const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 200
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Fire Safety', 'Earthquake', 'Health Emergency', 'Flood Safety', 'Chemical Hazard', 'General Safety']
  },
  level: {
    type: String,
    required: true,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  duration: {
    type: Number, // in minutes
    required: true,
    min: 1
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  videoUrl: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Draft'],
    default: 'Active'
  },
  viewCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Lesson', lessonSchema);
