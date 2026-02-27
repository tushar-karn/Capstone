const Notification = require('../models/Notification');

// @desc    Get all notifications (users see all, acknowledged status handled on frontend)
// @route   GET /api/notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new broadcast notification
// @route   POST /api/notifications
// @access  Admin/Staff only
exports.createNotification = async (req, res) => {
  try {
    const { title, message, type } = req.body;
    
    const notification = await Notification.create({
      title,
      message,
      type,
      createdBy: req.user._id
    });

    // Populate createdBy name for immediate frontend return
    await notification.populate('createdBy', 'name');

    res.status(201).json({ notification });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Acknowledge a notification
// @route   PUT /api/notifications/:id/acknowledge
exports.acknowledgeNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    // Add user to acknowledged array if not already there
    if (!notification.acknowledgedBy.includes(req.user._id)) {
      notification.acknowledgedBy.push(req.user._id);
      await notification.save();
    }

    res.json({ notification });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
