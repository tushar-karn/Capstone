# Campus Safety Hub

Campus Safety Hub is a comprehensive MERN-stack web application designed to enhance emergency response and proactive safety management in academic institutions or large corporate campuses.

## Key Features
- **Role-Based Access Control (RBAC):** Distinct dashboards and capabilities for Admins, Staff/Officers, and Students.
- **Incident Reporting & Management:** Real-time map-based incident tracking, status updates, and dynamic admin resolution.
- **Emergency SOS & Location Tracking:** Instant GPS dispatch for critical emergencies with reverse-geocoded addresses.
- **Broadcast Notifications:** Campus-wide alert system with priority levels and user acknowledgement tracking.
- **AI-Powered Risk Analysis:** Automated risk zone scoring and early warning generation based on historical incident data.
- **Interactive Drill Simulations:** Step-by-step interactive safety checklists with dynamic scoring.
- **Safety Lessons:** Centralized repository for safety training videos and documentation.

## Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, Framer Motion, Leaflet (React-Leaflet)
- **Backend:** Node.js, Express.js, MongoDB (Mongoose)
- **Authentication:** JSON Web Tokens (JWT), bcryptjs

## Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas (or local instance)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd Capstone
   ```

2. **Backend Setup:**
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in the `server` directory with the following:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```
   *(Optional)* Run the seed script to populate the database with realistic demo data, zones, and users:
   ```bash
   node seed.js
   ```
   Start the backend server:
   ```bash
   npm run dev
   ```

3. **Frontend Setup:**
   Open a new terminal and navigate to the client folder.
   ```bash
   cd client
   npm install
   ```
   Start the frontend development server:
   ```bash
   npm run dev
   ```

## Demo Credentials
If you ran the `seed.js` script, the following accounts will be available:
- **Admin**: `admin@campus.edu` / `admin123`
- **Staff**: `sarah@campus.edu` / `staff123`
- **Officer**: `mike@campus.edu` / `officer123`
- **Student**: `tushar@campus.edu` / `student123`
