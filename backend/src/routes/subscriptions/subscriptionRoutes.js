// src/routes/subscriptions/subscriptionRoutes.js
const express = require('express');
const router = express.Router();
const subscriptionController = require('../../controllers/subscriptionController');
const authMiddleware = require('../../middlewares/authMiddleware');

// Get subscription plans
router.get('/plans', subscriptionController.getSubscriptionPlans);

// Get company's active subscriptions
router.get('/active', authMiddleware.isAuthenticated, authMiddleware.isCompany, subscriptionController.getActiveSubscription);

// Route to create a PayPal payment for subscription
router.post('/create-payment', authMiddleware.isAuthenticated, authMiddleware.isCompany, subscriptionController.createPayPalPayment);

// Route to execute PayPal payment after approval
router.get('/execute-payment', authMiddleware.isAuthenticated, authMiddleware.isCompany, subscriptionController.executePayPalPayment);

// Route for webhook notifications from PayPal
router.post('/webhook', subscriptionController.handlePayPalWebhook);

module.exports = router;