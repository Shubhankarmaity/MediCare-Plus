# 🏥 MediCare Plus — Complete Project Documentation

> **Live App**: [medi-care-plus-gules.vercel.app](https://medi-care-plus-gules.vercel.app)

---

## 📌 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [System Architecture](#3-system-architecture)
4. [User Roles](#4-user-roles)
5. [Features & Functionality](#5-features--functionality)
   - [Authentication System](#51-authentication-system)
   - [Patient Dashboard](#52-patient-dashboard)
   - [Doctor Dashboard](#53-doctor-dashboard)
   - [Admin Dashboard](#54-admin-dashboard)
   - [Super Admin Dashboard](#55-super-admin-dashboard)
   - [Driver Dashboard](#56-driver-dashboard)
   - [Real-Time Features](#57-real-time-features)
6. [Database Models](#6-database-models)
7. [Backend API Routes](#7-backend-api-routes)
8. [Frontend Pages & Components](#8-frontend-pages--components)
9. [Data Flow & How It Works](#9-data-flow--how-it-works)
10. [Deployment](#10-deployment)

---

## 1. Project Overview

**MediCare Plus** is a full-stack, multi-role **Hospital Management System**. It connects patients, doctors, hospital admins, ambulance drivers, and a super administrator into one unified platform. The system supports appointment booking, real-time video consultations, ambulance SOS, medical report management, patient privacy controls, health vitals tracking, and cross-hospital administration.

### Key Highlights
- **5 distinct user roles** each with their own dashboard and permissions
- **Real-time communication** via Socket.io (chat, video calls, ambulance tracking)
- **OTP-based email verification** using Brevo API
- **Doctor approval workflow** — doctors must be approved by a hospital admin before they can log in
- **Patient privacy controls** — patients explicitly approve/deny doctor access to their records
- **Multi-hospital architecture** — each hospital has its own isolated admin

---

## 2. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| **Frontend Framework** | React | 18 |
| **Frontend Build Tool** | Vite | Latest |
| **UI Component Library** | MUI (Material UI) | v6 (Grid v2) |
| **CSS / Styling** | TailwindCSS | 3 |
| **Animations** | Framer Motion | Latest |
| **Charts** | Recharts | Latest |
| **Backend Runtime** | Node.js + Express | Express 5 |
| **Database** | MongoDB (Atlas) | Mongoose 8 |
| **Real-Time** | Socket.io | 4 |
| **Authentication** | JWT + bcryptjs | JWT 9 |
| **Email Service** | Brevo API (via nodemailer) | — |
| **PDF Generation** | jsPDF | Latest |
| **Video Calls** | WebRTC + simple-peer | — |
| **Frontend Hosting** | Vercel | — |
| **Backend Hosting** | Render | — |

---

## 3. System Architecture

```
┌──────────────────────────────────────────────┐
│              FRONTEND (React/Vite)            │
│  Vercel CDN — medi-care-plus-gules.vercel.app │
│                                              │
│  Pages: Home, Login, Signup, Dashboards...   │
│  State: localStorage (JWT token + user obj)  │
└──────────────┬───────────────────────────────┘
               │ REST API (HTTP)
               │ Socket.io (WebSocket)
               ▼
┌──────────────────────────────────────────────┐
│           BACKEND (Node.js / Express 5)       │
│         Render — backend server               │
│                                              │
│  ┌─────────────────────────────────────────┐ │
│  │  index.js (Entry Point)                 │ │
│  │  ├── Express REST API (14 route groups) │ │
│  │  └── Socket.io Server                  │ │
│  └─────────────────────────────────────────┘ │
│                                              │
│  Middleware: JWT Auth, CORS                  │
│  Controllers: auth, appointment, doctor      │
└──────────────┬───────────────────────────────┘
               │ Mongoose ODM
               ▼
┌──────────────────────────────────────────────┐
│         DATABASE (MongoDB Atlas)             │
│  Collections: Users, Appointments,           │
│  Hospitals, Messages, Notifications,         │
│  AmbulanceRequests, Payments, Vitals         │
└──────────────────────────────────────────────┘
```

---

## 4. User Roles

The entire system is built around **5 roles**, all stored in a single `User` collection with a `role` field:

| Role | Description | Email Verification | Admin Approval |
|---|---|---|---|
| `patient` | End-user booking appointments | ✅ Required | ❌ Auto-approved |
| `doctor` | Medical professional | ✅ Required | ✅ Required (by Hospital Admin) |
| `admin` | Manages one specific hospital | ❌ Not required | ❌ Auto-approved |
| `driver` | Ambulance driver | ✅ Required | ❌ Auto-approved |
| `super-admin` | Manages all hospitals globally | ❌ Not required | ❌ Auto-approved |

---

## 5. Features & Functionality

### 5.1 Authentication System

**Files**: `server/routes/auth.js`, `server/controllers/authController.js`, `my-app/src/pages/Login.jsx`, `Signup.jsx`, `ForgotPassword.jsx`

#### Registration Flow
1. User fills signup form (name, email, password, role, hospital)
2. Backend checks for duplicate email
3. For `admin` role: verifies the hospital exists and doesn't already have an admin
4. For `doctor` role: Hospital name is fetched from `hospitalId` and stored for backward compatibility
5. Password is hashed using **bcryptjs** (salt rounds: 10)
6. For `patient`, `doctor`, `driver`: A 6-digit **OTP** is generated, expires in 10 minutes, and emailed via **Brevo API**
7. `admin` and `super-admin` skip OTP — they're marked `isVerified: true` immediately
8. On success: a Socket.io `new_user` event is emitted to notify the admin dashboard in real-time

#### Email Verification (OTP)
- OTP is a random 6-digit number stored **hashed** in the DB
- User enters OTP on the `/verify-email` step
- OTP expires after 10 minutes; user can request a new one via "Resend OTP"

#### Login Flow
1. Email lookup (case-insensitive)
2. Password comparison with bcrypt
3. If `isVerified === false` → new OTP is auto-generated and sent; login blocked
4. If `role === doctor && !isApproved` → login blocked with approval status message
5. On success: JWT token signed with `{ id, role }`, expires in **7 days**
6. Token and user object stored in `localStorage` on the frontend

#### Forgot Password
1. User enters email → OTP sent
2. User enters OTP + new password
3. Password reset, OTP cleared, account automatically verified

#### JWT Authentication Middleware
- Every protected route uses `auth` middleware (`server/middleware/auth.js`)
- Extracts Bearer token from `Authorization` header
- Decodes and attaches `req.user = { id, role }` to every request

---

### 5.2 Patient Dashboard

**File**: `my-app/src/pages/PatientDashboard.jsx` (72KB, the largest file)
**Tabs**: Overview, Find Doctors, My Appointments, Health Vitals, Prescriptions, Book Ambulance, My Reports, Access Requests, Messages, Payments, Settings

#### Tab 0 — Overview
- Welcome banner with patient's first name
- Quick stats: upcoming appointments count, prescription records count, active chat count

#### Tab 1 — Find Doctors
- Lists all approved doctors from the MongoDB `User` collection with role `doctor`
- Shows: name, specialization, hospital, experience, consultation fee, available days/time
- **Book Appointment** button — sends `POST /api/appointments/book`
- Buttons disabled with "Pending Approval" text if a pending appointment already exists with that doctor
- Confirmation dialog before booking

#### Tab 2 — My Appointments
- **Upcoming**: appointments with status `pending` or `approved`
  - "Join Call" button (for `approved` status) — shows a notice to wait for doctor's call
  - "Chat" button — opens `ChatWindow` with that doctor
  - "Cancel" button — cancels pending appointments
- **History**: appointments with status `completed`, `cancelled`, or `rejected`

#### Tab 3 — Health Vitals
- **Component**: `HealthVitals.jsx`
- Log form: systolic/diastolic BP, heart rate, blood sugar, weight, temperature, notes
- Two Recharts `LineChart` visualizations:
  - Blood Pressure & Heart Rate over time
  - Weight & Blood Sugar over time
- Data stored via `POST /api/vitals`, fetched via `GET /api/vitals`

#### Tab 4 — Prescriptions
- **Component**: `PrescriptionManager.jsx`
- Lists all appointments that have a `doctorReport.prescription`
- **Download PDF** button generates a professional prescription PDF using **jsPDF** with:
  - MediCare Plus header, doctor details, patient name, date
  - Prescription medicines in a styled box
  - Recommendations section (if present)
  - Digital prescription footer

#### Tab 5 — Book Ambulance
- Lists all available ambulance drivers (`isAvailable: true`)
- Shows driver name, vehicle number, live location indicator
- **Call Now (SOS)** button sends `POST /api/ambulance/book`
- Patient's GPS coordinates (from browser's `navigator.geolocation`) are sent to the driver
- Location map placeholder displayed with live lat/lng coordinates

#### Tab 6 — My Reports
- Lists all appointments with a completed `doctorReport`
- Shows detailed report card: diagnosis, symptoms, prescription, dosage, duration, recommendations, tests recommended, follow-up date, severity badge
- **Download PDF** button captures the report card via `html2canvas` and `jsPDF`
- Reports sorted by `reportDate` descending (newest first)

#### Tab 7 — Access Requests
- **Component**: `PatientSettings.jsx` access requests section
- Lists all pending/approved/rejected doctor access requests
- Patient can **Approve** or **Reject** each request
- Approved access lets the requesting doctor view that patient's full medical history

#### Tab 8 — Messages
- Lists all active conversations
- Click a conversation → opens `ChatWindow` component
- Can also initiate chat with a doctor from Tab 2

#### Tab 9 — Payments
- **Component**: `PatientPaymentHistory.jsx`
- Displays payment history from `GET /api/payments`

#### Tab 10 — Settings
- **Component**: `PatientSettings.jsx`
- Update: name, phone, age, gender, blood group, address, emergency contact, medical history, allergies
- Calls `PUT /profile` on save

---

### 5.3 Doctor Dashboard

**File**: `my-app/src/pages/DoctorDashboard.jsx`

#### Features
- **Appointment Queue**: view all pending/approved appointments for this doctor
  - **Approve** / **Reject** each appointment (calls `PUT /api/appointments/status/:id`)
  - **Write Report** button → opens `DoctorReports` component
  - **Video Call** button → initiates WebRTC call to patient via `VideoCall` component
  - **Chat** button → opens `ChatWindow` with patient

- **Doctor Reports** (`DoctorReports.jsx`): Rich form to submit a medical report for an appointment:
  - Diagnosis, symptoms, prescription (medicines), dosage, duration, recommendations
  - Tests recommended, follow-up date, severity (Low/Medium/High/Critical), next visit instructions
  - Calls `POST /api/appointments/:id/report`

- **Patient Details** (`PatientDetails.jsx`): Full patient history (if access approved):
  - All past appointments with that patient
  - Calls `GET /api/appointments/patient/:id`

- **Analytics** (`DoctorAnalytics.jsx`): Charts showing appointment statistics

- **Settings** (`DoctorSettings.jsx`): Update specialization, experience, consultation fee, available days/time, phone

- **Video Calls**: Doctor can initiate a WebRTC call to a patient using Socket.io signaling:
  - `callUser` event sent to patient's socket room
  - Patient sees incoming call modal → accepts → WebRTC peer connection established

---

### 5.4 Admin Dashboard

**File**: `my-app/src/pages/AdminDashboard.jsx`
**Scope**: Each admin only manages **their own hospital**

#### Features
- **Dashboard Stats**: doctor count, patient count, driver count (scoped to hospital)
- **Pending Doctor Approvals**: 
  - List of doctors who registered for this hospital with `approvalStatus: 'pending'`
  - **Approve** (with optional department) or **Reject** (with reason)
  - Socket.io `doctor_approved` / `doctor_rejected` events emitted
- **User Management**: 
  - View list of doctors and patients
  - Click a user → view detailed profile + appointments
  - Patient profiles require patient's prior approval to view (privacy system)
- **Access Requests**: 
  - Admins can request access to patient records
  - Sends `POST /api/access-requests/request`
- **Appointment Overview**: all appointments for this hospital's doctors
- **Patient Discharge**: 
  - Remove a patient's `hospitalId` association 
  - `PUT /api/admin/discharge-patient/:id`
- **Real-time Notifications**: 
  - New patient registrations and appointment bookings trigger `NotificationBell` updates

---

### 5.5 Super Admin Dashboard

**File**: `my-app/src/pages/SuperAdminDashboard.jsx`
**Scope**: Global visibility across **all hospitals**

#### Features
- View, add, edit, delete hospitals (`/api/super-admin/hospitals`)
- View all users across the entire system
- Platform-wide statistics (total hospitals, doctors, patients, appointments)
- Manage any hospital's admin assignment

---

### 5.6 Driver Dashboard

**File**: `my-app/src/pages/DriverDashboard.jsx`

#### Features
- **Toggle Availability**: switch between available/unavailable for rides
- **Incoming Requests**: real-time SOS alerts via Socket.io `dispatch_ambulance` event
- **Active Ride**: view patient name, location, and manage ride status
- **Location Broadcasting**: driver sends GPS coordinates via `send_location` socket event → broadcast to all patients tracking the ambulance
- **Ride History**: list of past ambulance bookings

---

### 5.7 Real-Time Features

**All powered by Socket.io 4**

| Feature | Socket Event | Direction |
|---|---|---|
| New appointment notification | `new_appointment` | Server → Doctor + Admin |
| Admin notification | `notification_{adminId}` | Server → Admin |
| New user registered | `new_user` | Server → Admin dashboard |
| Driver location update | `send_location` / `receive_location` | Driver → All |
| Ambulance SOS | `sos_alert` / `dispatch_ambulance` | Patient → All Drivers |
| Chat message | `receive_message` | Server → Receiver |
| Video call initiation | `callUser` | Doctor → Patient |
| Video call answer | `answerCall` / `callAccepted` | Patient → Doctor |
| ICE candidate exchange | `ice-candidate` | Peer → Peer |
| Call end | `endCall` / `callEnded` | Either → Other |
| Doctor approved | `doctor_approved` | Admin → All |
| Push notification | `new_notification` | Server → User's room |

**User Rooms**: Each connected user joins a socket room equal to their MongoDB `_id`. This enables targeted notifications via `io.to(userId).emit(...)`.

---

## 6. Database Models

### `User` (Unified schema for all roles)
| Field | Type | Description |
|---|---|---|
| `name` | String | Full name |
| `email` | String | Unique, indexed, lowercase |
| `password` | String | bcrypt hash, excluded from queries by default |
| `role` | Enum | `patient / doctor / admin / driver / super-admin` |
| `hospitalId` | ObjectId → Hospital | Links user to a hospital |
| `isVerified` | Boolean | Email OTP verified? |
| `otp` | String | 6-digit OTP (hidden from queries) |
| `otpExpires` | Date | OTP expiry timestamp |
| `isApproved` | Boolean | Doctor approval status |
| `approvalStatus` | Enum | `pending / approved / rejected` |
| `privacySettings.profileAccess` | Map | Doctor ID → access permission object |
| `accessRequests` | Map | Doctor/Admin ID → request status |
| `phone`, `age`, `gender`, `bloodGroup`, `address`, `emergencyContact`, `medicalHistory`, `allergies` | Various | Patient-specific fields |
| `specialization`, `experience`, `qualification`, `consultationFee`, `availableDays`, `availableTime`, `doctorPhone`, `licenseNumber` | Various | Doctor-specific fields |
| `driverLicenseNumber`, `vehicleNumber`, `vehicleType`, `driverPhone`, `isAvailable`, `location` | Various | Driver-specific fields |

### `Appointment`
| Field | Type | Description |
|---|---|---|
| `patientId` | ObjectId → User | The patient |
| `doctorId` | ObjectId → User | The doctor |
| `patientName` | String | Stored at booking time (in case of data changes) |
| `date` | Date | Appointment date/time |
| `status` | Enum | `pending / approved / rejected` |
| `notes` | String | Patient notes |
| `doctorReport` | Object | Nested: diagnosis, symptoms, prescription, dosage, duration, recommendations, testsRecommended, followUpDate, severity, nextVisitInstructions |

### `Hospital`
| Field | Type | Description |
|---|---|---|
| `name`, `address`, `city`, `phone`, `email` | String | Basic info |
| `image` | String | URL to hospital image |
| `facilities` | [String] | List of available facilities |
| `totalBeds`, `availableBeds` | Number | Bed capacity |
| `icuAvailable`, `emergencyServices` | Boolean | Service availability |
| `rating` | Number | Default 4.5 |
| `adminId` | ObjectId → User | The hospital's admin |

### `Message`
| Field | Type | Description |
|---|---|---|
| `senderId`, `receiverId` | ObjectId → User | Participants |
| `content` | String | Message text |
| `read` | Boolean | Read status |
| `createdAt` | Date | Timestamp |

### `Notification`
| Field | Type | Description |
|---|---|---|
| `userId` | ObjectId → User | Recipient |
| `type` | String | e.g. `REGISTRATION`, `APPOINTMENT` |
| `message` | String | Notification text |
| `read` | Boolean | Read status |

### `AmbulanceRequest`
| Field | Type | Description |
|---|---|---|
| `patientId`, `driverId` | ObjectId → User | Participants |
| `patientName` | String | Snapshot of patient name |
| `location` | Object | `{ lat, lng }` |
| `status` | Enum | Request status |

### `Vitals`
| Field | Type | Description |
|---|---|---|
| `userId` | ObjectId → User | Patient |
| `systolic`, `diastolic` | Number | Blood pressure |
| `heartRate`, `bloodSugar`, `weight`, `temperature` | Number | Readings |
| `notes` | String | Optional notes |
| `date` | Date | When recorded |

### `Payment`
| Field | Type | Description |
|---|---|---|
| `patientId` | ObjectId → User | Payer |
| `amount` | Number | Payment amount |
| `status`, `method` | String | Payment details |

---

## 7. Backend API Routes

### Auth Routes (`/`)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | ❌ | Register new user |
| POST | `/login` | ❌ | Login + get JWT |
| POST | `/verify-email` | ❌ | Submit OTP for email verification |
| POST | `/resend-otp` | ❌ | Resend verification OTP |
| POST | `/forgot-password` | ❌ | Send password reset OTP |
| POST | `/reset-password` | ❌ | Reset password with OTP |
| GET | `/profile` | ✅ | Get logged-in user profile |
| PUT | `/profile` | ✅ | Update profile |
| POST | `/profile/grant-access/:id` | ✅ | Patient grants profile access |
| DELETE | `/profile/revoke-access/:id` | ✅ | Patient revokes profile access |
| GET | `/profile/access-list` | ✅ | Get list of users with access |

### Appointments (`/api/appointments`)
| Method | Path | Description |
|---|---|---|
| POST | `/book` | Book appointment (patient) |
| GET | `/my-appointments` | Get own appointments (doctor or patient) |
| PUT | `/status/:id` | Approve/reject/cancel appointment (doctor/patient) |
| POST | `/:id/report` | Submit medical report (doctor) |
| GET | `/patient/:id` | Get patient history (doctor, requires access) |

### Admin (`/api/admin`)
| Method | Path | Description |
|---|---|---|
| GET | `/dashboard-data` | Stats + users + appointments for this hospital |
| GET | `/user/:id` | Get detailed user info (with access check for patients) |
| GET | `/pending-doctors` | Doctors awaiting approval |
| PUT | `/approve-doctor/:id` | Approve a doctor |
| PUT | `/reject-doctor/:id` | Reject a doctor with reason |
| PUT | `/discharge-patient/:id` | Discharge patient from hospital |

### Other API Groups
| Base Path | Description |
|---|---|
| `/api/doctors` | List/update doctor profiles |
| `/api/ambulance` | Book ambulance, list drivers, manage requests |
| `/api/access-requests` | Privacy access request system |
| `/api/messages` | Chat: list conversations, send/get messages |
| `/api/notifications` | Get and mark notifications |
| `/api/hospitals` | Hospital CRUD |
| `/api/super-admin` | Cross-hospital management |
| `/api/vitals` | Health vitals CRUD |
| `/api/payments` | Payment records |

---

## 8. Frontend Pages & Components

### Pages (`/my-app/src/pages`)
| Page | Route | Description |
|---|---|---|
| `Home.jsx` | `/` | Landing page — animated hero, services, about, team |
| `Login.jsx` | `/login` | Login form with role detection |
| `Signup.jsx` | `/signup` | Full registration form (all roles) |
| `ForgotPassword.jsx` | `/forgot-password` | OTP-based password reset |
| `PatientDashboard.jsx` | `/patient-dashboard` | Main patient hub (11 tabs) |
| `DoctorDashboard.jsx` | `/doctor-dashboard` | Doctor workspace |
| `AdminDashboard.jsx` | `/admin-dashboard` | Hospital admin panel |
| `SuperAdminDashboard.jsx` | `/super-admin-dashboard` | Global admin panel |
| `DriverDashboard.jsx` | `/driver-dashboard` | Ambulance driver interface |
| `Profile.jsx` | `/profile` | User profile (shared page) |
| `HospitalSearch.jsx` | `/hospitals` | Browse all hospitals |
| `HospitalDetails.jsx` | `/hospitals/:id` | Individual hospital details |
| `DoctorDetails.jsx` | `/doctors/:id` | Individual doctor details |
| `AmbulanceServices.jsx` | `/ambulance` | Public ambulance info page |
| `LabTests.jsx` | `/lab-tests` | Lab test info page |
| `ProjectTeam.jsx` | `/team` | Meet the team page |

### Key Components (`/my-app/src/components`)
| Component | Description |
|---|---|
| `AnimatedRoutes.jsx` | React Router + Framer Motion page transitions |
| `ChatWindow.jsx` | Real-time chat UI, loads messages, sends via API + Socket.io |
| `VideoCall.jsx` | WebRTC peer-to-peer video call with simple-peer, controlled by Socket.io signaling |
| `DoctorReports.jsx` | Multi-field medical report form |
| `PatientDetails.jsx` | Detailed patient history viewer (for doctors) |
| `HealthVitals.jsx` | Vitals input form + Recharts line charts |
| `PrescriptionManager.jsx` | Prescription viewer + PDF download |
| `PatientSettings.jsx` | Patient profile editor |
| `DoctorSettings.jsx` | Doctor profile/schedule editor |
| `PatientPaymentHistory.jsx` | Payment records table |
| `DoctorAnalytics.jsx` | Appointment analytics charts |
| `NotificationBell.jsx` | Real-time notification dropdown in navbar |
| `DashboardLayout.jsx` | Shared sidebar + content wrapper for all dashboards |
| `Navbar.jsx` | Top navigation with role-aware links |
| `PageTransition.jsx` | Framer Motion fade transition wrapper |
| `ScrollProgress.jsx` | Scroll progress bar at top of page |
| `BackToTop.jsx` | Floating back-to-top button |

---

## 9. Data Flow & How It Works

### Appointment Booking Flow (End-to-End)

```
1. Patient clicks "Book Appointment" 
   └── Opens confirmation dialog

2. Patient confirms
   └── POST /api/appointments/book { doctorId, date }

3. Backend (appointmentController.bookAppointment):
   a. Verifies patient exists
   b. Fetches doctor + their hospital
   c. Hospital Exclusivity Check:
      - If patient already has hospitalId → must match doctor's hospital
      - If patient has no hospitalId → auto-assign doctor's hospital
   d. Creates new Appointment (status: 'pending')
   e. Populates appointment with patient + doctor details
   f. Socket.io → emits 'new_appointment' to all (doctor sees it in real-time)
   g. Socket.io → emits notification to hospital admin

4. Doctor sees new appointment in their dashboard (real-time)
   └── Approves or Rejects
       └── PUT /api/appointments/status/:id { status: 'approved'/'rejected' }

5. If Approved:
   └── Doctor can start video call → patient receives incoming call
   └── Doctor can write medical report
   └── Patient can see report in "My Reports" tab
   └── Patient can download report as PDF
```

### Patient Privacy / Access Request Flow

```
Doctor wants to view patient's full history
↓
Doctor sends access request (POST /api/access-requests/request)
↓
Patient sees request in "Access Requests" tab
↓
Patient approves (PUT /api/access-requests/respond/:id { action: 'approve' })
↓
Access stored in patient's User document:
  privacySettings.profileAccess[doctorId] = { approved: true, expiresAt, singleUse }
↓
Doctor can now call GET /api/appointments/patient/:id (checked in getPatientHistory)
```

### Video Call Flow

```
Doctor clicks "Video Call" button in appointment card
↓
VideoCall component created with doctor as initiator
  → WebRTC getUserMedia() to access camera/mic
  → simple-peer creates offer
  → Socket.io emits 'callUser' to patient's socket room

Patient receives 'callUser' event
  → Incoming call modal appears in PatientDashboard
  → Patient clicks "Answer"
  → answerCall() creates WebRTC answer
  → Socket.io emits 'answerCall'

Doctor receives 'callAccepted' event
  → WebRTC connection established
  → Both see live video feed
```

---

## 10. Deployment

| Layer | Platform | URL |
|---|---|---|
| Frontend | **Vercel** | https://medi-care-plus-gules.vercel.app |
| Backend | **Render** | Backend API server (free tier) |
| Database | **MongoDB Atlas** | Cloud cluster |
| Email | **Brevo API** | Transactional email delivery |

### Environment Variables (Backend `.env`)
```
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
CLIENT_URL=https://medi-care-plus-gules.vercel.app
BREVO_API_KEY=...
```

### Frontend Config (`my-app/src/config.js`)
```js
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

### Running Locally

**Backend:**
```bash
cd server
npm install
node index.js
# Runs on http://localhost:5000
```

**Frontend:**
```bash
cd my-app
npm install
npm run dev
# Runs on http://localhost:5173 (or 5179/5180)
```

---

*Documentation last updated: February 2026*
