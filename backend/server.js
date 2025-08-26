require('dotenv').config();
const express = require('express')
const Stripe = require('stripe');
const app = express()
const stripe = Stripe(process.env.STRIPE_SECRET_KEY)
const PORT = process.env.PORT || 3000;
const eCommerceRouter = require('./routers/eCommerceRouter')
const notFound = require('./middlewares/notFound')
const serverError = require('./middlewares/serverError')

const cors = require("cors");
const cookieParser = require('cookie-parser');

app.use(cors({
    origin: process.env.FRONT_URL || 'http://localhost:5173',
    credentials: true
}));

app.use(express.static('public'));
app.use(express.json());

// Home page route
app.get('/', (req, res) => {
    res.send('Boolean Shop API - Welcome to our e-commerce API');
});

// API Routes
app.use('/api/v1', eCommerceRouter);

app.post('/create-payment-intent', async (req, res) => {
    const { amount } = req.body
    try {

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'eur',
            payment_method_types: ['card'],
        })
        res.send({
            clientSecret: paymentIntent.client_secret
        });
    } catch (error) {
        res.status(500).send({ error: error.message })
    }
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api/v1`);
})

// Catch-all for undefined routes
app.use(notFound);

// Error handling middleware
app.use(serverError);

/**
 * API ENDPOINT REFERENCE (RESTful, slug-based)
 *
 * WARDROBE SECTIONS
 * GET /api/v1/wardrobe-sections                  - All wardrobe sections with their categories
 * GET /api/v1/wardrobe-sections/:slug/categories - Categories for a wardrobe section (by slug)
 * GET /api/v1/wardrobe-sections/:slug/products   - Products for a wardrobe section (by slug)
 *
 * CATEGORIES
 * GET /api/v1/categories                  - All categories (flat list)
 * GET /api/v1/categories/:slug            - Products for a specific category (by slug)
 *
 * PRODUCTS (Dynamic Filtering)
 * GET /api/v1/products/filter             - DYNAMIC: Filter, search, and list products with any combination of query params (category, wardrobe_section, color, size, discounted, search, minPrice, maxPrice, inStock, sort, limit, etc.)
 *   Example: /products/filter?wardrobe_section=tops-and-coats&color=Cream
 * 
 * PRODUCTS (Static)
 * GET /api/v1/products/bestsellers        - Top 10 best-selling products
 * GET /api/v1/products/random             - Random selection of products
 * GET /api/v1/products/discounted         - All discounted products
 * 
 * GET /api/v1/products/:slug              - Details of a specific product (by slug)
 *
 * ORDERS
 * POST /api/v1/orders                     - Create order
 * GET /api/v1/orders/:id                  - Order details (by id)
 * PATCH /api/v1/orders/:id/status         - Update order status
 * POST /api/v1/orders/track               - Track order
 * GET /api/v1/orders/email/:email         - Get all orders for a specific email address
 *
 * NEWSLETTER
 * POST /api/v1/newsletter/subscribe       - Subscribe to the newsletter
 * DELETE /api/v1/newsletter/unsubscribe/:email - Unsubscribe from the newsletter
 */