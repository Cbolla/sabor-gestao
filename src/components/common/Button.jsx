import React from 'react';

const buttonStyles = {
    base: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--spacing-sm)',
        padding: 'var(--spacing-md) var(--spacing-lg)',
        fontSize: 'var(--font-size-base)',
        fontWeight: 'var(--font-weight-semibold)',
        borderRadius: 'var(--radius-md)',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        minHeight: '48px',
        minWidth: '48px',
        outline: 'none',
        textDecoration: 'none',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
    },
    primary: {
        backgroundColor: 'var(--color-primary)',
        color: 'white',
    },
    secondary: {
        backgroundColor: 'var(--color-secondary)',
        color: 'var(--color-text)',
    },
    success: {
        backgroundColor: 'var(--color-success)',
        color: 'white',
    },
    warning: {
        backgroundColor: 'var(--color-warning)',
        color: 'white',
    },
    danger: {
        backgroundColor: 'var(--color-danger)',
        color: 'white',
    },
    outline: {
        backgroundColor: 'transparent',
        color: 'var(--color-primary)',
        border: '2px solid var(--color-primary)',
    },
    ghost: {
        backgroundColor: 'transparent',
        color: 'var(--color-primary)',
    },
    disabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
    },
    fullWidth: {
        width: '100%',
    },
    small: {
        padding: 'var(--spacing-sm) var(--spacing-md)',
        fontSize: 'var(--font-size-sm)',
        minHeight: '36px',
    },
    large: {
        padding: 'var(--spacing-lg) var(--spacing-xl)',
        fontSize: 'var(--font-size-lg)',
        minHeight: '56px',
    },
};

export const Button = ({
    children,
    variant = 'primary',
    size = 'medium',
    fullWidth = false,
    disabled = false,
    loading = false,
    icon,
    onClick,
    type = 'button',
    className = '',
    ...props
}) => {
    const getButtonStyle = () => {
        return {
            ...buttonStyles.base,
            ...buttonStyles[variant],
            ...(size === 'small' && buttonStyles.small),
            ...(size === 'large' && buttonStyles.large),
            ...(fullWidth && buttonStyles.fullWidth),
            ...(disabled && buttonStyles.disabled),
        };
    };

    const handleClick = (e) => {
        if (disabled || loading) {
            e.preventDefault();
            return;
        }
        onClick?.(e);
    };

    return (
        <button
            type={type}
            className={`button ${className}`}
            style={getButtonStyle()}
            onClick={handleClick}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <>
                    <span className="animate-spin">⏳</span>
                    Carregando...
                </>
            ) : (
                <>
                    {icon && <span>{icon}</span>}
                    {children}
                </>
            )}
        </button>
    );
};

export const IconButton = ({ icon, onClick, variant = 'ghost', disabled = false, ...props }) => {
    const style = {
        ...buttonStyles.base,
        ...buttonStyles[variant],
        padding: 'var(--spacing-sm)',
        minWidth: '48px',
        minHeight: '48px',
        borderRadius: 'var(--radius-full)',
        ...(disabled && buttonStyles.disabled),
    };

    return (
        <button
            type="button"
            style={style}
            onClick={onClick}
            disabled={disabled}
            {...props}
        >
            {icon}
        </button>
    );
};

export default Button;
