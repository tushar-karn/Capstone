const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Lesson = require('./models/Lesson');
const Incident = require('./models/Incident');
const EmergencyZone = require('./models/EmergencyZone');
const Simulation = require('./models/Simulation');
const ActivityLog = require('./models/ActivityLog');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB for seeding');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Lesson.deleteMany({}),
      Incident.deleteMany({}),
      EmergencyZone.deleteMany({}),
      Simulation.deleteMany({}),
      ActivityLog.deleteMany({})
    ]);
    console.log('🗑️ Cleared existing data');

    // ================= USERS =================
    const users = await User.create([
      { name: 'Admin User', email: 'admin@campus.edu', password: await bcrypt.hash('admin123', 10), role: 'admin', department: 'Administration' },
      { name: 'Dr. Sarah Johnson', email: 'sarah@campus.edu', password: await bcrypt.hash('staff123', 10), role: 'staff', department: 'Safety Department' },
      { name: 'Officer Mike Chen', email: 'mike@campus.edu', password: await bcrypt.hash('officer123', 10), role: 'officer', department: 'Campus Security' },
      { name: 'Tushar Karn', email: 'tushar@campus.edu', password: await bcrypt.hash('student123', 10), role: 'student', department: 'Computer Science' },
      { name: 'Emily Davis', email: 'emily@campus.edu', password: await bcrypt.hash('student123', 10), role: 'student', department: 'Engineering' },
      { name: 'James Wilson', email: 'james@campus.edu', password: await bcrypt.hash('student123', 10), role: 'student', department: 'Physics' },
      { name: 'Priya Sharma', email: 'priya@campus.edu', password: await bcrypt.hash('student123', 10), role: 'student', department: 'Chemistry' },
      { name: 'Alex Thompson', email: 'alex@campus.edu', password: await bcrypt.hash('staff123', 10), role: 'staff', department: 'Emergency Response' },
      { name: 'Maria Garcia', email: 'maria@campus.edu', password: await bcrypt.hash('student123', 10), role: 'student', department: 'Biology' },
      { name: 'David Lee', email: 'david@campus.edu', password: await bcrypt.hash('officer123', 10), role: 'officer', department: 'Campus Security' }
    ]);

    const admin = users[0];
    const staff = users[1];
    const officer = users[2];

    console.log(`👥 Created ${users.length} users`);

    // ================= LESSONS =================
    const lessons = await Lesson.create([
      {
        title: 'Fire Safety Fundamentals',
        category: 'Fire Safety',
        level: 'Beginner',
        duration: 30,
        content: 'Basics of fire safety and evacuation.',
        status: 'Active',
        viewCount: 200,
        createdBy: admin._id
      },
      {
        title: 'Advanced First Aid & CPR',
        category: 'Health Emergency',
        level: 'Advanced',
        duration: 60,
        content: 'CPR, AED and emergency care.',
        status: 'Active',
        viewCount: 300,
        createdBy: staff._id
      },

      // NEW LESSONS
      {
        title: 'Electrical Fire Safety',
        category: 'Fire Safety',
        level: 'Intermediate',
        duration: 35,
        content: 'Handling electrical fires safely.',
        status: 'Active',
        viewCount: 210,
        createdBy: admin._id
      },
      {
        title: 'Mental Health Crisis Response',
        category: 'Health Emergency',
        level: 'Intermediate',
        duration: 30,
        content: 'Responding to panic attacks and crises.',
        status: 'Active',
        viewCount: 130,
        createdBy: staff._id
      },
      {
        title: 'Night Safety & Personal Security',
        category: 'General Safety',
        level: 'Beginner',
        duration: 20,
        content: 'Campus safety at night.',
        status: 'Active',
        viewCount: 280,
        createdBy: admin._id
      }
    ]);

    console.log(`📘 Created ${lessons.length} lessons`);

    // ================= ZONES =================
    const zones = await EmergencyZone.create([
      {
        name: 'Science Block',
        type: 'danger',
        riskLevel: 'High',
        riskScore: 80,
        center: [28.615, 77.209],
        createdBy: admin._id
      },
      {
        name: 'Main Campus',
        type: 'warning',
        riskLevel: 'Medium',
        riskScore: 50,
        center: [28.613, 77.208],
        createdBy: admin._id
      },

      // NEW ZONES
      {
        name: 'Dormitory Area',
        type: 'warning',
        riskLevel: 'Medium',
        riskScore: 55,
        center: [28.6125, 77.2058],
        createdBy: admin._id
      },
      {
        name: 'Parking Zone',
        type: 'safe',
        riskLevel: 'Low',
        riskScore: 20,
        center: [28.6120, 77.2080],
        createdBy: admin._id
      }
    ]);

    console.log(`🗺️ Created ${zones.length} zones`);

    const now = new Date();

    // ================= INCIDENTS =================
    const incidents = await Incident.create([
      {
        title: 'Chemical Spill',
        type: 'Chemical',
        severity: 'High',
        status: 'Resolved',
        reportedBy: users[3]._id,
        assignedTo: officer._id,
        createdAt: new Date(now - 2 * 86400000)
      },

      // NEW INCIDENTS
      {
        title: 'Short Circuit in Lab',
        type: 'Fire',
        severity: 'High',
        status: 'Resolved',
        reportedBy: users[3]._id,
        assignedTo: officer._id,
        createdAt: new Date(now - 3 * 86400000)
      },
      {
        title: 'Unauthorized Entry',
        type: 'Security',
        severity: 'Medium',
        status: 'Closed',
        reportedBy: staff._id,
        assignedTo: officer._id,
        createdAt: new Date(now - 5 * 86400000)
      },
      {
        title: 'Heatwave Alert',
        type: 'Weather',
        severity: 'Low',
        status: 'Under Review',
        reportedBy: admin._id,
        createdAt: new Date(now - 1 * 86400000)
      }
    ]);

    console.log(`🚨 Created ${incidents.length} incidents`);

    // ================= SIMULATIONS =================
    const simulations = await Simulation.create([
      {
        title: 'Fire Drill',
        type: 'Fire',
        difficulty: 'Medium',
        status: 'Completed',
        zones: [zones[0]._id],
        createdBy: admin._id
      },

      // NEW SIMULATIONS
      {
        title: 'Cyber Security Drill',
        type: 'Security',
        difficulty: 'Medium',
        status: 'Scheduled',
        zones: [zones[1]._id],
        createdBy: admin._id
      },
      {
        title: 'Gas Leak Drill',
        type: 'Chemical',
        difficulty: 'Hard',
        status: 'Active',
        zones: [zones[0]._id],
        createdBy: staff._id
      }
    ]);

    console.log(`🧪 Created ${simulations.length} simulations`);

    // ================= ACTIVITY LOGS =================
    await ActivityLog.create([
      { user: admin._id, action: 'System Init', resourceType: 'System' },
      { user: users[3]._id, action: 'Lesson Completed', resourceType: 'Lesson' },
      { user: officer._id, action: 'Patrol Done', resourceType: 'Security' },
      { user: admin._id, action: 'Database Updated', resourceType: 'System' }
    ]);

    console.log('📋 Activity logs added');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\nLogin: tushar@campus.edu / student123');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedDB();

