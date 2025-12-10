/**
 * Format number as Brazilian currency (R$)
 */
export const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'R$ 0,00';

    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
};

/**
 * Parse currency string to number
 */
export const parseCurrency = (value) => {
    if (typeof value === 'number') return value;
    if (!value) return 0;

    // Remove R$, spaces, and dots (thousand separators)
    // Replace comma with dot for decimal
    const cleaned = value
        .replace(/R\$\s?/g, '')
        .replace(/\./g, '')
        .replace(',', '.');

    return parseFloat(cleaned) || 0;
};

/**
 * Format currency input (as user types)
 */
export const formatCurrencyInput = (value) => {
    // Remove non-numeric characters
    const numbers = value.replace(/\D/g, '');

    // Convert to cents
    const cents = parseInt(numbers, 10) || 0;

    // Convert to reais
    const reais = cents / 100;

    return formatCurrency(reais);
};

export default {
    formatCurrency,
    parseCurrency,
    formatCurrencyInput,
};
