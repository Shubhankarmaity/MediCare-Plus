# MediCare-Plus 🏥

A comprehensive Hospital Management System built with the MERN stack (MongoDB, Express.js, React, Node.js).

## 🚀 Features

### 👤 User Roles
- **Patients**: Book appointments, view medical history, request ambulance services.
- **Doctors**: View and manage appointments, update patient records.
- **Admins**: Manage users, doctors, and overall system settings.
- **Drivers**: Receive and respond to ambulance requests in real-time.

### ⚡ Key Functionalities
- **Real-time Updates**: Socket.io integration for ambulance tracking and live notifications.
- **Authentication**: Secure login/signup system with role-based access control.
- **Dashboard**: Tailored dashboards for each user role (Admin, Doctor, Patient, Driver).
- **Appointment Booking**: Streamlined process for scheduling doctor visits.

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
- **Frontend**: React (Vite), Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Real-time**: Socket.io

## 📂 Project Structure
- **`/server`**: Backend API and database logic.
  - `models/`: Database schemas (User, Appointment, AmbulanceRequest).
  - `routes/`: API endpoints.
- **`/my-app`**: Frontend React application.
  - `src/pages/`: Main application views (Dashboards, Home, Auth).
  - `src/components/`: Reusable UI components.

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