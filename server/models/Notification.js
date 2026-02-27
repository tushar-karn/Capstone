const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: [true, 'Notification message is required']
  },
  type: {
    type: String,
    enum: ['Info', 'Warning', 'Alert'],
    default: 'Info'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  acknowledgedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
