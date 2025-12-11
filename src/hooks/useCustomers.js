import { useState, useEffect } from 'react';
import { orderBy, where } from 'firebase/firestore';
import { firestoreService } from '../services/firestore.service';
import { useAuth } from '../contexts/AuthContext';

export const useCustomers = () => {
    const { establishment } = useAuth();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastDoc, setLastDoc] = useState(null); // Firestore cursor
    const [hasMore, setHasMore] = useState(true);

    const ITEMS_PER_PAGE = 20;

    const fetchCustomers = async (isInitial = true) => {
        if (!establishment?.id) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            // Fetch from subcollection: establishments/{id}/customers
            const collectionPath = `establishments/${establishment.id}/customers`;

            const constraints = [
                orderBy('name', 'asc'),
            ];

            const result = await firestoreService.getPaginatedDocuments(
                collectionPath,
                constraints,
                isInitial ? null : lastDoc,
                ITEMS_PER_PAGE
            );

            if (isInitial) {
                setCustomers(result.data);
            } else {
                setCustomers(prev => [...prev, ...result.data]);
            }

            setLastDoc(result.lastDoc);
            setHasMore(result.hasMore);
            setError(null);
        } catch (err) {
            console.error('Erro ao buscar clientes:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const searchCustomers = async (term) => {
        if (!establishment?.id) return;
        if (!term) {
            refreshCustomers();
            return;
        }

        try {
            setLoading(true);
            const collectionPath = `establishments/${establishment.id}/customers`;

            // Firestore simple search (prefix match logic)
            // name >= term AND name <= term + '\uf8ff'
            const constraints = [
                where('name', '>=', term),
                where('name', '<=', term + '\uf8ff'),
                orderBy('name', 'asc') // Required for range query
            ];

            const results = await firestoreService.getDocuments(collectionPath, constraints);

            setCustomers(results);
            setHasMore(false);
        } catch (err) {
            console.error('Erro na busca:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers(true);
    }, [establishment?.id]);

    const loadMore = () => {
        if (!loading && hasMore) {
            fetchCustomers(false);
        }
    };

    const refreshCustomers = () => {
        setLastDoc(null);
        setHasMore(true);
        fetchCustomers(true);
    };

    const createCustomer = async (customerData) => {
        try {
            if (!establishment?.id) {
                throw new Error('Estabelecimento não encontrado');
            }

            const collectionPath = `establishments/${establishment.id}/customers`;
            const docData = {
                ...customerData,
                totalOrders: 0,
                totalSpent: 0,
            };

            const customerId = await firestoreService.addDocument(collectionPath, docData);

            // Optimistic Update
            setCustomers(prev => [{
                id: customerId,
                ...docData,
                createdAt: new Date()
            }, ...prev]);

            return customerId;
        } catch (err) {
            console.error('Erro ao criar cliente:', err);
            setError(err.message);
            throw err;
        }
    };

    const updateCustomer = async (customerId, customerData) => {
        try {
            if (!establishment?.id) throw new Error('Estabelecimento não encontrado');

            setCustomers(prev => prev.map(c =>
                c.id === customerId ? { ...c, ...customerData } : c
            ));

            const collectionPath = `establishments/${establishment.id}/customers`;
            await firestoreService.updateDocument(collectionPath, customerId, customerData);

            return true;
        } catch (err) {
            console.error('Erro ao atualizar cliente:', err);
            setError(err.message);
            throw err;
        }
    };

    const deleteCustomer = async (customerId) => {
        try {
            if (!establishment?.id) throw new Error('Estabelecimento não encontrado');

            setCustomers(prev => prev.filter(c => c.id !== customerId));

            const collectionPath = `establishments/${establishment.id}/customers`;
            await firestoreService.deleteDocument(collectionPath, customerId);

            return true;
        } catch (err) {
            console.error('Erro ao deletar cliente:', err);
            setError(err.message);
            throw err;
        }
    };

    return {
        customers,
        loading,
        error,
        loadMore,
        hasMore,
        searchCustomers,
        refreshCustomers,
        createCustomer,
        updateCustomer,
        deleteCustomer,
    };
};

export default useCustomers;
