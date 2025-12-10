import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, DollarSign, Search } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { StatusBadge } from '../../components/common/Badge';
import { useExpenses } from '../../hooks/useExpenses';
import { formatCurrency } from '../../utils/currencyUtils';

const pageStyles = {
    container: {
        padding: 'var(--spacing-md)',
    },
    header: {
        marginBottom: 'var(--spacing-lg)',
    },
    searchBar: {
        marginBottom: 'var(--spacing-md)',
    },
    cardList: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-md)',
    },
    progress: {
        width: '100%',
        height: '8px',
        backgroundColor: 'var(--color-border)',
        borderRadius: 'var(--radius-full)',
        overflow: 'hidden',
        marginTop: 'var(--spacing-sm)',
    },
    progressBar: {
        height: '100%',
        backgroundColor: 'var(--color-success)',
        transition: 'width 0.3s ease',
    },
};

export const ExpenseListPage = () => {
    const navigate = useNavigate();
    const { expenses, loading } = useExpenses();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredExpenses = useMemo(() => {
        if (!searchTerm) return expenses;

        const term = searchTerm.toLowerCase();
        return expenses.filter(expense =>
            expense.title?.toLowerCase().includes(term) ||
            expense.category?.toLowerCase().includes(term)
        );
    }, [expenses, searchTerm]);

    if (loading) {
        return (
            <AppLayout title="Despesas">
                <LoadingSpinner />
            </AppLayout>
        );
    }

    return (
        <AppLayout title="Despesas">
            <div style={pageStyles.container}>
                <div style={pageStyles.header}>
                    <Button
                        variant="primary"
                        fullWidth
                        icon={<Plus size={20} />}
                        onClick={() => navigate('/finance/expenses/new')}
                    >
                        Nova Despesa
                    </Button>
                </div>

                <div style={pageStyles.searchBar}>
                    <Input
                        type="text"
                        placeholder="Buscar despesas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {filteredExpenses.length === 0 ? (
                    <EmptyState
                        icon="💰"
                        title={searchTerm ? "Nenhuma despesa encontrada" : "Nenhuma despesa cadastrada"}
                        description={searchTerm ? "Tente buscar por outro termo" : "Adicione sua primeira despesa"}
                        action={
                            !searchTerm && (
                                <Button
                                    variant="primary"
                                    icon={<Plus size={20} />}
                                    onClick={() => navigate('/finance/expenses/new')}
                                >
                                    Adicionar Despesa
                                </Button>
                            )
                        }
                    />
                ) : (
                    <div style={pageStyles.cardList}>
                        {filteredExpenses.map((expense) => {
                            const progress = expense.installments > 0
                                ? ((expense.paidInstallments || 0) / expense.installments) * 100
                                : 0;

                            return (
                                <Card
                                    key={expense.id}
                                    onClick={() => navigate(`/finance/expenses/${expense.id}`)}
                                    className="stagger-item"
                                >
                                    <CardHeader
                                        icon={<DollarSign size={24} />}
                                        title={expense.title}
                                        subtitle={expense.category}
                                        iconVariant="primary"
                                        action={<StatusBadge status={expense.status} />}
                                    />
                                    <CardBody>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
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
                                                    Parcelas
                                                </div>
                                                <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)' }}>
                                                    {expense.paidInstallments || 0}/{expense.installments}
                                                </div>
                                            </div>
                                        </div>

                                        <div style={pageStyles.progress}>
                                            <div style={{ ...pageStyles.progressBar, width: `${progress}%` }} />
                                        </div>

                                        <div style={{ marginTop: 'var(--spacing-sm)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                            Restante: {formatCurrency(expense.remainingAmount || 0)}
                                        </div>
                                    </CardBody>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </AppLayout>
    );
};

export default ExpenseListPage;
