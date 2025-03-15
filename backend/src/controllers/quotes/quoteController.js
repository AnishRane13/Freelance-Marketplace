// src/controllers/quoteController.js
const db = require("../../../db/db");
const { sendNotification } = require("../../utils/notificationHelper");

exports.submitQuote = async (req, res) => {
  const { userId, jobId, quote_price, cover_letter } = req.body;

  if (!quote_price || !cover_letter) {
    return res
      .status(400)
      .json({ error: "Quote price and cover letter are required" });
  }

  try {
    // Check if job exists and is open
    const jobQuery = `
      SELECT j.*, c.user_id as company_user_id
      FROM jobs j
      JOIN companies c ON j.company_id = c.company_id
      WHERE j.job_id = $1 AND j.status = 'open'
    `;

    const jobResult = await db.query(jobQuery, [jobId]);

    if (jobResult.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Job not found or not open for quotes" });
    }

    const job = jobResult.rows[0];

    // Check if user already submitted a quote
    const checkQuery = `
      SELECT * FROM quotes 
      WHERE job_id = $1 AND user_id = $2
    `;

    const checkResult = await db.query(checkQuery, [jobId, userId]);

    if (checkResult.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "You have already submitted a quote for this job" });
    }

    // Insert quote
    const insertQuery = `
      INSERT INTO quotes (user_id, job_id, quote_price, cover_letter, created_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const quoteResult = await db.query(insertQuery, [
      userId,
      jobId,
      quote_price,
      cover_letter,
    ]);

    // Notify company
    await sendNotification(
      job.company_user_id,
      jobId,
      "job_update",
      `New quote received for job "${job.title}"`
    );

    res.status(201).json({
      message: "Quote submitted successfully",
      quote: quoteResult.rows[0],
    });
  } catch (error) {
    console.error("Submit Quote Error:", error);
    res.status(500).json({ error: "Failed to submit quote" });
  }
};

exports.getUserQuotes = async (req, res) => {
  const { userId } = req.params;

  try {
    const query = `
      SELECT q.*, j.title, j.status as job_status, j.deadline,
        c.name as company_name, cat.name as category_name,
        EXISTS(SELECT 1 FROM selected_freelancers sf WHERE sf.job_id = j.job_id AND sf.user_id = $1) as is_selected
      FROM quotes q
      JOIN jobs j ON q.job_id = j.job_id
      JOIN companies comp ON j.company_id = comp.company_id
      JOIN users c ON comp.user_id = c.user_id
      JOIN categories cat ON j.category_id = cat.category_id
      WHERE q.user_id = $1
      ORDER BY q.created_at DESC
    `;

    const result = await db.query(query, [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error("Get User Quotes Error:", error);
    res.status(500).json({ error: "Failed to fetch quotes" });
  }
};


// src/controllers/quoteController.js
// Controller function (in quoteController.js)
exports.acceptQuote = async (req, res) => {
  const { quoteId } = req.params;
  const { companyId } = req.body;
  
  try {
    // Start transaction
    await db.query('BEGIN');
    
    // Get quote details with job verification
    const quoteQuery = `
      SELECT q.*, j.job_id, j.title, j.description, j.deadline, j.company_id, j.status
      FROM quotes q
      JOIN jobs j ON q.job_id = j.job_id
      WHERE q.quote_id = $1 AND j.company_id = $2 AND j.status = 'open'
    `;
    
    const quoteResult = await db.query(quoteQuery, [quoteId, companyId]);
    
    if (quoteResult.rows.length === 0) {
      await db.query('ROLLBACK');
      return res.status(404).json({ error: 'Quote not found or job not available' });
    }
    
    const quote = quoteResult.rows[0];
    const { job_id, user_id } = quote;
    
    // Check if a freelancer is already selected
    const checkQuery = `
      SELECT * FROM selected_freelancers 
      WHERE job_id = $1
    `;
    
    const checkResult = await db.query(checkQuery, [job_id]);
    
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
    
    const selectionResult = await db.query(insertQuery, [job_id, user_id]);
    
    // Create agreement record (without generating and storing PDF)
    const agreementQuery = `
      INSERT INTO agreements (job_id, user_id, company_id, pdf_url, terms, status, created_at)
      VALUES ($1, $2, $3, $4, $5, 'pending', CURRENT_TIMESTAMP)
      RETURNING *
    `;
    
    // Use a placeholder PDF URL (could be a static template path)
    const staticPdfPath = '../../HarrisonCollection_Guidelines_111020[23]1.pdf';
    
    // Generate standard terms based on job and quote details
    const termsQuery = `
      SELECT j.title, j.description, j.deadline, 
             q.quote_price, 
             u1.name as freelancer_name,
             u2.name as company_name
      FROM jobs j
      JOIN quotes q ON j.job_id = q.job_id
      JOIN users u1 ON q.user_id = u1.user_id
      JOIN companies c ON j.company_id = c.company_id
      JOIN users u2 ON c.user_id = u2.user_id
      WHERE j.job_id = $1 AND q.user_id = $2
    `;
    
    const termsResult = await db.query(termsQuery, [job_id, user_id]);
    const termsData = termsResult.rows[0];
    
    const terms = `
      AGREEMENT BETWEEN ${termsData.company_name} AND ${termsData.freelancer_name}
      
      JOB DETAILS:
      Title: ${termsData.title}
      Description: ${termsData.description}
      Price: ${termsData.quote_price} rupees
      Deadline: ${new Date(termsData.deadline).toLocaleDateString()}
      
      TERMS AND CONDITIONS:
      1. The freelancer agrees to complete the work as described above by the deadline.
      2. Payment will be made only after satisfactory completion of the work.
      3. The company owns all intellectual property rights to the work produced.
      4. The freelancer must maintain confidentiality regarding all project details.
      5. Any disputes will be resolved through mutual agreement or arbitration.
    `;
    
    const agreementResult = await db.query(agreementQuery, [
      job_id, user_id, companyId, staticPdfPath, terms
    ]);
    
    // Update job status
    const updateJobQuery = `
      UPDATE jobs 
      SET status = 'in_progress' 
      WHERE job_id = $1
      RETURNING *
    `;
    
    await db.query(updateJobQuery, [job_id]);
    
    // Notify user
    if (typeof sendNotification === 'function') {
      await sendNotification(
        user_id, 
        job_id, 
        'contract', 
        'You have been selected for a job! Please review the agreement.'
      );
    }
    
    // Commit transaction
    await db.query('COMMIT');
    
    res.status(200).json({
      message: 'Quote accepted and agreement created',
      selection: selectionResult.rows[0],
      agreement: agreementResult.rows[0]
    });
  } catch (error) {
    // Rollback transaction on error
    await db.query('ROLLBACK');
    console.error('Accept Quote Error:', error);
    res.status(500).json({ error: 'Failed to accept quote' });
  }
};