import React from 'react';

const badgeStyles = {
    base: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-xs) var(--spacing-md)',
        fontSize: 'var(--font-size-sm)',
        fontWeight: 'var(--font-weight-semibold)',
        borderRadius: 'var(--radius-full)',
        whiteSpace: 'nowrap',
    },
    primary: {
        backgroundColor: 'var(--color-primary-light)',
        color: 'var(--color-primary-dark)',
    },
    secondary: {
        backgroundColor: 'var(--color-secondary-light)',
        color: 'var(--color-secondary-dark)',
    },
    success: {
        backgroundColor: '#C8E6C9',
        color: 'var(--color-success)',
    },
    warning: {
        backgroundColor: '#FFE0B2',
        color: 'var(--color-warning)',
    },
    danger: {
        backgroundColor: '#FFCDD2',
        color: 'var(--color-danger)',
    },
    info: {
        backgroundColor: '#BBDEFB',
        color: 'var(--color-info)',
    },
    neutral: {
        backgroundColor: 'var(--color-border)',
        color: 'var(--color-text-secondary)',
    },
};

export const Badge = ({ children, variant = 'neutral', className = '', ...props }) => {
    const style = {
        ...badgeStyles.base,
        ...badgeStyles[variant],
    };

    return (
        <span className={`badge ${className}`} style={style} {...props}>
            {children}
        </span>
    );
};

// Status-specific badges
export const StatusBadge = ({ status }) => {
    const statusMap = {
        // Payment statuses
        pending: { variant: 'warning', label: 'Pendente' },
        paid: { variant: 'success', label: 'Pago' },
        overdue: { variant: 'danger', label: 'Atrasado' },

        // Order statuses
        confirmed: { variant: 'info', label: 'Confirmado' },
        in_production: { variant: 'warning', label: 'Em Produção' },
        ready: { variant: 'success', label: 'Pronto' },
        delivered: { variant: 'success', label: 'Entregue' },
        cancelled: { variant: 'danger', label: 'Cancelado' },

        // Production statuses
        todo: { variant: 'neutral', label: 'A Fazer' },
        in_progress: { variant: 'warning', label: 'Em Andamento' },
        done: { variant: 'success', label: 'Concluído' },

        // Delivery statuses
        in_transit: { variant: 'info', label: 'Em Trânsito' },
        failed: { variant: 'danger', label: 'Falhou' },

        // Stock statuses
        in_stock: { variant: 'success', label: 'Em Estoque' },
        low_stock: { variant: 'warning', label: 'Estoque Baixo' },
        out_of_stock: { variant: 'danger', label: 'Sem Estoque' },

        // General statuses
        active: { variant: 'success', label: 'Ativo' },
        inactive: { variant: 'neutral', label: 'Inativo' },
        completed: { variant: 'success', label: 'Completo' },
    };

    const statusConfig = statusMap[status] || { variant: 'neutral', label: status };

    return <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>;
};

export default Badge;
