# Project Overview & File Structure

This document provides a detailed overview of the project structure and the purpose of each file in the Hospital Management System.

## 📂 Project Root
- **`README.md`**: General project information and setup instructions.
- **`hospital-workflow.tldr` / `test.tldr`**: tldraw whiteboard files containing flowcharts and diagrams of the system architecture.
- **`flowchart.txt`**: Text-based representation of the project flow.

---

## 📂 Backend (`/server`)
Node.js/Express application handling API requests, database interactions, and real-time socket communication.

### Core Files
- **`index.js`**: **Entry Point**. Sets up the Express server, connects to MongoDB, configures Middleware (CORS, JSON), and initializes Socket.io for real-time features (chat, location tracking).
- **`.env`**: (Hidden) Environment variables (Port, MongoDB URI, JWT Secret).
- **`package.json`**: Backend dependencies (Express, Mongoose, Socket.io, etc.) and scripts.

### 📂 Routes (`/server/routes`)
API endpoints for different features.
- **`auth.js`**: User authentication (Login, Register). Handles JWT generation.
- **`admin.js`**: Administrative actions (Manage users, verify doctors, view system stats).
- **`appointments.js`**: Booking, scheduling, and managing appointments between patients and doctors.
- **`doctors.js`**: Doctor-specific logic (Profile updates, availability).
- **`ambulance.js`**: Ambulance booking and driver management.
- **`accessRequests.js`**: Manages requests for accessing patient medical records.
- **`messages.js`**: Chat functionality (Fetching conversations, sending messages).
- **`notifications.js`**: System notifications for users.
- **`hospitals.js`**: Hospital management endpoints.

### 📂 Models (`/server/models`)
Mongoose schemas defining the data structure.
- **`User.js`**: Main user schema (Patients, Doctors, Admins, Drivers). Stores profile info, roles, and credentials.
- **`Appointment.js`**: Appointment details (Date, Doctor, Patient, Status, Medical Reports).
- **`Message.js`**: Chat message schema (Sender, Receiver, Content, Timestamp, Read Status).
- **`Hospital.js`**: Hospital entity details (Name, Location, Admin).
- **`Notification.js`**: Structure for system notifications.
- **`AmbulanceRequest.js`**: Records of ambulance bookings and SOS alerts.

### Utility Scripts
- **`seed_and_book.js` / `seedHospitals.js`**: Scripts to populate the database with dummy data for testing.
- **`create_city_admin.js` / `create_ambulance_driver.js`**: Helper scripts to create specific user roles manually.
- **`clear_patients.js` / `resetDb.js`**: Maintenance scripts to clean up the database.

---

## 📂 Frontend (`/my-app`)
React application built with Vite and TailwindCSS.

### Core Files
- **`src/App.jsx`**: Main application component. Handles Routing (React Router) and global layout.
- **`src/main.jsx`**: Entry point rendering the React app.
- **`vite.config.js`**: Vite configuration (Ports, Plugins).
- **`tailwind.config.js`**: TailwindCSS styling configuration.

### 📂 Pages (`/my-app/src/pages`)
Main views corresponding to different routes.
- **`Home.jsx`**: Landing page with services overview and "Get Started" options.
- **`Login.jsx` / `Signup.jsx`**: Authentication pages.
- **`PatientDashboard.jsx`**: **Main User Hub**. Features: Find Doctors, Book Ambulance, View Reports, Chat, Access Requests.
- **`DoctorDashboard.jsx`**: Doctor's interface. Manage appointments, write reports, view schedule.
- **`AdminDashboard.jsx`**: Admin panel. Manage doctors/users, approve registrations, view platform stats.
- **`DriverDashboard.jsx`**: Ambulance driver interface. Receive ride requests, toggle availability.
- **`Profile.jsx`**: User profile settings (Update details, change password).
- **`HospitalSearch.jsx` / `HospitalDetails.jsx`**: Browse and view specific hospital information.

### 📂 Components (`/my-app/src/components`)
Reusable UI building blocks.
- **`Navbar.jsx`**: Top navigation bar with dynamic links based on user role.
- **`DashboardLayout.jsx`**: Common layout wrapper for dashboard pages (Sidebar + Content area).
- **`ChatWindow.jsx`**: Real-time chat interface component.
- **`NotificationBell.jsx`**: Notification dropdown in the navbar.
- **`PatientDetails.jsx`**: Detailed view of a patient's history for doctors.
- **`DoctorReports.jsx`**: Component for doctors to write and submit medical reports.

---

## 📝 Key Features Implementation Map
| Feature | Frontend File | Backend Route | Data Model |
| :--- | :--- | :--- | :--- |
| **Auth** | `Login.jsx`, `Signup.jsx` | `auth.js` | `User.js` |
| **Appointments** | `PatientDashboard.jsx` (Book), `DoctorDashboard.jsx` (View) | `appointments.js` | `Appointment.js` |
| **Chat** | `ChatWindow.jsx` | `messages.js` | `Message.js` |
| **Ambulance** | `PatientDashboard.jsx` (SOS), `DriverDashboard.jsx` | `ambulance.js` | `AmbulanceRequest.js` |
| **Reports** | `PatientDashboard.jsx` (View), `DoctorReports.jsx` (Create) | `appointments.js` | `Appointment.js` |
| **Admin** | `AdminDashboard.jsx` | `admin.js` | `User.js` |
