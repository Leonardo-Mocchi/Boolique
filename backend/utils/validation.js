/**
 * Validation utility functions
 */

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Check if value is a positive integer
function isPositiveInteger(value) {
    return Number.isInteger(Number(value)) && Number(value) > 0;
}

// Check if string is within length limits
function isValidLength(str, min, max) {
    return str && str.length >= min && str.length <= max;
}

// Sanitize string input (prevent SQL injection and XSS)
function sanitizeString(str) {
    if (!str) return '';
    return String(str)
        .replace(/[<>]/g, '') // Remove < and > to prevent HTML tags
        .trim();
}

function isValidPhone(phone) {
    // Basic validation - allows common phone formats
    // Adjust regex based on your specific requirements
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{7,}$/;
    return phoneRegex.test(phone);
}

module.exports = {
    isValidEmail,
    isPositiveInteger,
    isValidLength,
    sanitizeString,
    isValidPhone
};