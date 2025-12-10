import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';

const pageStyles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-md)',
        background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
    },
    card: {
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--spacing-xl)',
        boxShadow: 'var(--shadow-xl)',
        width: '100%',
        maxWidth: '400px',
        maxHeight: '90vh',
        overflowY: 'auto',
    },
    header: {
        textAlign: 'center',
        marginBottom: 'var(--spacing-xl)',
    },
    logo: {
        fontSize: '48px',
        marginBottom: 'var(--spacing-md)',
    },
    title: {
        fontSize: 'var(--font-size-2xl)',
        fontWeight: 'var(--font-weight-bold)',
        color: 'var(--color-text)',
        marginBottom: 'var(--spacing-sm)',
    },
    subtitle: {
        fontSize: 'var(--font-size-base)',
        color: 'var(--color-text-secondary)',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-md)',
    },
    error: {
        padding: 'var(--spacing-md)',
        backgroundColor: '#FFCDD2',
        color: 'var(--color-danger)',
        borderRadius: 'var(--radius-md)',
        fontSize: 'var(--font-size-sm)',
        marginBottom: 'var(--spacing-md)',
    },
    footer: {
        textAlign: 'center',
        marginTop: 'var(--spacing-lg)',
        fontSize: 'var(--font-size-sm)',
        color: 'var(--color-text-secondary)',
    },
    link: {
        color: 'var(--color-primary)',
        fontWeight: 'var(--font-weight-semibold)',
        textDecoration: 'none',
    },
};

export const RegisterPage = () => {
    const navigate = useNavigate();
    const { signUp } = useAuth();
    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        password: '',
        confirmPassword: '',
        establishmentName: '',
        cnpj: '',
        phone: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        // Validate password length
        if (formData.password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        setLoading(true);

        try {
            await signUp(
                formData.email,
                formData.password,
                formData.displayName,
                formData.establishmentName
            );
            navigate('/');
        } catch (err) {
            setError(err.message || 'Erro ao criar conta');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={pageStyles.container}>
            <div style={pageStyles.card} className="animate-scale-in">
                <div style={pageStyles.header}>
                    <div style={pageStyles.logo}>🍰</div>
                    <h1 style={pageStyles.title}>Criar Conta</h1>
                    <p style={pageStyles.subtitle}>Cadastre seu estabelecimento</p>
                </div>

                {error && (
                    <div style={pageStyles.error}>
                        {error}
                    </div>
                )}

                <form style={pageStyles.form} onSubmit={handleSubmit}>
                    <Input
                        type="text"
                        name="displayName"
                        label="Seu Nome"
                        placeholder="João Silva"
                        value={formData.displayName}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        type="email"
                        name="email"
                        label="E-mail"
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        type="text"
                        name="establishmentName"
                        label="Nome do Estabelecimento"
                        placeholder="Sabor da Promessa"
                        value={formData.establishmentName}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        type="text"
                        name="cnpj"
                        label="CNPJ (opcional)"
                        placeholder="00.000.000/0000-00"
                        value={formData.cnpj}
                        onChange={handleChange}
                    />

                    <Input
                        type="tel"
                        name="phone"
                        label="Telefone (opcional)"
                        placeholder="(11) 99999-9999"
                        value={formData.phone}
                        onChange={handleChange}
                    />

                    <Input
                        type="password"
                        name="password"
                        label="Senha"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        helperText="Mínimo 6 caracteres"
                    />

                    <Input
                        type="password"
                        name="confirmPassword"
                        label="Confirmar Senha"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />

                    <Button
                        type="submit"
                        variant="primary"
                        fullWidth
                        loading={loading}
                        icon={<UserPlus size={20} />}
                    >
                        Cadastrar
                    </Button>
                </form>

                <div style={pageStyles.footer}>
                    Já tem uma conta?{' '}
                    <Link to="/login" style={pageStyles.link}>
                        Entrar
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
