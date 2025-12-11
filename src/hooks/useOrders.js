import { useState, useEffect } from 'react';
import { orderBy } from 'firebase/firestore';
import { firestoreService } from '../services/firestore.service';
import { useAuth } from '../contexts/AuthContext';

export const useOrders = () => {
    const { establishment } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastDoc, setLastDoc] = useState(null);
    const [hasMore, setHasMore] = useState(true);

    const ITEMS_PER_PAGE = 20;

    const fetchOrders = async (isInitial = true) => {
        if (!establishment?.id) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const collectionPath = `establishments/${establishment.id}/orders`;
            const constraints = [
                orderBy('createdAt', 'desc')
            ];

            const result = await firestoreService.getPaginatedDocuments(
                collectionPath,
                constraints,
                isInitial ? null : lastDoc,
                ITEMS_PER_PAGE
            );

            if (isInitial) {
                setOrders(result.data);
            } else {
                setOrders(prev => [...prev, ...result.data]);
            }

            setLastDoc(result.lastDoc);
            setHasMore(result.hasMore);
            setError(null);
        } catch (err) {
            console.error('Erro ao buscar pedidos:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders(true);
    }, [establishment?.id]);

    const loadMore = () => {
        if (!loading && hasMore) {
            fetchOrders(false);
        }
    };

    const refreshOrders = () => {
        setLastDoc(null);
        setHasMore(true);
        fetchOrders(true);
    };

    const createOrder = async (orderData) => {
        try {
            if (!establishment?.id) throw new Error('Estabelecimento não encontrado');

            const orderNumber = `PED-${Date.now().toString().slice(-6)}`;
            const collectionPath = `establishments/${establishment.id}/orders`;

            const orderId = await firestoreService.addDocument(collectionPath, {
                ...orderData,
                orderNumber,
                status: 'pending',
                paymentStatus: 'pending',
                createdBy: establishment.ownerId,
            });

            refreshOrders();
            return orderId;
        } catch (err) {
            console.error('Erro ao criar pedido:', err);
            setError(err.message);
            throw err;
        }
    };

    const updateOrderStatus = async (orderId, status) => {
        try {
            if (!establishment?.id) throw new Error('Estabelecimento não encontrado');
            const collectionPath = `establishments/${establishment.id}/orders`;

            await firestoreService.updateDocument(collectionPath, orderId, { status });
            refreshOrders();
            return true;
        } catch (err) {
            console.error('Erro ao atualizar status do pedido:', err);
            setError(err.message);
            throw err;
        }
    };

    const updateOrder = async (orderId, orderData) => {
        try {
            if (!establishment?.id) throw new Error('Estabelecimento não encontrado');
            const collectionPath = `establishments/${establishment.id}/orders`;
            await firestoreService.updateDocument(collectionPath, orderId, orderData);
            refreshOrders();
            return true;
        } catch (err) {
            console.error('Erro ao atualizar pedido:', err);
            setError(err.message);
            throw err;
        }
    };

    const deleteOrder = async (orderId) => {
        try {
            if (!establishment?.id) throw new Error('Estabelecimento não encontrado');
            const collectionPath = `establishments/${establishment.id}/orders`;
            await firestoreService.deleteDocument(collectionPath, orderId);
            refreshOrders();
            return true;
        } catch (err) {
            console.error('Erro ao deletar pedido:', err);
            setError(err.message);
            throw err;
        }
    };

    return { orders, loading, error, loadMore, hasMore, refreshOrders, createOrder, updateOrderStatus, updateOrder, deleteOrder };
};

export default useOrders;
