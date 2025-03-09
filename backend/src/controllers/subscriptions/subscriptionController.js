// src/controllers/subscriptionController.js
const paypal = require('../../../conf/paypalConfig');
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
    // const companyId = req.user.company_id;
    const companyId = req.query.company_id;

    const query = `
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

    const result = await db.query(query, [companyId]);
    
    if (result.rows.length === 0) {
      return res.json({ hasActiveSubscription: false });
    }
    
    res.json({
      hasActiveSubscription: true,
      subscription: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Failed to retrieve subscription information' });
  }
};

// Create PayPal payment
exports.createPayPalPayment = async (req, res) => {
  const { planType } = req.body;
  const plan = SUBSCRIPTION_PLANS[planType];

  if (!plan) {
    return res.status(400).json({ error: 'Invalid subscription plan' });
  }

  try {
    // Verify company exists
    const companyQuery = `SELECT company_id FROM companies WHERE user_id = $1`;
    const companyResult = await db.query(companyQuery, [req.user.user_id]);
    
    if (companyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Company profile not found' });
    }
    
    const companyId = companyResult.rows[0].company_id;

    // Create unique payment ID to track this transaction
    const paymentTrackingId = crypto.randomUUID();
    
    // Create payment payload for PayPal
    const paymentJson = {
      "intent": "sale",
      "payer": {
        "payment_method": "paypal"
      },
      "redirect_urls": {
        "return_url": `${process.env.FRONTEND_URL}/payment/success?tracking_id=${paymentTrackingId}`,
        "cancel_url": `${process.env.FRONTEND_URL}/payment/cancel`
      },
      "transactions": [{
        "item_list": {
          "items": [{
            "name": plan.description,
            "sku": planType,
            "price": plan.amount.toString(),
            "currency": "INR",
            "quantity": 1
          }]
        },
        "amount": {
          "currency": "INR",
          "total": plan.amount.toString()
        },
        "description": `Freelance Platform Subscription - ${plan.description}`,
        "custom": paymentTrackingId // Store our tracking ID in PayPal payment
      }]
    };

    // Create the payment in PayPal
    paypal.payment.create(paymentJson, async (error, payment) => {
      if (error) {
        console.error('PayPal Payment Creation Error:', error);
        return res.status(500).json({ error: 'Failed to create PayPal payment' });
      }

      // Store payment tracking info in database
      const trackingQuery = `
        INSERT INTO payment_tracking 
        (tracking_id, paypal_payment_id, company_id, plan_type, amount, job_limit, status, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
      `;
      
      await db.query(trackingQuery, [
        paymentTrackingId,
        payment.id,
        companyId,
        planType,
        plan.amount,
        plan.jobLimit,
        'pending'
      ]);

      // Find approval URL to redirect user
      const approvalUrl = payment.links.find(link => link.rel === 'approval_url');
      
      if (approvalUrl) {
        res.json({ redirectUrl: approvalUrl.href });
      } else {
        res.status(500).json({ error: 'Unable to generate payment URL' });
      }
    });
  } catch (error) {
    console.error('Payment Creation Error:', error);
    res.status(500).json({ error: 'Failed to process subscription request' });
  }
};

// Execute PayPal payment after user approval
exports.executePayPalPayment = async (req, res) => {
  const { paymentId, PayerID, tracking_id } = req.query;
  
  if (!paymentId || !PayerID || !tracking_id) {
    return res.status(400).json({ error: 'Missing payment information' });
  }

  try {
    // Get payment tracking info
    const trackingQuery = `
      SELECT * FROM payment_tracking 
      WHERE tracking_id = $1 AND status = 'pending'
    `;
    
    const trackingResult = await db.query(trackingQuery, [tracking_id]);
    
    if (trackingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Payment tracking record not found' });
    }
    
    const paymentTracking = trackingResult.rows[0];
    const plan = SUBSCRIPTION_PLANS[paymentTracking.plan_type];
    
    // Execute payment in PayPal
    paypal.payment.execute(paymentId, { payer_id: PayerID }, async (error, payment) => {
      if (error) {
        console.error('PayPal Payment Execution Error:', error);
        
        // Update tracking status to failed
        await db.query(
          'UPDATE payment_tracking SET status = $1 WHERE tracking_id = $2',
          ['failed', tracking_id]
        );
        
        return res.status(500).json({ error: 'Payment execution failed' });
      }

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
          ['completed', result.rows[0].subscription_id, tracking_id]
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
          message: 'Subscription purchased successfully', 
          subscription: {
            subscriptionId: result.rows[0].subscription_id,
            amount: paymentTracking.amount,
            jobLimit: paymentTracking.job_limit,
            planType: paymentTracking.plan_type
          }
        });
      } catch (dbError) {
        // Rollback transaction on error
        await db.query('ROLLBACK');
        console.error('Database Subscription Error:', dbError);
        res.status(500).json({ error: 'Failed to record subscription' });
      }
    });
  } catch (error) {
    console.error('Payment Execution Error:', error);
    res.status(500).json({ error: 'Failed to execute payment' });
  }
};

// Handle PayPal webhook notifications
exports.handlePayPalWebhook = (req, res) => {
  // Verify webhook signature (in production)
  // Process IPN messages
  
  const eventType = req.body.event_type;
  const resourceId = req.body?.resource?.id;
  
  // Log webhook event
  console.log('PayPal Webhook:', eventType, resourceId);
  
  // Respond to PayPal to acknowledge receipt
  res.status(200).end();
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