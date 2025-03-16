// src/controllers/agreementController.js
const db = require('../../../db/db');
const { sendNotification } = require('../../utils/notificationHelper');

exports.getAgreement = async (req, res) => {
  const { agreementId } = req.params;
  const { userId } = req.body; 
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






// ------------------------------------------------------------------------------------------------------------
// 2. Getting Agreement Details (/agreements/:agreementId)

// Retrieves the agreement with relevant job, freelancer, and company details
// Checks authorization (only accessible by the involved freelancer or company)

// 3. Freelancer Accepting Agreement (/agreements/:agreementId/accept)

// Validates that the agreement exists and belongs to the freelancer
// Updates agreement status to "accepted"
// Creates record in contract_acceptance table
// Notifies the company

// 4. Freelancer Rejecting Agreement (/agreements/:agreementId/reject)

// Updates agreement status to "rejected"
// Removes the freelancer selection
// Sets job status back to "open"
// Notifies the company


// 1. GET /agreements/pending - For Pending Agreements
// This endpoint returns all agreements that are pending the user's acceptance. It:

// Returns only agreements where the status is 'pending'
// Includes relevant job details, company information, and pricing
// Orders the results with the most recent agreements first
// Is perfect for a "To-Do" section where users need to take action

// 2. GET /agreements - For All Agreements (History)
// This endpoint provides a complete history of all agreements for the user. It:

// Works for both freelancers and companies (with appropriate data for each)
// Includes both pending and completed agreements
// Shows status, dates, and whether the agreement was accepted or rejected
// Can be used for a comprehensive agreement history view


// src/controllers/agreementController.js
// exports.getAgreement = async (req, res) => {
//   const { agreementId } = req.params;
//   const userId = req.user.user_id;
  
//   try {
//     const query = `
//       SELECT a.*, j.title as job_title, j.description as job_description,
//         j.deadline, j.price,
//         u.name as user_name, u.email as user_email,
//         c.name as company_name
//       FROM agreements a
//       JOIN jobs j ON a.job_id = j.job_id
//       JOIN users u ON a.user_id = u.user_id
//       JOIN companies comp ON a.company_id = comp.company_id
//       JOIN users c ON comp.user_id = c.user_id
//       WHERE a.agreement_id = $1 AND (a.user_id = $2 OR c.user_id = $2)
//     `;
    
//     const result = await db.query(query, [agreementId, userId]);
    
//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: 'Agreement not found' });
//     }
    
//     res.json(result.rows[0]);
//   } catch (error) {
//     console.error('Get Agreement Error:', error);
//     res.status(500).json({ error: 'Failed to fetch agreement' });
//   }
// };

exports.acceptAgreement = async (req, res) => {
  const { agreementId } = req.params;
  const { userId } = req.body; 
  
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
      SET status = 'accepted', response_at = CURRENT_TIMESTAMP
      WHERE agreement_id = $1
      RETURNING *
    `;
    
    const updateResult = await db.query(updateQuery, [agreementId]);
    
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
    
    // Commit transaction
    await db.query('COMMIT');
    
    res.status(200).json({
      message: 'Agreement accepted successfully',
      agreement: updateResult.rows[0]
    });
  } catch (error) {
    // Rollback transaction on error
    await db.query('ROLLBACK');
    console.error('Accept Agreement Error:', error);
    res.status(500).json({ error: 'Failed to accept agreement' });
  }
};

exports.rejectAgreement = async (req, res) => {
  const { agreementId } = req.params;
  const { userId } = req.body; 
  
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
      SET status = 'rejected', response_at = CURRENT_TIMESTAMP
      WHERE agreement_id = $1
      RETURNING *
    `;
    
    const updateResult = await db.query(updateQuery, [agreementId]);
    
    // Delete from selected_freelancers
    await db.query(
      'DELETE FROM selected_freelancers WHERE job_id = $1 AND user_id = $2',
      [agreement.job_id, userId]
    );
    
    // Update job status back to open
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
    
    // Commit transaction
    await db.query('COMMIT');
    
    res.status(200).json({
      message: 'Agreement rejected successfully',
      agreement: updateResult.rows[0]
    });
  } catch (error) {
    // Rollback transaction on error
    await db.query('ROLLBACK');
    console.error('Reject Agreement Error:', error);
    res.status(500).json({ error: 'Failed to reject agreement' });
  }
};


exports.getPendingAgreements = async (req, res) => {
  const userId = req.user.user_id;
  
  try {
    const query = `
      SELECT 
        a.agreement_id,
        a.job_id,
        a.company_id,
        a.status,
        a.created_at,
        j.title as job_title,
        j.description as job_description,
        j.deadline,
        q.quote_price,
        c.name as company_name,
        c.profile_picture as company_profile_picture
      FROM agreements a
      JOIN jobs j ON a.job_id = j.job_id
      JOIN quotes q ON (q.job_id = j.job_id AND q.user_id = a.user_id)
      JOIN companies comp ON a.company_id = comp.company_id
      JOIN users c ON comp.user_id = c.user_id
      WHERE a.user_id = $1 AND a.status = 'pending'
      ORDER BY a.created_at DESC
    `;
    
    const result = await db.query(query, [userId]);
    
    res.status(200).json({
      count: result.rows.length,
      agreements: result.rows
    });
  } catch (error) {
    console.error('Get Pending Agreements Error:', error);
    res.status(500).json({ error: 'Failed to fetch pending agreements' });
  }
};

exports.getAllAgreements = async (req, res) => {
  const { user_id } = req.params; 

  try {
    // Fetch user type
    const userQuery = `SELECT user_type FROM users WHERE user_id = $1`;
    const userResult = await db.query(userQuery, [user_id]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userType = userResult.rows[0].user_type;
    let query, params;

    if (userType === 'user') {
      // Freelancer agreements
      query = `
        SELECT 
          a.agreement_id,
          a.job_id,
          a.company_id,
          a.status,
          a.created_at,
          a.response_at,
          j.title AS job_title,
          j.description AS job_description,
          j.deadline,
          j.status AS job_status,
          q.quote_price,
          c.name AS company_name,
          c.profile_picture AS company_profile_picture
        FROM agreements a
        JOIN jobs j ON a.job_id = j.job_id
        JOIN quotes q ON (q.job_id = j.job_id AND q.user_id = a.user_id)
        JOIN companies comp ON a.company_id = comp.company_id
        JOIN users c ON comp.user_id = c.user_id
        WHERE a.user_id = $1
        ORDER BY a.created_at DESC
      `;
      params = [user_id];
    } else {
      // Company agreements
      const companyQuery = `SELECT company_id FROM companies WHERE user_id = $1`;
      const companyResult = await db.query(companyQuery, [user_id]);

      if (companyResult.rows.length === 0) {
        return res.status(400).json({ error: 'Company profile not found' });
      }

      const companyId = companyResult.rows[0].company_id;

      query = `
        SELECT 
          a.agreement_id,
          a.job_id,
          a.user_id AS freelancer_id,
          a.status,
          a.created_at,
          a.response_at,
          j.title AS job_title,
          j.description AS job_description,
          j.deadline,
          j.status AS job_status,
          q.quote_price,
          u.name AS freelancer_name,
          u.profile_picture AS freelancer_profile_picture
        FROM agreements a
        JOIN jobs j ON a.job_id = j.job_id
        JOIN quotes q ON (q.job_id = j.job_id AND q.user_id = a.user_id)
        JOIN users u ON a.user_id = u.user_id
        WHERE a.company_id = $1
        ORDER BY a.created_at DESC
      `;
      params = [companyId];
    }

    // Execute query
    const result = await db.query(query, params);

    res.status(200).json({
      count: result.rows.length,
      agreements: result.rows,
    });
  } catch (error) {
    console.error('Get All Agreements Error:', error);
    res.status(500).json({ error: 'Failed to fetch agreements' });
  }
};

