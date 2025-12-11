import { useState, useEffect } from 'react';
import { orderBy, where } from 'firebase/firestore';
import { firestoreService } from '../services/firestore.service';
import { useAuth } from '../contexts/AuthContext';

export const useProducts = () => {
    const { establishment } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastDoc, setLastDoc] = useState(null);
    const [hasMore, setHasMore] = useState(true);

    const ITEMS_PER_PAGE = 20;

    const fetchProducts = async (isInitial = true) => {
        if (!establishment?.id) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const collectionPath = `establishments/${establishment.id}/products`;
            const constraints = [
                orderBy('name', 'asc')
            ];

            const result = await firestoreService.getPaginatedDocuments(
                collectionPath,
                constraints,
                isInitial ? null : lastDoc,
                ITEMS_PER_PAGE
            );

            if (isInitial) {
                setProducts(result.data);
            } else {
                setProducts(prev => [...prev, ...result.data]);
            }

            setLastDoc(result.lastDoc);
            setHasMore(result.hasMore);
            setError(null);
        } catch (err) {
            console.error('Erro ao buscar produtos:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts(true);
    }, [establishment?.id]);

    const loadMore = () => {
        if (!loading && hasMore) {
            fetchProducts(false);
        }
    };

    const refreshProducts = () => {
        setLastDoc(null);
        setHasMore(true);
        fetchProducts(true);
    };

    const createProduct = async (productData) => {
        try {
            if (!establishment?.id) throw new Error('Estabelecimento não encontrado');

            const collectionPath = `establishments/${establishment.id}/products`;
            const docData = {
                ...productData,
                isActive: true
            };

            // Add to Firestore (resolves immediately with offline persistence)
            const productId = await firestoreService.addDocument(collectionPath, docData);

            // Optimistic Update
            setProducts(prev => [{
                id: productId,
                ...docData,
                createdAt: new Date(), // Local fallback
                updatedAt: new Date()
            }, ...prev]);

            return productId;
        } catch (err) {
            console.error('Erro ao criar produto:', err);
            setError(err.message);
            throw err;
        }
    };

    const updateProduct = async (productId, productData) => {
        try {
            if (!establishment?.id) throw new Error('Estabelecimento não encontrado');

            // Optimistic Update
            setProducts(prev => prev.map(p =>
                p.id === productId ? { ...p, ...productData } : p
            ));

            const collectionPath = `establishments/${establishment.id}/products`;
            await firestoreService.updateDocument(collectionPath, productId, productData);

            return true;
        } catch (err) {
            console.error('Erro ao atualizar produto:', err);
            setError(err.message);
            // Revert optimistic update? For MVP, simpler to just error.
            // But ideally we'd revert. For now we assume local write success.
            throw err;
        }
    };

    const deleteProduct = async (productId) => {
        try {
            if (!establishment?.id) throw new Error('Estabelecimento não encontrado');

            // Optimistic Update
            setProducts(prev => prev.filter(p => p.id !== productId));

            const collectionPath = `establishments/${establishment.id}/products`;
            await firestoreService.deleteDocument(collectionPath, productId);

            return true;
        } catch (err) {
            console.error('Erro ao deletar produto:', err);
            setError(err.message);
            throw err;
        }
    };

    return { products, loading, error, loadMore, hasMore, refreshProducts, createProduct, updateProduct, deleteProduct };
};

export default useProducts;
