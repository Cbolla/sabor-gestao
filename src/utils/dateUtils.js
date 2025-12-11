import { format, parseISO, addMonths, isAfter, isBefore, isToday, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Helper to safely convert any date input to a Date object
 */
const toDateObj = (date) => {
    if (!date) return null;
    if (date instanceof Date) return date;
    if (typeof date.toDate === 'function') return date.toDate(); // Firestore Timestamp
    if (typeof date === 'string') return parseISO(date);
    return null;
};

/**
 * Format date to Brazilian format (dd/MM/yyyy)
 */
export const formatDate = (date) => {
    const dateObj = toDateObj(date);
    if (!dateObj) return '';

    try {
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
    const dateObj = toDateObj(date);
    if (!dateObj) return '';

    try {
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
    const dateObj = toDateObj(date);
    if (!dateObj) return '';

    try {
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
    const dateObj = toDateObj(date);
    if (!dateObj) return '';

    try {
        if (isToday(dateObj)) {
            return 'Hoje';
        }
        return format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
        console.error('Error formatting date:', error);
        return '';
    }
};

/**
 * Check if date is overdue
 */
export const isOverdue = (date) => {
    const dateObj = toDateObj(date);
    if (!dateObj) return false;

    try {
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
    const dateObj = toDateObj(date);
    if (!dateObj) return new Date();

    try {
        return addMonths(dateObj, months);
    } catch (error) {
        console.error('Error adding months:', error);
        return dateObj;
    }
};

/**
 * Convert date to ISO string for Firestore/Storage
 */
export const toISOString = (date) => {
    const dateObj = toDateObj(date);
    if (!dateObj) return null;
    return dateObj.toISOString();
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
