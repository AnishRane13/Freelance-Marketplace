// src/middlewares/authMiddleware.js
module.exports = {
    isAuthenticated: (req, res, next) => {
      if (!req.session.user || !req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      next();
    },
    
    isCompany: (req, res, next) => {
      if (req.user.user_type !== 'company') {
        return res.status(403).json({ error: 'Access denied. Companies only.' });
      }
      next();
    },
    
    isUser: (req, res, next) => {
      if (req.user.user_type !== 'user') {
        return res.status(403).json({ error: 'Access denied. Freelancers only.' });
      }
      next();
    }
  };