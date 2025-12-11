import React from 'react';

const inputStyles = {
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
    input: {
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

export const Input = ({
    label,
    error,
    helperText,
    required = false,
    fullWidth = true,
    ...props
}) => {
    const { style, ...otherProps } = props;

    const inputStyle = {
        ...inputStyles.input,
        ...(error && { borderColor: 'var(--color-danger)' }),
        ...(fullWidth && { width: '100%' }),
        ...(style || {}),
    };

    return (
        <div style={inputStyles.container}>
            {label && (
                <label style={inputStyles.label}>
                    {label}
                    {required && <span style={{ color: 'var(--color-danger)' }}> *</span>}
                </label>
            )}
            <input
                style={inputStyle}
                onFocus={(e) => {
                    e.target.style.borderColor = 'var(--color-primary)';
                }}
                onBlur={(e) => {
                    if (!error) {
                        e.target.style.borderColor = 'var(--color-border)';
                    }
                }}
                {...otherProps}
            />
            {error && <span style={inputStyles.error}>{error}</span>}
            {!error && helperText && <span style={inputStyles.helper}>{helperText}</span>}
        </div>
    );
};

export const TextArea = ({
    label,
    error,
    helperText,
    required = false,
    rows = 4,
    ...props
}) => {
    const textareaStyle = {
        ...inputStyles.input,
        minHeight: 'auto',
        resize: 'vertical',
        ...(error && { borderColor: 'var(--color-danger)' }),
    };

    return (
        <div style={inputStyles.container}>
            {label && (
                <label style={inputStyles.label}>
                    {label}
                    {required && <span style={{ color: 'var(--color-danger)' }}> *</span>}
                </label>
            )}
            <textarea
                style={textareaStyle}
                rows={rows}
                onFocus={(e) => {
                    e.target.style.borderColor = 'var(--color-primary)';
                }}
                onBlur={(e) => {
                    if (!error) {
                        e.target.style.borderColor = 'var(--color-border)';
                    }
                }}
                {...props}
            />
            {error && <span style={inputStyles.error}>{error}</span>}
            {!error && helperText && <span style={inputStyles.helper}>{helperText}</span>}
        </div>
    );
};

export default Input;
