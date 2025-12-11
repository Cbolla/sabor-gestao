import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    DollarSign,
    ShoppingBag,
    Users,
    Package,
    ChefHat,
    Truck,
    TrendingUp
} from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { Card, CardHeader, CardBody, MetricCard } from '../components/common/Card';
import { useAuth } from '../contexts/AuthContext';
import { useOrders } from '../hooks/useOrders';
import { formatCurrency } from '../utils/currencyUtils';

const pageStyles = {
    container: {
        padding: 'var(--spacing-md)',
    },
    section: {
        marginBottom: 'var(--spacing-xl)',
    },
    sectionTitle: {
        fontSize: 'var(--font-size-xl)',
        fontWeight: 'var(--font-weight-bold)',
        marginBottom: 'var(--spacing-md)',
        color: 'var(--color-text)',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', // Responsive grid: Stack at < 460px approx
        gap: 'var(--spacing-md)',
    },
    cardList: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-md)',
    },
};

export const DashboardPage = () => {
    const navigate = useNavigate();
    const { establishment } = useAuth();
    const { orders } = useOrders();

    // Calculate metrics
    const metrics = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];

        // Sales Today: Total of orders created today (or delivered today? usually created)
        // Let's go with Created Today for "Sales"
        const todayOrders = orders.filter(o => {
            if (!o.createdAt) return false;
            // Handle both Firestore timestamp (seconds) or ISO string
            const date = o.createdAt.seconds ? new Date(o.createdAt.seconds * 1000) : new Date(o.createdAt);
            return date.toISOString().split('T')[0] === today;
        });

        const salesToday = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0);

        // Active Orders: Pending, Confirmed, In Production, Ready
        const activeOrdersCount = orders.filter(o => ['pending', 'confirmed', 'in_production', 'ready'].includes(o.status)).length;

        // To Receive: Total of active orders (not yet delivered/paid fully? Assuming simple logic for now)
        // Or strictly 'delivered' but not 'paid'. Since we don't track payment status deeply yet, let's use Total of Active Orders as "Pipeline"
        // OR better: Total Revenue today (Delivered Today) vs Sales (Booked Today).
        // User asked for "money" to sum up when "delivered".
        // Let's interpret "Sales Today" as BOOKED revenue (created)
        // And "A Receber" (To Receive) as potential revenue from active orders.

        // Adjusted Strategy:
        // Vendas Hoje = Sum of orders created today.
        // A Receber = Sum of orders NOT yet delivered (active).
        // If I deliver an order, it should move from 'A Receber' to 'Vendas Realizadas' (if we had that).

        // To satisfy "summed the money", let's ensure "Vendas Hoje" captures the order correctly, 
        // AND "A Receber" decreases when delivered.

        const toReceive = orders
            .filter(o => ['pending', 'confirmed', 'in_production', 'ready'].includes(o.status))
            .reduce((sum, o) => sum + (o.total || 0), 0);

        return {
            salesToday,
            activeOrdersCount,
            toReceive
        };
    }, [orders]);

    const quickActions = [
        {
            title: 'Finanças',
            subtitle: 'Contas e parcelas',
            icon: <DollarSign size={24} />,
            iconVariant: 'primary',
            path: '/finance',
        },
        {
            title: 'Novo Pedido',
            subtitle: 'Criar encomenda',
            icon: <ShoppingBag size={24} />,
            iconVariant: 'success',
            path: '/orders/new',
        },
        {
            title: 'Clientes',
            subtitle: 'Gerenciar clientes',
            icon: <Users size={24} />,
            iconVariant: 'info',
            path: '/customers',
        },
        {
            title: 'Produtos',
            subtitle: 'Catálogo',
            icon: <Package size={24} />,
            iconVariant: 'warning',
            path: '/products', // Fixed path
        },
        {
            title: 'Cozinha',
            subtitle: 'Produção',
            icon: <ChefHat size={24} />,
            iconVariant: 'secondary',
            path: '/kitchen',
        },
        {
            title: 'Entregas',
            subtitle: 'Gerenciar entregas',
            icon: <Truck size={24} />,
            iconVariant: 'info',
            path: '/deliveries',
        },
    ];

    return (
        <AppLayout>
            <div style={pageStyles.container}>
                {/* Metrics Section */}
                <div style={pageStyles.section}>
                    <h2 style={pageStyles.sectionTitle}>Visão Geral</h2>
                    <div style={pageStyles.grid}>
                        <MetricCard
                            value={formatCurrency(metrics.salesToday)}
                            label="Vendas Hoje"
                            variant="primary"
                        />
                        <MetricCard
                            value={metrics.activeOrdersCount}
                            label="Pedidos Ativos"
                            variant="success"
                        />
                        <MetricCard
                            value={formatCurrency(metrics.toReceive)}
                            label="A Receber"
                            variant="warning"
                        />
                        <MetricCard
                            value="R$ 0,00"
                            label="A Pagar"
                            variant="danger"
                        />
                    </div>
                </div>

                {/* Quick Actions */}
                <div style={pageStyles.section}>
                    <h2 style={pageStyles.sectionTitle}>Acesso Rápido</h2>
                    <div style={pageStyles.cardList}>
                        {quickActions.map((action, index) => (
                            <Card
                                key={index}
                                onClick={() => action.path && navigate(action.path)}
                                className="stagger-item"
                            >
                                <CardHeader
                                    icon={action.icon}
                                    title={action.title}
                                    subtitle={action.subtitle}
                                    iconVariant={action.iconVariant}
                                />
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Welcome Message */}
                {establishment && (
                    <div style={pageStyles.section}>
                        <Card variant="primary" clickable={false}>
                            <CardBody>
                                <div style={{ textAlign: 'center' }}>
                                    <TrendingUp size={48} style={{ color: 'var(--color-primary)', marginBottom: 'var(--spacing-md)' }} />
                                    <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>
                                        Bem-vindo ao {establishment.name}!
                                    </h3>
                                    <p style={{ color: 'var(--color-text-secondary)' }}>
                                        Comece gerenciando suas finanças e pedidos.
                                    </p>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                )}
            </div>
        </AppLayout>
    );
};

export default DashboardPage;
