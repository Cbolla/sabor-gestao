import React, { useState, useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import {
    Calendar,
    Download,
    Search,
    Filter,
    TrendingUp,
    ShoppingBag,
    Pencil // Import Pencil
} from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card, CardHeader, CardBody, MetricCard } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal'; // Import Modal
import { useOrders } from '../../hooks/useOrders';
import { formatCurrency } from '../../utils/currencyUtils';
import { formatDate } from '../../utils/dateUtils';
import { startOfMonth, endOfMonth, format } from 'date-fns';

export const ReportsPage = () => {
    const { orders, loading, updateOrder } = useOrders(); // Get updateOrder
    const [dateRange, setDateRange] = useState('month');
    const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Edit State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);
    const [editFormData, setEditFormData] = useState({
        deliveryDate: '',
        total: '',
        status: ''
    });
    const [saving, setSaving] = useState(false);

    // Helper: Get best available date (Delivery > Created)
    const getOrderDate = (order) => {
        if (order.deliveryDate) {
            if (order.deliveryDate.seconds) return new Date(order.deliveryDate.seconds * 1000);
            return new Date(order.deliveryDate);
        }
        if (order.createdAt) {
            if (order.createdAt.seconds) return new Date(order.createdAt.seconds * 1000);
            return new Date(order.createdAt);
        }
        return new Date(); // Fallback
    };

    // Filter Logic
    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            // 1. Date Filter (using Delivery Date preferably)
            const orderDate = getOrderDate(order);
            const orderDateStr = format(orderDate, 'yyyy-MM-dd');
            const start = startDate;
            const end = endDate;

            if (orderDateStr < start || orderDateStr > end) return false;

            // 2. Status Filter
            if (statusFilter !== 'all' && order.status !== statusFilter) return false;

            // 3. Search (Customer Name or Product Name)
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                const customerMatch = order.customerName?.toLowerCase().includes(term);
                const itemsMatch = order.items?.some(item => item.name.toLowerCase().includes(term));
                if (!customerMatch && !itemsMatch) return false;
            }

            return true;
        });
    }, [orders, startDate, endDate, statusFilter, searchTerm]);

    // Metrics Calculation
    const metrics = useMemo(() => {
        const totalSales = filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
        const count = filteredOrders.length;
        const avgTicket = count > 0 ? totalSales / count : 0;

        // Group by Date for Chart
        const salesByDate = {};
        filteredOrders.forEach(o => {
            const date = getOrderDate(o);
            const dateStr = format(date, 'dd/MM');

            if (dateStr) {
                salesByDate[dateStr] = (salesByDate[dateStr] || 0) + (o.total || 0);
            }
        });

        const chartData = Object.entries(salesByDate).map(([date, total]) => ({
            name: date,
            total,
        })).sort((a, b) => {
            // Simple sort relying on dd/MM format usually works for single month view
            // Enhancing to full date sort would require storing full date in key if needed
            return a.name.localeCompare(b.name);
        });

        return { totalSales, count, avgTicket, chartData };
    }, [filteredOrders]);

    const handleExport = () => {
        // CSV Generation
        const headers = ['Data Entrega', 'Pedido', 'Cliente', 'Status', 'Total', 'Itens'];
        const rows = filteredOrders.map(o => {
            const date = getOrderDate(o);
            const items = o.items?.map(i => `${i.quantity}x ${i.name}`).join('; ') || '';
            return [
                format(date, 'dd/MM/yyyy'),
                o.orderNumber,
                o.customerName,
                o.status,
                o.total?.toFixed(2).replace('.', ','),
                items
            ];
        });

        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.map(c => `"${c}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `relatorio_vendas_${startDate}_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleEditClick = (order) => {
        setEditingOrder(order);
        const date = getOrderDate(order);
        setEditFormData({
            deliveryDate: format(date, 'yyyy-MM-dd'),
            total: order.total?.toFixed(2) || '0.00',
            status: order.status
        });
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        if (!editingOrder) return;
        setSaving(true);
        try {
            await updateOrder(editingOrder.id, {
                deliveryDate: new Date(editFormData.deliveryDate),
                total: parseFloat(editFormData.total),
                status: editFormData.status
            });
            setShowEditModal(false);
            setEditingOrder(null);
        } catch (error) {
            alert('Erro ao atualizar pedido: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <AppLayout title="Relatórios e Vendas">
            <div style={{ padding: 'var(--spacing-md)', paddingBottom: '80px' }}>

                {/* Filters Section */}
                <Card className="mb-md">
                    <CardHeader icon={<Filter size={20} />} title="Filtros" />
                    <CardBody>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-md)' }}>
                            <div style={{ marginBottom: 0 }}>
                                <Input
                                    type="date"
                                    label="Início"
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                    style={{ marginBottom: 0 }}
                                />
                            </div>
                            <div style={{ marginBottom: 0 }}>
                                <Input
                                    type="date"
                                    label="Fim"
                                    value={endDate}
                                    onChange={e => setEndDate(e.target.value)}
                                    style={{ marginBottom: 0 }}
                                />
                            </div>
                            <div style={{ marginBottom: 0 }}>
                                <Select
                                    label="Status"
                                    value={statusFilter}
                                    onChange={e => setStatusFilter(e.target.value)}
                                    options={[
                                        { value: 'all', label: 'Todos' },
                                        { value: 'delivered', label: 'Entregues' },
                                        { value: 'pending', label: 'Pendentes' },
                                        { value: 'canceled', label: 'Cancelados' }
                                    ]}
                                    style={{ marginBottom: 0 }}
                                />
                            </div>
                            <div style={{ marginBottom: 0 }}>
                                <Input
                                    label="Buscar"
                                    placeholder="Cliente ou Produto..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    icon={<Search size={18} />}
                                    style={{ marginBottom: 0 }}
                                />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Metrics Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '20px' }}>
                    <MetricCard
                        label="Faturamento Total"
                        value={formatCurrency(metrics.totalSales)}
                        variant="success"
                    />
                    <MetricCard
                        label="Pedidos"
                        value={metrics.count}
                        variant="primary"
                    />
                    <MetricCard
                        label="Ticket Médio"
                        value={formatCurrency(metrics.avgTicket)}
                        variant="info"
                    />
                </div>

                {/* Chart Section */}
                <Card className="mb-md">
                    <CardHeader icon={<TrendingUp size={20} />} title="Evolução de Vendas (por data entrega)" />
                    <CardBody>
                        <div style={{ height: '300px', width: '100%' }}>
                            <ResponsiveContainer>
                                <BarChart data={metrics.chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={val => `R$${val}`} />
                                    <Tooltip formatter={(val) => formatCurrency(val)} cursor={{ fill: '#f0f0f0' }} />
                                    <Bar dataKey="total" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardBody>
                </Card>

                {/* Table Section */}
                <Card>
                    <CardHeader
                        icon={<ShoppingBag size={20} />}
                        title="Detalhamento"
                        action={
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleExport}
                                icon={<Download size={16} />}
                            >
                                Baixar
                            </Button>
                        }
                    />
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #f0f0f0', textAlign: 'left', color: '#666' }}>
                                    <th style={{ padding: '12px' }}>Data Entrega</th>
                                    <th style={{ padding: '12px' }}>Cliente</th>
                                    <th style={{ padding: '12px' }}>Status</th>
                                    <th style={{ padding: '12px', textAlign: 'right' }}>Valor</th>
                                    <th style={{ padding: '12px', width: '50px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map(order => (
                                    <tr key={order.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                        <td style={{ padding: '12px' }}>
                                            {formatDate(getOrderDate(order))}
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ fontWeight: '500' }}>{order.customerName}</div>
                                            <div style={{ fontSize: '12px', color: '#999' }}>{order.orderNumber}</div>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                backgroundColor: order.status === 'delivered' ? '#e8f5e9' : '#fff3e0',
                                                color: order.status === 'delivered' ? '#2e7d32' : '#ef6c00'
                                            }}>
                                                {order.status === 'delivered' ? 'Entregue' : order.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>
                                            {formatCurrency(order.total)}
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            <button
                                                onClick={() => handleEditClick(order)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    padding: '4px',
                                                    color: 'var(--color-text-secondary)',
                                                    borderRadius: '4px'
                                                }}
                                            >
                                                <Pencil size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredOrders.length === 0 && (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                                            Nenhuma venda encontrada neste período.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Edit Modal */}
                <Modal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    title={`Editar Pedido ${editingOrder?.orderNumber}`}
                    footer={
                        <>
                            <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancelar</Button>
                            <Button variant="primary" onClick={handleSaveEdit} loading={saving}>Salvar</Button>
                        </>
                    }
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                        <Input
                            type="date"
                            label="Data de Entrega (Real)"
                            value={editFormData.deliveryDate}
                            onChange={e => setEditFormData({ ...editFormData, deliveryDate: e.target.value })}
                        />
                        <Select
                            label="Status"
                            value={editFormData.status}
                            onChange={e => setEditFormData({ ...editFormData, status: e.target.value })}
                            options={[
                                { value: 'pending', label: 'Pendente' },
                                { value: 'confirmed', label: 'Confirmado' },
                                { value: 'in_production', label: 'Em Produção' },
                                { value: 'ready', label: 'Pronto' },
                                { value: 'delivered', label: 'Entregue' },
                                { value: 'canceled', label: 'Cancelado' }
                            ]}
                        />
                        <Input
                            type="number"
                            label="Valor Total"
                            step="0.01"
                            value={editFormData.total}
                            onChange={e => setEditFormData({ ...editFormData, total: e.target.value })}
                        />
                    </div>
                </Modal>
            </div>
        </AppLayout>
    );
};

export default ReportsPage;
