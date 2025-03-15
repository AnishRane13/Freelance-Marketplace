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


// ------------------------------------------------------------------------------------------------------

// Agreement routes (for both company and freelancer)
router.get('/:agreementId', 
  authMiddleware.authenticate, 
  agreementController.getAgreement
);

// Freelancer routes
router.post('/:agreementId/accept', 
  authMiddleware.authenticate, 
  authMiddleware.isFreelancer, 
  agreementController.acceptAgreement
);

router.post('/:agreementId/reject', 
  authMiddleware.authenticate, 
  authMiddleware.isFreelancer, 
  agreementController.rejectAgreement
);

module.exports = router;