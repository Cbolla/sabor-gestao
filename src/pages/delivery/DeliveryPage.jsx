import React, { useState } from 'react';
import { Truck, CheckCircle, MapPin, Clock } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { useOrders } from '../../hooks/useOrders';
import { formatDate } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/currencyUtils';

const pageStyles = {
    container: { padding: 'var(--spacing-md)' },
    section: { marginBottom: 'var(--spacing-xl)' },
    sectionTitle: { fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' },
    cardList: { display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' },
    address: { display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' },
    meta: { display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' },
};

export const DeliveryPage = () => {
    const { orders, loading, updateOrderStatus } = useOrders();
    const [processingId, setProcessingId] = useState(null);

    // Filter orders
    const readyOrders = orders.filter(o => o.status === 'ready');
    const deliveredOrders = orders.filter(o => o.status === 'delivered').slice(0, 10); // Show last 10 delivered

    const handleMarkAsDelivered = async (orderId) => {
        setProcessingId(orderId);
        try {
            await updateOrderStatus(orderId, 'delivered');
        } catch (error) {
            alert('Erro ao confirmar entrega: ' + error.message);
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) return <AppLayout title="Entregas"><LoadingSpinner /></AppLayout>;

    return (
        <AppLayout title="Entregas">
            <div style={pageStyles.container}>

                {/* Ready to Deliver Section */}
                <div style={pageStyles.section}>
                    <h2 style={pageStyles.sectionTitle}>
                        <Truck size={20} />
                        Pronto para Entrega ({readyOrders.length})
                    </h2>

                    {readyOrders.length === 0 ? (
                        <EmptyState
                            icon="🛵"
                            title="Tudo entregue!"
                            description="Não há pedidos aguardando entrega no momento."
                        />
                    ) : (
                        <div style={pageStyles.cardList}>
                            {readyOrders.map(order => (
                                <Card key={order.id} variant="warning" clickable={false}>
                                    <CardHeader
                                        icon={<Truck size={24} />}
                                        title={`Pedido ${order.orderNumber}`}
                                        subtitle={order.customerName}
                                        iconVariant="warning"
                                    />
                                    <CardBody>
                                        <div style={pageStyles.address}>
                                            <MapPin size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                                            <span>
                                                {/* If address exists in order, show it, effectively checking if customer data was snapshotted or logic needs to fetch it. 
                                                    For now we rely on what's in the order or just show customer info handled by backend/hooks.
                                                    Assuming address might not be fully available on order object based on previous files, 
                                                    but let's display what we have or a placeholder. 
                                                */}
                                                {order.deliveryAddress || "Endereço não informado / Retirada no balcão"}
                                            </span>
                                        </div>

                                        <div style={pageStyles.meta}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                                                <Clock size={16} />
                                                <span>{order.deliveryDate ? formatDate(order.deliveryDate) : 'Sem data'}</span>
                                            </div>
                                            <div style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text)' }}>
                                                {formatCurrency(order.total)}
                                            </div>
                                        </div>

                                        {order.items && (
                                            <div style={{ marginTop: 'var(--spacing-sm)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                                {order.items.map(i => `${i.quantity}x ${i.name || i.productName}`).join(', ')}
                                            </div>
                                        )}
                                    </CardBody>
                                    <CardFooter>
                                        <Button
                                            variant="success"
                                            fullWidth
                                            icon={<CheckCircle size={20} />}
                                            onClick={() => handleMarkAsDelivered(order.id)}
                                            loading={processingId === order.id}
                                        >
                                            Confirmar Entrega
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent History */}
                {deliveredOrders.length > 0 && (
                    <div style={pageStyles.section}>
                        <h2 style={pageStyles.sectionTitle}>
                            <CheckCircle size={20} />
                            Entregues Recentemente
                        </h2>
                        <div style={pageStyles.cardList}>
                            {deliveredOrders.map(order => (
                                <Card key={order.id} variant="default" clickable={false} className="opacity-75">
                                    <CardBody>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontWeight: 'var(--font-weight-bold)' }}>{order.customerName}</div>
                                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                                    {order.orderNumber} • {formatCurrency(order.total)}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', color: 'var(--color-success)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                                                <CheckCircle size={16} />
                                                <span>Entregue</span>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
};

export default DeliveryPage;
