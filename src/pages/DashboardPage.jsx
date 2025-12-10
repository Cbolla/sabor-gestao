import React from 'react';
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
        gridTemplateColumns: 'repeat(2, 1fr)',
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
                            value="R$ 0,00"
                            label="Vendas Hoje"
                            variant="primary"
                        />
                        <MetricCard
                            value="0"
                            label="Pedidos Ativos"
                            variant="success"
                        />
                        <MetricCard
                            value="R$ 0,00"
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
