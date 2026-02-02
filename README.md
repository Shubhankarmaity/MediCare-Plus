# MediCare-Plus 🏥

A comprehensive Hospital Management System built with the MERN stack (MongoDB, Express.js, React, Node.js).

## 🚀 Live Demo
🔗 **Deployment Link:** [https://medi-care-plus-gules.vercel.app/](https://medi-care-plus-gules.vercel.app/)

## 🚀 Features

### 👤 User Roles
- **Patients**: 
  - 📅 **Book Appointments**: Schedule visits with doctors.
  - 🚑 **Ambulance Services**: Book emergency rides and track drivers in real-time.
  - 📄 **Medical Reports**: View and download PDF reports.
  - 💬 **Chat**: Communicate with doctors directly.
  - 🔐 **Profile Management**: Secure login and profile updates.
  
- **Doctors**: 
  - 🗓️ **Appointment Management**: View schedule and manage patient bookings.
  - 📝 **Medical Records**: upload and manage patient reports.
  - 💬 **Patient Chat**: Consult with patients via secure chat.
  
- **Admins**: 
  - 👥 **User Management**: Oversee doctors, patients, and drivers.
  - 📊 **Dashboard Stats**: View platform analytics.
  - ✅ **Approvals**: Verify doctor registrations.
  
- **Drivers**: 
  - 📍 **Ride Requests**: Receive real-time ambulance requests.
  - 🗺️ **Navigation**: Integrated map for locating patients.
  - 🟢 **Availability**: Toggle online/offline status.

### ⚡ Key Functionalities
- **Real-time Updates**: Socket.io integration for instant chat and ambulance tracking.
- **Interactive Maps**: Mapbox GL integration for location services.
- **PDF Generation**: Auto-generate medical reports using jsPDF.
- **Secure Authentication**: JWT-based secure login/signup with role-based access control.
- **Responsive Design**: Modern UI using Tailwind CSS and Framer Motion animations.

### 🎬 AI Video Presentation Prompt
To create an engaging demonstration video for this Hospital Management System, use the following prompt with your preferred AI video generation tool:

```
Create a professional 2-3 minute explainer video for a Hospital Management System called "MediCare-Plus". 
The video should showcase a modern healthcare platform with the following key features:

1. Opening scene: A clean, modern hospital with doctors, nurses, and patients in a well-lit environment
2. Animated dashboard transitions showing:
   - Admin panel with user management
   - Doctor's interface with appointment calendar
   - Patient portal with booking system
   - Driver app with ambulance tracking map
3. Real-time notifications appearing on screens (appointment confirmations, ambulance updates)
4. Secure login sequence with role-based access
5. Data visualization with charts showing patient statistics
6. Mobile responsiveness showing the system works on all devices
7. Closing scene: Happy patients, satisfied doctors, and efficient staff with the MediCare-Plus logo

Style: Clean, professional, modern healthcare aesthetic with blue and white color scheme
Animation: Smooth transitions, subtle motion graphics
Music: Uplifting, professional background music
Voiceover: Friendly, professional narrator explaining benefits
```

## 🛠️ Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Material UI (@mui/material), Lucide React
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Real-time**: Socket.io
- **Utilities**: Mapbox GL, jsPDF, html2canvas, Axios

## 📂 Project Structure
- **`/server`**: Backend API and database logic.
  - `models/`: Database schemas (User, Appointment, AmbulanceRequest, etc.).
  - `routes/`: API endpoints (Auth, Doctors, Appointments, etc.).
- **`/my-app`**: Frontend React application.
  - `src/pages/`: Main application views (Dashboards, Home, Auth).
  - `src/components/`: Reusable UI components (Navbar, ChatWindow, etc.).

## 🏃‍♂️ How to Run

### Prerequisites
- Node.js installed
- MongoDB installed and running locally

### 1. Backend Setup
```bash
cd server
npm install
node index.js
```
*Server runs on http://localhost:5000*

### 2. Frontend Setup
```bash
cd my-app
npm install
npm run dev
```
*Client runs on http://localhost:5173*

## 🔑 Environment Variables
The server uses `dotenv` for configuration. Ensure your MongoDB URI is correctly set in `server/index.js` or via a `.env` file if configured.
