/**
 * Utility to generate and convert between database IDs and customer-facing numeric IDs
 * This creates larger unique numbers without encoding/encryption
 */

// Configurable prefix (you can adjust these numbers to control format)
const PREFIX_MULTIPLIER = 10000000; // This creates a 7-digit prefix
const PREFIX_BASE = 98; // Starting prefix number (arbitrary)

/**
 * Generates a customer-facing numeric ID from a database ID
 * @param {number} databaseId - Original database ID
 * @returns {number} - Customer-facing numeric ID
 */
function generateNumericId(databaseId) {
    // Create a deterministic prefix from the database ID
    const prefix = PREFIX_BASE + (databaseId % 900); // Keeps prefix under 999

    // Combine prefix with ID to create a larger number
    return (prefix * PREFIX_MULTIPLIER) + databaseId;
}

/**
 * Extracts the original database ID from a customer-facing numeric ID
 * @param {number} numericId - Customer-facing numeric ID
 * @returns {number} - Original database ID
 */
function extractDatabaseId(numericId) {
    // Extract the original ID by getting the remainder after division
    return numericId % PREFIX_MULTIPLIER;
}

module.exports = {
    generateNumericId,
    extractDatabaseId
};
