const express = require("express");
const router = express.Router();
const ProductController = require('../controllers/ProductController');
const ImageController = require('../controllers/ImageController');

// Get all products
router.get('/', ProductController.getAllProducts);

// Get random products
router.get('/random', ProductController.getRandomProducts);

// Get discounted products
router.get('/discounted', ProductController.getDiscountedProducts);

// Get bestseller products
router.get('/bestsellers', ProductController.getBestsellers);

// Search products
router.get('/search', ProductController.searchProducts);

// Get color-specific images for a product
router.get('/product-images/:productId', ImageController.getProductColorImages);

// Get all images for a product
router.get('/images/:productId', ImageController.getAllProductImages);

// Add a new route to check product availability
router.post('/check-availability', ProductController.checkAvailability);

// Get product by slug (must be last to avoid conflicts with other routes)
router.get('/:slug', ProductController.getProductBySlug);

module.exports = router;