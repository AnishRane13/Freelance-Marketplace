// src/utils/notificationHelper.js
const db = require('../../db/db');

/**
 * Send a notification to a user
 * @param {number} recipientId - The user ID to receive the notification
 * @param {number} jobId - The related job ID (optional)
 * @param {string} type - Notification type (job_update, payment, contract, system)
 * @param {string} message - The notification message
 * @returns {Promise} - Database query result
 */
async function sendNotification(recipientId, jobId, type, message) {
  try {
    const query = `
      INSERT INTO notifications (recipient_id, job_id, type, message, is_read, created_at)
      VALUES ($1, $2, $3, $4, false, CURRENT_TIMESTAMP)
      RETURNING *
    `;
    
    return await db.query(query, [recipientId, jobId, type, message]);
  } catch (error) {
    console.error('Send Notification Error:', error);
    throw error;
  }
}

/**
 * Mark a notification as read
 * @param {number} notificationId - The notification ID
 * @param {number} userId - The user ID (for verification)
 * @returns {Promise} - Database query result
 */
async function markNotificationAsRead(notificationId, userId) {
  try {
    const query = `
      UPDATE notifications
      SET is_read = true
      WHERE notification_id = $1 AND recipient_id = $2
      RETURNING *
    `;
    
    return await db.query(query, [notificationId, userId]);
  } catch (error) {
    console.error('Mark Notification Read Error:', error);
    throw error;
  }
}

/**
 * Get user's notifications
 * @param {number} userId - The user ID
 * @param {number} limit - Maximum number of notifications to return
 * @param {boolean} unreadOnly - Whether to return only unread notifications
 * @returns {Promise} - Database query result
 */
async function getUserNotifications(userId, limit = 20, unreadOnly = false) {
  try {
    let query = `
      SELECT n.*, j.title as job_title
      FROM notifications n
      LEFT JOIN jobs j ON n.job_id = j.job_id
      WHERE n.recipient_id = $1
    `;
    
    if (unreadOnly) {
      query += ` AND n.is_read = false`;
    }
    
    query += ` ORDER BY n.created_at DESC LIMIT $2`;
    
    return await db.query(query, [userId, limit]);
  } catch (error) {
    console.error('Get User Notifications Error:', error);
    throw error;
  }
}

module.exports = {
  sendNotification,
  markNotificationAsRead,
  getUserNotifications
};