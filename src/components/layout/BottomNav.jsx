import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    DollarSign,
    ShoppingBag,
    ChefHat,
    Menu
} from 'lucide-react';

const navStyles = {
    container: {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: 'var(--spacing-sm) 0',
        zIndex: 'var(--z-fixed)',
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
    },
    item: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--spacing-xs)',
        padding: 'var(--spacing-sm)',
        minWidth: '64px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        borderRadius: 'var(--radius-md)',
        WebkitTapHighlightColor: 'transparent',
    },
    icon: {
        fontSize: '24px',
    },
    label: {
        fontSize: 'var(--font-size-xs)',
        fontWeight: 'var(--font-weight-medium)',
    },
};

export const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        {
            path: '/',
            icon: <LayoutDashboard size={24} />,
            label: 'Início',
        },
        {
            path: '/finance',
            icon: <DollarSign size={24} />,
            label: 'Finanças',
        },
        {
            path: '/orders',
            icon: <ShoppingBag size={24} />,
            label: 'Pedidos',
        },
        {
            path: '/kitchen',
            icon: <ChefHat size={24} />,
            label: 'Cozinha',
        },
        {
            path: '/menu',
            icon: <Menu size={24} />,
            label: 'Menu',
        },
    ];

    const isActive = (path) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    const getItemStyle = (path) => {
        const active = isActive(path);
        return {
            ...navStyles.item,
            color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            backgroundColor: active ? 'var(--color-primary-light)' : 'transparent',
        };
    };

    return (
        <nav style={navStyles.container}>
            {navItems.map((item) => (
                <div
                    key={item.path}
                    style={getItemStyle(item.path)}
                    onClick={() => navigate(item.path)}
                >
                    <div style={navStyles.icon}>{item.icon}</div>
                    <span style={navStyles.label}>{item.label}</span>
                </div>
            ))}
        </nav>
    );
};

export default BottomNav;
