import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { IconButton } from './Button';

const modalStyles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 'var(--z-modal-backdrop)',
        padding: 'var(--spacing-md)',
    },
    modal: {
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-xl)',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative',
        zIndex: 'var(--z-modal)',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--spacing-lg)',
        borderBottom: '1px solid var(--color-border)',
    },
    title: {
        fontSize: 'var(--font-size-xl)',
        fontWeight: 'var(--font-weight-bold)',
        margin: 0,
    },
    body: {
        padding: 'var(--spacing-lg)',
    },
    footer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 'var(--spacing-sm)',
        padding: 'var(--spacing-lg)',
        borderTop: '1px solid var(--color-border)',
    },
};

export const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    closeOnOverlayClick = true,
}) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            style={modalStyles.overlay}
            onClick={handleOverlayClick}
            className="animate-fade-in"
        >
            <div style={modalStyles.modal} className="animate-scale-in">
                {title && (
                    <div style={modalStyles.header}>
                        <h2 style={modalStyles.title}>{title}</h2>
                        <IconButton
                            icon={<X size={20} />}
                            onClick={onClose}
                            variant="ghost"
                        />
                    </div>
                )}
                <div style={modalStyles.body}>
                    {children}
                </div>
                {footer && (
                    <div style={modalStyles.footer}>
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;
