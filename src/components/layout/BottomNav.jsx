
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    DollarSign,
    ShoppingBag,
    ChefHat,
    TrendingUp,
    Menu,
    Package,
    Users,
    Truck,
    ArrowRight,
    ArrowLeft,
    Settings
} from 'lucide-react';
import './BottomNav.css';

export const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showSecondary, setShowSecondary] = useState(false);

    const primaryItems = [
        { path: '/', icon: <LayoutDashboard size={24} />, label: 'Início' },
        { path: '/finance', icon: <DollarSign size={24} />, label: 'Finanças' },
        { path: '/orders', icon: <ShoppingBag size={24} />, label: 'Pedidos' },
        { path: '/products', icon: <Package size={24} />, label: 'Estoque' },
    ];

    const secondaryItems = [
        { path: '/kitchen', icon: <ChefHat size={24} />, label: 'Cozinha' },
        { path: '/deliveries', icon: <Truck size={24} />, label: 'Entregas' },
        { path: '/reports', icon: <TrendingUp size={24} />, label: 'Relatórios' },
        { path: '/customers', icon: <Users size={24} />, label: 'Clientes' },
        { path: '/settings', icon: <Settings size={24} />, label: 'Config' },
    ];

    const currentItems = showSecondary ? secondaryItems : primaryItems;

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <nav className="bottom-nav">
            {/* Toggle Button LEFT (only if secondary) */}
            {showSecondary && (
                <div
                    className="bottom-nav-item toggle"
                    onClick={() => setShowSecondary(false)}
                >
                    <div className="bottom-nav-icon"><ArrowLeft size={24} /></div>
                    <span className="bottom-nav-label">Voltar</span>
                </div>
            )}

            {currentItems.map((item) => (
                <div
                    key={item.path}
                    className={`bottom-nav-item ${isActive(item.path) ? 'active' : ''}`}
                    onClick={() => navigate(item.path)}
                >
                    <div className="bottom-nav-icon">{item.icon}</div>
                    <span className="bottom-nav-label">{item.label}</span>
                </div>
            ))}

            {/* Toggle Button RIGHT (only if primary) */}
            {!showSecondary && (
                <div
                    className="bottom-nav-item toggle"
                    onClick={() => setShowSecondary(true)}
                >
                    <div className="bottom-nav-icon"><ArrowRight size={24} /></div>
                    <span className="bottom-nav-label">Mais</span>
                </div>
            )}
        </nav>
    );
};

export default BottomNav;
