import React from 'react';

const emptyStateStyles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-2xl)',
        textAlign: 'center',
        minHeight: '300px',
    },
    icon: {
        fontSize: '64px',
        marginBottom: 'var(--spacing-lg)',
        opacity: 0.3,
    },
    title: {
        fontSize: 'var(--font-size-xl)',
        fontWeight: 'var(--font-weight-semibold)',
        color: 'var(--color-text)',
        marginBottom: 'var(--spacing-sm)',
    },
    description: {
        fontSize: 'var(--font-size-base)',
        color: 'var(--color-text-secondary)',
        marginBottom: 'var(--spacing-lg)',
        maxWidth: '400px',
    },
};

export const EmptyState = ({
    icon = '📭',
    title = 'Nenhum item encontrado',
    description,
    action
}) => {
    return (
        <div style={emptyStateStyles.container}>
            <div style={emptyStateStyles.icon}>{icon}</div>
            <h3 style={emptyStateStyles.title}>{title}</h3>
            {description && <p style={emptyStateStyles.description}>{description}</p>}
            {action && <div>{action}</div>}
        </div>
    );
};

export default EmptyState;
