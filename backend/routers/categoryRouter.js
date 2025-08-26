const express = require("express");
const router = express.Router();
const CategoryController = require('../controllers/CategoryController');

// Get all categories (flattened list)
router.get('/', CategoryController.getAllCategories);

// Get products by category (by slug)
router.get('/:slug', CategoryController.getProductsByCategory);

module.exports = router;