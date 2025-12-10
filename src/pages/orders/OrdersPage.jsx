import React, { useState } from 'react';
import { Plus, ShoppingBag, Calendar, User } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { useOrders } from '../../hooks/useOrders';
import { formatCurrency } from '../../utils/currencyUtils';
import { formatDate } from '../../utils/dateUtils';

const pageStyles = {
    container: { padding: 'var(--spacing-md)' },
    header: { marginBottom: 'var(--spacing-lg)' },
    filterBar: { display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)', overflowX: 'auto' },
    filterButton: { padding: 'var(--spacing-sm) var(--spacing-md)', borderRadius: 'var(--radius-full)', border: '2px solid var(--color-border)', background: 'var(--color-surface)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', cursor: 'pointer', whiteSpace: 'nowrap' },
    cardList: { display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' },
};

export const OrdersPage = () => {
    const { orders, loading, updateOrderStatus, loadMore, hasMore, refreshOrders } = useOrders();
    const [filter, setFilter] = useState('all');

    const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await updateOrderStatus(orderId, newStatus);
        } catch (error) {
            alert('Erro ao atualizar status: ' + error.message);
        }
    };

    // Removed blocking loading state to improve perceived performance

    return (
        <AppLayout title="Encomendas">
            <div style={pageStyles.container}>
                <div style={pageStyles.header}>
                    <Button variant="primary" fullWidth icon={<Plus size={20} />}>
                        Nova Encomenda
                    </Button>
                </div>

                <div style={pageStyles.filterBar}>
                    {['all', 'pending', 'confirmed', 'in_production', 'ready', 'delivered'].map(status => (
                        <button
                            key={status}
                            style={{
                                ...pageStyles.filterButton,
                                borderColor: filter === status ? 'var(--color-primary)' : 'var(--color-border)',
                                color: filter === status ? 'var(--color-primary)' : 'var(--color-text)',
                                background: filter === status ? 'var(--color-primary-light)' : 'var(--color-surface)',
                            }}
                            onClick={() => setFilter(status)}
                        >
                            {status === 'all' ? 'Todos' : status === 'pending' ? 'Pendente' : status === 'confirmed' ? 'Confirmado' : status === 'in_production' ? 'Produção' : status === 'ready' ? 'Pronto' : 'Entregue'}
                        </button>
                    ))}
                </div>

                {filteredOrders.length === 0 ? (
                    <EmptyState icon="📦" title="Nenhuma encomenda"
                        description={filter === 'all' ? "Adicione sua primeira encomenda" : "Nenhuma encomenda com este status"}
                        action={filter === 'all' && <Button variant="primary" icon={<Plus size={20} />}>Nova Encomenda</Button>} />
                ) : (
                    <div style={pageStyles.cardList}>
                        {filteredOrders.map((order) => (
                            <Card key={order.id} className="stagger-item" clickable={false}>
                                <CardHeader
                                    icon={<ShoppingBag size={24} />}
                                    title={`Pedido ${order.orderNumber}`}
                                    subtitle={order.customerName}
                                    iconVariant="success"
                                    action={<StatusBadge status={order.status} />}
                                />
                                <CardBody>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)' }}>
                                        <User size={16} />
                                        <span>{order.customerName}</span>
                                    </div>
                                    {order.deliveryDate && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                                            <Calendar size={16} />
                                            <span>Entrega: {formatDate(order.deliveryDate)}</span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--spacing-md)' }}>
                                        <div>
                                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Total</div>
                                            <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)' }}>
                                                {formatCurrency(order.total || 0)}
                                            </div>
                                        </div>
                                        {order.advancePayment > 0 && (
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Sinal</div>
                                                <div style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-success)' }}>
                                                    {formatCurrency(order.advancePayment)}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardBody>
                                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                    <CardFooter>
                                        <Button
                                            variant="primary"
                                            size="small"
                                            fullWidth
                                            onClick={() => {
                                                const nextStatus = order.status === 'pending' ? 'confirmed' : order.status === 'confirmed' ? 'in_production' : order.status === 'in_production' ? 'ready' : 'delivered';
                                                handleStatusChange(order.id, nextStatus);
                                            }}
                                        >
                                            {order.status === 'pending' ? 'Confirmar' : order.status === 'confirmed' ? 'Iniciar Produção' : order.status === 'in_production' ? 'Marcar como Pronto' : 'Marcar como Entregue'}
                                        </Button>
                                    </CardFooter>
                                )}
                            </Card>
                        ))}

                        {hasMore && (
                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--spacing-md)' }}>
                                <Button variant="outline" onClick={loadMore} loading={loading}>
                                    Carregar mais
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
};

export default OrdersPage;
