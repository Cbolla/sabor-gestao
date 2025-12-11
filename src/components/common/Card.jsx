import React from 'react';
import '../../assets/styles/cards.css';

export const Card = ({
    children,
    className = '',
    onClick,
    variant = '',
    clickable = true
}) => {
    const cardClasses = [
        'card',
        clickable && onClick ? 'clickable' : 'non-clickable',
        variant,
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={cardClasses} onClick={onClick}>
            {children}
        </div>
    );
};

export const CardHeader = ({ icon, title, subtitle, action, iconVariant = 'primary' }) => {
    return (
        <div className="card-header">
            {icon && (
                <div className={`card - icon ${iconVariant} `}>
                    {icon}
                </div>
            )}
            <div style={{ flex: 1 }}>
                {title && <h3 className="card-title">{title}</h3>}
                {subtitle && <p className="card-subtitle">{subtitle}</p>}
            </div>
            {action && <div>{action}</div>}
        </div>
    );
};

export const CardBody = ({ children }) => {
    return <div className="card-body">{children}</div>;
};

export const CardFooter = ({ children }) => {
    return <div className="card-footer">{children}</div>;
};

export const MetricCard = ({ value, label, variant = 'primary' }) => {
    const style = variant === 'primary'
        ? { background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))' }
        : variant === 'success'
            ? { background: 'linear-gradient(135deg, var(--color-success), #388E3C)' }
            : variant === 'warning'
                ? { background: 'linear-gradient(135deg, var(--color-warning), #F57C00)' }
                : variant === 'danger'
                    ? { background: 'linear-gradient(135deg, var(--color-danger), #D32F2F)' }
                    : { background: 'linear-gradient(135deg, var(--color-info), #1976D2)' };

    return (
        <div className="card metric-card" style={style}>
            <div className="metric-value">{value}</div>
            <div className="metric-label">{label}</div>
        </div>
    );
};

export const EmptyCard = ({ icon, title, subtitle, action }) => {
    return (
        <div className="card card-empty non-clickable">
            {icon && <div className="card-empty-icon">{icon}</div>}
            {title && <div className="card-empty-text">{title}</div>}
            {subtitle && <div className="card-empty-subtext">{subtitle}</div>}
            {action && <div className="mt-lg">{action}</div>}
        </div>
    );
};

export default Card;
