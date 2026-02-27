const mongoose = require('mongoose');

const simulationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['Fire Drill', 'Earthquake Drill', 'Flood Scenario', 'Health Emergency', 'Chemical Spill', 'Active Threat'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard', 'Expert'],
    default: 'Medium'
  },
  description: {
    type: String,
    default: ''
  },
  scenario: {
    type: String,
    default: ''
  },
  instructions: [{
    step: Number,
    action: String,
    timeLimit: Number // seconds
  }],
  zones: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmergencyZone'
  }],
  status: {
    type: String,
    enum: ['Scheduled', 'Active', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  },
  scheduledDate: {
    type: Date
  },
  duration: {
    type: Number, // in minutes
    default: 30
  },
  participants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    joinedAt: { type: Date, default: Date.now },
    score: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    feedback: String
  }],
  results: {
    avgScore: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 },
    totalParticipants: { type: Number, default: 0 },
    aiDifficultySuggestion: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Simulation', simulationSchema);
