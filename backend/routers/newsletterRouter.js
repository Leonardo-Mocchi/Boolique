const express = require("express");
const router = express.Router();
const NewsletterController = require('../controllers/NewsletterController');

// Add email to newsletter list
router.post('/subscribe', NewsletterController.submitEmail);

// Get all newsletter subscribers (admin use only)
router.get('/subscribers', NewsletterController.getAllSubscribers);

// Unsubscribe email from newsletter list
router.delete('/unsubscribe/:email', NewsletterController.unsubscribeEmail);

module.exports = router;