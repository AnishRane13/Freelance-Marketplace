// src/controllers/quoteController.js
const db = require('../../../db/db');
const { sendNotification } = require('../../utils/notificationHelper');

exports.submitQuote = async (req, res) => {
  const { jobId } = req.params;
  const userId = req.user.user_id;
  const { quote_price, cover_letter } = req.body;
  
  if (!quote_price || !cover_letter) {
    return res.status(400).json({ error: 'Quote price and cover letter are required' });
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
      return res.status(404).json({ error: 'Job not found or not open for quotes' });
    }
    
    const job = jobResult.rows[0];
    
    // Check if user already submitted a quote
    const checkQuery = `
      SELECT * FROM quotes 
      WHERE job_id = $1 AND user_id = $2
    `;
    
    const checkResult = await db.query(checkQuery, [jobId, userId]);
    
    if (checkResult.rows.length > 0) {
      return res.status(400).json({ error: 'You have already submitted a quote for this job' });
    }
    
    // Insert quote
    const insertQuery = `
      INSERT INTO quotes (user_id, job_id, quote_price, cover_letter, created_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      RETURNING *
    `;
    
    const quoteResult = await db.query(insertQuery, [
      userId, jobId, quote_price, cover_letter
    ]);
    
    // Notify company
    await sendNotification(
      job.company_user_id,
      jobId,
      'job_update',
      `New quote received for job "${job.title}"`
    );
    
    res.status(201).json({
      message: 'Quote submitted successfully',
      quote: quoteResult.rows[0]
    });
  } catch (error) {
    console.error('Submit Quote Error:', error);
    res.status(500).json({ error: 'Failed to submit quote' });
  }
};

exports.getUserQuotes = async (req, res) => {
  const userId = req.user.user_id;
  
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
    console.error('Get User Quotes Error:', error);
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
};