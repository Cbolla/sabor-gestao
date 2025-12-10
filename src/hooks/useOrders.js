import { useState, useEffect } from 'react';
import { dbService } from '../services/db.service';
import { useAuth } from '../contexts/AuthContext';

export const useOrders = () => {
    const { establishment } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const ITEMS_PER_PAGE = 20;

    const fetchOrders = async (isInitial = true) => {
        if (!establishment?.id) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            const result = await dbService.getPaginatedDocuments(
                'orders',
                {
                    where: { field: 'establishmentId', value: establishment.id },
                    orderBy: { field: 'createdAt', direction: 'desc' }
                },
                isInitial ? 0 : offset,
                ITEMS_PER_PAGE
            );

            if (isInitial) {
                setOrders(result.data);
                setOffset(0);
            } else {
                setOrders(prev => [...prev, ...result.data]);
            }

            setOffset(result.offset);
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
        setOffset(0);
        setHasMore(true);
        fetchOrders(true);
    };

    const createOrder = async (orderData) => {
        try {
            if (!establishment?.id) throw new Error('Estabelecimento não encontrado');

            const orderNumber = `PED-${Date.now().toString().slice(-6)}`;

            const orderId = await dbService.addDocument('orders', {
                ...orderData,
                establishmentId: establishment.id,
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
            await dbService.updateDocument('orders', orderId, { status });
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
            await dbService.deleteDocument('orders', orderId);
            refreshOrders();
            return true;
        } catch (err) {
            console.error('Erro ao deletar pedido:', err);
            setError(err.message);
            throw err;
        }
    };

    return { orders, loading, error, loadMore, hasMore, refreshOrders, createOrder, updateOrderStatus, deleteOrder };
};

export default useOrders;
