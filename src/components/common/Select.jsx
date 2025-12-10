import React from 'react';

const selectStyles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-sm)',
        marginBottom: 'var(--spacing-md)',
    },
    label: {
        fontSize: 'var(--font-size-sm)',
        fontWeight: 'var(--font-weight-medium)',
        color: 'var(--color-text)',
    },
    select: {
        width: '100%',
        padding: 'var(--spacing-md)',
        fontSize: 'var(--font-size-base)',
        color: 'var(--color-text)',
        backgroundColor: 'var(--color-surface)',
        border: '2px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        outline: 'none',
        transition: 'border-color 0.2s ease',
        minHeight: '48px',
        cursor: 'pointer',
    },
    error: {
        fontSize: 'var(--font-size-sm)',
        color: 'var(--color-danger)',
    },
    helper: {
        fontSize: 'var(--font-size-sm)',
        color: 'var(--color-text-secondary)',
    },
};

export const Select = ({
    label,
    options = [],
    error,
    helperText,
    required = false,
    placeholder = 'Selecione...',
    ...props
}) => {
    const selectStyle = {
        ...selectStyles.select,
        ...(error && { borderColor: 'var(--color-danger)' }),
    };

    return (
        <div style={selectStyles.container}>
            {label && (
                <label style={selectStyles.label}>
                    {label}
                    {required && <span style={{ color: 'var(--color-danger)' }}> *</span>}
                </label>
            )}
            <select
                style={selectStyle}
                onFocus={(e) => {
                    e.target.style.borderColor = 'var(--color-primary)';
                }}
                onBlur={(e) => {
                    if (!error) {
                        e.target.style.borderColor = 'var(--color-border)';
                    }
                }}
                {...props}
            >
                <option value="">{placeholder}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && <span style={selectStyles.error}>{error}</span>}
            {!error && helperText && <span style={selectStyles.helper}>{helperText}</span>}
        </div>
    );
};

export default Select;
