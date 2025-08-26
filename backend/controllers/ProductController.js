const connection = require('../database/db');
const { isPositiveInteger, sanitizeString } = require('../utils/validation');

// Get all products
function getAllProducts(req, res) {
    const sql = `
        SELECT 
            p.id,
            p.slug,
            p.name,            p.description,
            p.long_description,
            p.price,
            p.discount,
            p.created_at,
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'url', pi.image_url,
                    'view_type', pi.view_type,
                    'is_primary', pi.is_primary
                )
            ) AS images
        FROM Products p
        LEFT JOIN Product_Images pi ON p.id = pi.product_id
        GROUP BY p.id
    `;

    connection.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        res.json(results);
    });
}

// Get product by slug
function getProductBySlug(req, res) {
    const { slug } = req.params;

    if (!slug) {
        return res.status(400).json({ error: 'Product slug is required' });
    }

    // Sanitize slug
    const sanitizedSlug = sanitizeString(slug);

    const sql = `
        SELECT 
            p.id,
            p.slug,
            p.name,
            p.description,
            p.long_description,
            p.price,
            p.discount,
            p.created_at,
            p.category_id,
            (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'url', pi.image_url,
                        'view_type', pi.view_type,
                        'is_primary', pi.is_primary,
                        'product_variation_id', pi.product_variation_id
                    )
                )
                FROM Product_Images pi 
                WHERE pi.product_id = p.id
            ) AS images,
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'id', pv.id,
                    'color', pv.color,
                    'color_hex', pv.color_hex,
                    'size', pv.size,
                    'stock', pv.stock,
                    'in_stock', pv.stock > 0
                )
            ) AS variations
        FROM Products p
        LEFT JOIN Product_Variations pv ON p.id = pv.product_id
        WHERE p.slug = ?
        GROUP BY p.id
    `;

    connection.query(sql, [sanitizedSlug], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Product not found' });

        res.json(results[0]);
    });
}

// Get random products - updated for suggested products
function getRandomProducts(req, res) {
    const { exclude, category_id, limit = 10 } = req.query;

    let sql = `
        SELECT 
            p.id,
            p.slug,
            p.name,
            p.description,
            p.long_description,
            p.price,
            p.discount,
            p.created_at,
            (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'url', pi.image_url,
                        'view_type', pi.view_type,
                        'is_primary', pi.is_primary,
                        'product_variation_id', pi.product_variation_id
                    )
                )
                FROM Product_Images pi 
                WHERE pi.product_id = p.id
            ) AS images
        FROM Products p
        WHERE 1=1
    `;

    const params = [];

    // Add conditions if parameters are provided
    if (exclude) {
        sql += ` AND p.id != ?`;
        params.push(exclude);
    }

    if (category_id) {
        sql += ` AND p.category_id = ?`;
        params.push(category_id);
    }

    // Complete the query
    sql += `
        GROUP BY p.id
        ORDER BY RAND()
        LIMIT ?
    `;

    params.push(parseInt(limit) || 10);

    connection.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
}

// Get discounted products
function getDiscountedProducts(req, res) {
    const sql = `
        SELECT 
            p.id,
            p.slug,
            p.name,
            p.description,
            p.long_description,
            p.price,
            p.discount,
            p.created_at,
            (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'url', pi.image_url,
                        'view_type', pi.view_type,
                        'is_primary', pi.is_primary,
                        'product_variation_id', pi.product_variation_id
                    )
                )
                FROM Product_Images pi 
                WHERE pi.product_id = p.id
            ) AS images
        FROM Products p
        WHERE p.discount > 0
        GROUP BY p.id
    `;

    connection.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.json([]);

        res.json(results);
    });
}

// Search products

function searchProducts(req, res) {
    const { query } = req.query;

    // Validate search query
    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
    }

    if (query.length < 2) {
        return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    // Sanitize the search query
    const sanitizedQuery = sanitizeString(query);

    const sql = `
        SELECT 
            p.id,
            p.slug,
            p.name,
            p.description,
            p.long_description,
            p.price,
            p.discount,
            p.created_at,
            (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'url', pi.image_url,
                        'view_type', pi.view_type,
                        'is_primary', pi.is_primary,
                        'product_variation_id', pi.product_variation_id
                    )
                )
                FROM Product_Images pi 
                WHERE pi.product_id = p.id
            ) AS images
        FROM Products p
        WHERE p.name LIKE ? OR p.description LIKE ?
        GROUP BY p.id
    `;

    connection.query(sql, [`%${sanitizedQuery}%`, `%${sanitizedQuery}%`], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.json([]);

        res.json(results);
    });
}

// Get bestseller products
function getBestsellers(req, res) {
    const sql = `
        SELECT 
            p.id,
            p.slug,
            p.name,
            p.description,
            p.long_description,
            p.price,
            p.discount,
            p.created_at,
            (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'url', pi.image_url,
                        'view_type', pi.view_type,
                        'is_primary', pi.is_primary,
                        'product_variation_id', pi.product_variation_id
                    )
                )
                FROM Product_Images pi 
                WHERE pi.product_id = p.id
            ) AS images
        FROM Products p
        INNER JOIN Bestseller_Products b ON p.id = b.product_id
        GROUP BY p.id
    `;

    connection.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        res.json(results);
    });
}

// Check product availability
function checkAvailability(req, res) {
    const { items } = req.body;

    // Validate items array
    if (!items || !Array.isArray(items)) {
        return res.status(400).json({ error: 'Invalid request format. Expected array of items.' });
    }

    // Validate each item in the array
    const validationErrors = [];
    items.forEach((item, index) => {
        if (!item.product_variation_id) {
            validationErrors.push(`Item at index ${index}: Missing product_variation_id`);
        } else if (!isPositiveInteger(item.product_variation_id)) {
            validationErrors.push(`Item at index ${index}: product_variation_id must be a positive integer`);
        }

        if (!item.quantity) {
            validationErrors.push(`Item at index ${index}: Missing quantity`);
        } else if (!isPositiveInteger(item.quantity)) {
            validationErrors.push(`Item at index ${index}: quantity must be a positive integer`);
        }
    });

    if (validationErrors.length > 0) {
        return res.status(400).json({ errors: validationErrors });
    }

    const promises = items.map(item => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT stock >= ? AS available, stock FROM Product_Variations WHERE id = ?';
            connection.query(query, [item.quantity, item.product_variation_id], (err, results) => {
                if (err) return reject(err);
                if (results.length === 0) {
                    return resolve({
                        product_variation_id: item.product_variation_id,
                        available: false,
                        error: 'Product variation not found'
                    });
                }
                resolve({
                    product_variation_id: item.product_variation_id,
                    available: results[0].available === 1,
                    requested: item.quantity,
                    current_stock: results[0].stock
                });
            });
        });
    });

    Promise.all(promises)
        .then(results => {
            const allAvailable = results.every(item => item.available);
            res.json({
                allAvailable,
                items: results
            });
        })
        .catch(error => {
            res.status(500).json({ error: error.message });
        });
}

module.exports = {
    getAllProducts,
    getProductBySlug,
    getRandomProducts,
    getDiscountedProducts,
    searchProducts,
    getBestsellers,
    checkAvailability
};