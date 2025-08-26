const connection = require('../database/db');

// Get all categories (flat list)
function getAllCategories(req, res) {
    const sql = `
        SELECT 
            id,
            name,
            slug,
            description,
            wardrobe_section_id
        FROM categories
    `;

    connection.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
}

// Get all wardrobe sections with their categories
function getAllWardrobeSections(req, res) {
    const sql = `
        SELECT 
            Wardrobe_Section.id,
            Wardrobe_Section.name,
            Wardrobe_Section.slug,
            Wardrobe_Section.description,
            (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', c.id,
                        'name', c.name,
                        'slug', c.slug,
                        'description', c.description
                    )
                )
                FROM categories c
                WHERE c.wardrobe_section_id = Wardrobe_Section.id
            ) AS categories
        FROM Wardrobe_Section
    `;

    connection.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        // Parse the JSON string to an actual array for each wardrobe section
        results.forEach(section => {
            if (typeof section.categories === 'string') {
                try {
                    section.categories = JSON.parse(section.categories);
                } catch (e) {
                    section.categories = [];
                }
            } else if (Array.isArray(section.categories)) {
                // Already an array, do nothing
            } else if (!section.categories) {
                section.categories = [];
            }
        });

        res.json(results);
    });
}

// Get products by wardrobe section
function getProductsByWardrobeSection(req, res) {
    const { slug } = req.params;

    // Validate the slug parameter
    if (!slug || typeof slug !== 'string') {
        return res.status(400).json({ error: 'Invalid wardrobe section slug provided' });
    }

    const sql = `
        SELECT 
            products.id,
            products.slug,
            products.name,
            products.description,
            products.long_description,
            products.price,
            products.discount,
            categories.id AS category_id,
            categories.name AS category_name,
            categories.slug AS category_slug,
            Wardrobe_Section.id AS wardrobe_section_id,
            Wardrobe_Section.name AS wardrobe_section_name,
            Wardrobe_Section.slug AS wardrobe_section_slug,
            (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'url', pi.image_url,
                        'view_type', pi.view_type,
                        'is_primary', pi.is_primary,
                        'product_variation_id', pi.product_variation_id
                    )
                )
                FROM product_images pi 
                WHERE pi.product_id = products.id
            ) AS images
        FROM products
        JOIN categories ON products.category_id = categories.id
        JOIN Wardrobe_Section ON categories.wardrobe_section_id = Wardrobe_Section.id
        WHERE Wardrobe_Section.slug = ?
        GROUP BY products.id
    `;

    connection.query(sql, [slug], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: `No products found for wardrobe section: ${slug}` });

        // Parse the JSON string to an actual array for each product
        results.forEach(product => {
            if (typeof product.images === 'string') {
                try {
                    product.images = JSON.parse(product.images);
                } catch (e) {
                    product.images = [];
                }
            } else if (Array.isArray(product.images)) {
                // Already an array, do nothing
            } else if (!product.images) {
                product.images = [];
            }
        });

        res.json(results);
    });
}

// Get products by category (by slug)
function getProductsByCategory(req, res) {
    const { slug } = req.params;

    // Validate the slug parameter
    if (!slug || typeof slug !== 'string') {
        return res.status(400).json({ error: 'Invalid category slug provided' });
    }

    const sql = `
        SELECT 
            products.id,
            products.slug,
            products.name,
            products.description,
            products.long_description,
            products.price,
            products.discount,
            categories.id AS category_id,
            categories.name AS category_name,
            categories.slug AS category_slug,
            Wardrobe_Section.id AS wardrobe_section_id,
            Wardrobe_Section.name AS wardrobe_section_name,
            Wardrobe_Section.slug AS wardrobe_section_slug,
            (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'url', pi.image_url,
                        'view_type', pi.view_type,
                        'is_primary', pi.is_primary,
                        'product_variation_id', pi.product_variation_id
                    )
                )
                FROM product_images pi 
                WHERE pi.product_id = products.id
            ) AS images
        FROM products
        JOIN categories ON products.category_id = categories.id
        JOIN Wardrobe_Section ON categories.wardrobe_section_id = Wardrobe_Section.id
        WHERE categories.slug = ?
        GROUP BY products.id
    `;

    connection.query(sql, [slug], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: `No products found for category: ${slug}` });

        // Parse the JSON string to an actual array for each product
        results.forEach(product => {
            if (typeof product.images === 'string') {
                try {
                    product.images = JSON.parse(product.images);
                } catch (e) {
                    product.images = [];
                }
            } else if (Array.isArray(product.images)) {
                // Already an array, do nothing
            } else if (!product.images) {
                product.images = [];
            }
        });

        res.json(results);
    });
}

// Get categories by wardrobe section
function getCategoriesByWardrobeSection(req, res) {
    const { slug } = req.params;

    // Validate the slug parameter
    if (!slug || typeof slug !== 'string') {
        return res.status(400).json({ error: 'Invalid wardrobe section slug provided' });
    }

    const sql = `
        SELECT 
            categories.id,
            categories.name,
            categories.slug,
            categories.description,
            Wardrobe_Section.id AS wardrobe_section_id,
            Wardrobe_Section.name AS wardrobe_section_name,
            Wardrobe_Section.slug AS wardrobe_section_slug
        FROM categories
        JOIN Wardrobe_Section ON categories.wardrobe_section_id = Wardrobe_Section.id
        WHERE Wardrobe_Section.slug = ?
    `;

    connection.query(sql, [slug], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: `No categories found for wardrobe section: ${slug}` });

        res.json(results);
    });
}

module.exports = {
    getAllCategories,
    getAllWardrobeSections,
    getProductsByWardrobeSection,
    getProductsByCategory,
    getCategoriesByWardrobeSection
};