import React, { useState } from 'react';
import { ChefHat, Clock } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { useOrders } from '../../hooks/useOrders';
import { formatDate } from '../../utils/dateUtils';

const pageStyles = {
    container: { padding: 'var(--spacing-md)' },
    kanbanContainer: { display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' },
    column: { flex: 1 },
    columnHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)', padding: 'var(--spacing-md)', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' },
    columnTitle: { fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)' },
    columnCount: { fontSize: 'var(--font-size-sm)', padding: 'var(--spacing-xs) var(--spacing-md)', background: 'var(--color-primary)', color: 'white', borderRadius: 'var(--radius-full)' },
    cardList: { display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' },
};

export const KitchenPage = () => {
    const { orders, loading, updateOrderStatus } = useOrders();

    const todoOrders = orders.filter(o => o.status === 'confirmed');
    const inProgressOrders = orders.filter(o => o.status === 'in_production');
    const doneOrders = orders.filter(o => o.status === 'ready');

    const handleMoveToInProgress = async (orderId) => {
        try {
            await updateOrderStatus(orderId, 'in_production');
        } catch (error) {
            alert('Erro: ' + error.message);
        }
    };

    const handleMoveToDone = async (orderId) => {
        try {
            await updateOrderStatus(orderId, 'ready');
        } catch (error) {
            alert('Erro: ' + error.message);
        }
    };

    if (loading) return <AppLayout title="Cozinha"><LoadingSpinner /></AppLayout>;

    const KanbanColumn = ({ title, orders, color, onMove, buttonText }) => (
        <div style={pageStyles.column}>
            <div style={pageStyles.columnHeader}>
                <span style={pageStyles.columnTitle}>{title}</span>
                <span style={{ ...pageStyles.columnCount, background: color }}>{orders.length}</span>
            </div>
            {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--color-text-secondary)' }}>
                    Nenhum pedido
                </div>
            ) : (
                <div style={pageStyles.cardList}>
                    {orders.map((order) => (
                        <Card key={order.id} clickable={false}>
                            <CardHeader
                                icon={<ChefHat size={24} />}
                                title={`Pedido ${order.orderNumber}`}
                                subtitle={order.customerName}
                                iconVariant="secondary"
                            />
                            <CardBody>
                                {order.deliveryDate && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
                                        <Clock size={16} />
                                        <span style={{ fontSize: 'var(--font-size-sm)' }}>
                                            Entrega: {formatDate(order.deliveryDate)}
                                        </span>
                                    </div>
                                )}
                                {order.items && order.items.length > 0 && (
                                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                        {order.items.map((item, idx) => (
                                            <div key={idx} style={{ fontSize: 'var(--font-size-sm)', padding: 'var(--spacing-xs) 0' }}>
                                                • {item.quantity}x {item.productName}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {onMove && (
                                    <Button variant="primary" size="small" fullWidth onClick={() => onMove(order.id)}>
                                        {buttonText}
                                    </Button>
                                )}
                            </CardBody>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <AppLayout title="Cozinha">
            <div style={pageStyles.container}>
                {todoOrders.length === 0 && inProgressOrders.length === 0 && doneOrders.length === 0 ? (
                    <EmptyState
                        icon="👨‍🍳"
                        title="Nenhum pedido na cozinha"
                        description="Os pedidos confirmados aparecerão aqui para produção"
                    />
                ) : (
                    <div style={pageStyles.kanbanContainer}>
                        <KanbanColumn
                            title="A Fazer"
                            orders={todoOrders}
                            color="var(--color-warning)"
                            onMove={handleMoveToInProgress}
                            buttonText="Iniciar Produção"
                        />
                        <KanbanColumn
                            title="Em Produção"
                            orders={inProgressOrders}
                            color="var(--color-info)"
                            onMove={handleMoveToDone}
                            buttonText="Marcar como Pronto"
                        />
                        <KanbanColumn
                            title="Pronto"
                            orders={doneOrders}
                            color="var(--color-success)"
                        />
                    </div>
                )}
            </div>
        </AppLayout>
    );
};

export default KitchenPage;
