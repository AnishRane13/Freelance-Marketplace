// src/controllers/jobController.js
const db = require('../config/database');
const { updateJobPostCount } = require('./subscriptionController');

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

// Other job controller methods...