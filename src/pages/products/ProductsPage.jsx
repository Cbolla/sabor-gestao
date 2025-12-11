import React, { useState } from 'react';
import { Plus, Package, Search, Pencil } from 'lucide-react';
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

const categoryOptions = [
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
    const { products, loading, createProduct, updateProduct, loadMore, hasMore, refreshProducts } = useProducts();
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '', description: '', category: '', price: '', cost: ''
    });

    // Client-side filter for now (since products list is paginated)
    const filteredProducts = products.filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                                        <button
                                            onClick={() => handleEditClick(product)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                padding: 'var(--spacing-xs)',
                                                borderRadius: 'var(--radius-md)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'var(--color-text-secondary)',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = 'var(--color-primary-light)';
                                                e.currentTarget.style.color = 'var(--color-primary)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                e.currentTarget.style.color = 'var(--color-text-secondary)';
                                            }}
                                        >
                                            <Pencil size={18} />
                                        </button>
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

                <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingProduct ? "Editar Produto" : "Novo Produto"}
                    footer={<><Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
                        <Button variant="primary" onClick={handleSubmit} loading={saving}>Salvar</Button></>}>
                    <form style={pageStyles.form} onSubmit={handleSubmit}>
                        <Input type="text" label="Nome" placeholder="Nome do produto" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                        <Select label="Categoria" options={categoryOptions} value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required />
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
