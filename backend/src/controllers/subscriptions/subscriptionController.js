// src/controllers/subscriptionController.js
const db = require('../../../db/db');
const crypto = require('crypto');

// Subscription plans
const SUBSCRIPTION_PLANS = {
  STARTER: {
    amount: 100,
    jobLimit: 2,
    description: 'Starter Plan - 2 Job Posts',
    duration: 30 // days
  },
  STANDARD: {
    amount: 500,
    jobLimit: 10,
    description: 'Standard Plan - 10 Job Posts',
    duration: 30 // days
  },
  PREMIUM: {
    amount: 1000,
    jobLimit: 25,
    description: 'Premium Plan - 25 Job Posts',
    duration: 60 // days
  }
};

// Get subscription plans
exports.getSubscriptionPlans = (req, res) => {
  res.json(SUBSCRIPTION_PLANS);
};

// Get company's active subscription
exports.getActiveSubscription = async (req, res) => {
  try {
    // Get user_id from request, which is actually company_id
    const userId = req.query.company_id; 

    // First, fetch the company_id for the given user_id
    const companyQuery = `SELECT company_id FROM companies WHERE user_id = $1`;
    const companyResult = await db.query(companyQuery, [userId]);

    if (companyResult.rows.length === 0) {
      return res.json({ error: 'No company found for the given user.' });
    }

    const companyId = companyResult.rows[0].company_id;

    // Fetch the active subscription for the company
    const subscriptionQuery = `
      SELECT subscription_id, amount, job_limit, jobs_posted, 
             purchased_at, expires_at,
             job_limit - jobs_posted AS remaining_jobs
      FROM subscriptions 
      WHERE company_id = $1 
      AND expires_at > CURRENT_TIMESTAMP 
      AND jobs_posted < job_limit
      ORDER BY expires_at DESC
      LIMIT 1
    `;

    const subscriptionResult = await db.query(subscriptionQuery, [companyId]);

    if (subscriptionResult.rows.length === 0) {
      return res.json({ hasActiveSubscription: false });
    }

    res.json({
      hasActiveSubscription: true,
      subscription: subscriptionResult.rows[0],
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Failed to retrieve subscription information' });
  }
};

// Create payment intent
exports.createPaymentIntent = async (req, res) => {
  const { planType, user_id } = req.body;
  const plan = SUBSCRIPTION_PLANS[planType];

  if (!plan) {
    return res.status(400).json({ error: 'Invalid subscription plan' });
  }

  if (!user_id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    // Verify company exists
    const companyQuery = `SELECT company_id FROM companies WHERE user_id = $1`;
    const companyResult = await db.query(companyQuery, [user_id]);
    
    if (companyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Company profile not found' });
    }
    
    const companyId = companyResult.rows[0].company_id;

    // Create unique payment ID to track this transaction
    const paymentIntentId = crypto.randomUUID();
    
    // Store payment intent in database
    const paymentIntentQuery = `
      INSERT INTO payment_tracking 
      (tracking_id, paypal_payment_id, company_id, plan_type, amount, job_limit, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
      RETURNING tracking_id
    `;
    
    await db.query(paymentIntentQuery, [
      paymentIntentId,
      'CUSTOM_PAYMENT_' + paymentIntentId.substring(0, 8),  // Custom payment ID format
      companyId,
      planType,
      plan.amount,
      plan.jobLimit,
      'pending'
    ]);

    // Return payment details to frontend
    res.json({
      paymentIntentId: paymentIntentId,
      amount: plan.amount,
      description: plan.description,
      redirectUrl: `${process.env.FRONTEND_URL}/payment/checkout?intent_id=${paymentIntentId}`
    });
  } catch (error) {
    console.error('Payment Intent Creation Error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
};

// Process payment (simulating payment processing)
exports.processPayment = async (req, res) => {
  const { 
    paymentIntentId, 
    cardNumber, 
    expiryMonth, 
    expiryYear, 
    cvc, 
    cardholderName 
  } = req.body;
  
  // Basic validation
  if (!paymentIntentId || !cardNumber || !expiryMonth || !expiryYear || !cvc || !cardholderName) {
    return res.status(400).json({ error: 'Missing payment information' });
  }

  // Simple card validation (this would be more robust in production)
  if (cardNumber.length < 13 || cardNumber.length > 19) {
    return res.status(400).json({ error: 'Invalid card number' });
  }

  try {
    // Get payment tracking info
    const trackingQuery = `
      SELECT * FROM payment_tracking 
      WHERE tracking_id = $1 AND status = 'pending'
    `;
    
    const trackingResult = await db.query(trackingQuery, [paymentIntentId]);
    
    if (trackingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Payment intent not found or already processed' });
    }
    
    const paymentTracking = trackingResult.rows[0];
    const plan = SUBSCRIPTION_PLANS[paymentTracking.plan_type];
    
    // In a real implementation, you would integrate with a payment processor here
    // For now, we'll simulate a successful payment

    try {
      // Start a transaction
      await db.query('BEGIN');
      
      // Insert subscription into database
      const subscriptionQuery = `
        INSERT INTO subscriptions 
        (company_id, amount, job_limit, jobs_posted, purchased_at, expires_at) 
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '${plan.duration} days')
        RETURNING subscription_id
      `;

      const result = await db.query(subscriptionQuery, [
        paymentTracking.company_id, 
        paymentTracking.amount, 
        paymentTracking.job_limit, 
        0
      ]);
      
      // Update payment tracking record
      await db.query(
        'UPDATE payment_tracking SET status = $1, completed_at = CURRENT_TIMESTAMP, subscription_id = $2 WHERE tracking_id = $3',
        ['completed', result.rows[0].subscription_id, paymentIntentId]
      );
      
      // Create notification for company
      const notificationQuery = `
        INSERT INTO notifications
        (recipient_id, type, message, is_read, created_at)
        VALUES (
          (SELECT user_id FROM companies WHERE company_id = $1),
          'system',
          $2,
          false,
          CURRENT_TIMESTAMP
        )
      `;
      
      await db.query(notificationQuery, [
        paymentTracking.company_id,
        `Your ${plan.description} subscription has been activated. You can now post up to ${plan.jobLimit} jobs.`
      ]);
      
      // Commit transaction
      await db.query('COMMIT');

      res.json({ 
        success: true,
        message: 'Payment processed and subscription activated successfully', 
        subscription: {
          subscriptionId: result.rows[0].subscription_id,
          amount: paymentTracking.amount,
          jobLimit: paymentTracking.job_limit,
          planType: paymentTracking.plan_type
        },
        redirectUrl: `${process.env.FRONTEND_URL}/payment/success?tracking_id=${paymentIntentId}`
      });
    } catch (dbError) {
      // Rollback transaction on error
      await db.query('ROLLBACK');
      console.error('Database Subscription Error:', dbError);
      res.status(500).json({ 
        error: 'Failed to record subscription',
        redirectUrl: `${process.env.FRONTEND_URL}/payment/failure`
      });
    }
  } catch (error) {
    console.error('Payment Processing Error:', error);
    res.status(500).json({ 
      error: 'Failed to process payment',
      redirectUrl: `${process.env.FRONTEND_URL}/payment/failure`
    });
  }
};

// Verify payment status
exports.verifyPaymentStatus = async (req, res) => {
  const { tracking_id } = req.query;
  
  if (!tracking_id) {
    return res.status(400).json({ error: 'Missing tracking ID' });
  }

  try {
    const query = `
      SELECT pt.*, s.job_limit, s.jobs_posted, s.expires_at
      FROM payment_tracking pt
      LEFT JOIN subscriptions s ON pt.subscription_id = s.subscription_id
      WHERE pt.tracking_id = $1
    `;
    
    const result = await db.query(query, [tracking_id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment record not found' });
    }
    
    const payment = result.rows[0];
    
    res.json({
      status: payment.status,
      planType: payment.plan_type,
      amount: payment.amount,
      completedAt: payment.completed_at,
      subscription: payment.subscription_id ? {
        subscriptionId: payment.subscription_id,
        jobLimit: payment.job_limit,
        jobsPosted: payment.jobs_posted,
        expiresAt: payment.expires_at
      } : null
    });
  } catch (error) {
    console.error('Payment Status Verification Error:', error);
    res.status(500).json({ error: 'Failed to verify payment status' });
  }
};

// Middleware to check subscription before job creation
exports.checkSubscriptionBeforeJobPost = async (req, res, next) => {
  try {
    const companyId = req.user.company_id;

    // Find the most recent active subscription
    const subscriptionQuery = `
      SELECT * FROM subscriptions 
      WHERE company_id = $1 
      AND expires_at > CURRENT_TIMESTAMP 
      AND jobs_posted < job_limit 
      ORDER BY purchased_at DESC 
      LIMIT 1
    `;

    const result = await db.query(subscriptionQuery, [companyId]);

    if (result.rows.length === 0) {
      return res.status(403).json({ 
        error: 'No active subscription. Please purchase a subscription to post jobs.' 
      });
    }

    // Attach subscription to request for job creation route
    req.activeSubscription = result.rows[0];
    next();
  } catch (error) {
    console.error('Subscription Check Error:', error);
    res.status(500).json({ error: 'Failed to verify subscription' });
  }
};

// Update job limit after job creation
exports.updateJobPostCount = async (subscriptionId) => {
  try {
    const updateQuery = `
      UPDATE subscriptions 
      SET jobs_posted = jobs_posted + 1 
      WHERE subscription_id = $1
      RETURNING job_limit, jobs_posted
    `;
    return await db.query(updateQuery, [subscriptionId]);
  } catch (error) {
    console.error('Update Job Post Count Error:', error);
    throw error;
  }
};