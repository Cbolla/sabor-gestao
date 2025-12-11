import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Search, Phone, Mail, Trash2, Pencil } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { useCustomers } from '../../hooks/useCustomers';

const pageStyles = {
    container: { padding: 'var(--spacing-md)' },
    header: { marginBottom: 'var(--spacing-lg)' },
    searchBar: { marginBottom: 'var(--spacing-md)' },
    cardList: { display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' },
    form: { display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' },
};

export const CustomersPage = () => {
    const navigate = useNavigate();
    const { customers, loading, createCustomer, updateCustomer, deleteCustomer, loadMore, hasMore, searchCustomers, refreshCustomers } = useCustomers();
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState(null);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [formData, setFormData] = useState({
        name: '', phone: '', email: '', cpf: '', birthDate: '', notes: '',
        address: { street: '', number: '', neighborhood: '', city: '', state: '', zipCode: '' }
    });

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            searchCustomers(searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleEditClick = (customer) => {
        setEditingCustomer(customer);
        setFormData({
            name: customer.name,
            phone: customer.phone || '',
            email: customer.email || '',
            cpf: customer.cpf || '',
            birthDate: customer.birthDate || '',
            notes: customer.notes || '',
            address: customer.address || { street: '', number: '', neighborhood: '', city: '', state: '', zipCode: '' }
        });
        setShowModal(true);
    };

    const handleNewCustomer = () => {
        setEditingCustomer(null);
        setFormData({ name: '', phone: '', email: '', cpf: '', birthDate: '', notes: '', address: { street: '', number: '', neighborhood: '', city: '', state: '', zipCode: '' } });
        setShowModal(true);
    };

    const handleDeleteClick = (customer) => {
        setCustomerToDelete(customer);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!customerToDelete) return;

        setDeleting(true);
        try {
            await deleteCustomer(customerToDelete.id);
            setShowDeleteModal(false);
            setCustomerToDelete(null);
        } catch (error) {
            alert('Erro ao excluir cliente: ' + error.message);
        } finally {
            setDeleting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingCustomer) {
                await updateCustomer(editingCustomer.id, formData);
            } else {
                await createCustomer(formData);
            }
            setShowModal(false);
            setFormData({ name: '', phone: '', email: '', cpf: '', birthDate: '', notes: '', address: { street: '', number: '', neighborhood: '', city: '', state: '', zipCode: '' } });
            refreshCustomers(); // Refresh list after creation/update
        } catch (error) {
            alert('Erro ao salvar cliente: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    // if (loading && customers.length === 0) return <AppLayout title="Clientes"><LoadingSpinner /></AppLayout>;
    // Better to let the shell render and show spinner inside content area if needed, 
    // but for now let's just keep the layout consistent. 
    // We'll remove the blocking return and handle loading in the list area.

    return (
        <AppLayout title="Clientes">
            <div style={pageStyles.container}>
                <div style={pageStyles.header}>
                    <Button variant="primary" fullWidth icon={<Plus size={20} />} onClick={handleNewCustomer}>
                        Novo Cliente
                    </Button>
                </div>

                <div style={pageStyles.searchBar}>
                    <Input type="text" placeholder="Buscar clientes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>

                {customers.length === 0 && !loading ? (
                    <EmptyState icon="👥" title={searchTerm ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
                        description={searchTerm ? "Tente buscar por outro termo" : "Adicione seu primeiro cliente"}
                        action={!searchTerm && <Button variant="primary" icon={<Plus size={20} />} onClick={handleNewCustomer}>Adicionar Cliente</Button>} />
                ) : (
                    <div style={pageStyles.cardList}>
                        {customers.map((customer) => (
                            <Card key={customer.id} className="stagger-item">
                                <CardHeader
                                    icon={<Users size={24} />}
                                    title={customer.name}
                                    subtitle={customer.phone || customer.email}
                                    iconVariant="info"
                                    action={
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                            <button
                                                onClick={() => handleEditClick(customer)}
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
                                            <button
                                                onClick={() => handleDeleteClick(customer)}
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
                                                    e.currentTarget.style.backgroundColor = 'var(--color-danger-light)';
                                                    e.currentTarget.style.color = 'var(--color-danger)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                                                }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    }
                                />
                                <CardBody>
                                    {customer.phone && <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)' }}>
                                        <Phone size={16} /> <span>{customer.phone}</span>
                                    </div>}
                                    {customer.email && <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                        <Mail size={16} /> <span>{customer.email}</span>
                                    </div>}
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

                {/* Delete Confirmation Modal */}
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
                    <p>Tem certeza que deseja excluir <strong>{customerToDelete?.name}</strong>?</p>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-sm)' }}>
                        Esta ação não pode ser desfeita.
                    </p>
                </Modal>

                <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingCustomer ? "Editar Cliente" : "Novo Cliente"}
                    footer={<><Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
                        <Button variant="primary" onClick={handleSubmit} loading={saving}>Salvar</Button></>}>
                    <form style={pageStyles.form} onSubmit={handleSubmit}>
                        <Input type="text" label="Nome" placeholder="Nome do cliente" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                        <Input type="tel" label="Telefone" placeholder="(11) 99999-9999" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
                        <Input type="email" label="E-mail (opcional)" placeholder="cliente@email.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                        <Input type="text" label="CPF (opcional)" placeholder="000.000.000-00" value={formData.cpf} onChange={(e) => setFormData({ ...formData, cpf: e.target.value })} />
                    </form>
                </Modal>
            </div>
        </AppLayout>
    );
};

export default CustomersPage;
