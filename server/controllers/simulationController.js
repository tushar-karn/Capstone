const Simulation = require('../models/Simulation');
const ActivityLog = require('../models/ActivityLog');
const { evaluateSimulationPerformance } = require('../utils/aiEngine');

// @desc    Get all simulations
// @route   GET /api/simulations
exports.getSimulations = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;

    const total = await Simulation.countDocuments(query);
    const simulations = await Simulation.find(query)
      .populate('createdBy', 'name')
      .populate('zones', 'name type riskScore')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ simulations, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single simulation
// @route   GET /api/simulations/:id
exports.getSimulation = async (req, res) => {
  try {
    const simulation = await Simulation.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('zones', 'name type riskScore coordinates')
      .populate('participants.user', 'name email');
    if (!simulation) return res.status(404).json({ message: 'Simulation not found' });
    res.json({ simulation });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create simulation
// @route   POST /api/simulations
exports.createSimulation = async (req, res) => {
  try {
    const simulation = await Simulation.create({ ...req.body, createdBy: req.user._id });

    await ActivityLog.create({
      user: req.user._id,
      action: 'Simulation Created',
      details: `Created ${simulation.type}: ${simulation.title}`,
      resourceType: 'Simulation',
      resourceId: simulation._id
    });

    res.status(201).json({ simulation });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update simulation
// @route   PUT /api/simulations/:id
exports.updateSimulation = async (req, res) => {
  try {
    const simulation = await Simulation.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!simulation) return res.status(404).json({ message: 'Simulation not found' });
    res.json({ simulation });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete simulation
// @route   DELETE /api/simulations/:id
exports.deleteSimulation = async (req, res) => {
  try {
    const simulation = await Simulation.findByIdAndDelete(req.params.id);
    if (!simulation) return res.status(404).json({ message: 'Simulation not found' });
    res.json({ message: 'Simulation deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Join simulation
// @route   POST /api/simulations/:id/join
exports.joinSimulation = async (req, res) => {
  try {
    const simulation = await Simulation.findById(req.params.id);
    if (!simulation) return res.status(404).json({ message: 'Simulation not found' });

    const alreadyJoined = simulation.participants.find(p => p.user.toString() === req.user._id.toString());
    if (alreadyJoined) return res.status(400).json({ message: 'Already joined this simulation' });

    simulation.participants.push({ user: req.user._id });
    await simulation.save();

    res.json({ message: 'Joined simulation successfully', simulation });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Submit simulation results
// @route   POST /api/simulations/:id/results
exports.submitResults = async (req, res) => {
  try {
    const simulation = await Simulation.findById(req.params.id);
    if (!simulation) return res.status(404).json({ message: 'Simulation not found' });

    const participant = simulation.participants.find(p => p.user.toString() === req.user._id.toString());
    if (!participant) return res.status(400).json({ message: 'Not a participant' });

    participant.score = req.body.score || 0;
    participant.completed = true;
    participant.feedback = req.body.feedback;

    // AI: Evaluate performance and suggest difficulty
    const aiResults = evaluateSimulationPerformance(simulation.participants);
    simulation.results = {
      avgScore: aiResults.avgScore,
      completionRate: aiResults.completionRate,
      totalParticipants: aiResults.totalParticipants,
      aiDifficultySuggestion: aiResults.suggestion
    };

    await simulation.save();
    res.json({ simulation, aiSuggestion: aiResults.suggestion });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get simulation stats
// @route   GET /api/simulations/stats/overview
exports.getSimulationStats = async (req, res) => {
  try {
    const total = await Simulation.countDocuments();
    const byType = await Simulation.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    const avgScores = await Simulation.aggregate([
      { $match: { 'results.avgScore': { $gt: 0 } } },
      { $group: { _id: '$type', avgScore: { $avg: '$results.avgScore' } } }
    ]);

    res.json({ total, byType, avgScores });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
