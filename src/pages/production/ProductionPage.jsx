import React, { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select'; // Assuming this exists or using native select
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { useAuth } from '../../contexts/AuthContext';
import { useProducts } from '../../hooks/useProducts';
import { firestoreService } from '../../services/firestore.service';
import { formatCurrency } from '../../utils/currencyUtils';
import {
    Calendar,
    ClipboardList,
    Plus,
    Trash2,
    TrendingUp,
    DollarSign,
    Calculator
} from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

const pageStyles = {
    container: { padding: 'var(--spacing-md)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' },
    summaryCards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--spacing-md)' },
    summaryCard: {
        padding: 'var(--spacing-md)',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--color-surface)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
    },
    label: { fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' },
    value: { fontSize: 'var(--font-size-xl)', fontWeight: 'bold' },
    controls: { display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' },
    list: { display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' },
    item: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--spacing-sm)',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)'
    }
};

export const ProductionPage = () => {
    const { establishment } = useAuth();
    const { products } = useProducts(); // Assuming products are loaded
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [productionItems, setProductionItems] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form state for adding item
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState(1);

    // Load production data when date changes
    useEffect(() => {
        const loadCommonData = async () => {
            if (!establishment?.id) return;
            setLoading(true);
            try {
                // Path: establishments/{id}/production/{date} (doc)
                // Using setDoc with merge for updates
                const docRef = doc(db, `establishments/${establishment.id}/production`, selectedDate);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setProductionItems(docSnap.data().items || []);
                } else {
                    setProductionItems([]);
                }
            } catch (error) {
                console.error("Error loading production plan:", error);
                // alert("Erro ao carregar plano de produção.");
            } finally {
                setLoading(false);
            }
        };
        loadCommonData();
    }, [establishment?.id, selectedDate]);

    // Save whenever items change (Auto-save)
    // Using a debounce or simple effect might be too frequent. 
    // Let's us explicit save or effect with check.
    // For simplicity: Save on modification (add/remove) inside the handlers

    const saveItems = async (itemsToSave) => {
        if (!establishment?.id) return;
        try {
            const docRef = doc(db, `establishments/${establishment.id}/production`, selectedDate);
            await setDoc(docRef, {
                date: selectedDate,
                items: itemsToSave,
                updatedAt: new Date()
            }, { merge: true });
        } catch (err) {
            console.error("Error auto-saving:", err);
        }
    };

    const handleAddItem = async () => {
        if (!selectedProduct) return;
        const product = products.find(p => p.id === selectedProduct);
        if (!product) return;

        const newItem = {
            id: Date.now().toString(), // local unique id for list
            productId: product.id,
            name: product.name,
            quantity: parseInt(quantity),
            cost: product.cost || 0,
            price: product.price || 0
        };

        const updatedItems = [...productionItems, newItem];
        setProductionItems(updatedItems);
        setSelectedProduct('');
        setQuantity(1);
        await saveItems(updatedItems);
    };

    const handleRemoveItem = async (index) => {
        const updatedItems = productionItems.filter((_, i) => i !== index);
        setProductionItems(updatedItems);
        await saveItems(updatedItems);
    };

    // Metrics
    const metrics = useMemo(() => {
        return productionItems.reduce((acc, item) => {
            const totalCost = (item.cost || 0) * item.quantity;
            const totalPrice = (item.price || 0) * item.quantity;
            return {
                cost: acc.cost + totalCost,
                revenue: acc.revenue + totalPrice,
                profit: acc.profit + (totalPrice - totalCost)
            };
        }, { cost: 0, revenue: 0, profit: 0 });
    }, [productionItems]);

    // Derived Product Options
    const productOptions = products.map(p => ({ value: p.id, label: p.name }));

    return (
        <AppLayout title="Planejamento de Produção">
            <div style={pageStyles.container}>

                {/* Date Selector */}
                <Card>
                    <CardBody>
                        <div style={pageStyles.controls}>
                            <Calendar size={20} color="var(--color-primary)" />
                            <Input
                                type="date"
                                value={selectedDate}
                                onChange={e => setSelectedDate(e.target.value)}
                                style={{ margin: 0 }}
                            />
                        </div>
                    </CardBody>
                </Card>

                {/* Metrics Summary */}
                <div style={pageStyles.summaryCards}>
                    <div style={pageStyles.summaryCard}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <div style={{ padding: '8px', borderRadius: '50%', background: '#ffcdd2', color: '#c62828' }}>
                                <DollarSign size={16} />
                            </div>
                            <span style={pageStyles.label}>Custo Previsto</span>
                        </div>
                        <span style={{ ...pageStyles.value, color: '#c62828' }}>{formatCurrency(metrics.cost)}</span>
                    </div>

                    <div style={pageStyles.summaryCard}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <div style={{ padding: '8px', borderRadius: '50%', background: '#e1bee7', color: '#6a1b9a' }}>
                                <Calculator size={16} />
                            </div>
                            <span style={pageStyles.label}>Faturamento Estimado</span>
                        </div>
                        <span style={{ ...pageStyles.value, color: '#6a1b9a' }}>{formatCurrency(metrics.revenue)}</span>
                    </div>

                    <div style={pageStyles.summaryCard}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <div style={{ padding: '8px', borderRadius: '50%', background: '#c8e6c9', color: '#2e7d32' }}>
                                <TrendingUp size={16} />
                            </div>
                            <span style={pageStyles.label}>Lucro Projetado</span>
                        </div>
                        <span style={{ ...pageStyles.value, color: '#2e7d32' }}>{formatCurrency(metrics.profit)}</span>
                    </div>
                </div>

                {/* Add Item Form */}
                <Card>
                    <CardHeader icon={<ClipboardList size={20} />} title="O que será produzido?" />
                    <CardBody>
                        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                            <div style={{ flex: 2, minWidth: '150px' }}>
                                <div style={{ marginBottom: '8px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>Produto</div>
                                <select
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--color-border)',
                                        backgroundColor: 'var(--color-surface)'
                                    }}
                                    value={selectedProduct}
                                    onChange={e => setSelectedProduct(e.target.value)}
                                >
                                    <option value="">Selecione...</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ flex: 1, minWidth: '80px' }}>
                                <div style={{ marginBottom: '8px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>Qtd</div>
                                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ padding: '8px', border: 'none', background: 'transparent', cursor: 'pointer' }}>-</button>
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={e => setQuantity(parseInt(e.target.value) || 0)}
                                        style={{ width: '100%', border: 'none', textAlign: 'center', outline: 'none' }}
                                    />
                                    <button onClick={() => setQuantity(quantity + 1)} style={{ padding: '8px', border: 'none', background: 'transparent', cursor: 'pointer' }}>+</button>
                                </div>
                            </div>
                            <div style={{ flex: '0 0 auto' }}>
                                <Button variant="primary" onClick={handleAddItem} disabled={!selectedProduct}>
                                    <Plus size={20} />
                                </Button>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Items List */}
                <div style={pageStyles.list}>
                    {productionItems.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-secondary)' }}>
                            Nenhum item planejado para este dia.
                        </div>
                    ) : (
                        productionItems.map((item, index) => (
                            <div key={index} style={pageStyles.item}>
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>{item.quantity}x {item.name}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                                        Custo unit.: {formatCurrency(item.cost)} | Venda: {formatCurrency(item.price)}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Lucro Total</div>
                                        <div style={{ color: '#2e7d32', fontWeight: 'bold' }}>
                                            {formatCurrency((item.price - item.cost) * item.quantity)}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveItem(index)}
                                        style={{ border: 'none', background: 'none', color: 'var(--color-danger)', cursor: 'pointer', padding: '8px' }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

            </div>
        </AppLayout>
    );
};

export default ProductionPage;
