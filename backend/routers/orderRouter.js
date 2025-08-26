const express = require("express");
const router = express.Router();
const OrderController = require('../controllers/OrderController');
const { authenticateToken } = require('../middlewares/auth');

// Create a new order
router.post('/', OrderController.createOrder);

// Get order by ID (admin use)
router.get('/:id', OrderController.getOrderById);

// Track order by email and order ID
router.post('/track', OrderController.trackOrder);

// Get orders by email
router.get('/email/:email', OrderController.getOrdersByEmail);

// Update order status (admin use)
router.patch('/:id/status', OrderController.updateOrderStatus);

// Replace the comment and route with a properly authenticated version
router.get('/user/:userId', authenticateToken, OrderController.getUserOrders);

module.exports = router;