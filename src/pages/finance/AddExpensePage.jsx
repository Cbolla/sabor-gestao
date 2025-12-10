import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card, CardBody } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { TextArea } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useExpenses } from '../../hooks/useExpenses';
import { formatCurrency, parseCurrency } from '../../utils/currencyUtils';

const pageStyles = {
    container: {
        padding: 'var(--spacing-md)',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-md)',
    },
    buttonGroup: {
        display: 'flex',
        gap: 'var(--spacing-sm)',
        marginTop: 'var(--spacing-lg)',
    },
};

const categoryOptions = [
    { value: 'equipment', label: 'Equipamento' },
    { value: 'water', label: 'Água' },
    { value: 'electricity', label: 'Luz' },
    { value: 'ingredients', label: 'Insumos' },
    { value: 'investment', label: 'Investimento' },
    { value: 'debt', label: 'Dívida' },
    { value: 'rent', label: 'Aluguel' },
    { value: 'other', label: 'Outro' },
];

const paymentMethodOptions = [
    { value: 'card', label: 'Cartão' },
    { value: 'pix', label: 'PIX' },
    { value: 'boleto', label: 'Boleto' },
    { value: 'cash', label: 'Dinheiro' },
];

export const AddExpensePage = () => {
    const navigate = useNavigate();
    const { createExpense } = useExpenses();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        category: '',
        totalAmount: '',
        installments: '',
        firstDueDate: '',
        paymentMethod: '',
        supplier: '',
        description: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.title || !formData.category || !formData.totalAmount || !formData.installments || !formData.firstDueDate) {
            setError('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        const totalAmount = parseCurrency(formData.totalAmount);
        const installments = parseInt(formData.installments, 10);

        if (totalAmount <= 0) {
            setError('O valor total deve ser maior que zero.');
            return;
        }

        if (installments <= 0 || installments > 120) {
            setError('O número de parcelas deve ser entre 1 e 120.');
            return;
        }

        setLoading(true);

        try {
            const expenseData = {
                title: formData.title,
                category: formData.category,
                totalAmount,
                installments,
                firstDueDate: new Date(formData.firstDueDate).toISOString(),
                paymentMethod: formData.paymentMethod || 'other',
                supplier: formData.supplier || '',
                description: formData.description || '',
            };

            const expenseId = await createExpense(expenseData);
            navigate(`/finance/expenses/${expenseId}`);
        } catch (err) {
            setError(err.message || 'Erro ao criar despesa. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout title="Nova Despesa">
            <div style={pageStyles.container}>
                <Card clickable={false}>
                    <CardBody>
                        <form style={pageStyles.form} onSubmit={handleSubmit}>
                            {error && (
                                <div style={{
                                    padding: 'var(--spacing-md)',
                                    backgroundColor: '#FFCDD2',
                                    color: 'var(--color-danger)',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: 'var(--font-size-sm)',
                                }}>
                                    {error}
                                </div>
                            )}

                            <Input
                                type="text"
                                name="title"
                                label="Título"
                                placeholder="Ex: Máquina Masseira 3kg"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />

                            <Select
                                name="category"
                                label="Categoria"
                                options={categoryOptions}
                                value={formData.category}
                                onChange={handleChange}
                                required
                            />

                            <Input
                                type="number"
                                name="totalAmount"
                                label="Valor Total (R$)"
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                value={formData.totalAmount}
                                onChange={handleChange}
                                required
                                helperText="Digite o valor total da despesa"
                            />

                            <Input
                                type="number"
                                name="installments"
                                label="Número de Parcelas"
                                placeholder="12"
                                min="1"
                                max="120"
                                value={formData.installments}
                                onChange={handleChange}
                                required
                                helperText="Quantidade de parcelas (1 a 120)"
                            />

                            <Input
                                type="date"
                                name="firstDueDate"
                                label="Data da Primeira Parcela"
                                value={formData.firstDueDate}
                                onChange={handleChange}
                                required
                                helperText="As próximas parcelas serão geradas automaticamente"
                            />

                            <Select
                                name="paymentMethod"
                                label="Forma de Pagamento"
                                options={paymentMethodOptions}
                                value={formData.paymentMethod}
                                onChange={handleChange}
                            />

                            <Input
                                type="text"
                                name="supplier"
                                label="Fornecedor (opcional)"
                                placeholder="Nome do fornecedor"
                                value={formData.supplier}
                                onChange={handleChange}
                            />

                            <TextArea
                                name="description"
                                label="Observações (opcional)"
                                placeholder="Informações adicionais sobre esta despesa"
                                rows={3}
                                value={formData.description}
                                onChange={handleChange}
                            />

                            <div style={pageStyles.buttonGroup}>
                                <Button
                                    type="button"
                                    variant="outline"
                                    fullWidth
                                    onClick={() => navigate(-1)}
                                    disabled={loading}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    fullWidth
                                    loading={loading}
                                    icon={<Save size={20} />}
                                >
                                    Salvar
                                </Button>
                            </div>
                        </form>
                    </CardBody>
                </Card>
            </div>
        </AppLayout>
    );
};

export default AddExpensePage;
