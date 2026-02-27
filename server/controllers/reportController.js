const Incident = require('../models/Incident');
const Simulation = require('../models/Simulation');
const User = require('../models/User');
const Lesson = require('../models/Lesson');
const EmergencyZone = require('../models/EmergencyZone');
const ActivityLog = require('../models/ActivityLog');
const { predictIncidentTrends } = require('../utils/aiEngine');

// @desc    Get dashboard analytics
// @route   GET /api/reports/dashboard
exports.getDashboardData = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeLessons = await Lesson.countDocuments({ status: 'Active' });
    const incidentsThisMonth = await Incident.countDocuments({
      createdAt: { $gte: new Date(new Date().setDate(1)) }
    });
    const totalSimulations = await Simulation.countDocuments();
    const pendingIncidents = await Incident.countDocuments({ status: { $in: ['Reported', 'Under Review'] } });

    // System health (mock - based on data quality)
    const totalRecords = totalUsers + activeLessons + incidentsThisMonth + totalSimulations;
    const systemHealth = Math.min(98, 75 + Math.floor(totalRecords / 5));

    // Recent activity
    const recentActivity = await ActivityLog.find()
      .populate('user', 'name avatar role')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      kpis: { totalUsers, activeLessons, incidentsThisMonth, systemHealth, totalSimulations, pendingIncidents },
      recentActivity
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get incident analytics
// @route   GET /api/reports/incidents
exports.getIncidentAnalytics = async (req, res) => {
  try {
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

    const bySeverity = await Incident.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);

    const byType = await Incident.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    const byStatus = await Incident.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // AI trend prediction
    const trendPrediction = predictIncidentTrends(monthlyTrend.map(m => ({ month: m._id, count: m.count })));

    res.json({ monthlyTrend, bySeverity, byType, byStatus, trendPrediction });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get simulation analytics
// @route   GET /api/reports/simulations
exports.getSimulationAnalytics = async (req, res) => {
  try {
    const byType = await Simulation.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 }, avgScore: { $avg: '$results.avgScore' } } }
    ]);

    const participation = await Simulation.aggregate([
      { $unwind: '$participants' },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          totalParticipants: { $sum: 1 },
          completedCount: { $sum: { $cond: ['$participants.completed', 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ byType, participation });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user participation stats
// @route   GET /api/reports/participation
exports.getParticipationStats = async (req, res) => {
  try {
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    const monthlyRegistrations = await User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 12 }
    ]);

    const activeVsInactive = await User.aggregate([
      { $group: { _id: '$isActive', count: { $sum: 1 } } }
    ]);

    res.json({ usersByRole, monthlyRegistrations, activeVsInactive });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
