const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token and attach user to request
const authenticatedUser = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (!req.user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};

// Admin only middleware
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
};

// Staff or Admin middleware
const staffOrAdmin = (req, res, next) => {
  if (req.user && ['admin', 'staff', 'officer'].includes(req.user.role)) {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied. Staff or Admin only.' });
  }
};

// Officer or Admin middleware
const officerOrAdmin = (req, res, next) => {
  if (req.user && ['admin', 'officer'].includes(req.user.role)) {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied. Officer or Admin only.' });
  }
};

module.exports = { authenticatedUser, adminOnly, staffOrAdmin, officerOrAdmin };
