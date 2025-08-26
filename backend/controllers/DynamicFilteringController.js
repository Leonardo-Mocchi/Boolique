/**
 * DynamicFilteringController.js
 * 
 * Handles the dynamic filtering of products with various parameters:
 * - Filter parameters (category, wardrobe_section, color, size, etc.)
 * - Sorting options (price_asc, price_desc, newest, oldest, etc.)
 * - Pagination (limit)
 */
const connection = require('../database/db');

function dynamicFiltering(req, res) {
    // whitelist to avoid sql injections
    // These are parameters used for filtering products
    const ALLOWED_FILTERS = [
        'category', 'wardrobe_section', 'color', 'size', 'discounted', 'search', 'minPrice', 'maxPrice', 'inStock', 'available'
    ];

    // These are parameters used for controlling result presentation (not filtering)
    const ALLOWED_SPECIAL_PARAMS = ['sort', 'limit'];

    // check if the filters are in the whitelist 
    const isValidFilter = (filter) => ALLOWED_FILTERS.includes(filter);

    // Check if the filters are valid and create the filters object
    const filters = {};
    Object.keys(req.query).forEach(key => {
        if (isValidFilter(key)) {
            filters[key] = req.query[key];
        }
    });

    // Check for invalid parameters and return an error
    const invalidParams = Object.keys(req.query).filter(key => !isValidFilter(key) && !ALLOWED_SPECIAL_PARAMS.includes(key));
    if (invalidParams.length > 0) {
        return res.status(400).json({ error: `Invalid parameters: ${invalidParams.join(', ')}` });
    }

    let sql = `  SELECT 
    p.id, p.slug, p.name, p.description, p.long_description, p.price, p.discount, p.created_at,
    c.id AS category_id, c.name AS category_name, c.slug AS category_slug,
    WS.id AS wardrobe_section_id, WS.name AS wardrobe_section_name, WS.slug AS wardrobe_section_slug,
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
      WHERE pi.product_id = p.id
    ) AS images,
    JSON_ARRAYAGG(
      JSON_OBJECT(
        'id', pv.id,
        'color', pv.color,
        'size', pv.size,
        'stock', pv.stock
      )
    ) AS variations
  FROM products p
  JOIN categories c ON p.category_id = c.id
  JOIN Wardrobe_Section WS ON c.wardrobe_section_id = WS.id
  LEFT JOIN product_variations pv ON p.id = pv.product_id
  WHERE 1=1
`;

    const params = [];

    if (filters.category) {
        sql += ' AND c.slug = ?';
        params.push(filters.category);
    }
    if (filters.wardrobe_section) {
        sql += ' AND WS.slug = ?';
        params.push(filters.wardrobe_section);
    }
    if (filters.color) {
        sql += ' AND pv.color = ?';
        params.push(filters.color);
    }
    if (filters.size) {
        sql += ' AND pv.size = ?';
        params.push(filters.size);
    }
    if (filters.discounted === 'true') {
        sql += ' AND p.discount > 0';
    }
    if (filters.inStock === 'true') {
        sql += ' AND pv.stock > 0';
    }
    if (filters.available === 'true') {
        sql += ' AND EXISTS (SELECT 1 FROM product_variations pv2 WHERE pv2.product_id = p.id AND pv2.stock > 0)';
    }
    if (filters.search) {
        sql += ' AND (p.name LIKE ? OR p.description LIKE ?)';
        params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    if (filters.minPrice) {
        sql += ' AND p.price >= ?';
        params.push(Number(filters.minPrice));
    }
    if (filters.maxPrice) {
        sql += ' AND p.price <= ?';
        params.push(Number(filters.maxPrice));
    } sql += ' GROUP BY p.id';    // Handle sorting options
    const sortOption = req.query.sort;
    if (sortOption) {
        switch (sortOption) {
            case 'price_desc':
                sql += ' ORDER BY p.price DESC';
                break;
            case 'price_asc':
                sql += ' ORDER BY p.price ASC';
                break;
            case 'discount_desc':
                sql += ' ORDER BY p.discount DESC';
                break;
            case 'discount_asc':
                sql += ' ORDER BY p.discount ASC';
                break;
            case 'newest':
            case 'new_arrivals':
                sql += ' ORDER BY p.created_at DESC';
                break;
            case 'oldest':
                sql += ' ORDER BY p.created_at ASC';
                break;
            case 'name_asc':
                sql += ' ORDER BY p.name ASC';
                break;
            case 'name_desc':
                sql += ' ORDER BY p.name DESC';
                break;

        }
    }
    if (req.query.limit) {
        sql += ' LIMIT ?';
        params.push(Number(req.query.limit));
    }

    connection.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        // Parse images/variations JSON if needed
        results.forEach(product => {
            if (typeof product.images === 'string') {
                try { product.images = JSON.parse(product.images); } catch { product.images = []; }
            }
            if (typeof product.variations === 'string') {
                try { product.variations = JSON.parse(product.variations); } catch { product.variations = []; }
            }
        });
        res.json(results);
    });

}

module.exports = {
    dynamicFiltering,
};