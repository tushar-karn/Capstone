const mongoose = require('mongoose');

const emergencyZoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Zone name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['danger', 'warning', 'safe'],
    required: true
  },
  riskLevel: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  riskScore: {
    type: Number,
    default: 50,
    min: 0,
    max: 100
  },
  coordinates: {
    type: [[Number]], // Array of [lat, lng] pairs forming a polygon
    required: true
  },
  center: {
    type: [Number], // [lat, lng]
    default: [0, 0]
  },
  radius: {
    type: Number, // in meters
    default: 500
  },
  description: {
    type: String,
    default: ''
  },
  evacuationPoints: [{
    name: String,
    coordinates: [Number], // [lat, lng]
    capacity: Number
  }],
  shelters: [{
    name: String,
    coordinates: [Number], // [lat, lng]
    type: { type: String, enum: ['Hospital', 'Shelter', 'Fire Station', 'Police Station', 'Assembly Point'] },
    capacity: Number,
    contact: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('EmergencyZone', emergencyZoneSchema);
