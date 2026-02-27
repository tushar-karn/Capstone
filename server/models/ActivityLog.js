const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    trim: true
  },
  details: {
    type: String,
    default: ''
  },
  resourceType: {
    type: String,
    enum: ['User', 'Lesson', 'Incident', 'Simulation', 'EmergencyZone', 'Report', 'System'],
    default: 'System'
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId
  },
  ipAddress: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Auto-expire logs after 90 days
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
