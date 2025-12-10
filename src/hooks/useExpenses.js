import { useState, useEffect } from 'react';
import { collection, doc, orderBy, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { firestoreService } from '../services/firestore.service';
import { storageService } from '../services/storage.service';
import { useAuth } from '../contexts/AuthContext';
import { generateInstallments } from '../utils/installmentUtils';

export const useExpenses = () => {
    const { establishment } = useAuth();
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!establishment?.id) {
            setLoading(false);
            return;
        }

        const collectionPath = `establishments/${establishment.id}/expenses`;

        const unsubscribe = firestoreService.subscribeToCollection(
            collectionPath,
            [orderBy('createdAt', 'desc')],
            (data) => {
                setExpenses(data);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [establishment?.id]);

    const createExpense = async (expenseData) => {
        try {
            if (!establishment?.id) {
                throw new Error('No establishment found');
            }

            const collectionPath = `establishments/${establishment.id}/expenses`;

            // Calculate installment value
            const installmentValue = expenseData.totalAmount / expenseData.installments;

            // Create expense document
            const expenseId = await firestoreService.addDocument(collectionPath, {
                ...expenseData,
                installmentValue,
                status: 'active',
                paidInstallments: 0,
                remainingAmount: expenseData.totalAmount,
                createdBy: establishment.ownerId,
            });

            // Generate and create installments
            const installmentsData = generateInstallments(expenseData);
            const installmentsPath = `${collectionPath}/${expenseId}/installments`;

            // Create all installments
            await Promise.all(
                installmentsData.map((installment) =>
                    firestoreService.addDocument(installmentsPath, installment)
                )
            );

            return expenseId;
        } catch (err) {
            console.error('Error creating expense:', err);
            setError(err.message);
            throw err;
        }
    };

    const deleteExpense = async (expenseId) => {
        try {
            if (!establishment?.id) {
                throw new Error('No establishment found');
            }

            const collectionPath = `establishments/${establishment.id}/expenses`;
            await firestoreService.deleteDocument(collectionPath, expenseId);

            return true;
        } catch (err) {
            console.error('Error deleting expense:', err);
            setError(err.message);
            throw err;
        }
    };

    return {
        expenses,
        loading,
        error,
        createExpense,
        deleteExpense,
    };
};

export const useExpenseDetail = (expenseId) => {
    const { establishment } = useAuth();
    const [expense, setExpense] = useState(null);
    const [installments, setInstallments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!establishment?.id || !expenseId) {
            setLoading(false);
            return;
        }

        const expensePath = `establishments/${establishment.id}/expenses`;
        const installmentsPath = `${expensePath}/${expenseId}/installments`;

        // Subscribe to expense
        const unsubscribeExpense = firestoreService.subscribeToDocument(
            expensePath,
            expenseId,
            (data) => {
                setExpense(data);
            }
        );

        // Subscribe to installments
        const unsubscribeInstallments = firestoreService.subscribeToCollection(
            installmentsPath,
            [orderBy('installmentNumber', 'asc')],
            (data) => {
                setInstallments(data);
                setLoading(false);
            }
        );

        return () => {
            unsubscribeExpense();
            unsubscribeInstallments();
        };
    }, [establishment?.id, expenseId]);

    const markAsPaid = async (installmentId, proofFile = null) => {
        try {
            if (!establishment?.id || !expenseId) {
                throw new Error('Missing required data');
            }

            const installmentsPath = `establishments/${establishment.id}/expenses/${expenseId}/installments`;

            let paymentProof = null;

            // Upload proof if provided
            if (proofFile) {
                const uploadResult = await storageService.uploadPaymentProof(
                    proofFile,
                    establishment.id,
                    expenseId,
                    installmentId
                );
                paymentProof = uploadResult.url;
            }

            // Update installment
            await firestoreService.updateDocument(installmentsPath, installmentId, {
                status: 'paid',
                paidAt: new Date().toISOString(),
                paidBy: establishment.ownerId,
                paymentProof,
            });

            // Update expense summary
            const paidCount = installments.filter(i =>
                i.status === 'paid' || i.id === installmentId
            ).length;

            const paidAmount = installments
                .filter(i => i.status === 'paid' || i.id === installmentId)
                .reduce((sum, i) => sum + (i.amount || 0), 0);

            const expensePath = `establishments/${establishment.id}/expenses`;
            await firestoreService.updateDocument(expensePath, expenseId, {
                paidInstallments: paidCount,
                remainingAmount: expense.totalAmount - paidAmount,
                status: paidCount === installments.length ? 'completed' : 'active',
            });

            return true;
        } catch (err) {
            console.error('Error marking as paid:', err);
            setError(err.message);
            throw err;
        }
    };

    const uploadProof = async (installmentId, file) => {
        try {
            if (!establishment?.id || !expenseId) {
                throw new Error('Missing required data');
            }

            const uploadResult = await storageService.uploadPaymentProof(
                file,
                establishment.id,
                expenseId,
                installmentId
            );

            const installmentsPath = `establishments/${establishment.id}/expenses/${expenseId}/installments`;
            await firestoreService.updateDocument(installmentsPath, installmentId, {
                paymentProof: uploadResult.url,
            });

            return uploadResult.url;
        } catch (err) {
            console.error('Error uploading proof:', err);
            setError(err.message);
            throw err;
        }
    };

    return {
        expense,
        installments,
        loading,
        error,
        markAsPaid,
        uploadProof,
    };
};

export default useExpenses;
