// src/controllers/jobController.js
const db = require('../../../db/db');
const { updateJobPostCount } = require('../subscriptions/subscriptionController');
const { generateAgreementPDF } = require('../../utils/pdfGenerator');
const { sendNotification } = require('../../utils/notificationHelper');

exports.createJob = async (req, res) => {
  try {
    const { title, description, category_id, price, location, deadline, status, company_id } = req.body;
    const userId = req.body.company_id; // This is actually the user_id from localStorage
    
    // Get the actual company_id for this user_id
    const companyResult = await db.query(
      'SELECT company_id FROM companies WHERE user_id = $1',
      [userId]
    );
    
    if (companyResult.rows.length === 0) {
      return res.status(400).json({ error: "No company found for this user." });
    }
    
    const companyId = companyResult.rows[0].company_id;
    const subscription = req.activeSubscription;

    console.log("Incoming request to create job with data:", req.body);
    console.log("Company ID:", companyId);
    console.log("Active Subscription:", subscription);

    if (!subscription) {
      console.warn("No active subscription found.");
      return res.status(403).json({ error: "You don't have an active subscription." });
    }

    const jobQuery = `
      INSERT INTO jobs (company_id, title, description, category_id, price, location, deadline, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING job_id
    `;

    console.log("Executing job insert query...");
    const result = await db.query(jobQuery, [companyId, title, description, category_id, price, location, deadline, status]);

    if (result.rows.length > 0) {
      console.log("Job successfully inserted with ID:", result.rows[0].job_id);

      // Update jobs_posted count
      const updateSubscriptionQuery = `
        UPDATE subscriptions 
        SET jobs_posted = jobs_posted + 1 
        WHERE subscription_id = $1
      `;

      console.log("Updating subscription's jobs_posted count...");
      await db.query(updateSubscriptionQuery, [subscription.subscription_id]);
    }

    console.log("Job creation complete. Sending response...");
    res.status(201).json({ success: true, job: result.rows[0] });
  } catch (error) {
    console.error("Job Creation Error:", error);
    res.status(500).json({ error: "Failed to create job" });
  }
};

exports.getCompanyJobs = async (req, res) => {
  const userId = req.params.userId;

  try {
    // First, get the company_id associated with this user_id
    const companyQuery = `
      SELECT company_id FROM companies 
      WHERE user_id = $1
    `;
    
    const companyResult = await db.query(companyQuery, [userId]);
    
    if (companyResult.rows.length === 0) {
      return res.status(404).json({ error: "No company found for this user" });
    }
    
    const companyId = companyResult.rows[0].company_id;
    
    // Now use the correct company_id to fetch jobs
    const jobsQuery = `
      SELECT j.*, 
             cat.name AS category_name,
             (SELECT COUNT(*) FROM quotes WHERE job_id = j.job_id) AS quotes_count,
             (CASE WHEN j.deadline <= CURRENT_DATE THEN true ELSE false END) AS expired
      FROM jobs j
      JOIN categories cat ON j.category_id = cat.category_id
      WHERE j.company_id = $1
      ORDER BY j.created_at DESC
    `;
    
    const jobsResult = await db.query(jobsQuery, [companyId]);
    
    res.json({ jobs: jobsResult.rows });
  } catch (error) {
    console.error("Get Company Jobs Error:", error);
    res.status(500).json({ error: "Failed to fetch company jobs" });
  }
};

exports.getUserJobs = async (req, res) => {
  const { userId, category } = req.params;

  try {
    // Fetch user categories
    const userCategoriesQuery = `SELECT categories FROM users WHERE user_id = $1`;
    
    const userCategoriesResult = await db.query(userCategoriesQuery, [userId]);

    if (userCategoriesResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userCategories = userCategoriesResult.rows[0].categories;

    if (userCategories.length === 0 && category === "all") {
      return res.json({ jobs: [] });
    }

    // Base query to fetch jobs
    let query = `
      SELECT j.*, 
             c.name AS company_name, 
             cat.name AS category_name,
             comp.website, 
             comp.location AS company_location,
             EXISTS(SELECT 1 FROM quotes WHERE job_id = j.job_id AND user_id = $1) AS has_quoted
      FROM jobs j
      JOIN companies comp ON j.company_id = comp.company_id
      JOIN users c ON comp.user_id = c.user_id
      JOIN categories cat ON j.category_id = cat.category_id
      WHERE j.status = 'open' AND j.deadline > CURRENT_DATE
    `;

    let queryParams = [userId];
    let paramIndex = 2; // For parameterized queries

    // Apply filtering logic
    if (category && category !== "all") {
      query += ` AND j.category_id = $${paramIndex}`;
      queryParams.push(category);
      paramIndex++;
    } else if (userCategories.length > 0) {
      query += ` AND j.category_id = ANY($${paramIndex})`;
      queryParams.push(userCategories);
      paramIndex++;
    }

    // Order jobs by latest
    query += " ORDER BY j.created_at DESC";

    // Execute query
    const result = await db.query(query, queryParams);

    res.json({ jobs: result.rows });
  } catch (error) {
    console.error("Get Jobs Error:", error);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
};

exports.getJobDetails = async (req, res) => {
  const { job_id } = req.params;  // Use req.params for job_id
  const { userId, userType } = req.body;
  
  console.log('Received job_id:', job_id);
  console.log('User ID:', userId, '| User Type:', userType);
  
  try {
    // Get job details
    const jobQuery = `
      SELECT j.*, u.name as company_name, cat.name as category_name, 
        u.profile_picture as company_profile_picture, j.company_id,
        (CASE WHEN j.deadline <= CURRENT_DATE THEN true ELSE false END) AS expired
      FROM jobs j
      JOIN companies comp ON j.company_id = comp.company_id
      JOIN users u ON comp.user_id = u.user_id 
      JOIN categories cat ON j.category_id = cat.category_id
      WHERE j.job_id = $1
    `;
    const jobResult = await db.query(jobQuery, [job_id]);
    
    console.log('Job query result:', jobResult.rows);
    if (jobResult.rows.length === 0) {
      console.log('No job found with job_id:', job_id);
      return res.status(404).json({ error: 'Job not found' });
    }
    
    const job = jobResult.rows[0];
    let quotes = [];
    
    // Only fetch quotes if user is the company that posted the job
    // First, check if the userId (which is the user_id) is associated with the company that posted this job
    if (userType === 'company') {
      // Get the company_id for this user
      const companyQuery = `
        SELECT company_id FROM companies 
        WHERE user_id = $1
      `;
      
      const companyResult = await db.query(companyQuery, [userId]);
      
      if (companyResult.rows.length > 0 && companyResult.rows[0].company_id == job.company_id) {
        console.log('Fetching quotes for company:', companyResult.rows[0].company_id);
        
        const quotesQuery = `
          SELECT q.*, u.name, u.profile_picture, 
            (SELECT COUNT(*) FROM job_completion jc WHERE jc.user_id = q.user_id AND jc.status = 'completed') as completed_jobs
          FROM quotes q
          JOIN users u ON q.user_id = u.user_id
          WHERE q.job_id = $1
          ORDER BY q.created_at DESC
        `;
        
        const quotesResult = await db.query(quotesQuery, [job_id]);
        quotes = quotesResult.rows;
        console.log('Quotes fetched:', quotes.length);
      } else {
        console.log('User is not the job posting company');
      }
    } else {
      console.log('User is not authorized to view quotes');
    }
    
    // Check if there's a selected freelancer
    const selectedQuery = `
      SELECT sf.*, u.name, u.email, u.profile_picture
      FROM selected_freelancers sf
      JOIN users u ON sf.user_id = u.user_id
      WHERE sf.job_id = $1
    `;
    
    const selectedResult = await db.query(selectedQuery, [job_id]);
    const selectedFreelancer = selectedResult.rows.length > 0 ? selectedResult.rows[0] : null;
    console.log('Selected Freelancer:', selectedFreelancer);
    
    // Check for agreement status
    const agreementQuery = `
      SELECT * FROM agreements WHERE job_id = $1
    `;
    
    const agreementResult = await db.query(agreementQuery, [job_id]);
    const agreement = agreementResult.rows.length > 0 ? agreementResult.rows[0] : null;
    console.log('Agreement:', agreement);
    
    res.json({
      job,
      quotes,
      selectedFreelancer,
      agreement
    });
  } catch (error) {
    console.error('Get Job Details Error:', error);
    res.status(500).json({ error: 'Failed to fetch job details' });
  }
};


exports.cancelJob = async (req, res) => {
  const { jobId } = req.params;
  const companyId = req.user.company_id;
  
  try {
    // Verify the job belongs to this company and is in 'open' status
    const checkQuery = `
      SELECT * FROM jobs
      WHERE job_id = $1 AND company_id = $2 AND status = 'open'
    `;
    
    const checkResult = await db.query(checkQuery, [jobId, companyId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: "Job not found or cannot be cancelled" });
    }
    
    // Update job status to cancelled
    const updateQuery = `
      UPDATE jobs
      SET status = 'cancelled'
      WHERE job_id = $1
      RETURNING *
    `;
    
    const result = await db.query(updateQuery, [jobId]);
    
    // Notify freelancers who submitted quotes
    const quotesQuery = `
      SELECT user_id FROM quotes WHERE job_id = $1
    `;
    
    const quotesResult = await db.query(quotesQuery, [jobId]);
    
    for (const row of quotesResult.rows) {
      await sendNotification(
        row.user_id,
        jobId,
        'job_update',
        `The job you quoted on has been cancelled by the company.`
      );
    }
    
    res.json({ message: "Job cancelled successfully", job: result.rows[0] });
  } catch (error) {
    console.error("Cancel Job Error:", error);
    res.status(500).json({ error: "Failed to cancel job" });
  }
};

exports.getJobQuotes = async (req, res) => {
  const { jobId } = req.params;
  const companyId = req.user.company_id;
  
  try {
    // Verify the job belongs to this company
    const checkQuery = `
      SELECT * FROM jobs
      WHERE job_id = $1 AND company_id = $2
    `;
    
    const checkResult = await db.query(checkQuery, [jobId, companyId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: "Job not found" });
    }
    
    // Get all quotes with freelancer details
    const quotesQuery = `
      SELECT q.*,
             u.name, u.profile_picture, u.bio,
             (SELECT COUNT(*) FROM selected_freelancers 
              WHERE user_id = q.user_id) AS jobs_selected,
             (SELECT COUNT(*) FROM selected_freelancers sf
              JOIN jobs j ON sf.job_id = j.job_id
              WHERE sf.user_id = q.user_id AND j.status = 'completed') AS jobs_completed
      FROM quotes q
      JOIN users u ON q.user_id = u.user_id
      WHERE q.job_id = $1
      ORDER BY q.created_at DESC
    `;
    
    const result = await db.query(quotesQuery, [jobId]);
    
    res.json({ quotes: result.rows });
  } catch (error) {
    console.error("Get Job Quotes Error:", error);
    res.status(500).json({ error: "Failed to fetch job quotes" });
  }
};

exports.updateJob = async (req, res) => {
  const { jobId } = req.params;
  const companyId = req.user.company_id;
  const { title, description, price, location, deadline } = req.body;
  
  try {
    // Verify the job belongs to this company and is in 'open' status
    const checkQuery = `
      SELECT * FROM jobs
      WHERE job_id = $1 AND company_id = $2 AND status = 'open'
    `;
    
    const checkResult = await db.query(checkQuery, [jobId, companyId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: "Job not found or cannot be updated" });
    }
    
    // Update job details
    const updateQuery = `
      UPDATE jobs
      SET title = $1, description = $2, price = $3, location = $4, deadline = $5
      WHERE job_id = $6
      RETURNING *
    `;
    
    const result = await db.query(updateQuery, [
      title, description, price, location, deadline, jobId
    ]);
    
    // Notify freelancers who submitted quotes
    const quotesQuery = `
      SELECT user_id FROM quotes WHERE job_id = $1
    `;
    
    const quotesResult = await db.query(quotesQuery, [jobId]);
    
    for (const row of quotesResult.rows) {
      await sendNotification(
        row.user_id,
        jobId,
        'job_update',
        `A job you quoted on has been updated by the company.`
      );
    }
    
    res.json({ message: "Job updated successfully", job: result.rows[0] });
  } catch (error) {
    console.error("Update Job Error:", error);
    res.status(500).json({ error: "Failed to update job" });
  }
};

exports.getJobAgreements = async (req, res) => {
  const { jobId } = req.params;
  const companyId = req.user.company_id;
  
  try {
    // Verify the job belongs to this company
    const checkQuery = `
      SELECT * FROM jobs
      WHERE job_id = $1 AND company_id = $2
    `;
    
    const checkResult = await db.query(checkQuery, [jobId, companyId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: "Job not found" });
    }
    
    // Get agreement details
    const agreementQuery = `
      SELECT a.*,
             u.name as freelancer_name, u.profile_picture,
             j.title as job_title
      FROM agreements a
      JOIN users u ON a.user_id = u.user_id
      JOIN jobs j ON a.job_id = j.job_id
      WHERE a.job_id = $1 AND a.company_id = $2
    `;
    
    const result = await db.query(agreementQuery, [jobId, companyId]);
    
    res.json({ agreements: result.rows });
  } catch (error) {
    console.error("Get Job Agreements Error:", error);
    res.status(500).json({ error: "Failed to fetch job agreements" });
  }
};

exports.getJobCompletionStatus = async (req, res) => {
  const { jobId } = req.params;
  const companyId = req.user.company_id;
  
  try {
    // Get comprehensive job status with freelancer details
    const query = `
      SELECT j.*,
             sf.user_id as freelancer_id,
             u.name as freelancer_name, u.profile_picture,
             a.status as agreement_status,
             (SELECT status FROM payments WHERE job_id = j.job_id LIMIT 1) as payment_status
      FROM jobs j
      LEFT JOIN selected_freelancers sf ON j.job_id = sf.job_id
      LEFT JOIN users u ON sf.user_id = u.user_id
      LEFT JOIN agreements a ON j.job_id = a.job_id AND sf.user_id = a.user_id
      WHERE j.job_id = $1 AND j.company_id = $2
    `;
    
    const result = await db.query(query, [jobId, companyId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Job not found" });
    }
    
    res.json({ job: result.rows[0] });
  } catch (error) {
    console.error("Get Job Completion Status Error:", error);
    res.status(500).json({ error: "Failed to fetch job completion status" });
  }
};


exports.selectFreelancer = async (req, res) => {
  const { jobId, userId } = req.params;
  const company_id = req.user.company_id;
  
  try {
    // Start transaction
    await db.query('BEGIN');
    
    // Verify job belongs to this company
    const jobQuery = `
      SELECT * FROM jobs 
      WHERE job_id = $1 AND company_id = $2 AND status = 'open'
    `;
    
    const jobResult = await db.query(jobQuery, [jobId, company_id]);
    
    if (jobResult.rows.length === 0) {
      await db.query('ROLLBACK');
      return res.status(404).json({ error: 'Job not found or not available for selection' });
    }
    
    const job = jobResult.rows[0];
    
    // Verify quote exists
    const quoteQuery = `
      SELECT * FROM quotes 
      WHERE job_id = $1 AND user_id = $2
    `;
    
    const quoteResult = await db.query(quoteQuery, [jobId, userId]);
    
    if (quoteResult.rows.length === 0) {
      await db.query('ROLLBACK');
      return res.status(404).json({ error: 'Quote not found for this user' });
    }
    
    const quote = quoteResult.rows[0];
    
    // Check if a freelancer is already selected
    const checkQuery = `
      SELECT * FROM selected_freelancers 
      WHERE job_id = $1
    `;
    
    const checkResult = await db.query(checkQuery, [jobId]);
    
    if (checkResult.rows.length > 0) {
      await db.query('ROLLBACK');
      return res.status(400).json({ error: 'A freelancer is already selected for this job' });
    }
    
    // Insert into selected_freelancers
    const insertQuery = `
      INSERT INTO selected_freelancers (job_id, user_id, selected_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      RETURNING *
    `;
    
    const selectionResult = await db.query(insertQuery, [jobId, userId]);
    
    // Generate agreement PDF
    const userQuery = `
      SELECT * FROM users WHERE user_id = $1
    `;
    
    const companyQuery = `
      SELECT u.* FROM users u
      JOIN companies c ON u.user_id = c.user_id
      WHERE c.company_id = $1
    `;
    
    const userResult = await db.query(userQuery, [userId]);
    const companyResult = await db.query(companyQuery, [company_id]);
    
    const user = userResult.rows[0];
    const company = companyResult.rows[0];
    
    // Generate standard terms
    const terms = `
    AGREEMENT BETWEEN ${company.name} AND ${user.name}
    
    JOB DETAILS:
    Title: ${job.title}
    Description: ${job.description}
    Price: ${quote.quote_price} rupees
    Deadline: ${new Date(job.deadline).toLocaleDateString()}
    
    TERMS AND CONDITIONS:
    1. The freelancer agrees to complete the work as described above by the deadline.
    2. Payment will be made only after satisfactory completion of the work.
    3. The company owns all intellectual property rights to the work produced.
    4. The freelancer must maintain confidentiality regarding all project details.
    5. Any disputes will be resolved through mutual agreement or arbitration.
    `;
    
    // Generate PDF (implementation depends on your pdf library)
    const pdfUrl = await generateAgreementPDF(job, quote, user, company, terms);
    
    // Save agreement to database
    const agreementQuery = `
      INSERT INTO agreements (job_id, user_id, company_id, pdf_url, terms, status, created_at)
      VALUES ($1, $2, $3, $4, $5, 'pending', CURRENT_TIMESTAMP)
      RETURNING *
    `;
    
    const agreementResult = await db.query(agreementQuery, [
      jobId, userId, company_id, pdfUrl, terms
    ]);
    
    // Update job status
    const updateJobQuery = `
      UPDATE jobs 
      SET status = 'in_progress' 
      WHERE job_id = $1
      RETURNING *
    `;
    
    await db.query(updateJobQuery, [jobId]);
    
    // Notify user
    await sendNotification(userId, jobId, 'contract', 'You have been selected for a job! Please review the agreement.');
    
    // Commit transaction
    await db.query('COMMIT');
    
    res.status(200).json({
      message: 'Freelancer selected successfully',
      selection: selectionResult.rows[0],
      agreement: agreementResult.rows[0]
    });
  } catch (error) {
    // Rollback transaction on error
    await db.query('ROLLBACK');
    console.error('Select Freelancer Error:', error);
    res.status(500).json({ error: 'Failed to select freelancer' });
  }
};

exports.markJobComplete = async (req, res) => {
  const { jobId } = req.params;
  const company_id = req.user.company_id;
  
  try {
    // Start transaction
    await db.query('BEGIN');
    
    // Verify job belongs to this company and is in progress
    const jobQuery = `
      SELECT j.*, sf.user_id as freelancer_id, q.quote_price 
      FROM jobs j
      JOIN selected_freelancers sf ON j.job_id = sf.job_id
      JOIN quotes q ON j.job_id = q.job_id AND sf.user_id = q.user_id
      WHERE j.job_id = $1 AND j.company_id = $2 AND j.status = 'in_progress'
    `;
    
    const jobResult = await db.query(jobQuery, [jobId, company_id]);
    
    if (jobResult.rows.length === 0) {
      await db.query('ROLLBACK');
      return res.status(404).json({ error: 'Job not found or not in progress' });
    }
    
    const job = jobResult.rows[0];
    
    // Check if agreement is accepted
    const agreementQuery = `
      SELECT * FROM agreements
      WHERE job_id = $1 AND user_id = $2 AND status = 'accepted'
    `;
    
    const agreementResult = await db.query(agreementQuery, [jobId, job.freelancer_id]);
    
    if (agreementResult.rows.length === 0) {
      await db.query('ROLLBACK');
      return res.status(400).json({ error: 'Agreement not yet accepted by freelancer' });
    }
    
    // Update job status
    const updateJobQuery = `
      UPDATE jobs 
      SET status = 'completed' 
      WHERE job_id = $1
      RETURNING *
    `;
    
    const updatedJob = await db.query(updateJobQuery, [jobId]);
    
    // Create payment entry
    const paymentQuery = `
      INSERT INTO payments (job_id, company_id, amount, payment_status)
      VALUES ($1, $2, $3, 'pending')
      RETURNING *
    `;
    
    const paymentResult = await db.query(paymentQuery, [
      jobId, company_id, job.quote_price
    ]);
    
    // Notify freelancer
    await sendNotification(
      job.freelancer_id, 
      jobId, 
      'job_update', 
      `Job "${job.title}" has been marked as completed. Payment is pending.`
    );
    
    // Commit transaction
    await db.query('COMMIT');
    
    res.status(200).json({
      message: 'Job marked as completed',
      job: updatedJob.rows[0],
      payment: paymentResult.rows[0]
    });
  } catch (error) {
    // Rollback transaction on error
    await db.query('ROLLBACK');
    console.error('Mark Job Complete Error:', error);
    res.status(500).json({ error: 'Failed to mark job as complete' });
  }
};

exports.createJobCompletionPayment = async (req, res) => {
  const { jobId } = req.params;
  const { company_id } = req.body; // This is actually the user_id from users table

  console.log(`Received request to create job payment for Job ID: ${jobId} and User ID: ${company_id}`);

  if (!company_id) {
    console.log('User ID missing in request body');
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    // First, get the actual company_id from the companies table using the user_id
    const companyQuery = `
      SELECT company_id FROM companies WHERE user_id = $1
    `;
    
    const companyResult = await db.query(companyQuery, [company_id]);
    
    if (companyResult.rows.length === 0) {
      console.log(`No company found for user ID: ${company_id}`);
      return res.status(404).json({ error: 'Company not found' });
    }
    
    const actualCompanyId = companyResult.rows[0].company_id;
    console.log(`Found actual company ID: ${actualCompanyId} for user ID: ${company_id}`);
    
    console.log('Checking for existing pending payment intent...');
    const existingPaymentQuery = `
      SELECT * FROM payment_tracking
      WHERE company_id = $1 AND plan_type = 'job_completion' AND status = 'pending'
      AND tracking_id IN (
        SELECT tracking_id FROM payment_tracking_meta
        WHERE meta_key = 'job_id' AND meta_value = $2
      )
    `;

    const existingPayment = await db.query(existingPaymentQuery, [actualCompanyId, jobId]);

    if (existingPayment.rows.length > 0) {
      console.log('Existing pending payment found. Verifying job status...');
      const payment = existingPayment.rows[0];

      const jobQuery = `
        SELECT j.*, j.title, sf.user_id as freelancer_id, q.quote_price 
        FROM jobs j
        JOIN selected_freelancers sf ON j.job_id = sf.job_id
        JOIN quotes q ON j.job_id = q.job_id AND sf.user_id = q.user_id
        WHERE j.job_id = $1 AND j.company_id = $2 AND j.status = 'in_progress'
      `;

      const jobResult = await db.query(jobQuery, [jobId, actualCompanyId]);

      if (jobResult.rows.length === 0) {
        console.log('Job not in progress or not found. Marking existing payment as failed.');
        await db.query(
          'UPDATE payment_tracking SET status = $1 WHERE tracking_id = $2',
          ['failed', payment.tracking_id]
        );
        return res.status(404).json({ error: 'Job not found or not in progress' });
      }

      const job = jobResult.rows[0];
      console.log('Returning existing payment intent');

      return res.json({
        paymentIntentId: payment.tracking_id,
        jobId,
        amount: payment.amount,
        description: `Payment for job: ${job.title}`,
        redirectUrl: `${process.env.FRONTEND_URL}/payment/job-checkout?intent_id=${payment.tracking_id}&job_id=${jobId}`
      });
    }

    console.log('No existing payment found. Verifying job eligibility...');
    const jobQuery = `
      SELECT j.*, j.title, sf.user_id as freelancer_id, q.quote_price 
      FROM jobs j
      JOIN selected_freelancers sf ON j.job_id = sf.job_id
      JOIN quotes q ON j.job_id = q.job_id AND sf.user_id = q.user_id
      WHERE j.job_id = $1 AND j.company_id = $2 AND j.status = 'in_progress'
    `;

    const jobResult = await db.query(jobQuery, [jobId, actualCompanyId]);

    if (jobResult.rows.length === 0) {
      console.log('Job not found or not in progress');
      return res.status(404).json({ error: 'Job not found or not in progress' });
    }

    const job = jobResult.rows[0];
    console.log('Job verified. Checking agreement acceptance...');

    const agreementQuery = `
      SELECT * FROM agreements
      WHERE job_id = $1 AND user_id = $2 AND status = 'accepted'
    `;

    const agreementResult = await db.query(agreementQuery, [jobId, job.freelancer_id]);

    if (agreementResult.rows.length === 0) {
      console.log('Agreement not accepted by freelancer');
      return res.status(400).json({ error: 'Agreement not yet accepted by freelancer' });
    }

    console.log('Agreement accepted. Starting transaction...');

    await db.query('BEGIN');

    try {
      const paymentIntentId = crypto.randomUUID();
      console.log(`Generated Payment Intent ID: ${paymentIntentId}`);

      const paymentIntentQuery = `
        INSERT INTO payment_tracking 
        (tracking_id, paypal_payment_id, company_id, plan_type, amount, job_limit, status, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
        RETURNING tracking_id
      `;

      await db.query(paymentIntentQuery, [
        paymentIntentId,
        'JOB_PAYMENT_' + paymentIntentId.substring(0, 8),
        actualCompanyId,
        'job_completion',
        job.quote_price,
        1,
        'pending'
      ]);

      console.log('Inserted payment intent into payment_tracking');

      const metaQuery = `
        INSERT INTO payment_tracking_meta
        (tracking_id, meta_key, meta_value)
        VALUES ($1, $2, $3)
      `;

      await db.query(metaQuery, [paymentIntentId, 'job_id', jobId]);
      console.log('Inserted payment metadata');

      await db.query('COMMIT');
      console.log('Transaction committed successfully');

      res.json({
        paymentIntentId,
        jobId,
        amount: job.quote_price,
        description: `Payment for job: ${job.title}`,
        redirectUrl: `${process.env.FRONTEND_URL}/payment/job-checkout?intent_id=${paymentIntentId}&job_id=${jobId}`
      });
    } catch (txError) {
      console.error('Transaction failed. Rolling back...', txError);
      await db.query('ROLLBACK');
      throw txError;
    }
  } catch (error) {
    console.error('Job Payment Intent Creation Error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
};


exports.processJobCompletionPayment = async (req, res) => {
  const { 
    paymentIntentId, 
    jobId,
    cardNumber, 
    expiryMonth, 
    expiryYear, 
    cvc, 
    cardholderName,
    company_id  // This is actually the user_id from users table
  } = req.body;
  
  // Basic validation
  if (!paymentIntentId || !jobId || !cardNumber || !expiryMonth || !expiryYear || !cvc || !cardholderName || !company_id) {
    return res.status(400).json({ error: 'Missing payment information' });
  }

  try {
    // First, get the actual company_id from the companies table using the user_id
    const companyQuery = `
      SELECT company_id FROM companies WHERE user_id = $1
    `;
    
    const companyResult = await db.query(companyQuery, [company_id]);
    
    if (companyResult.rows.length === 0) {
      console.log(`No company found for user ID: ${company_id}`);
      return res.status(404).json({ error: 'Company not found' });
    }
    
    const actualCompanyId = companyResult.rows[0].company_id;
    console.log(`Found actual company ID: ${actualCompanyId} for user ID: ${company_id}`);

    // Start transaction
    await db.query('BEGIN');
    
    // Get payment tracking info and verify it belongs to this job
    const trackingQuery = `
      SELECT pt.* FROM payment_tracking pt
      JOIN payment_tracking_meta ptm ON pt.tracking_id = ptm.tracking_id
      WHERE pt.tracking_id = $1 
      AND pt.company_id = $2 
      AND pt.status = 'pending'
      AND ptm.meta_key = 'job_id'
      AND ptm.meta_value = $3
    `;
    
    const trackingResult = await db.query(trackingQuery, [paymentIntentId, actualCompanyId, jobId]);
    
    if (trackingResult.rows.length === 0) {
      await db.query('ROLLBACK');
      return res.status(404).json({ error: 'Payment intent not found or already processed' });
    }
    
    const paymentTracking = trackingResult.rows[0];
    
    // Check if payment was already processed but transaction failed
    const existingPaymentQuery = `
      SELECT * FROM payments
      WHERE job_id = $1 AND company_id = $2 AND payment_status = 'completed'
    `;
    
    const existingPayment = await db.query(existingPaymentQuery, [jobId, actualCompanyId]);
    
    if (existingPayment.rows.length > 0) {
      // Payment already exists, mark this intent as completed
      await db.query(
        'UPDATE payment_tracking SET status = $1, completed_at = CURRENT_TIMESTAMP WHERE tracking_id = $2',
        ['completed', paymentIntentId]
      );
      
      await db.query('COMMIT');
      
      return res.json({ 
        success: true,
        message: 'Payment was already processed successfully',
        payment: existingPayment.rows[0],
        redirectUrl: `${process.env.FRONTEND_URL}/jobs/completed?job_id=${jobId}`
      });
    }
    
    // Verify job exists and belongs to this company
    // Also get the quote price to double-check
    const jobQuery = `
      SELECT j.*, sf.user_id as freelancer_id, q.quote_price
      FROM jobs j
      JOIN selected_freelancers sf ON j.job_id = sf.job_id
      JOIN quotes q ON j.job_id = q.job_id AND sf.user_id = q.user_id
      WHERE j.job_id = $1 AND j.company_id = $2 AND j.status = 'in_progress'
    `;
    
    const jobResult = await db.query(jobQuery, [jobId, actualCompanyId]);
    
    if (jobResult.rows.length === 0) {
      await db.query('ROLLBACK');
      return res.status(404).json({ error: 'Job not found or not in progress' });
    }
    
    const job = jobResult.rows[0];
    
    // Verify the amount matches the quote price
    if (paymentTracking.amount !== job.quote_price) {
      await db.query('ROLLBACK');
      return res.status(400).json({ error: 'Payment amount does not match the agreed quote price' });
    }
    
    try {
      // Update job status
      const updateJobQuery = `
        UPDATE jobs 
        SET status = 'completed' 
        WHERE job_id = $1
        RETURNING *
      `;
      
      const updatedJob = await db.query(updateJobQuery, [jobId]);
      
      // Create payment entry
      const paymentQuery = `
        INSERT INTO payments (job_id, company_id, amount, payment_status)
        VALUES ($1, $2, $3, 'completed')
        RETURNING *
      `;
      
      const paymentResult = await db.query(paymentQuery, [
        jobId, actualCompanyId, job.quote_price
      ]);
      
      // Create job completion record with properly set completed_at field
      const completionQuery = `
        INSERT INTO job_completion 
        (job_id, user_id, company_id, amount_paid, status, completed_at)
        VALUES ($1, $2, $3, $4, 'completed', CURRENT_TIMESTAMP)
        RETURNING *
      `;
      
      const completionResult = await db.query(completionQuery, [
        jobId, 
        job.freelancer_id, 
        actualCompanyId, 
        job.quote_price
      ]);
      
      // Update payment tracking record
      await db.query(
        'UPDATE payment_tracking SET status = $1, completed_at = CURRENT_TIMESTAMP WHERE tracking_id = $2',
        ['completed', paymentIntentId]
      );
      
      // Send notifications
      await sendNotification(
        job.freelancer_id, 
        jobId, 
        'payment', 
        `Payment for job "${job.title}" has been completed. Amount: ${job.quote_price}`
      );
      
      // Commit transaction
      await db.query('COMMIT');

      res.json({ 
        success: true,
        message: 'Payment processed and job completed successfully', 
        job: updatedJob.rows[0],
        payment: paymentResult.rows[0],
        redirectUrl: `${process.env.FRONTEND_URL}/jobs/completed?job_id=${jobId}`
      });
    } catch (dbError) {
      // Rollback transaction on error
      await db.query('ROLLBACK');
      console.error('Database Job Completion Error:', dbError);
      res.status(500).json({ 
        error: 'Failed to complete job payment',
        redirectUrl: `${process.env.FRONTEND_URL}/payment/failure`
      });
    }
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Job Payment Processing Error:', error);
    res.status(500).json({ 
      error: 'Failed to process payment',
      redirectUrl: `${process.env.FRONTEND_URL}/payment/failure`
    });
  }
};

// Add this helper function to cleanup stale payment intents
exports.cleanupStalePaymentIntents = async () => {
  try {
    const staleIntentsQuery = `
      UPDATE payment_tracking
      SET status = 'failed'
      WHERE status = 'pending'
      AND created_at < (NOW() - INTERVAL '24 hours')
      RETURNING tracking_id
    `;
    
    const result = await db.query(staleIntentsQuery);
    console.log(`Cleaned up ${result.rowCount} stale payment intents`);
  } catch (error) {
    console.error('Failed to cleanup stale payment intents:', error);
  }
};