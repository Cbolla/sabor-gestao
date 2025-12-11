import { useState, useEffect } from 'react';
import { orderBy, where } from 'firebase/firestore';
import { firestoreService } from '../services/firestore.service';
import { storageService } from '../services/storage.service';
import { useAuth } from '../contexts/AuthContext';
import { generateInstallments } from '../utils/installmentUtils';

export const useExpenses = () => {
    const { establishment } = useAuth();
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchExpenses = async () => {
        if (!establishment?.id) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const collectionPath = `establishments/${establishment.id}/expenses`;
            const constraints = [
                orderBy('createdAt', 'desc')
            ];

            const result = await firestoreService.getDocuments(collectionPath, constraints);
            setExpenses(result);
            setError(null);
        } catch (err) {
            console.error('Error fetching expenses:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, [establishment?.id]);

    const createExpense = async (expenseData) => {
        try {
            if (!establishment?.id) throw new Error('Estabelecimento não encontrado');

            const installmentValue = expenseData.totalAmount / expenseData.installments;
            const collectionPath = `establishments/${establishment.id}/expenses`;

            const expenseId = await firestoreService.addDocument(collectionPath, {
                ...expenseData,
                installmentValue,
                status: 'active',
                paidInstallments: 0,
                remainingAmount: expenseData.totalAmount,
                createdBy: establishment.ownerId,
            });

            // Installments
            const installmentsData = generateInstallments(expenseData);
            const installmentsPath = `establishments/${establishment.id}/expenses/${expenseId}/installments`;

            await Promise.all(
                installmentsData.map((installment) =>
                    firestoreService.addDocument(installmentsPath, installment)
                )
            );

            fetchExpenses();
            return expenseId;
        } catch (err) {
            console.error('Error creating expense:', err);
            setError(err.message);
            throw err;
        }
    };

    const deleteExpense = async (expenseId) => {
        try {
            if (!establishment?.id) throw new Error('Estabelecimento não encontrado');

            const collectionPath = `establishments/${establishment.id}/expenses`;
            await firestoreService.deleteDocument(collectionPath, expenseId);

            // Note: Subcollections are not automatically deleted in Firestore.
            // For a production app we'd use a Cloud Function.
            // For now, we leave the orphaned subcollection.

            fetchExpenses();
            return true;
        } catch (err) {
            console.error('Error deleting expense:', err);
            setError(err.message);
            throw err;
        }
    };

    return { expenses, loading, error, createExpense, deleteExpense, refreshExpenses: fetchExpenses };
};

export const useExpenseDetail = (expenseId) => {
    const { establishment } = useAuth();
    const [expense, setExpense] = useState(null);
    const [installments, setInstallments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        if (!establishment?.id || !expenseId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            // Get Expense
            const collectionPath = `establishments/${establishment.id}/expenses`;
            const exp = await firestoreService.getDocument(collectionPath, expenseId);
            setExpense(exp);

            if (exp) {
                // Get Installments
                const installmentsPath = `establishments/${establishment.id}/expenses/${expenseId}/installments`;
                const constraints = [orderBy('installmentNumber', 'asc')];
                const insts = await firestoreService.getDocuments(installmentsPath, constraints);
                setInstallments(insts);
            }
        } catch (err) {
            console.error('Error fetching expense details:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [establishment?.id, expenseId]);

    const markAsPaid = async (installmentId, proofFile = null) => {
        try {
            if (!establishment?.id || !expenseId) throw new Error('Missing required data');

            let paymentProof = null;
            if (proofFile) {
                // Now we can use storageService if configured for Firebase Storage
                // or keep skipping if strictly Firestore usage without Storage rules
                // Assuming Storage is standard Firebase
                const uploadResult = await storageService.uploadPaymentProof(
                    proofFile,
                    establishment.id,
                    expenseId,
                    installmentId
                );
                paymentProof = uploadResult.url;
            }

            const installmentsPath = `establishments/${establishment.id}/expenses/${expenseId}/installments`;
            await firestoreService.updateDocument(installmentsPath, installmentId, {
                status: 'paid',
                paidAt: new Date().toISOString(),
                paidBy: establishment.ownerId,
                paymentProof,
            });

            // Update local state or re-fetch?
            // Re-fetch logic
            const allInstallments = await firestoreService.getDocuments(installmentsPath);
            // We just updated one, but getDocuments might be stale if no realtime listener?
            // firestoreService.getDocuments is a one-time fetch. It should be up to date after await update.

            const paidCount = allInstallments.filter(i => i.status === 'paid' || i.id === installmentId).length;
            // Note: if fetch returned old data, we manually account for current one.
            // But updateDocument awaits server completion.

            const paidAmount = allInstallments
                .filter(i => i.status === 'paid' || i.id === installmentId)
                .reduce((sum, i) => sum + (i.amount || 0), 0);

            const collectionPath = `establishments/${establishment.id}/expenses`;
            await firestoreService.updateDocument(collectionPath, expenseId, {
                paidInstallments: paidCount,
                remainingAmount: (expense.totalAmount - paidAmount),
                status: paidCount === allInstallments.length ? 'completed' : 'active'
            });

            fetchData();
            return true;
        } catch (err) {
            console.error('Error marking as paid:', err);
            setError(err.message);
            throw err;
        }
    };

    const uploadProof = async (installmentId, file) => {
        // ...
        return null;
    };

    return { expense, installments, loading, error, markAsPaid, uploadProof };
};

export default useExpenses;
