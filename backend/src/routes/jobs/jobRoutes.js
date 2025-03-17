// src/routes/jobs/jobRoutes.js
const express = require('express');
const router = express.Router();
const jobController = require('../../controllers/jobs/jobsController');
const quoteController = require('../../controllers/quotes/quoteController');
const paymentController = require('../../controllers/payment/paymentController');
const { checkSubscriptionBeforeJobPost } = require('../../controllers/subscriptions/subscriptionController');

// Job creation route
router.post('/create', 
  checkSubscriptionBeforeJobPost,
  jobController.createJob
);

// Get jobs for a user with optional category filtering
router.get('/user/:userId/:category',  jobController.getUserJobs);

// COMPANY SPECIFIC ROUTES
// Get all jobs posted by the company
router.get('/company/getAllJobsByCompany/:userId', jobController.getCompanyJobs);

// Cancel a job (company only)
router.put('/company/:jobId/cancel',  jobController.cancelJob);

// Update job details (company only)
router.put('/company/:jobId',  jobController.updateJob);

// Get all quotes for a specific job (company only)
router.get('/company/:jobId/quotes', jobController.getJobQuotes);

// Get agreements for a job (company only)
router.get('/company/:jobId/agreements',  jobController.getJobAgreements);

// Get job completion status (company only)
router.get('/company/:jobId/status',  jobController.getJobCompletionStatus);

// Get job details with quotes (accessible by both freelancers and companies)
router.post('/jobDetails/:job_id', jobController.getJobDetails);

// Submit a quote for a job (freelancer only)
router.post('/:jobId/quote',  quoteController.submitQuote);

// Get quotes submitted by user
router.get('/quotes/user',  quoteController.getUserQuotes);

// Select a freelancer for a job (company only)
router.post('/:jobId/select/:userId', jobController.selectFreelancer);

// Mark a job as complete (company only)
router.post('/:jobId/complete', jobController.markJobComplete);

// Process payment for a completed job (company only)
router.post('/:jobId/payment', paymentController.processJobPayment);

// Capture job payment (company only)
router.post('/payment/capture', paymentController.captureJobPayment);

// Create a job completion payment intent (company only)
router.post('/:jobId/completion-payment', jobController.createJobCompletionPayment);

// Process the job completion payment (company only)
router.post('/completion-payment/process', jobController.processJobCompletionPayment);


module.exports = router;