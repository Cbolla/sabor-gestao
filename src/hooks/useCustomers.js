import { useState, useEffect } from 'react';
import { dbService } from '../services/db.service';
import { useAuth } from '../contexts/AuthContext';

export const useCustomers = () => {
    const { establishment } = useAuth();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const ITEMS_PER_PAGE = 20;

    const fetchCustomers = async (isInitial = true) => {
        if (!establishment?.id) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            const result = await dbService.getPaginatedDocuments(
                'customers',
                {
                    where: { field: 'establishmentId', value: establishment.id },
                    orderBy: { field: 'name', direction: 'asc' }
                },
                isInitial ? 0 : offset,
                ITEMS_PER_PAGE
            );

            if (isInitial) {
                setCustomers(result.data);
                setOffset(0);
            } else {
                setCustomers(prev => [...prev, ...result.data]);
            }

            setOffset(result.offset);
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

        try {
            setLoading(true);

            const results = await dbService.searchDocuments(
                'customers',
                'name',
                term,
                { where: { field: 'establishmentId', value: establishment.id } }
            );

            setCustomers(results);
            setHasMore(false); // Search results don't have pagination
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
        setOffset(0);
        setHasMore(true);
        fetchCustomers(true);
    };

    const createCustomer = async (customerData) => {
        try {
            if (!establishment?.id) {
                throw new Error('Estabelecimento não encontrado');
            }

            const customerId = await dbService.addDocument('customers', {
                ...customerData,
                establishmentId: establishment.id,
                totalOrders: 0,
                totalSpent: 0,
            });

            refreshCustomers();
            return customerId;
        } catch (err) {
            console.error('Erro ao criar cliente:', err);
            setError(err.message);
            throw err;
        }
    };

    const updateCustomer = async (customerId, customerData) => {
        try {
            if (!establishment?.id) {
                throw new Error('Estabelecimento não encontrado');
            }

            await dbService.updateDocument('customers', customerId, customerData);
            refreshCustomers();
            return true;
        } catch (err) {
            console.error('Erro ao atualizar cliente:', err);
            setError(err.message);
            throw err;
        }
    };

    const deleteCustomer = async (customerId) => {
        try {
            if (!establishment?.id) {
                throw new Error('Estabelecimento não encontrado');
            }

            await dbService.deleteDocument('customers', customerId);
            refreshCustomers();
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
