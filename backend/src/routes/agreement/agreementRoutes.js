// src/routes/agreement/agreementRoutes.js
const express = require('express');
const router = express.Router();
const agreementController = require('../../controllers/agreements/agreementController');
// const authMiddleware = require('../../middlewares/authMiddleware');

// Get agreement details
router.post('/:agreementId', agreementController.getAgreement);


// // Respond to agreement (accept/reject)
// router.post('/:agreementId/respond', 
//   authMiddleware.isAuthenticated,
//   authMiddleware.isUser,
//   agreementController.respondToAgreement
// );


// // ------------------------------------------------------------------------------------------------------

// // Agreement routes (for both company and freelancer)
// router.get('/:agreementId', 
//   authMiddleware.authenticate, 
//   agreementController.getAgreement
// );

// Freelancer routes
router.post('/:agreementId/accept', 
  agreementController.acceptAgreement
);

router.post('/:agreementId/reject', 
  agreementController.rejectAgreement
);

router.get('/getAllAgreements/:user_id', agreementController.getAllAgreements);

module.exports = router;