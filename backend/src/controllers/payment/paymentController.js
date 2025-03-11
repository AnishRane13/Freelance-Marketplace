// src/controllers/paymentController.js
const db = require('../../../db/db');
const paypal = require('@paypal/checkout-server-sdk');
const { sendNotification } = require('../../utils/notificationHelper');

// PayPal setup
function getPayPalClient() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const environment = process.env.NODE_ENV === 'production'
    ? new paypal.core.LiveEnvironment(clientId, clientSecret)
    : new paypal.core.SandboxEnvironment(clientId, clientSecret);
  
  return new paypal.core.PayPalHttpClient(environment);
}

exports.createSubscriptionPayment = async (req, res) => {
  const { plan_type, amount, job_limit } = req.body;
  const company_id = req.user.company_id;
  
  if (!plan_type || !amount || !job_limit) {
    return res.status(400).json({ error: 'Plan type, amount, and job limit are required' });
  }
  
  try {
    // Generate tracking ID
    const trackingId = require('uuid').v4();
    
    // Create tracking record
    const trackingQuery = `
      INSERT INTO payment_tracking (tracking_id, paypal_payment_id, company_id, plan_type, amount, job_limit, status)
      VALUES ($1, '', $2, $3, $4, $5, 'pending')
      RETURNING *
    `;
    
    await db.query(trackingQuery, [trackingId, company_id, plan_type, amount, job_limit]);
    
    // Create PayPal order
    const client = getPayPalClient();
    const request = new paypal.orders.OrdersCreateRequest();
    
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: trackingId,
        description: `Job Posting Subscription - ${plan_type}`,
        amount: {
          currency_code: 'INR',
          value: amount.toString()
        }
      }],
      application_context: {
        return_url: `${process.env.APP_URL}/subscription/success`,
        cancel_url: `${process.env.APP_URL}/subscription/cancel`
      }
    });
    
    const order = await client.execute(request);
    
    // Update tracking with PayPal ID
    await db.query(
      'UPDATE payment_tracking SET paypal_payment_id = $1 WHERE tracking_id = $2',
      [order.result.id, trackingId]
    );
    
    // Return PayPal order details to client
    res.json({
      paypalOrderId: order.result.id,
      approvalLink: order.result.links.find(link => link.rel === 'approve').href,
      trackingId: trackingId
    });
  } catch (error) {
    console.error('Create Subscription Payment Error:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
};

exports.captureSubscriptionPayment = async (req, res) => {
  const { paypalOrderId, trackingId } = req.body;
  
  if (!paypalOrderId || !trackingId) {
    return res.status(400).json({ error: 'PayPal order ID and tracking ID are required' });
  }
  
  try {
    // Start transaction
    await db.query('BEGIN');
    
    // Get tracking record
    const trackingQuery = `
      SELECT * FROM payment_tracking
      WHERE tracking_id = $1 AND paypal_payment_id = $2 AND status = 'pending'
    `;
    
    const trackingResult = await db.query(trackingQuery, [trackingId, paypalOrderId]);
    
    if (trackingResult.rows.length === 0) {
      await db.query('ROLLBACK');
      return res.status(404).json({ error: 'Payment tracking record not found' });
    }
    
    const tracking = trackingResult.rows[0];
    
    // Capture payment with PayPal
    const client = getPayPalClient();
    const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
    request.requestBody({});
    
    const capture = await client.execute(request);
    
    if (capture.result.status !== 'COMPLETED') {
      await db.query('ROLLBACK');
      return res.status(400).json({ error: 'Payment not completed' });
    }
    
    // Update tracking status
    await db.query(
      'UPDATE payment_tracking SET status = $1, completed_at = CURRENT_TIMESTAMP WHERE tracking_id = $2',
      ['completed', trackingId]
    );
    
    // Create subscription
    const subscriptionQuery = `
      INSERT INTO subscriptions (company_id, amount, job_limit, jobs_posted, purchased_at, expires_at)
      VALUES ($1, $2, $3, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days')
      RETURNING *
    `;
    
    const subscriptionResult = await db.query(subscriptionQuery, [
      tracking.company_id, tracking.amount, tracking.job_limit
    ]);
    
    // Update payment tracking with subscription ID
    await db.query(
      'UPDATE payment_tracking SET subscription_id = $1 WHERE tracking_id = $2',
      [subscriptionResult.rows[0].subscription_id, trackingId]
    );
    
    // Commit transaction
    await db.query('COMMIT');
    
    res.status(200).json({
      message: 'Subscription payment completed successfully',
      subscription: subscriptionResult.rows[0]
    });
  } catch (error) {
    // Rollback transaction on error
    await db.query('ROLLBACK');
    console.error('Capture Subscription Payment Error:', error);
    res.status(500).json({ error: 'Failed to capture payment' });
  }
};

// Continuing from previous implementation...

exports.processJobPayment = async (req, res) => {
    const { jobId } = req.params;
    const company_id = req.user.company_id;
    
    try {
      // Start transaction
      await db.query('BEGIN');
      
      // Verify job belongs to this company and is completed
      const jobQuery = `
        SELECT j.*, sf.user_id as freelancer_id, q.quote_price, u.name as freelancer_name, u.payment_email
        FROM jobs j
        JOIN selected_freelancers sf ON j.job_id = sf.job_id
        JOIN quotes q ON j.job_id = q.job_id AND sf.user_id = q.user_id
        JOIN users u ON sf.user_id = u.user_id
        WHERE j.job_id = $1 AND j.company_id = $2 AND j.status = 'completed'
      `;
      
      const jobResult = await db.query(jobQuery, [jobId, company_id]);
      
      if (jobResult.rows.length === 0) {
        await db.query('ROLLBACK');
        return res.status(404).json({ error: 'Job not found or not completed' });
      }
      
      const job = jobResult.rows[0];
      
      // Check if payment is already processed
      const paymentQuery = `
        SELECT * FROM payments
        WHERE job_id = $1 AND payment_status = 'completed'
      `;
      
      const paymentResult = await db.query(paymentQuery, [jobId]);
      
      if (paymentResult.rows.length > 0) {
        await db.query('ROLLBACK');
        return res.status(400).json({ error: 'Payment already processed for this job' });
      }
      
      // Create PayPal order
      const client = getPayPalClient();
      const request = new paypal.orders.OrdersCreateRequest();
      
      request.prefer("return=representation");
      request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: `job-${jobId}`,
          description: `Payment for Job: ${job.title}`,
          amount: {
            currency_code: 'INR',
            value: job.quote_price.toString()
          }
        }],
        application_context: {
          return_url: `${process.env.APP_URL}/payment/success/${jobId}`,
          cancel_url: `${process.env.APP_URL}/payment/cancel/${jobId}`
        }
      });
      
      const order = await client.execute(request);
      
      // Update payment record with PayPal ID
      await db.query(
        'UPDATE payments SET payment_status = $1 WHERE job_id = $2',
        ['pending', jobId]
      );
      
      // Commit transaction
      await db.query('COMMIT');
      
      // Return PayPal order details to client
      res.json({
        paypalOrderId: order.result.id,
        approvalLink: order.result.links.find(link => link.rel === 'approve').href,
        jobId: jobId
      });
    } catch (error) {
      // Rollback transaction on error
      await db.query('ROLLBACK');
      console.error('Process Job Payment Error:', error);
      res.status(500).json({ error: 'Failed to process payment' });
    }
  };
  
  exports.captureJobPayment = async (req, res) => {
    const { paypalOrderId, jobId } = req.body;
    const company_id = req.user.company_id;
    
    if (!paypalOrderId || !jobId) {
      return res.status(400).json({ error: 'PayPal order ID and job ID are required' });
    }
    
    try {
      // Start transaction
      await db.query('BEGIN');
      
      // Get job and payment details
      const jobQuery = `
        SELECT j.*, sf.user_id as freelancer_id, q.quote_price
        FROM jobs j
        JOIN selected_freelancers sf ON j.job_id = sf.job_id
        JOIN quotes q ON j.job_id = q.job_id AND sf.user_id = q.user_id
        WHERE j.job_id = $1 AND j.company_id = $2 AND j.status = 'completed'
      `;
      
      const jobResult = await db.query(jobQuery, [jobId, company_id]);
      
      if (jobResult.rows.length === 0) {
        await db.query('ROLLBACK');
        return res.status(404).json({ error: 'Job not found or not completed' });
      }
      
      const job = jobResult.rows[0];
      
      // Capture payment with PayPal
      const client = getPayPalClient();
      const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
      request.requestBody({});
      
      const capture = await client.execute(request);
      
      if (capture.result.status !== 'COMPLETED') {
        await db.query('ROLLBACK');
        return res.status(400).json({ error: 'Payment not completed' });
      }
      
      // Update payment status
      await db.query(
        'UPDATE payments SET payment_status = $1 WHERE job_id = $2',
        ['completed', jobId]
      );
      
      // Create job completion record
      const completionQuery = `
        INSERT INTO job_completion (job_id, user_id, company_id, amount_paid, status)
        VALUES ($1, $2, $3, $4, 'completed')
        RETURNING *
      `;
      
      const completionResult = await db.query(completionQuery, [
        jobId, job.freelancer_id, company_id, job.quote_price
      ]);
      
      // Notify freelancer
      await sendNotification(
        job.freelancer_id,
        jobId,
        'payment',
        `Payment for job "${job.title}" has been completed. Amount: ${job.quote_price} rupees.`
      );
      
      // Commit transaction
      await db.query('COMMIT');
      
      res.status(200).json({
        message: 'Job payment completed successfully',
        completion: completionResult.rows[0]
      });
    } catch (error) {
      // Rollback transaction on error
      await db.query('ROLLBACK');
      console.error('Capture Job Payment Error:', error);
      res.status(500).json({ error: 'Failed to capture payment' });
    }
  };
  
  exports.getUserPaymentDetails = async (req, res) => {
    const userId = req.user.user_id;
    
    try {
      // Get user's completed jobs and earnings
      const completionsQuery = `
        SELECT jc.*, j.title as job_title, j.description as job_description,
          c.name as company_name
        FROM job_completion jc
        JOIN jobs j ON jc.job_id = j.job_id
        JOIN companies comp ON jc.company_id = comp.company_id
        JOIN users c ON comp.user_id = c.user_id
        WHERE jc.user_id = $1 AND jc.status = 'completed'
        ORDER BY jc.completed_at DESC
      `;
      
      const completionsResult = await db.query(completionsQuery, [userId]);
      
      // Get user's total earnings
      const totalQuery = `
        SELECT SUM(amount_paid) as total_earnings
        FROM job_completion
        WHERE user_id = $1 AND status = 'completed'
      `;
      
      const totalResult = await db.query(totalQuery, [userId]);
      
      // Get user's payment email
      const userQuery = `
        SELECT payment_email 
        FROM users
        WHERE user_id = $1
      `;
      
      const userResult = await db.query(userQuery, [userId]);
      
      res.json({
        completions: completionsResult.rows,
        totalEarnings: totalResult.rows[0].total_earnings || 0,
        paymentEmail: userResult.rows[0].payment_email
      });
    } catch (error) {
      console.error('Get User Payment Details Error:', error);
      res.status(500).json({ error: 'Failed to fetch payment details' });
    }
  };
  
  exports.updatePaymentEmail = async (req, res) => {
    const userId = req.user.user_id;
    const { paymentEmail } = req.body;
    
    if (!paymentEmail) {
      return res.status(400).json({ error: 'Payment email is required' });
    }
    
    try {
      const query = `
        UPDATE users
        SET payment_email = $1
        WHERE user_id = $2
        RETURNING user_id, payment_email
      `;
      
      const result = await db.query(query, [paymentEmail, userId]);
      
      res.json({
        message: 'Payment email updated successfully',
        user: result.rows[0]
      });
    } catch (error) {
      console.error('Update Payment Email Error:', error);
      res.status(500).json({ error: 'Failed to update payment email' });
    }
  };