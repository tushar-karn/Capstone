const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

// Generate JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
};

// @desc    Register user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, department, emergencyContact } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const user = await User.create({ name, email, password, role: role || 'student', department, emergencyContact });

    // Log activity
    await ActivityLog.create({
      user: user._id,
      action: 'User Registered',
      details: `New ${role || 'student'} account created`,
      resourceType: 'User',
      resourceId: user._id
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        emergencyContact: user.emergencyContact
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Log activity
    await ActivityLog.create({
      user: user._id,
      action: 'User Login',
      details: `${user.role} logged in`,
      resourceType: 'User',
      resourceId: user._id
    });

    const token = generateToken(user._id, user.role);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        avatar: user.avatar,
        emergencyContact: user.emergencyContact
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, department, emergencyContact, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, department, emergencyContact, avatar },
      { new: true, runValidators: true }
    );
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
