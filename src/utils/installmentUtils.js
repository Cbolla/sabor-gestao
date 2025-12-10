import { addMonthsToDate } from './dateUtils';

/**
 * Calculate installment value
 */
export const calculateInstallmentValue = (totalAmount, installments) => {
    if (!totalAmount || !installments || installments === 0) return 0;
    return totalAmount / installments;
};

/**
 * Generate installment data for creation
 * Returns array of installment objects ready to be saved to Firestore
 */
export const generateInstallments = (expenseData) => {
    const {
        totalAmount,
        installments: totalInstallments,
        firstDueDate,
    } = expenseData;

    if (!totalAmount || !totalInstallments || !firstDueDate) {
        throw new Error('Missing required data for installment generation');
    }

    const installmentValue = calculateInstallmentValue(totalAmount, totalInstallments);
    const installmentsArray = [];

    for (let i = 0; i < totalInstallments; i++) {
        const dueDate = addMonthsToDate(firstDueDate, i);

        installmentsArray.push({
            installmentNumber: i + 1,
            amount: installmentValue,
            dueDate: dueDate.toISOString(),
            status: 'pending',
            paidAt: null,
            paidBy: null,
            paymentProof: null,
            notes: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
    }

    return installmentsArray;
};

/**
 * Calculate expense summary
 */
export const calculateExpenseSummary = (expense, installments = []) => {
    const totalInstallments = installments.length;
    const paidInstallments = installments.filter(i => i.status === 'paid').length;
    const pendingInstallments = installments.filter(i => i.status === 'pending').length;
    const overdueInstallments = installments.filter(i => i.status === 'overdue').length;

    const paidAmount = installments
        .filter(i => i.status === 'paid')
        .reduce((sum, i) => sum + (i.amount || 0), 0);

    const remainingAmount = expense.totalAmount - paidAmount;

    const progress = totalInstallments > 0
        ? (paidInstallments / totalInstallments) * 100
        : 0;

    return {
        totalInstallments,
        paidInstallments,
        pendingInstallments,
        overdueInstallments,
        paidAmount,
        remainingAmount,
        progress: Math.round(progress),
    };
};

/**
 * Get installment status based on due date and payment
 */
export const getInstallmentStatus = (installment) => {
    if (installment.status === 'paid') {
        return 'paid';
    }

    const dueDate = new Date(installment.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    if (dueDate < today) {
        return 'overdue';
    }

    return 'pending';
};

/**
 * Update installment statuses based on due dates
 */
export const updateInstallmentStatuses = (installments) => {
    return installments.map(installment => ({
        ...installment,
        status: getInstallmentStatus(installment),
    }));
};

export default {
    calculateInstallmentValue,
    generateInstallments,
    calculateExpenseSummary,
    getInstallmentStatus,
    updateInstallmentStatuses,
};
