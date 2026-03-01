const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Incident = require('./models/Incident');
const EmergencyZone = require('./models/EmergencyZone');
const Simulation = require('./models/Simulation');
const Notification = require('./models/Notification'); // Added this too

const clearMapData = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Clear specific collections 
    await Promise.all([
      Incident.deleteMany({}),
      EmergencyZone.deleteMany({}),
      Simulation.deleteMany({}),
      Notification.deleteMany({}) // Clear old notifications too
    ]);

    console.log('🗑️  Successfully cleared all Emergency Zones, Incidents, Simulations, and Notifications!');
    console.log('Your user accounts and lessons have been preserved.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    process.exit(1);
  }
};

clearMapData();
