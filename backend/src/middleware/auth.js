const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  try {
    // Get token from different possible sources
    const token = 
      req.headers.authorization?.split(' ')[1] || // Bearer token
      req.cookies?.token || // Cookie
      req.body?.token || // Request body
      req.query?.token; // Query parameter

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication token provided',
        error: 'TOKEN_MISSING'
      });
    }

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({
            success: false,
            message: 'Token has expired',
            error: 'TOKEN_EXPIRED'
          });
        }
        
        if (err.name === 'JsonWebTokenError') {
          return res.status(403).json({
            success: false,
            message: 'Invalid token',
            error: 'TOKEN_INVALID'
          });
        }

        return res.status(403).json({
          success: false,
          message: 'Token verification failed',
          error: 'TOKEN_VERIFICATION_FAILED'
        });
      }

      // Add user data to request object
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        // Add any other relevant user data from token
        tokenIssuedAt: decoded.iat,
        tokenExpiresAt: decoded.exp
      };

      // Optional: Check if token is about to expire
      const tokenExpirationBuffer = 15 * 60; // 15 minutes in seconds
      if (decoded.exp - (Date.now() / 1000) < tokenExpirationBuffer) {
        res.set('X-Token-Expiring-Soon', 'true');
      }

      next();
    });
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication',
      error: 'AUTH_ERROR'
    });
  }
};

module.exports = { authenticateToken };