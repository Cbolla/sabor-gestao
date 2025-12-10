import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Package, ShoppingCart, ShoppingBag, ChefHat, Truck, Warehouse, Settings, LogOut } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { Card, CardHeader } from '../components/common/Card';
import { useAuth } from '../contexts/AuthContext';

const pageStyles = {
    container: { padding: 'var(--spacing-md)' },
    cardList: { display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' },
};

export const MenuPage = () => {
    const navigate = useNavigate();
    const { signOut } = useAuth();

    const menuItems = [
        { title: 'Clientes', subtitle: 'Gerenciar clientes', icon: <Users size={24} />, iconVariant: 'info', path: '/customers' },
        { title: 'Produtos', subtitle: 'Catálogo de produtos', icon: <Package size={24} />, iconVariant: 'warning', path: '/products' },
        { title: 'Vendas', subtitle: 'PDV e vendas', icon: <ShoppingCart size={24} />, iconVariant: 'success', path: '/sales' },
        { title: 'Encomendas', subtitle: 'Pedidos personalizados', icon: <ShoppingBag size={24} />, iconVariant: 'primary', path: '/orders' },
        { title: 'Cozinha', subtitle: 'Produção (Kanban)', icon: <ChefHat size={24} />, iconVariant: 'secondary', path: '/kitchen' },
        { title: 'Entregas', subtitle: 'Gerenciar entregas', icon: <Truck size={24} />, iconVariant: 'info', path: '/deliveries' },
        { title: 'Estoque', subtitle: 'Ingredientes e insumos', icon: <Warehouse size={24} />, iconVariant: 'warning', path: '/stock' },
        { title: 'Configurações', subtitle: 'Ajustes do sistema', icon: <Settings size={24} />, iconVariant: 'neutral', path: '/settings' },
    ];

    const handleSignOut = async () => {
        if (window.confirm('Deseja realmente sair?')) {
            await signOut();
        }
    };

    return (
        <AppLayout title="Menu">
            <div style={pageStyles.container}>
                <div style={pageStyles.cardList}>
                    {menuItems.map((item, index) => (
                        <Card key={index} onClick={() => item.path && navigate(item.path)} className="stagger-item">
                            <CardHeader icon={item.icon} title={item.title} subtitle={item.subtitle} iconVariant={item.iconVariant} />
                        </Card>
                    ))}

                    <Card onClick={handleSignOut} variant="danger">
                        <CardHeader icon={<LogOut size={24} />} title="Sair" subtitle="Encerrar sessão" iconVariant="danger" />
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
};

export default MenuPage;
