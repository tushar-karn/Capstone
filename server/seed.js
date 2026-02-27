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
    console.log('🗑️  Cleared existing data');

    // === USERS ===
    const users = await User.create([
      { name: 'Admin User', email: 'admin@campus.edu', password: 'admin123', role: 'admin', department: 'Administration', emergencyContact: '+1-555-0100' },
      { name: 'Dr. Sarah Johnson', email: 'sarah@campus.edu', password: 'staff123', role: 'staff', department: 'Safety Department', emergencyContact: '+1-555-0101' },
      { name: 'Officer Mike Chen', email: 'mike@campus.edu', password: 'officer123', role: 'officer', department: 'Campus Security', emergencyContact: '+1-555-0102' },
      { name: 'Tushar Karn', email: 'tushar@campus.edu', password: 'student123', role: 'student', department: 'Computer Science', emergencyContact: '+1-555-0103' },
      { name: 'Emily Davis', email: 'emily@campus.edu', password: 'student123', role: 'student', department: 'Engineering', emergencyContact: '+1-555-0104' },
      { name: 'James Wilson', email: 'james@campus.edu', password: 'student123', role: 'student', department: 'Physics', emergencyContact: '+1-555-0105' },
      { name: 'Priya Sharma', email: 'priya@campus.edu', password: 'student123', role: 'student', department: 'Chemistry', emergencyContact: '+1-555-0106' },
      { name: 'Alex Thompson', email: 'alex@campus.edu', password: 'staff123', role: 'staff', department: 'Emergency Response', emergencyContact: '+1-555-0107' },
      { name: 'Maria Garcia', email: 'maria@campus.edu', password: 'student123', role: 'student', department: 'Biology', emergencyContact: '+1-555-0108' },
      { name: 'David Lee', email: 'david@campus.edu', password: 'officer123', role: 'officer', department: 'Campus Security', emergencyContact: '+1-555-0109' }
    ]);
    console.log(`👥 Created ${users.length} users`);

    const admin = users[0];
    const staff = users[1];
    const officer = users[2];

    // === LESSONS ===
    const lessons = await Lesson.create([
      {
        title: 'Fire Safety Fundamentals',
        category: 'Fire Safety',
        level: 'Beginner',
        duration: 30,
        content: 'This comprehensive course covers the basics of fire safety including fire prevention, fire extinguisher usage (PASS technique), evacuation procedures, and emergency exit identification. Learn the different classes of fires (A, B, C, D, K) and the appropriate extinguisher for each type. Practice identifying fire hazards in buildings and understanding building fire alarm systems.',
        videoUrl: 'https://www.youtube.com/watch?v=fire-safety-101',
        status: 'Active',
        viewCount: 245,
        createdBy: admin._id
      },
      {
        title: 'Earthquake Preparedness & Response',
        category: 'Earthquake',
        level: 'Intermediate',
        duration: 45,
        content: 'Master earthquake preparedness with Drop-Cover-Hold On techniques. Learn to identify structural weak points, safe spots in buildings, and post-earthquake assessment procedures. This course covers the Richter scale, seismic zones on campus, emergency kit preparation, and communication protocols during and after an earthquake event.',
        videoUrl: 'https://www.youtube.com/watch?v=earthquake-prep',
        status: 'Active',
        viewCount: 189,
        createdBy: admin._id
      },
      {
        title: 'Advanced First Aid & CPR',
        category: 'Health Emergency',
        level: 'Advanced',
        duration: 60,
        content: 'Advanced training in first aid procedures including CPR/AED operation, wound management, fracture immobilization, and recognition of medical emergencies. Covers anaphylaxis response, choking procedures (Heimlich maneuver), burn treatment protocols, and how to handle traumatic injuries until professional medical help arrives.',
        videoUrl: 'https://www.youtube.com/watch?v=advanced-first-aid',
        status: 'Active',
        viewCount: 312,
        createdBy: staff._id
      },
      {
        title: 'Flood Safety & Water Rescue Basics',
        category: 'Flood Safety',
        level: 'Intermediate',
        duration: 40,
        content: 'Understanding flood risks, flash flood warnings, and evacuation routes. Learn about water rescue basics, how to safely navigate flooded areas, and emergency response procedures during flooding events. Covers sandbagging techniques, electrical safety during floods, and post-flood cleanup safety.',
        videoUrl: 'https://www.youtube.com/watch?v=flood-safety',
        status: 'Active',
        viewCount: 156,
        createdBy: admin._id
      },
      {
        title: 'Chemical Hazard Awareness',
        category: 'Chemical Hazard',
        level: 'Advanced',
        duration: 50,
        content: 'Comprehensive training on chemical hazard identification, MSDS/SDS reading, proper PPE usage, spill response procedures, and decontamination protocols. Learn to identify hazardous material symbols, understand exposure limits, and respond to chemical emergencies in laboratory and industrial settings.',
        videoUrl: 'https://www.youtube.com/watch?v=chemical-safety',
        status: 'Active',
        viewCount: 98,
        createdBy: staff._id
      },
      {
        title: 'Campus Emergency Communication',
        category: 'General Safety',
        level: 'Beginner',
        duration: 20,
        content: 'Learn the campus emergency communication systems including mass notification alerts, emergency phone locations, walkie-talkie protocols, and social media monitoring during emergencies. Understand the chain of command and how to report incidents effectively.',
        videoUrl: 'https://www.youtube.com/watch?v=emergency-comms',
        status: 'Active',
        viewCount: 420,
        createdBy: admin._id
      },
      {
        title: 'Building Evacuation Procedures',
        category: 'Fire Safety',
        level: 'Beginner',
        duration: 25,
        content: 'Step-by-step guide to building evacuation including assembly point identification, buddy system implementation, assisting individuals with disabilities, and floor warden responsibilities. Practice reading evacuation maps and participating in orderly evacuations.',
        status: 'Active',
        viewCount: 367,
        createdBy: admin._id
      },
      {
        title: 'Active Threat Response Training',
        category: 'General Safety',
        level: 'Advanced',
        duration: 45,
        content: 'Run-Hide-Fight methodology and situational awareness training for active threat scenarios. Covers barricading techniques, communication with law enforcement, trauma first aid under stress, and psychological preparedness for high-stress emergency situations.',
        status: 'Inactive',
        viewCount: 75,
        createdBy: staff._id
      }
    ]);
    console.log(`📘 Created ${lessons.length} lessons`);

    // === EMERGENCY ZONES (Campus coordinates - using a generic university layout) ===
    const zones = await EmergencyZone.create([
      {
        name: 'Science Building Complex',
        type: 'danger',
        riskLevel: 'High',
        riskScore: 82,
        coordinates: [[28.6145, 77.2090], [28.6155, 77.2090], [28.6155, 77.2105], [28.6145, 77.2105]],
        center: [28.6150, 77.2097],
        radius: 200,
        description: 'Chemical laboratories and research facilities with hazardous materials storage',
        evacuationPoints: [
          { name: 'Science Building East Exit', coordinates: [28.6148, 77.2108], capacity: 200 },
          { name: 'Science Quad Assembly', coordinates: [28.6142, 77.2095], capacity: 500 }
        ],
        shelters: [
          { name: 'University Hospital', coordinates: [28.6160, 77.2115], type: 'Hospital', capacity: 300, contact: '+1-555-0911' },
          { name: 'Science Emergency Station', coordinates: [28.6152, 77.2088], type: 'Fire Station', capacity: 50, contact: '+1-555-0912' }
        ],
        createdBy: admin._id
      },
      {
        name: 'Main Campus Quad',
        type: 'warning',
        riskLevel: 'Medium',
        riskScore: 45,
        coordinates: [[28.6130, 77.2070], [28.6145, 77.2070], [28.6145, 77.2090], [28.6130, 77.2090]],
        center: [28.6137, 77.2080],
        radius: 300,
        description: 'Central campus area with high foot traffic and multiple building access points',
        evacuationPoints: [
          { name: 'Main Gate Assembly Point', coordinates: [28.6128, 77.2075], capacity: 1000 },
          { name: 'Parking Lot B', coordinates: [28.6135, 77.2065], capacity: 800 }
        ],
        shelters: [
          { name: 'Student Center Safe Room', coordinates: [28.6138, 77.2082], type: 'Shelter', capacity: 400, contact: '+1-555-0913' },
          { name: 'Campus Police Station', coordinates: [28.6132, 77.2072], type: 'Police Station', capacity: 100, contact: '+1-555-0914' }
        ],
        createdBy: admin._id
      },
      {
        name: 'Sports Complex & Fields',
        type: 'safe',
        riskLevel: 'Low',
        riskScore: 15,
        coordinates: [[28.6110, 77.2100], [28.6130, 77.2100], [28.6130, 77.2130], [28.6110, 77.2130]],
        center: [28.6120, 77.2115],
        radius: 400,
        description: 'Open area sports fields and gymnasium - designated primary evacuation assembly zone',
        evacuationPoints: [
          { name: 'Football Field Center', coordinates: [28.6120, 77.2115], capacity: 2000 },
          { name: 'Track & Field Area', coordinates: [28.6115, 77.2120], capacity: 1500 }
        ],
        shelters: [
          { name: 'Gymnasium Emergency Shelter', coordinates: [28.6125, 77.2108], type: 'Shelter', capacity: 600, contact: '+1-555-0915' },
          { name: 'Sports Complex First Aid', coordinates: [28.6118, 77.2105], type: 'Assembly Point', capacity: 200, contact: '+1-555-0916' }
        ],
        createdBy: admin._id
      },
      {
        name: 'Engineering Workshop Area',
        type: 'danger',
        riskLevel: 'High',
        riskScore: 75,
        coordinates: [[28.6155, 77.2060], [28.6170, 77.2060], [28.6170, 77.2080], [28.6155, 77.2080]],
        center: [28.6162, 77.2070],
        radius: 250,
        description: 'Heavy machinery, welding stations, and electrical workshops with industrial hazards',
        evacuationPoints: [
          { name: 'Workshop East Gate', coordinates: [28.6160, 77.2082], capacity: 300 },
          { name: 'Engineering Parking', coordinates: [28.6168, 77.2058], capacity: 400 }
        ],
        shelters: [
          { name: 'Engineering Building Safe Room', coordinates: [28.6158, 77.2065], type: 'Shelter', capacity: 200, contact: '+1-555-0917' }
        ],
        createdBy: admin._id
      },
      {
        name: 'Library & Administrative Zone',
        type: 'warning',
        riskLevel: 'Medium',
        riskScore: 35,
        coordinates: [[28.6135, 77.2090], [28.6145, 77.2090], [28.6145, 77.2110], [28.6135, 77.2110]],
        center: [28.6140, 77.2100],
        radius: 200,
        description: 'Library, admin offices, and student services - moderate occupancy zone',
        evacuationPoints: [
          { name: 'Library Front Lawn', coordinates: [28.6133, 77.2100], capacity: 600 }
        ],
        shelters: [
          { name: 'Admin Building Basement', coordinates: [28.6140, 77.2095], type: 'Shelter', capacity: 300, contact: '+1-555-0918' }
        ],
        createdBy: admin._id
      }
    ]);
    console.log(`🗺️  Created ${zones.length} emergency zones`);

    // === INCIDENTS ===
    const now = new Date();
    const incidents = await Incident.create([
      {
        title: 'Chemical Spill in Lab 204',
        description: 'Minor chemical spill of sulfuric acid in Chemistry Lab 204. Area was evacuated and hazmat team responded. No injuries reported.',
        type: 'Chemical',
        severity: 'High',
        status: 'Resolved',
        location: { coordinates: [77.2095, 28.6150], address: 'Science Building, Lab 204', building: 'Science Building' },
        reportedBy: users[3]._id,
        assignedTo: officer._id,
        createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Fire Alarm - Cafeteria Kitchen',
        description: 'Fire alarm triggered in cafeteria kitchen due to smoke from cooking. False alarm confirmed by fire department.',
        type: 'Fire',
        severity: 'Medium',
        status: 'Closed',
        location: { coordinates: [77.2080, 28.6137], address: 'Student Center, Cafeteria', building: 'Student Center' },
        reportedBy: users[4]._id,
        assignedTo: staff._id,
        createdAt: new Date(now - 5 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Student Injury at Sports Complex',
        description: 'Student suffered ankle fracture during basketball practice. First aid administered on site, transported to university hospital.',
        type: 'Medical',
        severity: 'Medium',
        status: 'Resolved',
        location: { coordinates: [77.2115, 28.6120], address: 'Sports Complex, Basketball Court', building: 'Sports Complex' },
        reportedBy: users[5]._id,
        assignedTo: officer._id,
        createdAt: new Date(now - 8 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Suspicious Package - Library',
        description: 'Unattended bag reported near library entrance. Campus security investigated and cleared the area. Package belonged to a student.',
        type: 'Security',
        severity: 'High',
        status: 'Closed',
        location: { coordinates: [77.2100, 28.6140], address: 'Main Library, Entrance', building: 'Library' },
        reportedBy: users[6]._id,
        assignedTo: officer._id,
        createdAt: new Date(now - 12 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Water Leak - Engineering Building',
        description: 'Major water pipe burst on 2nd floor of Engineering building causing flooding. Maintenance team dispatched. Classes relocated.',
        type: 'Flood',
        severity: 'Medium',
        status: 'In Progress',
        location: { coordinates: [77.2070, 28.6162], address: 'Engineering Building, 2nd Floor', building: 'Engineering Building' },
        reportedBy: staff._id,
        assignedTo: admin._id,
        createdAt: new Date(now - 1 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Minor Earthquake Tremor Felt',
        description: 'Light tremor felt across campus (estimated 3.2 magnitude). No structural damage reported. Safety inspection scheduled.',
        type: 'Earthquake',
        severity: 'Low',
        status: 'Under Review',
        location: { coordinates: [77.2080, 28.6137], address: 'Campus-wide', building: 'Multiple' },
        reportedBy: admin._id,
        createdAt: new Date(now - 15 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Gas Odor Reported in Dormitory',
        description: 'Strong gas odor reported in Block C dormitory. Gas supply shut off, area evacuated. Leak found and repaired by utility team.',
        type: 'Chemical',
        severity: 'Critical',
        status: 'Resolved',
        location: { coordinates: [77.2050, 28.6125], address: 'Dormitory Block C', building: 'Dormitory C' },
        reportedBy: users[8]._id,
        assignedTo: officer._id,
        createdAt: new Date(now - 20 * 24 * 60 * 60 * 1000)
      }
    ]);
    console.log(`🚨 Created ${incidents.length} incidents`);

    // === SIMULATIONS ===
    const simulations = await Simulation.create([
      {
        title: 'Campus-Wide Fire Evacuation Drill',
        type: 'Fire Drill',
        difficulty: 'Medium',
        description: 'Full campus fire evacuation drill testing all building evacuation routes and assembly point procedures.',
        scenario: 'A fire has been detected in the Science Building Lab 204. All buildings within 500m radius must evacuate to designated assembly points. Test emergency communication systems and evacuation timing.',
        instructions: [
          { step: 1, action: 'Activate fire alarm in Science Building', timeLimit: 30 },
          { step: 2, action: 'Evacuate all buildings to assembly points', timeLimit: 300 },
          { step: 3, action: 'Take roll call at assembly points', timeLimit: 180 },
          { step: 4, action: 'Report all-clear to command center', timeLimit: 60 }
        ],
        zones: [zones[0]._id, zones[1]._id],
        status: 'Completed',
        scheduledDate: new Date(now - 7 * 24 * 60 * 60 * 1000),
        duration: 45,
        participants: [
          { user: users[3]._id, score: 88, completed: true, feedback: 'Well organized drill' },
          { user: users[4]._id, score: 92, completed: true, feedback: 'Clear instructions' },
          { user: users[5]._id, score: 75, completed: true, feedback: 'Confusing exit routes' },
          { user: users[6]._id, score: 85, completed: true, feedback: 'Good experience' },
          { user: users[8]._id, score: 90, completed: true, feedback: 'Very realistic scenario' }
        ],
        results: { avgScore: 86, completionRate: 100, totalParticipants: 5, aiDifficultySuggestion: 'Increase difficulty - participants are excelling' },
        createdBy: admin._id
      },
      {
        title: 'Earthquake Drop-Cover-Hold Drill',
        type: 'Earthquake Drill',
        difficulty: 'Easy',
        description: 'Practice earthquake response procedures with focus on Drop-Cover-Hold On technique.',
        scenario: 'A 5.5 magnitude earthquake strikes during class hours. Students and staff must practice immediate response and building evacuation after tremors stop.',
        instructions: [
          { step: 1, action: 'Drop to the ground immediately', timeLimit: 10 },
          { step: 2, action: 'Take cover under stable furniture', timeLimit: 15 },
          { step: 3, action: 'Hold on until shaking stops', timeLimit: 60 },
          { step: 4, action: 'Evacuate building when safe', timeLimit: 180 }
        ],
        zones: [zones[1]._id],
        status: 'Scheduled',
        scheduledDate: new Date(now + 14 * 24 * 60 * 60 * 1000),
        duration: 30,
        participants: [],
        createdBy: staff._id
      },
      {
        title: 'Flood Emergency Response',
        type: 'Flood Scenario',
        difficulty: 'Hard',
        description: 'Simulated flood emergency testing campus drainage systems and evacuation of low-lying areas.',
        scenario: 'Heavy rainfall has caused flash flooding on campus. Low-lying areas are submerged. Power outages in some buildings. Execute flood emergency protocols.',
        instructions: [
          { step: 1, action: 'Issue flood warning via mass notification', timeLimit: 60 },
          { step: 2, action: 'Evacuate basement and ground floor areas', timeLimit: 300 },
          { step: 3, action: 'Deploy sandbag barriers', timeLimit: 600 },
          { step: 4, action: 'Account for all personnel', timeLimit: 300 }
        ],
        zones: [zones[2]._id, zones[4]._id],
        status: 'Completed',
        scheduledDate: new Date(now - 30 * 24 * 60 * 60 * 1000),
        duration: 60,
        participants: [
          { user: users[3]._id, score: 72, completed: true, feedback: 'Very challenging' },
          { user: users[5]._id, score: 68, completed: true, feedback: 'Need more practice' },
          { user: users[8]._id, score: 55, completed: false, feedback: 'Too difficult' }
        ],
        results: { avgScore: 65, completionRate: 67, totalParticipants: 3, aiDifficultySuggestion: 'Consider providing additional training before next drill' },
        createdBy: admin._id
      },
      {
        title: 'Medical Emergency First Response',
        type: 'Health Emergency',
        difficulty: 'Medium',
        description: 'Practice first aid response for various medical emergencies on campus.',
        scenario: 'Multiple medical emergencies reported: cardiac arrest in the library, allergic reaction in cafeteria, and sports injury at the gym. Coordinate multi-site medical response.',
        instructions: [
          { step: 1, action: 'Assess the situation and call for help', timeLimit: 30 },
          { step: 2, action: 'Begin CPR if qualified', timeLimit: 120 },
          { step: 3, action: 'Use AED if available', timeLimit: 60 },
          { step: 4, action: 'Hand over to professional medical team', timeLimit: 180 }
        ],
        zones: [zones[2]._id, zones[4]._id],
        status: 'Active',
        scheduledDate: new Date(now),
        duration: 40,
        participants: [
          { user: users[4]._id, score: 0, completed: false },
          { user: users[6]._id, score: 0, completed: false }
        ],
        createdBy: staff._id
      }
    ]);
    console.log(`🧪 Created ${simulations.length} simulations`);

    // === ACTIVITY LOGS ===
    await ActivityLog.create([
      { user: admin._id, action: 'System Initialized', details: 'Campus Safety Hub system initialized with seed data', resourceType: 'System' },
      { user: admin._id, action: 'Zone Created', details: 'Created 5 emergency zones on campus map', resourceType: 'EmergencyZone' },
      { user: staff._id, action: 'Lesson Created', details: 'Created Advanced First Aid lesson', resourceType: 'Lesson' },
      { user: officer._id, action: 'Incident Resolved', details: 'Resolved chemical spill in Lab 204', resourceType: 'Incident' },
      { user: users[3]._id, action: 'Simulation Completed', details: 'Completed fire evacuation drill with score 88', resourceType: 'Simulation' },
      { user: admin._id, action: 'User Created', details: 'Added 10 users to the system', resourceType: 'User' },
      { user: staff._id, action: 'Drill Scheduled', details: 'Scheduled Earthquake drill for next week', resourceType: 'Simulation' },
      { user: users[4]._id, action: 'Incident Reported', details: 'Reported fire alarm in cafeteria', resourceType: 'Incident' }
    ]);
    console.log('📋 Created activity logs');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📧 Login Credentials:');
    console.log('   Admin:   admin@campus.edu / admin123');
    console.log('   Staff:   sarah@campus.edu / staff123');
    console.log('   Officer: mike@campus.edu / officer123');
    console.log('   Student: tushar@campus.edu / student123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
