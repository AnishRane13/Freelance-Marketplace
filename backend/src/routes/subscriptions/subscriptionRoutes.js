// src/routes/subscriptions/subscriptionRoutes.js
const express = require('express');
const router = express.Router();
const subscriptionController = require("../../controllers/subscriptions/subscriptionController");
// Get subscription plans
router.get('/plans', subscriptionController.getSubscriptionPlans);

// Get company's active subscriptions
router.get('/active',  subscriptionController.getActiveSubscription);
// router.get('/active', authMiddleware.isAuthenticated, authMiddleware.isCompany, subscriptionController.getActiveSubscription);

// Create payment intent
router.post('/payment/create',  subscriptionController.createPaymentIntent);

// Process payment
router.post('/payment/process', subscriptionController.processPayment);

// Verify payment status
router.get('/payment/verify', subscriptionController.verifyPaymentStatus);

module.exports = router;