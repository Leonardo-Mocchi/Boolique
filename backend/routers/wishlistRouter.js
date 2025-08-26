const express = require("express");
const router = express.Router();
const WishlistController = require('../controllers/WishlistController');
const { authenticateToken } = require('../middlewares/auth');

// Get all wishlist items for the logged-in user
router.get('/', authenticateToken, WishlistController.getWishlist);

// Add a product to wishlist
router.post('/', authenticateToken, WishlistController.addToWishlist);

// Remove a product from wishlist
router.delete('/:productId', authenticateToken, WishlistController.removeFromWishlist);

// Check if a product is in wishlist
router.get('/check/:productId', authenticateToken, WishlistController.isInWishlist);

// Clear entire wishlist
router.delete('/', authenticateToken, WishlistController.clearWishlist);

module.exports = router;