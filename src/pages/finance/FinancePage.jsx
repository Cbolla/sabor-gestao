import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, DollarSign, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card, CardHeader, CardBody, MetricCard } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { useExpenses } from '../../hooks/useExpenses';
import { formatCurrency } from '../../utils/currencyUtils';
import { formatDate } from '../../utils/dateUtils';

const pageStyles = {
    container: {
        padding: 'var(--spacing-md)',
    },
    section: {
        marginBottom: 'var(--spacing-xl)',
    },
    sectionHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 'var(--spacing-md)',
    },
    sectionTitle: {
        fontSize: 'var(--font-size-xl)',
        fontWeight: 'var(--font-weight-bold)',
        color: 'var(--color-text)',
        margin: 0,
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 'var(--spacing-md)',
    },
    cardList: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-md)',
    },
};

export const FinancePage = () => {
    const navigate = useNavigate();
    const { expenses, loading } = useExpenses();

    // Calculate metrics
    const metrics = useMemo(() => {
        const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.totalAmount || 0), 0);
        const totalPaid = expenses.reduce((sum, exp) => {
            const paidAmount = exp.totalAmount - (exp.remainingAmount || 0);
            return sum + paidAmount;
        }, 0);
        const totalRemaining = expenses.reduce((sum, exp) => sum + (exp.remainingAmount || 0), 0);

        const activeExpenses = expenses.filter(exp => exp.status === 'active').length;

        return {
            totalExpenses,
            totalPaid,
            totalRemaining,
            activeExpenses,
        };
    }, [expenses]);

    // Get recent expenses
    const recentExpenses = useMemo(() => {
        return expenses.slice(0, 5);
    }, [expenses]);

    if (loading) {
        return (
            <AppLayout title="Finanças">
                <LoadingSpinner />
            </AppLayout>
        );
    }

    return (
        <AppLayout title="Finanças">
            <div style={pageStyles.container}>
                {/* Metrics */}
                <div style={pageStyles.section}>
                    <div style={pageStyles.grid}>
                        <MetricCard
                            value={formatCurrency(metrics.totalExpenses)}
                            label="Total em Despesas"
                            variant="primary"
                        />
                        <MetricCard
                            value={formatCurrency(metrics.totalPaid)}
                            label="Total Pago"
                            variant="success"
                        />
                        <MetricCard
                            value={formatCurrency(metrics.totalRemaining)}
                            label="Total Restante"
                            variant="warning"
                        />
                        <MetricCard
                            value={metrics.activeExpenses}
                            label="Contas Ativas"
                            variant="info"
                        />
                    </div>
                </div>

                {/* Quick Actions */}
                <div style={pageStyles.section}>
                    <Button
                        variant="primary"
                        fullWidth
                        icon={<Plus size={20} />}
                        onClick={() => navigate('/finance/expenses/new')}
                    >
                        Nova Despesa / Conta
                    </Button>
                </div>

                {/* Recent Expenses */}
                <div style={pageStyles.section}>
                    <div style={pageStyles.sectionHeader}>
                        <h2 style={pageStyles.sectionTitle}>Despesas Recentes</h2>
                        <Button
                            variant="ghost"
                            size="small"
                            onClick={() => navigate('/finance/expenses')}
                        >
                            Ver Todas
                        </Button>
                    </div>

                    {recentExpenses.length === 0 ? (
                        <EmptyState
                            icon="💰"
                            title="Nenhuma despesa cadastrada"
                            description="Comece adicionando sua primeira conta ou despesa"
                            action={
                                <Button
                                    variant="primary"
                                    icon={<Plus size={20} />}
                                    onClick={() => navigate('/finance/expenses/new')}
                                >
                                    Adicionar Despesa
                                </Button>
                            }
                        />
                    ) : (
                        <div style={pageStyles.cardList}>
                            {recentExpenses.map((expense) => (
                                <Card
                                    key={expense.id}
                                    onClick={() => navigate(`/finance/expenses/${expense.id}`)}
                                    className="stagger-item"
                                >
                                    <CardHeader
                                        icon={<DollarSign size={24} />}
                                        title={expense.title}
                                        subtitle={`${expense.category} • ${expense.paidInstallments || 0}/${expense.installments} pagas`}
                                        iconVariant="primary"
                                    />
                                    <CardBody>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                                    Total
                                                </div>
                                                <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)' }}>
                                                    {formatCurrency(expense.totalAmount)}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                                    Restante
                                                </div>
                                                <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-warning)' }}>
                                                    {formatCurrency(expense.remainingAmount || 0)}
                                                </div>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Categories Overview */}
                <div style={pageStyles.section}>
                    <h2 style={pageStyles.sectionTitle}>Acesso Rápido</h2>
                    <div style={pageStyles.cardList}>
                        <Card onClick={() => navigate('/finance/expenses')}>
                            <CardHeader
                                icon={<DollarSign size={24} />}
                                title="Todas as Despesas"
                                subtitle="Ver lista completa"
                                iconVariant="primary"
                            />
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default FinancePage;
