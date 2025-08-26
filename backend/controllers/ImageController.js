const connection = require('../database/db');

// Get color-specific product images
function getProductColorImages(req, res) {
    const { productId } = req.params;

    const sql = `
        SELECT 
            pv.color,
            pv.id AS variation_id,
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'url', pi.image_url,
                    'view_type', pi.view_type,
                    'is_primary', pi.is_primary
                )
            ) AS images
        FROM product_variations pv
        LEFT JOIN product_images pi ON pv.id = pi.product_variation_id AND pv.product_id = pi.product_id
        WHERE pv.product_id = ?
        GROUP BY pv.color, pv.id
    `;

    connection.query(sql, [productId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'No variation images found for this product' });

        res.json(results);
    });
}

// Get all images for a specific product
function getAllProductImages(req, res) {
    const { productId } = req.params;

    const sql = `
        SELECT 
            image_url,
            is_primary,
            view_type,
            product_variation_id
        FROM product_images
        WHERE product_id = ?
        ORDER BY is_primary DESC, view_type
    `;

    connection.query(sql, [productId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'No images found for this product' });

        res.json(results);
    });
}

module.exports = {
    getProductColorImages,
    getAllProductImages
};