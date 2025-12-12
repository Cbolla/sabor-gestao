import React from 'react';
import { LogOut, User, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { IconButton } from '../common/Button';

const headerStyles = {
    container: {
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        padding: 'var(--spacing-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 'var(--z-sticky)',
        boxShadow: 'var(--shadow-sm)',
    },
    left: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-md)',
    },
    logo: {
        fontSize: '32px',
    },
    info: {
        display: 'flex',
        flexDirection: 'column',
    },
    title: {
        fontSize: 'var(--font-size-lg)',
        fontWeight: 'var(--font-weight-bold)',
        color: 'var(--color-text)',
        margin: 0,
    },
    subtitle: {
        fontSize: 'var(--font-size-sm)',
        color: 'var(--color-text-secondary)',
        margin: 0,
    },
    right: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-sm)',
    },
};

export const Header = ({ title }) => {
    const { establishment, user, signOut } = useAuth();

    const handleSignOut = async () => {
        if (window.confirm('Deseja realmente sair?')) {
            await signOut();
        }
    };

    return (
        <header style={headerStyles.container}>
            <div style={headerStyles.left}>
                <img
                    src={establishment?.logoUrl || '/logo_default.png'}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/logo.jpg';
                    }}
                    alt="Logo"
                    style={{ height: '40px', width: '40px', objectFit: 'cover', borderRadius: '50%' }}
                />
                <div style={headerStyles.info}>
                    <h1 style={headerStyles.title}>
                        {title || establishment?.name || 'Sabor da Promessa'}
                    </h1>
                    {user && (
                        <p style={headerStyles.subtitle}>
                            {user.displayName || user.email}
                        </p>
                    )}
                </div>
            </div>
            <div style={headerStyles.right}>
                <IconButton
                    icon={<LogOut size={20} />}
                    onClick={handleSignOut}
                    variant="ghost"
                />
            </div>
        </header>
    );
};

export default Header;
