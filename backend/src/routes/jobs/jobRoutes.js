// src/routes/jobs/jobRoutes.js
const express = require('express');
const router = express.Router();
const jobController = require('../../controllers/jobController');
const quoteController = require('../../controllers/quoteController');
const { checkSubscriptionBeforeJobPost } = require('../../controllers/subscriptionController');
const authMiddleware = require('../../middlewares/authMiddleware');

router.post('/create', 
  authMiddleware.isAuthenticated,
  authMiddleware.isCompany, 
  checkSubscriptionBeforeJobPost,
  jobController.createJob
);

// Get jobs by category
router.get('/category/:categoryId', 
  authMiddleware.isAuthenticated,
  jobController.getJobsByCategory
);

// Get job details with quotes (for company)
router.get('/:jobId', 
  authMiddleware.isAuthenticated,
  jobController.getJobDetails
);

// Submit a quote for a job (freelancer only)
router.post('/:jobId/quote', 
  authMiddleware.isAuthenticated,
  authMiddleware.isUser,
  quoteController.submitQuote
);

// Get quotes submitted by user
router.get('/quotes/user', 
  authMiddleware.isAuthenticated,
  authMiddleware.isUser,
  quoteController.getUserQuotes
);

// Select a freelancer for a job (company only)
router.post('/:jobId/select/:userId', 
  authMiddleware.isAuthenticated,
  authMiddleware.isCompany,
  jobController.selectFreelancer
);

// Mark a job as complete (company only)
router.post('/:jobId/complete', 
  authMiddleware.isAuthenticated,
  authMiddleware.isCompany,
  jobController.markJobComplete
);

// Process payment for a completed job (company only)
router.post('/:jobId/payment', 
  authMiddleware.isAuthenticated,
  authMiddleware.isCompany,
  paymentController.processJobPayment
);

// Capture job payment (company only)
router.post('/payment/capture', 
  authMiddleware.isAuthenticated,
  authMiddleware.isCompany,
  paymentController.captureJobPayment
);

module.exports = router;