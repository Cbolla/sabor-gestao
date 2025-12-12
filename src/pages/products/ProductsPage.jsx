import React, { useState } from 'react';
import { Plus, Package, Search, Pencil, Trash2 } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { TextArea } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { useProducts } from '../../hooks/useProducts';
import { formatCurrency } from '../../utils/currencyUtils';

import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';

const defaultCategories = [
    { value: 'cake', label: 'Bolo' },
    { value: 'sweet', label: 'Doce' },
    { value: 'salty', label: 'Salgado' },
    { value: 'drink', label: 'Bebida' },
    { value: 'other', label: 'Outro' },
];

const pageStyles = {
    container: { padding: 'var(--spacing-md)' },
    header: { marginBottom: 'var(--spacing-lg)' },
    searchBar: { marginBottom: 'var(--spacing-md)' },
    cardList: { display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' },
    form: { display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' },
    priceRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' },
};

export const ProductsPage = () => {
    const { products, loading, createProduct, updateProduct, deleteProduct, loadMore, hasMore, refreshProducts } = useProducts();
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [saving, setSaving] = useState(false);

    // Delete states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const [formData, setFormData] = useState({
        name: '', description: '', category: '', price: '', cost: ''
    });

    const { establishment, setEstablishment } = useAuth();
    const customCategories = establishment?.categories?.map(c => ({ value: c, label: c })) || [];
    const allCategoryOptions = [...defaultCategories, ...customCategories];

    const handleAddCategory = async () => {
        const newCategory = prompt('Nome da nova categoria:');
        if (!newCategory) return;

        if (allCategoryOptions.some(c => c.label.toLowerCase() === newCategory.toLowerCase())) {
            alert('Categoria já existe!');
            return;
        }

        try {
            const establishmentRef = doc(db, 'establishments', establishment.id);
            await updateDoc(establishmentRef, {
                categories: arrayUnion(newCategory)
            });

            setEstablishment(prev => ({
                ...prev,
                categories: [...(prev.categories || []), newCategory]
            }));

            setFormData(prev => ({ ...prev, category: newCategory }));
        } catch (error) {
            console.error("Error adding category:", error);
            alert("Erro ao salvar categoria.");
        }
    };

    // Client-side filter for now (since products list is paginated)
    const filteredProducts = products.filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDeleteClick = (product) => {
        setProductToDelete(product);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!productToDelete) return;
        setDeleting(true);
        try {
            await deleteProduct(productToDelete.id);
            setShowDeleteModal(false);
            setProductToDelete(null);
        } catch (error) {
            alert('Erro ao excluir: ' + error.message);
        } finally {
            setDeleting(false);
        }
    };

    const handleEditClick = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name || '',
            description: product.description || '',
            category: product.category || '',
            price: product.price || '',
            cost: product.cost || ''
        });
        setShowModal(true);
    };

    const handleNewProduct = () => {
        setEditingProduct(null);
        setFormData({ name: '', description: '', category: '', price: '', cost: '' });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const productData = {
                ...formData,
                price: parseFloat(formData.price) || 0,
                cost: parseFloat(formData.cost) || 0,
            };

            if (editingProduct) {
                await updateProduct(editingProduct.id, productData);
            } else {
                await createProduct(productData);
            }
            setShowModal(false);
            setEditingProduct(null);
            setFormData({ name: '', description: '', category: '', price: '', cost: '' });
        } catch (error) {
            alert('Erro ao salvar produto: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    // Removed blocking loading state to improve perceived performance

    return (
        <AppLayout title="Produtos">
            <div style={pageStyles.container}>
                <div style={pageStyles.header}>
                    <Button variant="primary" fullWidth icon={<Plus size={20} />} onClick={handleNewProduct}>
                        Novo Produto
                    </Button>
                </div>

                <div style={pageStyles.searchBar}>
                    <Input type="text" placeholder="Buscar produtos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>

                {filteredProducts.length === 0 ? (
                    <EmptyState icon="📦" title={searchTerm ? "Nenhum produto encontrado" : "Nenhum produto cadastrado"}
                        description={searchTerm ? "Tente buscar por outro termo" : "Adicione seu primeiro produto"}
                        action={!searchTerm && <Button variant="primary" icon={<Plus size={20} />} onClick={handleNewProduct}>Adicionar Produto</Button>} />
                ) : (
                    <div style={pageStyles.cardList}>
                        {filteredProducts.map((product) => (
                            <Card key={product.id} className="stagger-item">
                                <CardHeader
                                    icon={<Package size={24} />}
                                    title={product.name}
                                    subtitle={product.category}
                                    iconVariant="warning"
                                    action={
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            <button
                                                onClick={() => handleEditClick(product)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '4px', color: 'var(--color-text-secondary)' }}
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(product)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '4px', color: 'var(--color-danger)' }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    }
                                />
                                <CardBody>
                                    {product.description && <p style={{ marginBottom: 'var(--spacing-sm)', color: 'var(--color-text-secondary)' }}>{product.description}</p>}
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <div>
                                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Preço</div>
                                            <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-success)' }}>
                                                {formatCurrency(product.price)}
                                            </div>
                                        </div>
                                        {product.cost > 0 && (
                                            <>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Custo</div>
                                                    <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)' }}>
                                                        {formatCurrency(product.cost)}
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Lucro</div>
                                                    <div style={{
                                                        fontSize: 'var(--font-size-base)',
                                                        fontWeight: 'var(--font-weight-bold)',
                                                        color: (product.price - product.cost) >= 0 ? 'var(--color-primary)' : 'var(--color-danger)'
                                                    }}>
                                                        {formatCurrency(product.price - product.cost)}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    {product.cost > 0 && product.price > 0 && (
                                        <div style={{
                                            marginTop: 'var(--spacing-xs)',
                                            padding: 'var(--spacing-xs) var(--spacing-sm)',
                                            backgroundColor: 'var(--color-surface-hover)',
                                            borderRadius: 'var(--radius-md)',
                                            fontSize: 'var(--font-size-sm)',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <span style={{ color: 'var(--color-text-secondary)' }}>Margem:</span>
                                            <span style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text)' }}>
                                                {((product.price - product.cost) / product.price * 100).toFixed(0)}%
                                            </span>
                                        </div>
                                    )}
                                </CardBody>
                            </Card>
                        ))}

                        {hasMore && (
                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--spacing-md)' }}>
                                <Button variant="outline" onClick={loadMore} loading={loading}>
                                    Carregar mais
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                <Modal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    title="Confirmar Exclusão"
                    footer={<>
                        <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancelar</Button>
                        <Button variant="primary" onClick={confirmDelete} loading={deleting} style={{ backgroundColor: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}>
                            Excluir
                        </Button>
                    </>}
                >
                    <p>Tem certeza que deseja excluir <strong>{productToDelete?.name}</strong>?</p>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: '8px' }}>Esta ação não poderá ser desfeita.</p>
                </Modal>

                <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingProduct ? "Editar Produto" : "Novo Produto"}
                    footer={<><Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
                        <Button variant="primary" onClick={handleSubmit} loading={saving}>Salvar</Button></>}>
                    <form style={pageStyles.form} onSubmit={handleSubmit}>
                        <Input type="text" label="Nome" placeholder="Nome do produto" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                            <div style={{ flex: 1 }}>
                                <Select label="Categoria" options={allCategoryOptions} value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required />
                            </div>
                            <Button type="button" variant="outline" onClick={handleAddCategory} style={{ marginBottom: '16px', padding: '10px' }}>
                                <Plus size={20} />
                            </Button>
                        </div>
                        <TextArea label="Descrição (opcional)" placeholder="Descrição do produto" rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                        <div style={pageStyles.priceRow}>
                            <Input type="number" label="Preço (R$)" placeholder="0.00" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
                            <Input type="number" label="Custo (R$)" placeholder="0.00" step="0.01" value={formData.cost} onChange={(e) => setFormData({ ...formData, cost: e.target.value })} />
                        </div>
                    </form>
                </Modal>
            </div>
        </AppLayout>
    );
};

export default ProductsPage;
