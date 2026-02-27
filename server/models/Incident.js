const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  type: {
    type: String,
    enum: ['Fire', 'Earthquake', 'Flood', 'Medical', 'Chemical', 'Security', 'Other'],
    required: true
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Reported', 'Under Review', 'In Progress', 'Resolved', 'Closed'],
    default: 'Reported'
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [lng, lat]
      default: [0, 0]
    },
    address: {
      type: String,
      default: ''
    },
    building: {
      type: String,
      default: ''
    }
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  images: [{
    type: String
  }],
  notes: [{
    text: String,
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    addedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

incidentSchema.index({ 'location': '2dsphere' });

module.exports = mongoose.model('Incident', incidentSchema);
