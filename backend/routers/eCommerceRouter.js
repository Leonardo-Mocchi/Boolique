const express = require("express");
const router = express.Router();

// Import generalist controller with dynamic filtering
const dynamicFilteringController = require('../controllers/DynamicFilteringController');

// Import specialized routers
const productRouter = require('./productRouter');
const categoryRouter = require('./categoryRouter');
const orderRouter = require('./orderRouter');
const newsletterRouter = require('./newsletterRouter');
const wardrobeSectionRouter = require('./wardrobeSectionRouter');
const authRouter = require('./authRouter');
const wishlistRouter = require('./wishlistRouter'); // Add this line

// Generalist route for dynamic product filtering
router.get('/products/filter', dynamicFilteringController.dynamicFiltering);

// Set up routes by domain
router.use('/products', productRouter);
router.use('/categories', categoryRouter);
router.use('/orders', orderRouter);
router.use('/newsletter', newsletterRouter);
router.use('/wardrobe-sections', wardrobeSectionRouter);
router.use('/auth', authRouter);
router.use('/wishlist', wishlistRouter); // Add this line

// Legacy compatibility - redirect root to products
router.get('/', (req, res) => {
    const baseUrl = req.baseUrl || '';
    res.redirect(`${baseUrl}/products`);
});

module.exports = router;