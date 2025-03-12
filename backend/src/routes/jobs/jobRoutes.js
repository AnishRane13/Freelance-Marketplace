// src/routes/jobs/jobRoutes.js
const express = require('express');
const router = express.Router();
const jobController = require('../../controllers/jobs/jobsController');
const quoteController = require('../../controllers/quotes/quoteController');
const paymentController = require('../../controllers/payment/paymentController')
const { checkSubscriptionBeforeJobPost } = require('../../controllers/subscriptions/subscriptionController');

router.post('/create', 
  checkSubscriptionBeforeJobPost,
  jobController.createJob
);

// Get jobs by category
router.get('/category/:categoryId', 
  jobController.getJobsForUserCategories
);

// Get job details with quotes (for company)
router.get('/:jobId', 
  jobController.getJobDetails
);

// Submit a quote for a job (freelancer only)
router.post('/:jobId/quote', 
  quoteController.submitQuote
);

// Get quotes submitted by user
router.get('/quotes/user', 
  quoteController.getUserQuotes
);

// Select a freelancer for a job (company only)
router.post('/:jobId/select/:userId', 
  jobController.selectFreelancer
);

// Mark a job as complete (company only)
router.post('/:jobId/complete', 
  jobController.markJobComplete
);

// Process payment for a completed job (company only)
router.post('/:jobId/payment', 
  paymentController.processJobPayment
);

// Capture job payment (company only)
router.post('/payment/capture', 
  paymentController.captureJobPayment
);

module.exports = router;