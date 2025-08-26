const connection = require('../database/db');
const { isPositiveInteger } = require('../utils/validation');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'alta_moda_shop_super_secret_key';

// Helper to get user ID from token
function getUserIdFromToken(req) {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) return null;

        const token = authHeader.split(' ')[1];
        if (!token) return null;

        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded.user_id;
    } catch (error) {
        return null;
    }
}

// Controller methods
const WishlistController = {
    // Database operations (moved from WishlistModel)
    async getByUserId(userId) {
        try {
            const [rows] = await connection.promise().query(
                `SELECT 
                    w.id,
                    w.user_id,
                    w.product_id,
                    w.created_at,
                    p.name,
                    p.slug,
                    p.description,
                    p.price,
                    p.discount,
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
                        WHERE pi.product_id = p.id AND pi.is_primary = 1
                        LIMIT 1
                    ) AS images
                FROM wishlists w
                INNER JOIN products p ON w.product_id = p.id
                WHERE w.user_id = ?
                ORDER BY w.created_at DESC`,
                [userId]
            );

            // Parse the JSON string to an actual array for each product
            rows.forEach(item => {
                if (typeof item.images === 'string') {
                    try {
                        item.images = JSON.parse(item.images);
                    } catch (e) {
                        item.images = [];
                    }
                } else if (!item.images) {
                    item.images = [];
                }
            });

            return rows;
        } catch (error) {
            throw error;
        }
    },

    async add(userId, productId) {
        try {
            // Validate productId is a positive integer
            if (!isPositiveInteger(productId)) {
                throw new Error('Product ID must be a valid positive integer');
            }

            // Check if product exists before adding to wishlist
            const [productExists] = await connection.promise().query(
                'SELECT 1 FROM Products WHERE id = ?',
                [productId]
            );

            if (productExists.length === 0) {
                throw new Error('Product not found');
            }

            // Proceed with adding to wishlist
            const [result] = await connection.promise().query(
                'INSERT IGNORE INTO wishlists (user_id, product_id) VALUES (?, ?)',
                [userId, productId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    },

    async remove(userId, productId) {
        try {
            const [result] = await connection.promise().query(
                'DELETE FROM wishlists WHERE user_id = ? AND product_id = ?',
                [userId, productId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    },

    async isInWishlist(userId, productId) {
        try {
            const [rows] = await connection.promise().query(
                'SELECT 1 FROM wishlists WHERE user_id = ? AND product_id = ?',
                [userId, productId]
            );
            return rows.length > 0;
        } catch (error) {
            throw error;
        }
    },

    async clearWishlist(userId) {
        try {
            const [result] = await connection.promise().query(
                'DELETE FROM wishlists WHERE user_id = ?',
                [userId]
            );
            return result.affectedRows;
        } catch (error) {
            throw error;
        }
    },

    // API Controllers (refactored to use direct methods)
    async getWishlist(req, res) {
        try {
            const userId = getUserIdFromToken(req);
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const wishlistItems = await WishlistController.getByUserId(userId);
            res.json(wishlistItems);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Improve the addToWishlist method with better validation
    async addToWishlist(req, res) {
        try {
            const userId = getUserIdFromToken(req);
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { productId } = req.body;

            // Validate productId
            if (!productId) {
                return res.status(400).json({ error: 'Product ID is required' });
            }

            if (!isPositiveInteger(productId)) {
                return res.status(400).json({ error: 'Product ID must be a valid positive integer' });
            }

            // Check if product exists before adding to wishlist
            const [productRows] = await connection.promise().query(
                'SELECT id FROM Products WHERE id = ?',
                [productId]
            );

            if (productRows.length === 0) {
                return res.status(404).json({ error: 'Product not found' });
            }

            const success = await WishlistController.add(userId, productId);

            if (success) {
                res.status(201).json({ message: 'Product added to wishlist' });
            } else {
                res.status(200).json({ message: 'Product already in wishlist' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Improve the removeFromWishlist method with better validation
    async removeFromWishlist(req, res) {
        try {
            const userId = getUserIdFromToken(req);
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { productId } = req.params;

            // Validate productId
            if (!productId) {
                return res.status(400).json({ error: 'Product ID is required' });
            }

            if (!isPositiveInteger(productId)) {
                return res.status(400).json({ error: 'Product ID must be a valid positive integer' });
            }

            const removed = await WishlistController.remove(userId, productId);

            if (removed) {
                res.json({ message: 'Product removed from wishlist' });
            } else {
                res.status(404).json({ error: 'Product not found in wishlist' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async isInWishlistCheck(req, res) {
        try {
            const userId = getUserIdFromToken(req);
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { productId } = req.params;
            if (!productId) {
                return res.status(400).json({ error: 'Product ID is required' });
            }

            const inWishlist = await WishlistController.isInWishlist(userId, productId);
            res.json({ inWishlist });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async clearWishlistItems(req, res) {
        try {
            const userId = getUserIdFromToken(req);
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const count = await WishlistController.clearWishlist(userId);
            res.json({ message: `Removed ${count} items from wishlist` });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = WishlistController;