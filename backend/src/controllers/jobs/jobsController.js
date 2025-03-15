// src/controllers/jobController.js
const db = require('../../../db/db');
const { updateJobPostCount } = require('../subscriptions/subscriptionController');
const { generateAgreementPDF } = require('../../utils/pdfGenerator');
const { sendNotification } = require('../../utils/notificationHelper');

exports.createJob = async (req, res) => {
  try {
    const { title, description, category_id, price, location, deadline, status } = req.body;
    const companyId = req.companyId; // Now properly retrieved
    const subscription = req.activeSubscription;

    if (!subscription) {
      return res.status(403).json({ error: "You don't have an active subscription." });
    }

    const jobQuery = `
      INSERT INTO jobs (company_id, title, description, category_id, price, location, deadline, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING job_id
    `;

    const result = await db.query(jobQuery, [companyId, title, description, category_id, price, location, deadline, status]);

    if (result.rows.length > 0) {
      // Update jobs_posted count
      const updateSubscriptionQuery = `
        UPDATE subscriptions 
        SET jobs_posted = jobs_posted + 1 
        WHERE subscription_id = $1
      `;
      await db.query(updateSubscriptionQuery, [subscription.subscription_id]);
    }

    res.status(201).json({ success: true, job: result.rows[0] });
  } catch (error) {
    console.error("Job Creation Error:", error);
    res.status(500).json({ error: "Failed to create job" });
  }
};

exports.getCompanyJobs = async (req, res) => {

  const companyId = req.params.userId;

  try {
    const query = `
      SELECT j.*, 
             cat.name AS category_name,
             (SELECT COUNT(*) FROM quotes WHERE job_id = j.job_id) AS quotes_count,
             (CASE WHEN j.deadline < CURRENT_DATE THEN true ELSE false END) AS expired
      FROM jobs j
      JOIN categories cat ON j.category_id = cat.category_id
      WHERE j.company_id = $1
      ORDER BY j.created_at DESC
    `;
    
    const result = await db.query(query, [companyId]);
    
    res.json({ jobs: result.rows });
  } catch (error) {
    console.error("Get Company Jobs Error:", error);
    res.status(500).json({ error: "Failed to fetch company jobs" });
  }
};

exports.getUserJobs = async (req, res) => {
  const { userId, category } = req.params;
  // console.log("Request received with userId:", userId, "and category:", category);

  try {
    // Fetch user categories
    const userCategoriesQuery = `SELECT categories FROM users WHERE user_id = $1`;
    // console.log("Executing query:", userCategoriesQuery, "with params:", [userId]);
    
    const userCategoriesResult = await db.query(userCategoriesQuery, [userId]);
    // console.log("User categories result:", userCategoriesResult.rows);

    if (userCategoriesResult.rows.length === 0) {
      // console.log("User not found");
      return res.status(404).json({ error: "User not found" });
    }

    const userCategories = userCategoriesResult.rows[0].categories;
    // console.log("User categories:", userCategories);

    if (userCategories.length === 0 && category === "all") {
      // console.log("No categories & category filter is 'all', returning empty jobs list.");
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
      WHERE j.status = 'open' AND j.deadline >= CURRENT_DATE
    `;

    let queryParams = [userId];
    let paramIndex = 2; // For parameterized queries

    // console.log("Category filter:", category);

    // Apply filtering logic
    if (category && category !== "all") {
      query += ` AND j.category_id = $${paramIndex}`;
      queryParams.push(category);
      // console.log("Filtering by specific category:", category);
      paramIndex++;
    } else if (userCategories.length > 0) {
      query += ` AND j.category_id = ANY($${paramIndex})`;
      queryParams.push(userCategories);
      // console.log("Filtering by user categories:", userCategories);
      paramIndex++;
    }

    // Order jobs by latest
    query += " ORDER BY j.created_at DESC";
    // console.log("Final query:", query);
    // console.log("Final query parameters:", queryParams);

    // Execute query
    const result = await db.query(query, queryParams);
    // console.log("Query result:", result.rows);

    res.json({ jobs: result.rows });
  } catch (error) {
    console.error("Get Jobs Error:", error);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
};


exports.getJobDetails = async (req, res) => {
  const { job_id } = req.params;  // Use req.params for job_id
  const { userId, userType } = req.body;

  try {
    // Get job details
    const jobQuery = `
   SELECT j.*, u.name as company_name, cat.name as category_name, 
  u.profile_picture as company_profile_picture, j.company_id
FROM jobs j
JOIN companies comp ON j.company_id = comp.company_id
JOIN users u ON comp.user_id = u.user_id 
JOIN categories cat ON j.category_id = cat.category_id
WHERE j.job_id = $1
  `;  
    
    const jobResult = await db.query(jobQuery, [job_id]);
    
    if (jobResult.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    const job = jobResult.rows[0];

    // Get quotes only if user is the company that posted the job
    let quotes = [];
    if (userType === 'company' && job.company_id == userId) {
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

    // Check for agreement status
    const agreementQuery = `
      SELECT * FROM agreements WHERE job_id = $1
    `;

    const agreementResult = await db.query(agreementQuery, [job_id]);
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