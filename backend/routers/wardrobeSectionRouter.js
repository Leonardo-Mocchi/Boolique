const express = require("express");
const router = express.Router();
const CategoryController = require('../controllers/CategoryController');

// Get all wardrobe sections with their categories
router.get('/', CategoryController.getAllWardrobeSections);

// Get categories by wardrobe section (by slug)
router.get('/:slug/categories', CategoryController.getCategoriesByWardrobeSection);

// Get products by wardrobe section (by slug)
router.get('/:slug/products', CategoryController.getProductsByWardrobeSection);

module.exports = router;
