import { useState, useEffect } from 'react';
import { dbService } from '../services/db.service';
import { useAuth } from '../contexts/AuthContext';

export const useProducts = () => {
    const { establishment } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const ITEMS_PER_PAGE = 20;

    const fetchProducts = async (isInitial = true) => {
        if (!establishment?.id) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            const result = await dbService.getPaginatedDocuments(
                'products',
                {
                    where: { field: 'establishmentId', value: establishment.id },
                    orderBy: { field: 'name', direction: 'asc' }
                },
                isInitial ? 0 : offset,
                ITEMS_PER_PAGE
            );

            if (isInitial) {
                setProducts(result.data);
                setOffset(0);
            } else {
                setProducts(prev => [...prev, ...result.data]);
            }

            setOffset(result.offset);
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
        setOffset(0);
        setHasMore(true);
        fetchProducts(true);
    };

    const createProduct = async (productData) => {
        try {
            if (!establishment?.id) throw new Error('Estabelecimento não encontrado');

            const productId = await dbService.addDocument('products', {
                ...productData,
                establishmentId: establishment.id,
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
            await dbService.updateDocument('products', productId, productData);
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
            await dbService.deleteDocument('products', productId);
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
