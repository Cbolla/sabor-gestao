import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
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

export const LoginPage = () => {
    const navigate = useNavigate();
    const { signIn, user } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

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
        setLoading(true);

        try {
            await signIn(formData.email, formData.password);
        } catch (err) {
            setError(err.message || 'Erro ao fazer login');
            setLoading(false);
        }
    };

    return (
        <div style={pageStyles.container}>
            <div style={pageStyles.card} className="animate-scale-in">
                <div style={pageStyles.header}>
                    <div style={pageStyles.logo}>🍰</div>
                    <h1 style={pageStyles.title}>Sabor da Promessa</h1>
                    <p style={pageStyles.subtitle}>Gestão de Confeitaria</p>
                </div>

                {error && (
                    <div style={pageStyles.error}>
                        {error}
                    </div>
                )}

                <form style={pageStyles.form} onSubmit={handleSubmit}>
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
                        type="password"
                        name="password"
                        label="Senha"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <Button
                        type="submit"
                        variant="primary"
                        fullWidth
                        loading={loading}
                        icon={<LogIn size={20} />}
                    >
                        Entrar
                    </Button>
                </form>

                <div style={pageStyles.footer}>
                    Não tem uma conta?{' '}
                    <Link to="/register" style={pageStyles.link}>
                        Cadastre-se
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
