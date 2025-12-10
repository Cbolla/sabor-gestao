import React from 'react';

const spinnerStyles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--spacing-md)',
        padding: 'var(--spacing-xl)',
    },
    spinner: {
        width: '48px',
        height: '48px',
        border: '4px solid var(--color-border)',
        borderTop: '4px solid var(--color-primary)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    text: {
        fontSize: 'var(--font-size-sm)',
        color: 'var(--color-text-secondary)',
    },
};

export const LoadingSpinner = ({ text = 'Carregando...', size = 'medium' }) => {
    const sizeMap = {
        small: '24px',
        medium: '48px',
        large: '64px',
    };

    const spinnerStyle = {
        ...spinnerStyles.spinner,
        width: sizeMap[size],
        height: sizeMap[size],
    };

    return (
        <div style={spinnerStyles.container}>
            <div style={spinnerStyle} />
            {text && <span style={spinnerStyles.text}>{text}</span>}
        </div>
    );
};

export const InlineSpinner = ({ size = 16 }) => {
    const style = {
        display: 'inline-block',
        width: `${size}px`,
        height: `${size}px`,
        border: '2px solid var(--color-border)',
        borderTop: '2px solid var(--color-primary)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    };

    return <div style={style} />;
};

export default LoadingSpinner;
