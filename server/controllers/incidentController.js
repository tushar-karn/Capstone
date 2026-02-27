const Incident = require('../models/Incident');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all incidents
// @route   GET /api/incidents
exports.getIncidents = async (req, res) => {
  try {
    const { type, severity, status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (type) query.type = type;
    if (severity) query.severity = severity;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Students see incidents that are NOT 'Reported' (i.e. Verified) OR their own reports
    if (req.user.role === 'student') {
      const studentVisibilityObj = {
        $or: [
          { status: { $ne: 'Reported' } },
          { reportedBy: req.user._id }
        ]
      };

      if (query.$or) {
        query.$and = [
          { $or: query.$or },
          studentVisibilityObj
        ];
        delete query.$or;
      } else {
        query.$or = studentVisibilityObj.$or;
      }
    }

    const total = await Incident.countDocuments(query);
    const incidents = await Incident.find(query)
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ incidents, total, pages: Math.ceil(total / limit), currentPage: parseInt(page) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single incident
// @route   GET /api/incidents/:id
exports.getIncident = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('notes.addedBy', 'name');
    if (!incident) return res.status(404).json({ message: 'Incident not found' });
    res.json({ incident });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create incident
// @route   POST /api/incidents
exports.createIncident = async (req, res) => {
  try {
    const incident = await Incident.create({ ...req.body, reportedBy: req.user._id });

    await ActivityLog.create({
      user: req.user._id,
      action: 'Incident Reported',
      details: `Reported incident: ${incident.title} (${incident.severity})`,
      resourceType: 'Incident',
      resourceId: incident._id
    });

    res.status(201).json({ incident });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update incident
// @route   PUT /api/incidents/:id
exports.updateIncident = async (req, res) => {
  try {
    const incident = await Incident.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email');
    if (!incident) return res.status(404).json({ message: 'Incident not found' });

    await ActivityLog.create({
      user: req.user._id,
      action: 'Incident Updated',
      details: `Updated incident: ${incident.title} - Status: ${incident.status}`,
      resourceType: 'Incident',
      resourceId: incident._id
    });

    res.json({ incident });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete incident
// @route   DELETE /api/incidents/:id
exports.deleteIncident = async (req, res) => {
  try {
    const incident = await Incident.findByIdAndDelete(req.params.id);
    if (!incident) return res.status(404).json({ message: 'Incident not found' });

    await ActivityLog.create({
      user: req.user._id,
      action: 'Incident Deleted',
      details: `Deleted incident: ${incident.title}`,
      resourceType: 'Incident',
      resourceId: incident._id
    });

    res.json({ message: 'Incident deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get incident stats
// @route   GET /api/incidents/stats/overview
exports.getIncidentStats = async (req, res) => {
  try {
    const total = await Incident.countDocuments();
    const thisMonth = await Incident.countDocuments({
      createdAt: { $gte: new Date(new Date().setDate(1)) }
    });
    const bySeverity = await Incident.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);
    const byStatus = await Incident.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const byType = await Incident.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    const monthlyTrend = await Incident.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 12 }
    ]);

    res.json({ total, thisMonth, bySeverity, byStatus, byType, monthlyTrend });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
