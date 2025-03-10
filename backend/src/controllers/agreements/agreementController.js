// src/controllers/agreementController.js
const db = require('../config/database');
const { sendNotification } = require('../utils/notificationHelper');

exports.getAgreement = async (req, res) => {
  const { agreementId } = req.params;
  const userId = req.user.user_id;
  
  try {
    const query = `
      SELECT a.*, j.title as job_title, j.description as job_description,
        j.deadline, j.price,
        u.name as user_name, u.email as user_email,
        c.name as company_name
      FROM agreements a
      JOIN jobs j ON a.job_id = j.job_id
      JOIN users u ON a.user_id = u.user_id
      JOIN companies comp ON a.company_id = comp.company_id
      JOIN users c ON comp.user_id = c.user_id
      WHERE a.agreement_id = $1 AND (a.user_id = $2 OR c.user_id = $2)
    `;
    
    const result = await db.query(query, [agreementId, userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Agreement not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get Agreement Error:', error);
    res.status(500).json({ error: 'Failed to fetch agreement' });
  }
};

exports.respondToAgreement = async (req, res) => {
  const { agreementId } = req.params;
  const { response } = req.body; // 'accepted' or 'rejected'
  const userId = req.user.user_id;
  
  if (!response || !['accepted', 'rejected'].includes(response)) {
    return res.status(400).json({ error: 'Valid response (accepted/rejected) is required' });
  }
  
  try {
    // Start transaction
    await db.query('BEGIN');
    
    // Check if agreement exists and belongs to this user
    const checkQuery = `
      SELECT a.*, j.company_id, c.user_id as company_user_id, j.title as job_title
      FROM agreements a
      JOIN jobs j ON a.job_id = j.job_id
      JOIN companies c ON j.company_id = c.company_id
      WHERE a.agreement_id = $1 AND a.user_id = $2 AND a.status = 'pending'
    `;
    
    const checkResult = await db.query(checkQuery, [agreementId, userId]);
    
    if (checkResult.rows.length === 0) {
      await db.query('ROLLBACK');
      return res.status(404).json({ error: 'Agreement not found or already responded to' });
    }
    
    const agreement = checkResult.rows[0];
    
    // Update agreement status
    const updateQuery = `
      UPDATE agreements
      SET status = $1, response_at = CURRENT_TIMESTAMP
      WHERE agreement_id = $2
      RETURNING *
    `;
    
    const updateResult = await db.query(updateQuery, [response, agreementId]);
    
    // If rejected, update job status back to open
    if (response === 'rejected') {
      // Delete from selected_freelancers
      await db.query(
        'DELETE FROM selected_freelancers WHERE job_id = $1 AND user_id = $2',
        [agreement.job_id, userId]
      );
      
      // Update job status
      await db.query(
        'UPDATE jobs SET status = $1 WHERE job_id = $2',
        ['open', agreement.job_id]
      );
      
      // Notify company
      await sendNotification(
        agreement.company_user_id,
        agreement.job_id,
        'contract',
        `Agreement for job "${agreement.job_title}" was rejected by the freelancer.`
      );
    } else {
      // Create contract acceptance record
      await db.query(
        `INSERT INTO contract_acceptance (job_id, user_id, status, accepted_at)
         VALUES ($1, $2, 'accepted', CURRENT_TIMESTAMP)`,
        [agreement.job_id, userId]
      );
      
      // Notify company
      await sendNotification(
        agreement.company_user_id,
        agreement.job_id,
        'contract',
        `Agreement for job "${agreement.job_title}" was accepted by the freelancer.`
      );
    }
    
    // Commit transaction
    await db.query('COMMIT');
    
    res.status(200).json({
      message: `Agreement ${response} successfully`,
      agreement: updateResult.rows[0]
    });
  } catch (error) {
    // Rollback transaction on error
    await db.query('ROLLBACK');
    console.error('Respond to Agreement Error:', error);
    res.status(500).json({ error: 'Failed to respond to agreement' });
  }
};