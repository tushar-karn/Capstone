const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all users
// @route   GET /api/users
exports.getUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ users, total, pages: Math.ceil(total / limit), currentPage: parseInt(page) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, department, emergencyContact, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, department, emergencyContact, isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });

    await ActivityLog.create({
      user: req.user._id,
      action: 'User Updated',
      details: `Updated user: ${user.name}`,
      resourceType: 'User',
      resourceId: user._id
    });

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await ActivityLog.create({
      user: req.user._id,
      action: 'User Deleted',
      details: `Deleted user: ${user.name}`,
      resourceType: 'User',
      resourceId: user._id
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user stats
// @route   GET /api/users/stats/overview
exports.getUserStats = async (req, res) => {
  try {
    const total = await User.countDocuments();
    const byRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    const activeUsers = await User.countDocuments({ isActive: true });
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt');

    res.json({ total, byRole, activeUsers, recentUsers });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
