const Lesson = require('../models/Lesson');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all lessons
// @route   GET /api/lessons
exports.getLessons = async (req, res) => {
  try {
    const { category, level, status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (category) query.category = category;
    if (level) query.level = level;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    // Non-admin users see only active lessons
    if (req.user.role === 'student') {
      query.status = 'Active';
    }

    const total = await Lesson.countDocuments(query);
    const lessons = await Lesson.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ lessons, total, pages: Math.ceil(total / limit), currentPage: parseInt(page) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single lesson
// @route   GET /api/lessons/:id
exports.getLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate('createdBy', 'name');
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

    // Increment view count
    lesson.viewCount += 1;
    await lesson.save();

    res.json({ lesson });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create lesson
// @route   POST /api/lessons
exports.createLesson = async (req, res) => {
  try {
    const lesson = await Lesson.create({ ...req.body, createdBy: req.user._id });

    await ActivityLog.create({
      user: req.user._id,
      action: 'Lesson Created',
      details: `Created lesson: ${lesson.title}`,
      resourceType: 'Lesson',
      resourceId: lesson._id
    });

    res.status(201).json({ lesson });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update lesson
// @route   PUT /api/lessons/:id
exports.updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

    await ActivityLog.create({
      user: req.user._id,
      action: 'Lesson Updated',
      details: `Updated lesson: ${lesson.title}`,
      resourceType: 'Lesson',
      resourceId: lesson._id
    });

    res.json({ lesson });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete lesson
// @route   DELETE /api/lessons/:id
exports.deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndDelete(req.params.id);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

    await ActivityLog.create({
      user: req.user._id,
      action: 'Lesson Deleted',
      details: `Deleted lesson: ${lesson.title}`,
      resourceType: 'Lesson',
      resourceId: lesson._id
    });

    res.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get lesson stats
// @route   GET /api/lessons/stats/overview
exports.getLessonStats = async (req, res) => {
  try {
    const total = await Lesson.countDocuments();
    const active = await Lesson.countDocuments({ status: 'Active' });
    const byCategory = await Lesson.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, totalViews: { $sum: '$viewCount' } } }
    ]);
    const mostViewed = await Lesson.find().sort({ viewCount: -1 }).limit(5).select('title category viewCount');

    res.json({ total, active, byCategory, mostViewed });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark lesson as complete
// @route   POST /api/lessons/:id/complete
exports.completeLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

    const user = await User.findById(req.user._id);
    if (!user.completedLessons.includes(lesson._id)) {
      user.completedLessons.push(lesson._id);
      await user.save();
    }

    res.json({ message: 'Lesson marked as complete', completedLessons: user.completedLessons });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
