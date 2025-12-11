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
            const productId = await firestoreService.addDocument(collectionPath, {
                ...productData,
                isActive: true
            });

            refreshProducts();
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
            const collectionPath = `establishments/${establishment.id}/products`;
            await firestoreService.updateDocument(collectionPath, productId, productData);
            refreshProducts();
            return true;
        } catch (err) {
            console.error('Erro ao atualizar produto:', err);
            setError(err.message);
            throw err;
        }
    };

    const deleteProduct = async (productId) => {
        try {
            if (!establishment?.id) throw new Error('Estabelecimento não encontrado');
            const collectionPath = `establishments/${establishment.id}/products`;
            await firestoreService.deleteDocument(collectionPath, productId);
            refreshProducts();
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
