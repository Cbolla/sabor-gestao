import { format, parseISO, addMonths, isAfter, isBefore, isToday, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Format date to Brazilian format (dd/MM/yyyy)
 */
export const formatDate = (date) => {
    if (!date) return '';

    try {
        const dateObj = date instanceof Date ? date : parseISO(date);
        return format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
        console.error('Error formatting date:', error);
        return '';
    }
};

/**
 * Format date to short format (dd/MM)
 */
export const formatDateShort = (date) => {
    if (!date) return '';

    try {
        const dateObj = date instanceof Date ? date : parseISO(date);
        return format(dateObj, 'dd/MM', { locale: ptBR });
    } catch (error) {
        console.error('Error formatting date:', error);
        return '';
    }
};

/**
 * Format date with time (dd/MM/yyyy HH:mm)
 */
export const formatDateTime = (date) => {
    if (!date) return '';

    try {
        const dateObj = date instanceof Date ? date : parseISO(date);
        return format(dateObj, 'dd/MM/yyyy HH:mm', { locale: ptBR });
    } catch (error) {
        console.error('Error formatting date:', error);
        return '';
    }
};

/**
 * Format date to relative format (Hoje, Amanhã, etc.)
 */
export const formatDateRelative = (date) => {
    if (!date) return '';

    try {
        const dateObj = date instanceof Date ? date : parseISO(date);

        if (isToday(dateObj)) {
            return 'Hoje';
        }

        return formatDate(dateObj);
    } catch (error) {
        console.error('Error formatting date:', error);
        return '';
    }
};

/**
 * Check if date is overdue
 */
export const isOverdue = (date) => {
    if (!date) return false;

    try {
        const dateObj = date instanceof Date ? date : parseISO(date);
        return isPast(dateObj) && !isToday(dateObj);
    } catch (error) {
        console.error('Error checking overdue:', error);
        return false;
    }
};

/**
 * Add months to a date
 */
export const addMonthsToDate = (date, months) => {
    try {
        const dateObj = date instanceof Date ? date : parseISO(date);
        return addMonths(dateObj, months);
    } catch (error) {
        console.error('Error adding months:', error);
        return date;
    }
};

/**
 * Convert date to ISO string for Firestore
 */
export const toISOString = (date) => {
    if (!date) return null;

    try {
        const dateObj = date instanceof Date ? date : new Date(date);
        return dateObj.toISOString();
    } catch (error) {
        console.error('Error converting to ISO:', error);
        return null;
    }
};

export default {
    formatDate,
    formatDateShort,
    formatDateTime,
    formatDateRelative,
    isOverdue,
    addMonthsToDate,
    toISOString,
};
