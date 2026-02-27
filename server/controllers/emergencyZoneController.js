const EmergencyZone = require('../models/EmergencyZone');
const Incident = require('../models/Incident');
const ActivityLog = require('../models/ActivityLog');
const { calculateRiskScore, generateEarlyWarnings } = require('../utils/aiEngine');

// @desc    Get all emergency zones
// @route   GET /api/emergency-zones
exports.getZones = async (req, res) => {
  try {
    const { type, isActive } = req.query;
    const query = {};
    if (type) query.type = type;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const zones = await EmergencyZone.find(query).populate('createdBy', 'name');
    res.json({ zones });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single zone
// @route   GET /api/emergency-zones/:id
exports.getZone = async (req, res) => {
  try {
    const zone = await EmergencyZone.findById(req.params.id).populate('createdBy', 'name');
    if (!zone) return res.status(404).json({ message: 'Zone not found' });
    res.json({ zone });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create zone
// @route   POST /api/emergency-zones
exports.createZone = async (req, res) => {
  try {
    const zone = await EmergencyZone.create({ ...req.body, createdBy: req.user._id });

    // Calculate initial risk score
    const incidents = await Incident.find();
    zone.riskScore = calculateRiskScore(zone, incidents);
    await zone.save();

    await ActivityLog.create({
      user: req.user._id,
      action: 'Emergency Zone Created',
      details: `Created zone: ${zone.name} (${zone.type})`,
      resourceType: 'EmergencyZone',
      resourceId: zone._id
    });

    res.status(201).json({ zone });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update zone
// @route   PUT /api/emergency-zones/:id
exports.updateZone = async (req, res) => {
  try {
    const zone = await EmergencyZone.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!zone) return res.status(404).json({ message: 'Zone not found' });

    await ActivityLog.create({
      user: req.user._id,
      action: 'Emergency Zone Updated',
      details: `Updated zone: ${zone.name}`,
      resourceType: 'EmergencyZone',
      resourceId: zone._id
    });

    res.json({ zone });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete zone
// @route   DELETE /api/emergency-zones/:id
exports.deleteZone = async (req, res) => {
  try {
    const zone = await EmergencyZone.findByIdAndDelete(req.params.id);
    if (!zone) return res.status(404).json({ message: 'Zone not found' });

    await ActivityLog.create({
      user: req.user._id,
      action: 'Emergency Zone Deleted',
      details: `Deleted zone: ${zone.name}`,
      resourceType: 'EmergencyZone',
      resourceId: zone._id
    });

    res.json({ message: 'Zone deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get AI early warnings
// @route   GET /api/emergency-zones/ai/warnings
exports.getWarnings = async (req, res) => {
  try {
    const zones = await EmergencyZone.find({ isActive: true });
    const incidents = await Incident.find();

    // Recalculate risk scores
    for (const zone of zones) {
      zone.riskScore = calculateRiskScore(zone, incidents);
      await zone.save();
    }

    const warnings = generateEarlyWarnings(zones);
    res.json({ warnings, totalZones: zones.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
