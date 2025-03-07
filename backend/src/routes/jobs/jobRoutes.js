// src/routes/jobs/jobRoutes.js
const express = require('express');
const router = express.Router();
const jobController = require('../../controllers/jobController');
const quoteController = require('../../controllers/quoteController');
const { checkSubscriptionBeforeJobPost } = require('../../controllers/subscriptionController');
const authMiddleware = require('../../middlewares/authMiddleware');

// Create a new job (company only)
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

// Select a freelancer for a job (company only)
router.post('/:jobId/select/:userId', 
  authMiddleware.isAuthenticated,
  authMiddleware.isCompany,
  jobController.selectFreelancer
);

module.exports = router;