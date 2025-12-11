import React, { useState, useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line
} from 'recharts';
import {
    Calendar,
    Download,
    Search,
    Filter,
    TrendingUp,
    ShoppingBag,
    CreditCard
} from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card, CardHeader, CardBody, MetricCard } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { useOrders } from '../../hooks/useOrders';
import { formatCurrency } from '../../utils/currencyUtils';
import { formatDate } from '../../utils/dateUtils';
import { startOfMonth, endOfMonth, subMonths, isWithinInterval, parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const ReportsPage = () => {
    const { orders, loading } = useOrders();
    const [dateRange, setDateRange] = useState('month'); // today, week, month, year, custom
    const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Filter Logic
    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            // 1. Date Filter
            let orderDate;
            if (order.createdAt?.seconds) {
                orderDate = new Date(order.createdAt.seconds * 1000);
            } else if (order.createdAt) {
                orderDate = new Date(order.createdAt);
            } else {
                return false;
            }

            // Adjust comparison to be inclusive and handle timezones simply (by interacting with ISO strings yyyy-mm-dd)
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
            let dateStr = '';
            if (o.createdAt?.seconds) dateStr = format(new Date(o.createdAt.seconds * 1000), 'dd/MM');
            else if (o.createdAt) dateStr = format(new Date(o.createdAt), 'dd/MM');

            if (dateStr) {
                salesByDate[dateStr] = (salesByDate[dateStr] || 0) + (o.total || 0);
            }
        });

        const chartData = Object.entries(salesByDate).map(([date, total]) => ({
            name: date,
            total,
        })).sort((a, b) => {
            // Simple string sort works for dd/MM if strictly within same year/month structure, 
            // but for robustness across years might need real dates. For MVP chart display it's usually fine or we rely on input order.
            // Actually, recreating standard sort:
            return a.name.localeCompare(b.name);
        });

        return { totalSales, count, avgTicket, chartData };
    }, [filteredOrders]);

    const handleExport = () => {
        // CSV Generation
        const headers = ['Data', 'Pedido', 'Cliente', 'Status', 'Total', 'Itens'];
        const rows = filteredOrders.map(o => {
            const date = o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000) : new Date(o.createdAt);
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
                    <CardHeader icon={<TrendingUp size={20} />} title="Evolução de Vendas" />
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
                                    <th style={{ padding: '12px' }}>Data</th>
                                    <th style={{ padding: '12px' }}>Cliente</th>
                                    <th style={{ padding: '12px' }}>Status</th>
                                    <th style={{ padding: '12px', textAlign: 'right' }}>Valor</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map(order => (
                                    <tr key={order.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                        <td style={{ padding: '12px' }}>
                                            {formatDate(order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000) : order.createdAt)}
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
                                    </tr>
                                ))}
                                {filteredOrders.length === 0 && (
                                    <tr>
                                        <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                                            Nenhuma venda encontrada neste período.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
};

export default ReportsPage;
