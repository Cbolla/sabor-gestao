import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Upload, Eye } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/common/Card';
import { Button, IconButton } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import { useExpenseDetail } from '../../hooks/useExpenses';
import { formatCurrency } from '../../utils/currencyUtils';
import { formatDate, isOverdue } from '../../utils/dateUtils';

const pageStyles = {
    container: {
        padding: 'var(--spacing-md)',
    },
    header: {
        marginBottom: 'var(--spacing-lg)',
    },
    backButton: {
        marginBottom: 'var(--spacing-md)',
    },
    section: {
        marginBottom: 'var(--spacing-xl)',
    },
    sectionTitle: {
        fontSize: 'var(--font-size-lg)',
        fontWeight: 'var(--font-weight-bold)',
        marginBottom: 'var(--spacing-md)',
    },
    infoGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 'var(--spacing-md)',
    },
    infoItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-xs)',
    },
    infoLabel: {
        fontSize: 'var(--font-size-sm)',
        color: 'var(--color-text-secondary)',
    },
    infoValue: {
        fontSize: 'var(--font-size-base)',
        fontWeight: 'var(--font-weight-semibold)',
    },
    cardList: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-md)',
    },
    fileInput: {
        display: 'none',
    },
};

export const ExpenseDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { expense, installments, loading, markAsPaid, uploadProof } = useExpenseDetail(id);

    const [selectedInstallment, setSelectedInstallment] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showProofModal, setShowProofModal] = useState(false);
    const [uploadingProof, setUploadingProof] = useState(false);
    const [markingAsPaid, setMarkingAsPaid] = useState(false);

    const handleMarkAsPaid = async (installmentId, withProof = false) => {
        setMarkingAsPaid(true);
        try {
            await markAsPaid(installmentId, null);
            setShowPaymentModal(false);
            setSelectedInstallment(null);
        } catch (error) {
            alert('Erro ao marcar como pago: ' + error.message);
        } finally {
            setMarkingAsPaid(false);
        }
    };

    const handleUploadProof = async (installmentId, file) => {
        setUploadingProof(true);
        try {
            await uploadProof(installmentId, file);
            setShowProofModal(false);
            setSelectedInstallment(null);
        } catch (error) {
            alert('Erro ao enviar comprovante: ' + error.message);
        } finally {
            setUploadingProof(false);
        }
    };

    const handleFileSelect = (e, installmentId) => {
        const file = e.target.files?.[0];
        if (file) {
            handleUploadProof(installmentId, file);
        }
    };

    if (loading) {
        return (
            <AppLayout title="Detalhes da Despesa">
                <LoadingSpinner />
            </AppLayout>
        );
    }

    if (!expense) {
        return (
            <AppLayout title="Despesa não encontrada">
                <div style={pageStyles.container}>
                    <Button onClick={() => navigate('/finance/expenses')}>
                        Voltar
                    </Button>
                </div>
            </AppLayout>
        );
    }

    const getInstallmentVariant = (installment) => {
        if (installment.status === 'paid') return 'success';
        if (isOverdue(installment.dueDate)) return 'danger';
        return 'warning';
    };

    return (
        <AppLayout title={expense.title}>
            <div style={pageStyles.container}>
                <div style={pageStyles.header}>
                    <div style={pageStyles.backButton}>
                        <Button
                            variant="ghost"
                            icon={<ArrowLeft size={20} />}
                            onClick={() => navigate('/finance/expenses')}
                        >
                            Voltar
                        </Button>
                    </div>

                    <Card clickable={false}>
                        <CardBody>
                            <div style={pageStyles.infoGrid}>
                                <div style={pageStyles.infoItem}>
                                    <span style={pageStyles.infoLabel}>Categoria</span>
                                    <span style={pageStyles.infoValue}>{expense.category}</span>
                                </div>
                                <div style={pageStyles.infoItem}>
                                    <span style={pageStyles.infoLabel}>Status</span>
                                    <StatusBadge status={expense.status} />
                                </div>
                                <div style={pageStyles.infoItem}>
                                    <span style={pageStyles.infoLabel}>Valor Total</span>
                                    <span style={pageStyles.infoValue}>{formatCurrency(expense.totalAmount)}</span>
                                </div>
                                <div style={pageStyles.infoItem}>
                                    <span style={pageStyles.infoLabel}>Restante</span>
                                    <span style={pageStyles.infoValue}>{formatCurrency(expense.remainingAmount || 0)}</span>
                                </div>
                                <div style={pageStyles.infoItem}>
                                    <span style={pageStyles.infoLabel}>Parcelas</span>
                                    <span style={pageStyles.infoValue}>
                                        {expense.paidInstallments || 0}/{expense.installments}
                                    </span>
                                </div>
                                {expense.paymentMethod && (
                                    <div style={pageStyles.infoItem}>
                                        <span style={pageStyles.infoLabel}>Forma de Pagamento</span>
                                        <span style={pageStyles.infoValue}>{expense.paymentMethod}</span>
                                    </div>
                                )}
                            </div>
                            {expense.description && (
                                <div style={{ marginTop: 'var(--spacing-md)' }}>
                                    <span style={pageStyles.infoLabel}>Observações</span>
                                    <p style={{ marginTop: 'var(--spacing-xs)' }}>{expense.description}</p>
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </div>

                <div style={pageStyles.section}>
                    <h2 style={pageStyles.sectionTitle}>Parcelas</h2>
                    <div style={pageStyles.cardList}>
                        {installments.map((installment) => (
                            <Card
                                key={installment.id}
                                variant={getInstallmentVariant(installment)}
                                clickable={false}
                            >
                                <CardHeader
                                    title={`Parcela ${installment.installmentNumber}/${expense.installments}`}
                                    subtitle={`Vencimento: ${formatDate(installment.dueDate)}`}
                                    action={<StatusBadge status={installment.status} />}
                                />
                                <CardBody>
                                    <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)' }}>
                                        {formatCurrency(installment.amount)}
                                    </div>
                                    {installment.paidAt && (
                                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-xs)' }}>
                                            Pago em: {formatDate(installment.paidAt)}
                                        </div>
                                    )}
                                </CardBody>
                                <CardFooter>
                                    {installment.status === 'paid' ? (
                                        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', width: '100%' }}>
                                            {installment.paymentProof ? (
                                                <Button
                                                    variant="outline"
                                                    size="small"
                                                    fullWidth
                                                    icon={<Eye size={16} />}
                                                    onClick={() => window.open(installment.paymentProof, '_blank')}
                                                >
                                                    Ver Comprovante
                                                </Button>
                                            ) : (
                                                <>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        style={pageStyles.fileInput}
                                                        id={`file-${installment.id}`}
                                                        onChange={(e) => handleFileSelect(e, installment.id)}
                                                    />
                                                    <Button
                                                        variant="outline"
                                                        size="small"
                                                        fullWidth
                                                        icon={<Upload size={16} />}
                                                        onClick={() => document.getElementById(`file-${installment.id}`).click()}
                                                        loading={uploadingProof}
                                                    >
                                                        Enviar Comprovante
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <Button
                                            variant="success"
                                            size="small"
                                            fullWidth
                                            icon={<Check size={16} />}
                                            onClick={() => {
                                                setSelectedInstallment(installment);
                                                setShowPaymentModal(true);
                                            }}
                                        >
                                            Marcar como Pago
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Payment Confirmation Modal */}
                <Modal
                    isOpen={showPaymentModal}
                    onClose={() => setShowPaymentModal(false)}
                    title="Confirmar Pagamento"
                    footer={
                        <>
                            <Button
                                variant="outline"
                                onClick={() => setShowPaymentModal(false)}
                                disabled={markingAsPaid}
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="success"
                                onClick={() => handleMarkAsPaid(selectedInstallment?.id)}
                                loading={markingAsPaid}
                                icon={<Check size={20} />}
                            >
                                Confirmar
                            </Button>
                        </>
                    }
                >
                    <p>
                        Deseja marcar a parcela {selectedInstallment?.installmentNumber} de{' '}
                        {formatCurrency(selectedInstallment?.amount)} como paga?
                    </p>
                    <p style={{ marginTop: 'var(--spacing-md)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                        Você poderá enviar o comprovante depois.
                    </p>
                </Modal>
            </div>
        </AppLayout>
    );
};

export default ExpenseDetailPage;
