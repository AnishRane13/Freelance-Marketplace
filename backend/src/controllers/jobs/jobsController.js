// src/controllers/jobController.js
const db = require('../../../db/db');
const { updateJobPostCount } = require('./subscriptionController');
const { generateAgreementPDF } = require('../utils/pdfGenerator');
const { sendNotification } = require('../utils/notificationHelper');

exports.createJob = async (req, res) => {
  const { title, description, category_id, price, location, deadline } = req.body;
  const company_id = req.user.company_id;
  
  // Validate required fields
  if (!title || !description || !category_id || !price || !location || !deadline) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  try {
    // Check if active subscription exists (should already be checked by middleware)
    const subscription = req.activeSubscription;
    
    // Start transaction
    await db.query('BEGIN');
    
    // Insert new job
    const jobQuery = `
      INSERT INTO jobs 
      (company_id, title, description, category_id, price, location, deadline, status, created_at) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'open', CURRENT_TIMESTAMP) 
      RETURNING *
    `;
    
    const jobResult = await db.query(jobQuery, [
      company_id, title, description, category_id, price, location, deadline
    ]);
    
    const newJob = jobResult.rows[0];
    
    // Update job post count in subscription
    const subscriptionResult = await updateJobPostCount(subscription.subscription_id);
    const updatedSubscription = subscriptionResult.rows[0];
    
    // Create notifications for users with matching category
    const notificationQuery = `
      INSERT INTO notifications (recipient_id, job_id, type, message, is_read, created_at)
      SELECT 
        user_id, 
        $1, 
        'job_update', 
        $2, 
        false, 
        CURRENT_TIMESTAMP
      FROM users
      WHERE 
        user_type = 'user' 
        AND $3 = ANY(categories)
    `;
    
    await db.query(notificationQuery, [
      newJob.job_id,
      `New job posted: ${title}`,
      category_id
    ]);
    
    // Commit transaction
    await db.query('COMMIT');
    
    res.status(201).json({
      job: newJob,
      subscription: {
        job_limit: updatedSubscription.job_limit,
        jobs_posted: updatedSubscription.jobs_posted,
        remaining: updatedSubscription.job_limit - updatedSubscription.jobs_posted
      }
    });
  } catch (error) {
    // Rollback transaction on error
    await db.query('ROLLBACK');
    console.error('Job Creation Error:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
};

exports.getJobsByCategory = async (req, res) => {
  const { categoryId } = req.params;
  const userId = req.user.user_id;
  
  try {
    const query = `
      SELECT j.*, c.name as company_name, cat.name as category_name,
      EXISTS(SELECT 1 FROM quotes WHERE job_id = j.job_id AND user_id = $1) as has_quoted
      FROM jobs j
      JOIN companies comp ON j.company_id = comp.company_id
      JOIN users c ON comp.user_id = c.user_id
      JOIN categories cat ON j.category_id = cat.category_id
      WHERE j.category_id = $2
      AND j.status = 'open'
      ORDER BY j.created_at DESC
    `;
    
    const result = await db.query(query, [userId, categoryId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Get Jobs Error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
};

exports.getJobDetails = async (req, res) => {
  const { jobId } = req.params;
  const userId = req.user.user_id;
  const userType = req.user.user_type;
  
  try {
    // Get job details
    const jobQuery = `
      SELECT j.*, c.name as company_name, cat.name as category_name,
        u.profile_picture as company_profile_picture
      FROM jobs j
      JOIN companies comp ON j.company_id = comp.company_id
      JOIN users u ON comp.user_id = u.user_id
      JOIN categories cat ON j.category_id = cat.category_id
      WHERE j.job_id = $1
    `;
    
    const jobResult = await db.query(jobQuery, [jobId]);
    
    if (jobResult.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    const job = jobResult.rows[0];
    
    // Get quotes if user is the company that posted the job
    let quotes = [];
    if (userType === 'company' && job.company_id === req.user.company_id) {
      const quotesQuery = `
        SELECT q.*, u.name, u.profile_picture, 
          (SELECT COUNT(*) FROM job_completion jc WHERE jc.user_id = q.user_id AND jc.status = 'completed') as completed_jobs
        FROM quotes q
        JOIN users u ON q.user_id = u.user_id
        WHERE q.job_id = $1
        ORDER BY q.created_at DESC
      `;
      
      const quotesResult = await db.query(quotesQuery, [jobId]);
      quotes = quotesResult.rows;
    }
    
    // Check if there's a selected freelancer
    const selectedQuery = `
      SELECT sf.*, u.name, u.email, u.profile_picture
      FROM selected_freelancers sf
      JOIN users u ON sf.user_id = u.user_id
      WHERE sf.job_id = $1
    `;
    
    const selectedResult = await db.query(selectedQuery, [jobId]);
    const selectedFreelancer = selectedResult.rows.length > 0 ? selectedResult.rows[0] : null;
    
    // Check for agreement status
    const agreementQuery = `
      SELECT *
      FROM agreements
      WHERE job_id = $1
    `;
    
    const agreementResult = await db.query(agreementQuery, [jobId]);
    const agreement = agreementResult.rows.length > 0 ? agreementResult.rows[0] : null;
    
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