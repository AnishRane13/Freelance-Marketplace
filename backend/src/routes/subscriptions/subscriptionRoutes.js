// src/routes/subscriptions/subscriptionRoutes.js
const express = require('express');
const router = express.Router();
const subscriptionController = require("../../controllers/subscriptions/subscriptionController");
const authMiddleware = require("../../middleware/authMiddleware");

// Get subscription plans
router.get('/plans', subscriptionController.getSubscriptionPlans);

// Get company's active subscriptions
router.get('/active',  subscriptionController.getActiveSubscription);
// router.get('/active', authMiddleware.isAuthenticated, authMiddleware.isCompany, subscriptionController.getActiveSubscription);

// Route to create a PayPal payment for subscription
router.post('/create-payment',  subscriptionController.createPayPalPayment);

// Route to execute PayPal payment after approval
router.get('/execute-payment', subscriptionController.executePayPalPayment);

// Route for webhook notifications from PayPal
router.post('/webhook', subscriptionController.handlePayPalWebhook);

module.exports = router;