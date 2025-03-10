// src/routes/agreement/agreementRoutes.js
const express = require('express');
const router = express.Router();
const agreementController = require('../../controllers/agreementController');
const authMiddleware = require('../../middlewares/authMiddleware');

// Get agreement details
router.get('/:agreementId', 
  authMiddleware.isAuthenticated,
  agreementController.getAgreement
);

// Respond to agreement (accept/reject)
router.post('/:agreementId/respond', 
  authMiddleware.isAuthenticated,
  authMiddleware.isUser,
  agreementController.respondToAgreement
);

module.exports = router;