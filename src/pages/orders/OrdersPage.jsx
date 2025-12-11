import React, { useState, useEffect } from 'react';
import { Plus, ShoppingBag, Calendar, User, Trash2, X } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { useOrders } from '../../hooks/useOrders';
import { useCustomers } from '../../hooks/useCustomers';
import { useProducts } from '../../hooks/useProducts'; // Import useProducts
import { formatCurrency } from '../../utils/currencyUtils';
import { formatDate } from '../../utils/dateUtils';

const pageStyles = {
    container: { padding: 'var(--spacing-md)' },
    header: { marginBottom: 'var(--spacing-lg)' },
    filterBar: { display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)', overflowX: 'auto' },
    filterButton: { padding: 'var(--spacing-sm) var(--spacing-md)', borderRadius: 'var(--radius-full)', border: '2px solid var(--color-border)', background: 'var(--color-surface)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', cursor: 'pointer', whiteSpace: 'nowrap' },
    cardList: { display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' },
    productRow: { display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'flex-start', marginBottom: 'var(--spacing-sm)' },
    itemList: { display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)', marginTop: 'var(--spacing-sm)', maxHeight: '150px', overflowY: 'auto' },
    itemRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--spacing-xs)', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)' }
};

export const OrdersPage = () => {
    const { orders, loading, updateOrderStatus, deleteOrder, createOrder, loadMore, hasMore, refreshOrders } = useOrders();
    const { customers } = useCustomers();
    const { products } = useProducts(); // Get products
    const [filter, setFilter] = useState('all');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [saving, setSaving] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [isNewCustomer, setIsNewCustomer] = useState(false);

    // Order Item State
    const [orderItems, setOrderItems] = useState([]);
    const [currentProduct, setCurrentProduct] = useState('');
    const [currentQty, setCurrentQty] = useState(1);

    // Prepare customer options
    const customerOptions = [
        ...customers.map(c => ({ value: c.id, label: `${c.name} ${c.phone ? `- ${c.phone}` : ''}` })),
        { value: 'new', label: '➕ Novo Cliente' }
    ];

    // Prepare product options
    const productOptions = products.map(p => ({
        value: p.id,
        label: `${p.name} - ${formatCurrency(p.price)}`
    }));

    const [formData, setFormData] = useState({
        customerName: '',
        customerPhone: '',
        deliveryDate: '',
        total: '',
        advancePayment: '',
        notes: ''
    });

    const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

    // Calculate total whenever items change
    useEffect(() => {
        const calculatedTotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        setFormData(prev => ({ ...prev, total: calculatedTotal.toFixed(2) }));
    }, [orderItems]);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await updateOrderStatus(orderId, newStatus);
        } catch (error) {
            alert('Erro ao atualizar status: ' + error.message);
        }
    };

    const handleDeleteClick = (order) => {
        setOrderToDelete(order);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!orderToDelete) return;

        setDeleting(true);
        try {
            await deleteOrder(orderToDelete.id);
            setShowDeleteModal(false);
            setOrderToDelete(null);
        } catch (error) {
            alert('Erro ao excluir pedido: ' + error.message);
        } finally {
            setDeleting(false);
        }
    };

    const handleAddItem = () => {
        if (!currentProduct) return;

        // Find product by numeric ID if possible, or string match
        const product = products.find(p => String(p.id) === String(currentProduct));
        if (!product) {
            console.error('Product not found:', currentProduct);
            return;
        }

        const quantity = parseInt(currentQty, 10) || 1;
        const price = parseFloat(product.price) || 0;

        const newItem = {
            productId: product.id,
            name: product.name,
            price: price, // Ensure number
            quantity: quantity // Ensure number
        };

        setOrderItems(prev => [...prev, newItem]); // Functional update to ensure fresh state
        setCurrentProduct('');
        setCurrentQty(1);
    };

    const handleRemoveItem = (index) => {
        const newItems = [...orderItems];
        newItems.splice(index, 1);
        setOrderItems(newItems);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Get customer name from selected customer or new customer input
            const customerName = isNewCustomer ? formData.customerName :
                customers.find(c => c.id === selectedCustomer)?.name || formData.customerName;

            await createOrder({
                customerName,
                customerId: isNewCustomer ? null : selectedCustomer,
                deliveryDate: formData.deliveryDate ? new Date(formData.deliveryDate) : null,
                total: parseFloat(formData.total) || 0,
                advancePayment: parseFloat(formData.advancePayment) || 0,
                notes: formData.notes,
                items: orderItems // Save items
            });

            setShowCreateModal(false);
            setSelectedCustomer('');
            setIsNewCustomer(false);
            setOrderItems([]); // Reset items
            setFormData({ customerName: '', customerPhone: '', deliveryDate: '', total: '', advancePayment: '', notes: '' });
        } catch (error) {
            alert('Erro ao criar pedido: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    // Removed blocking loading state to improve perceived performance

    return (
        <AppLayout title="Encomendas">
            <div style={pageStyles.container}>
                <div style={pageStyles.header}>
                    <Button variant="primary" fullWidth icon={<Plus size={20} />} onClick={() => setShowCreateModal(true)}>
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
                        action={filter === 'all' && <Button variant="primary" icon={<Plus size={20} />} onClick={() => setShowCreateModal(true)}>Nova Encomenda</Button>} />
                ) : (
                    <div style={pageStyles.cardList}>
                        {filteredOrders.map((order) => (
                            <Card key={order.id} className="stagger-item" clickable={false}>
                                <CardHeader
                                    icon={<ShoppingBag size={24} />}
                                    title={`Pedido ${order.orderNumber}`}
                                    subtitle={order.customerName}
                                    iconVariant="success"
                                    action={
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                            <StatusBadge status={order.status} />
                                            <button
                                                onClick={() => handleDeleteClick(order)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    padding: 'var(--spacing-xs)',
                                                    borderRadius: 'var(--radius-md)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'var(--color-text-secondary)',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'var(--color-danger-light)';
                                                    e.currentTarget.style.color = 'var(--color-danger)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                                                }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    }
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

                                    {/* Order Items Preview (Compact) */}
                                    {order.items && order.items.length > 0 && (
                                        <div style={{ marginTop: 'var(--spacing-sm)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                            {order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
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

                {/* Delete Confirmation Modal */}
                <Modal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    title="Confirmar Exclusão"
                    footer={<>
                        <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancelar</Button>
                        <Button variant="primary" onClick={confirmDelete} loading={deleting} style={{ backgroundColor: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}>
                            Excluir
                        </Button>
                    </>}
                >
                    <p>Tem certeza que deseja excluir o pedido <strong>{orderToDelete?.orderNumber}</strong>?</p>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-sm)' }}>
                        Esta ação não pode ser desfeita.
                    </p>
                </Modal>

                {/* Create Order Modal */}
                <Modal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    title="Nova Encomenda"
                    footer={<>
                        <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancelar</Button>
                        <Button variant="primary" onClick={handleSubmit} loading={saving}>Salvar</Button>
                    </>}
                >
                    <form style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }} onSubmit={handleSubmit}>
                        {/* Customer Selection */}
                        <Select
                            label="Cliente"
                            value={selectedCustomer}
                            onChange={(e) => {
                                const value = e.target.value;
                                setSelectedCustomer(value);
                                setIsNewCustomer(value === 'new');
                                if (value !== 'new') {
                                    setFormData({ ...formData, customerName: '', customerPhone: '' });
                                }
                            }}
                            options={customerOptions}
                            required
                        />

                        {/* New Customer Fields */}
                        {isNewCustomer && (
                            <div style={{ padding: 'var(--spacing-md)', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-border)' }}>
                                <Input
                                    type="text"
                                    label="Nome do Novo Cliente"
                                    placeholder="João Silva"
                                    value={formData.customerName}
                                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                    required
                                />
                                <Input
                                    type="tel"
                                    label="Telefone (opcional)"
                                    placeholder="(11) 99999-9999"
                                    value={formData.customerPhone}
                                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                                    style={{ marginBottom: 0 }}
                                />
                            </div>
                        )}

                        <Input
                            type="date"
                            label="Data de Entrega"
                            value={formData.deliveryDate}
                            onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                        />

                        {/* Product Selection */}
                        <div style={{ padding: 'var(--spacing-md)', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                            <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)' }}>
                                Adicionar Produtos
                            </label>
                            <div style={pageStyles.productRow}>
                                <div style={{ flex: 1 }}>
                                    <Select
                                        value={currentProduct}
                                        onChange={(e) => setCurrentProduct(e.target.value)}
                                        options={productOptions}
                                        placeholder="Selecione um produto"
                                        style={{ marginBottom: 0 }}
                                    />
                                </div>
                                <div style={{ width: '100px' }}>
                                    <Input
                                        type="number"
                                        min="1"
                                        placeholder="Qtd"
                                        value={currentQty}
                                        onChange={(e) => setCurrentQty(e.target.value)}
                                        style={{ marginBottom: 0, textAlign: 'center' }}
                                    />
                                </div>
                                <Button type="button" variant="primary" onClick={handleAddItem} disabled={!currentProduct} style={{ height: '48px', width: '48px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Plus size={24} />
                                </Button>
                            </div>

                            {/* Items List */}
                            {orderItems.length > 0 && (
                                <div style={pageStyles.itemList}>
                                    {orderItems.map((item, index) => (
                                        <div key={index} style={pageStyles.itemRow}>
                                            <div style={{ fontSize: 'var(--font-size-sm)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                                                <span style={{ fontWeight: 'bold', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '2px 6px', borderRadius: '4px' }}>{item.quantity}x</span>
                                                <span>{item.name}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text)' }}>
                                                    {formatCurrency(item.price * item.quantity)}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveItem(index)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)', padding: '4px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                            <div style={{ flex: 1 }}>
                                <Input
                                    type="number"
                                    label="Valor Total"
                                    placeholder="0.00"
                                    step="0.01"
                                    value={formData.total}
                                    readOnly
                                    style={{ backgroundColor: 'var(--color-surface-hover)', fontWeight: 'bold', fontSize: 'var(--font-size-lg)' }}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <Input
                                    type="number"
                                    label="Sinal (opcional)"
                                    placeholder="0.00"
                                    step="0.01"
                                    value={formData.advancePayment}
                                    onChange={(e) => setFormData({ ...formData, advancePayment: e.target.value })}
                                />
                            </div>
                        </div>

                        <Input
                            type="text"
                            label="Observações (opcional)"
                            placeholder="Detalhes do pedido, instruções especiais..."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </form>
                </Modal>
            </div>
        </AppLayout>
    );
};

export default OrdersPage;
