const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['Incident Summary', 'Drill Performance', 'Risk Assessment', 'User Activity', 'Monthly Overview'],
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed, // Flexible JSON data
    default: {}
  },
  dateRange: {
    start: { type: Date },
    end: { type: Date }
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['Generated', 'Pending', 'Archived'],
    default: 'Generated'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Report', reportSchema);
