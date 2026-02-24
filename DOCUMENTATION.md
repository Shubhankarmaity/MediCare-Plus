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
   - [AI Chatbot & Medical Advisor](#58-ai-chatbot--medical-advisor-medibot)
6. [Database Models](#6-database-models)
7. [Backend API Routes](#7-backend-api-routes)
8. [Frontend Pages & Components](#8-frontend-pages--components)
9. [Data Flow & How It Works](#9-data-flow--how-it-works)
10. [Deployment & Local Setup](#10-deployment--local-setup)

---

## 1. Project Overview

**MediCare Plus** is a full-stack, multi-role **Hospital Management System**. It connects patients, doctors, hospital admins, ambulance drivers, and a super administrator into one unified platform. The system supports appointment booking, real-time video consultations, ambulance SOS, medical report management, patient privacy controls, health vitals tracking, dynamic ML-powered hospital recommendations, and cross-hospital administration.

### Key Highlights
- **5 distinct user roles** each with their own dashboard and permissions.
- **Real-time communication** via Socket.io (chat, video calls, ambulance tracking).
- **Dual-AI Chatbot (MediBot)** powered by NLP and an ML recommendation engine.
- **Dynamic ML Retraining** to automatically incorporate newly added hospitals without downtime.
- **Hospital Image Uploads** handled via robust `multer` integrations.
- **Doctor approval workflow** — doctors must be approved by a hospital admin before they can log in.
- **Patient privacy controls** — patients explicitly approve/deny doctor access to their records.
- **Multi-hospital architecture** — each hospital has its own isolated admin.

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
| **File Uploads** | Multer | Latest |
| **Email Service** | Brevo API (via nodemailer) | — |
| **PDF Generation** | jsPDF + html2canvas | Latest |
| **Video Calls** | WebRTC + simple-peer | — |
| **ML Microservice** | Python + Flask | 3.10+ |
| **ML Libraries** | scikit-learn, pandas, numpy, joblib | Latest |
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
               │ REST API (HTTP + FormData)
               │ Socket.io (WebSocket)
               ▼
┌──────────────────────────────────────────────┐
│           BACKEND (Node.js / Express 5)       │
│         Render — backend server               │
│                                              │
│  ┌─────────────────────────────────────────┐ │
│  │  index.js (Entry Point)                 │ │
│  │  ├── Express REST API (15 route groups) │ │
│  │  ├── Static File Serving (/uploads)     │ │
│  │  └── Socket.io Server                   │ │
│  └─────────────────────────────────────────┘ │
│                                              │
│  Middleware: JWT Auth, CORS, Multer          │
│  Controllers: auth, appointment, superadmin  │
└──────────────┬──────────────────────┬────────┘
               │ Mongoose ODM         │ HTTP POST (Axios)
               ▼                      ▼
┌─────────────────────────┐  ┌─────────────────────────┐
│        DATABASE         │  │    ML MICROSERVICE      │
│     (MongoDB Atlas)     │  │    (Python / Flask)     │
│                         │  │                         │
│  Collections: Users,    │  │  Port: 5001             │
│  Appointments,          │  │  Model: NearestNeighbors│
│  Hospitals, Messages,   │  │  NLP: TF-IDF Vectorizer │
│  Vitals, Payments...    │  │  Routes: /predict,      │
│                         │  │          /retrain       │
└─────────────────────────┘  └─────────────────────────┘
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
1. User fills signup form (name, email, password, role, hospital).
2. Backend checks for duplicate email.
3. For `admin` role: verifies the hospital exists and doesn't already have an admin.
4. For `doctor` role: Hospital name is fetched from `hospitalId` and stored.
5. Password is hashed using **bcryptjs** (salt rounds: 10).
6. For `patient`, `doctor`, `driver`: A 6-digit **OTP** is generated, expires in 10 minutes, and emailed via **Brevo API**.
7. `admin` and `super-admin` skip OTP — they're marked `isVerified: true` immediately.
8. On success: a Socket.io `new_user` event is emitted.

#### Email Verification (OTP)
- OTP is a random 6-digit number stored **hashed** in the DB.
- User enters OTP on the `/verify-email` step.
- OTP expires after 10 minutes; user can request a new one via "Resend OTP".

#### Login Flow
1. Email lookup (case-insensitive).
2. Password comparison with bcrypt.
3. If `isVerified === false` → new OTP is auto-generated and sent; login blocked.
4. If `role === doctor && !isApproved` → login blocked with approval status message.
5. On success: JWT token signed with `{ id, role }`, expires in **7 days**.
6. Token and user object stored in `localStorage` on the frontend.

---

### 5.2 Patient Dashboard

**File**: `my-app/src/pages/PatientDashboard.jsx` (Primary Hub)
**Tabs**: Overview, Find Doctors, My Appointments, Health Vitals, Prescriptions, Book Ambulance, My Reports, Access Requests, Messages, Payments, Settings

#### Top Features
- **Booking Hub**: Browse doctors across all hospitals and book appointments. Real-time visual lockouts for duplicate bookings pending approval.
- **Dynamic Data Visualization**: Recharts provides live line graphs of tracked health vitals (BP, Sugar, Weight, Heart Rate).
- **Report & Prescription Downloads**: Integration with `html2canvas` and `jsPDF` allows patients to download perfectly formatted PDF records of their interactions and prescriptions.
- **SOS Ambulance Dispatch**: 1-click dispatch sends live GPS coordinates directly to on-duty ambulance drivers via WebSocket.
- **Privacy Access Center**: A dedicated tab to approve or reject requests from doctors who wish to view the patient's full medical history.

---

### 5.3 Doctor Dashboard

**File**: `my-app/src/pages/DoctorDashboard.jsx`

#### Top Features
- **Appointment Queue**: Real-time incoming appointment requests. Doctors can approve, reject, chat, video call, or submit a final report.
- **WebRTC Video Consultations**:
  - Push-button WebRTC peer-to-peer setup over Socket.io signaling.
  - Opens direct camera-to-camera feed directly within the browser (no external app required).
- **Patient Medical History Viewer**: Provided the patient has granted access, the doctor can pull up holistic chronological data on a patient's past ailments and treatments.
- **Rich Medical Reports**: Post-consultation, doctors can submit structured diagnosis, medication regimens, and severity tags.

---

### 5.4 Admin Dashboard

**File**: `my-app/src/pages/AdminDashboard.jsx`
**Scope**: Each admin only manages **their own hospital**.

#### Top Features
- **Doctor Approval Gateway**: Doctors trying to associate themselves with a hospital must pass an Admin vetting screen.
- **Staff Auditing**: Instantly trace all doctors, their specializations, appointment counts, and direct patient interaction lists.
- **Record Request Automation**: Admins can request medical records en masse on behalf of attending doctors or surgical prep teams.

---

### 5.5 Super Admin Dashboard

**File**: `my-app/src/pages/SuperAdminDashboard.jsx`
**Scope**: Global visibility across **all hospitals**.

#### Top Features
- **Hospital Image Uploads**: 
  - Using `FormData` on the frontend and `multer` on the backend, Super Admins can attach custom high-resolution images to hospital listings. 
  - The backend securely handles `multipart/form-data`, saves to `/uploads`, constructs a static serving route URL, and injects it directly into the `image` schema field.
- **Admin Auto-Creation Workflow**:
  - When spinning up a new hospital, the Super Admin can optionally auto-generate an Admin account attached exclusively to that facility in one sweeping API call.
- **Global Fleet & System Management**: God-eye view over total network metrics, doctor volumes, bed capacities across multiple cities, and live driver networks.

---

### 5.6 Driver Dashboard

**File**: `my-app/src/pages/DriverDashboard.jsx`

#### Top Features
- **Shift Toggling**: Drivers can go `Available` or `Busy`.
- **Live SOS Dispatching**: Connected to Socket.io to receive emergency coordinates.
- **Live GPS Tracking**: Real-time push of the ambulance location to the patient currently requesting them.

---

### 5.7 Real-Time Features (Socket.io)

**All powered by Socket.io 4**. Each connected user is automatically added to a Socket `room` equal to their MongoDB `_id`, allowing precise notifications via `io.to(userId).emit(...)`.

| Feature | Socket Event | Direction |
|---|---|---|
| New appointment request | `new_appointment` | Server → Doctor + Admin |
| New user registered | `new_user` | Server → Admin dashboard |
| Driver GPS update | `send_location` / `receive_location` | Driver → All |
| Ambulance SOS | `sos_alert` / `dispatch_ambulance` | Patient → All Drivers |
| Direct Chatting | `receive_message` | Server → Receiver |
| WebRTC call initiation | `callUser` | Doctor → Patient |
| WebRTC call answer | `answerCall` / `callAccepted` | Patient → Doctor |
| ICE candidate exchange | `ice-candidate` | Peer → Peer |
| Doctor Approved status | `doctor_approved` | Admin → Doctor |

---

### 5.8 AI Chatbot & Medical Advisor (MediBot)

**Files**: `my-app/src/components/MediBot.jsx`, `server/controllers/chatbotController.js`, `train_model.py`, `app.py`

#### Capabilities
- **Floating Chat UI**: Accessible globally across the patient experience.
- **Medical Knowledge Base**: Using intelligent keyword parsing and LLM integration, MediBot answers general health queries directly (e.g., "What are symptoms of diabetes?").
- **Dynamic Hospital ML Recommendation Flow**:
  1. **Patient Query**: Patient describes symptoms ("I have chest pain and need a robust hospital").
  2. **Intent Parsing**: The controller detects keywords indicating a hospital request.
  3. **Node-to-Flask Inference**: Node.js sends symptoms + patient medical history via Axios to the Python Flask microservice `http://localhost:5001/predict`.
  4. **NLP Vectorization & KNN Similarity**: Symptoms convert to a TF-IDF vector matrix in Python. The trained `NearestNeighbors` model runs a cosine similarity mathematical check against a pre-trained dataset of hospital profiles.
  5. **Fuzzy Document Mapping**: Python returns top 3 hospital strings. Node.js maps these strings using RegExp fuzzy matching to exact `ObjectId` references in the MongoDB database, circumventing rigid ID drift.
  6. **UI Rendering**: Returns fully interactive hospital cards inside the chat.

#### Dynamic ML Retraining
- **Problem**: When a Super Admin adds a *new* hospital, the trained `hospital_model.pkl` doesn't know about it.
- **Solution**: Zero-downtime dynamic retraining.
  - The Node.js server intercepts `POST /api/super-admin/hospital` or `PUT`.
  - Upon success, Node.js triggers an async background Axios call to `POST http://localhost:5001/retrain`.
  - The Python server fetches the latest hospital snapshot dynamically from MongoDB via `pymongo`.
  - It retrains the KNN model and TF-IDF vectorizer vectors in memory.
  - It saves new `.pkl` files and hot-reloads the global pipeline without requiring a server reboot.
  - The frontend dynamically displays "Brain updating..." feedback while this occurs.

---

## 6. Database Models

The schema uses MongoDB (mongoose ODM). Below is a high-level summary.

### `User` (Unified schema for all roles)
- `name`, `email`, `password`, `role` (`patient / doctor / admin / driver / super-admin`)
- `hospitalId`, `isVerified`, `otp`, `approvalStatus`
- **Patient specifics**: `bloodGroup`, `medicalHistory`, `privacySettings`
- **Doctor specifics**: `specialization`, `experience`, `consultationFee`
- **Driver specifics**: `vehicleNumber`, `isAvailable`, `location`

### `Hospital`
- `name`, `address`, `city`, `phone`, `email`
- `image` (URL to Multer `/uploads/x.jpg` or static fallback)
- `facilities`, `totalBeds`, `availableBeds`, `icuAvailable`, `rating`
- `adminId` (The auto-created Admin account reference)

### `Appointment`
- `patientId`, `doctorId`, `date`, `status`, `notes`
- `doctorReport` (Rich object: diagnosis, prescription, duration, severity)

### Additional Models
- **`Message`**: Real-time conversations (`senderId`, `receiverId`, `content`)
- **`Notification`**: System alerts (`userId`, `type`, `message`)
- **`AmbulanceRequest`**: SOS rides (`patientId`, `driverId`, `status`)
- **`Vitals`**: Medical logs (`systolic`, `diastolic`, `bloodSugar`)

---

## 7. Backend API Routes

*Note: Middleware (`auth`, `isSuperAdmin`, `isAdmin`) guards these routes strictly.*

### Auth Routes (`/`)
- `POST /register`, `POST /login`, `POST /verify-email`, `POST /forgot-password`
- `GET /profile`, `PUT /profile`, `POST /profile/grant-access/:id`

### Hospital & Admin Logic
- `POST /api/super-admin/hospital`: Handled via **`multer.single('image')`** for `multipart/form-data`. Auto-creates Admin account.
- `POST /api/super-admin/trigger-retrain`: Manual manual invocation for ML sync.
- `GET /api/admin/dashboard-data`: Pulls isolated stats for the scoped hospital.
- `PUT /api/admin/approve-doctor/:id`

### Doctor & Patient Operations
- `POST /api/appointments/book`, `GET /api/appointments/my-appointments`
- `POST /api/appointments/:id/report`, `GET /api/appointments/patient/:id`
- `GET /api/vitals`, `POST /api/vitals`
- `POST /api/chatbot`: Main MediBot text ingestion.

### Static File Serving
- `/uploads`: Mounted via Express to serve hospital images directly to the client (`app.use('/uploads', express.static...)`).

---

## 8. Frontend Pages & Components

### Pages (`my-app/src/pages/`)
- `Home.jsx`, `PatientDashboard.jsx`, `SuperAdminDashboard.jsx`, `HospitalSearch.jsx`, `HospitalDetails.jsx`

### Key Components (`my-app/src/components/`)
- **`MediBot.jsx`**: Floating UI wrapper handling Chatbot APIs.
- **`VideoCall.jsx`**: Handles `navigator.mediaDevices.getUserMedia()` and creates `SimplePeer` instances.
- **`PrescriptionManager.jsx`**: Generates medical PDFs from the `Appointment.doctorReport` subdocument.
- **`HealthVitals.jsx`**: Plugs into Recharts for live graph drawing.
- **`NotificationBell.jsx`**: Navbar badge hooked into Socket.io.

---

## 9. Data Flow & How It Works

### Appointment Booking Flow (End-to-End)
1. Patient clicks "Book Appointment".
2. `POST /api/appointments/book` with `{ doctorId, date }`.
3. Backend controller checks exclusivity constraint: if Patient has `hospitalId`, the Doctor must belong to the same hospital.
4. Appointment created with status `'pending'`.
5. Socket.io emits `new_appointment` to Doctor.
6. Doctor approves via dashboard → `PUT .../status/approve`.
7. Once approved, Doctor can launch a WebRTC via `callUser` Socket event or write a `report` payload.

---

## 10. Code Structure & Key Libraries

To fully understand and present the project, knowing what each piece of technology is responsible for is crucial.

### Frontend (`/my-app`)
- **React (`react`, `react-router-dom`)**: Core UI library and SPA (Single Page Application) routing system.
- **Material UI (`@mui/material`, `@emotion/react`)**: UI component framework heavily utilized for building cards, navigation sidebars, standardized grids, and dialog modals.
- **TailwindCSS**: Utility-first CSS framework for rapid, custom layout styling overriding standard MUI defaults where needed.
- **Framer Motion (`framer-motion`)**: Powers the highly smooth page transitions (`PageTransition.jsx`) and animated interactive elements like hovering cards.
- **Lucide React (`lucide-react`)**: Beautiful, modern SVG icon pack used throughout the application dashboards.
- **Recharts (`recharts`)**: Renders the dynamic, responsive line graphs for the Patient's Health Vitals tracking in the Patient Dashboard.
- **Socket.io Client (`socket.io-client`)**: Connects to the Node.js backend for real-time bi-directional messaging (chat messages, incoming video calls, and SOS ambulance coordinates).
- **Simple-Peer (`simple-peer`)**: An abstraction over WebRTC. Manages the complex peer-to-peer camera and microphone connection for live video consultations.
- **jsPDF & html2canvas**: Captures snapshot images of the DOM elements (prescriptions and medical reports) and successfully converts them into professional, downloadable PDF files.
- **Axios / Fetch**: Handles all HTTP REST API calls to the Express and Python backends.

### Backend (`/server`)
- **Express (`express`)**: The core HTTP server framework mapping URL endpoints (like `/api/appointments`) to specific controller logic.
- **Mongoose (`mongoose`)**: The MongoDB ODM (Object Data Modeling) library. It maps regular JavaScript objects to database documents and enforces the rigorous Schema structures (like `Hospital.js`).
- **Socket.io (`socket.io`)**: The WebSocket server running perfectly alongside Express. Handles all real-time event streaming (`new_appointment`, `sos_alert`).
- **Multer (`multer`)**: Middleware that intercepts `multipart/form-data` requests. It securely accepts, names, and saves uploaded hospital images directly to the `/uploads` disk folder.
- **Nodemailer (`nodemailer`)**: Powers the email verification logic. It hooks securely into the **Brevo SMTP API** to email OTP verification codes.
- **Bcrypt.js (`bcryptjs`)**: Cryptographically hashes and salts user passwords before permanently saving them into the MongoDB database.
- **JSON Web Token (`jsonwebtoken`)**: Generates the stateless, encrypted authentication tokens stored on the client side, confirming identities on every subsequent request without hitting the database for session checking.
- **Google Generative AI (`@google/generative-ai`)**: Hooks into Google's Gemini LLM to power the conversational general health knowledge responses deeply integrated into the MediBot.

### ML Microservice (`/`)
- **Flask (`Flask`)**: A lightweight Python web server acting strictly as a micro-API exposing the `/predict` and `/retrain` endpoints to the Node.js server.
- **Scikit-Learn (`scikit-learn`)**: The backbone of the ML recommendation engine. Uses the `TfidfVectorizer` for Natural Language Processing on patient query strings, and the `NearestNeighbors` algorithm to mathematically flag the closest matching hospital profile.
- **Pandas & NumPy (`pandas`, `numpy`)**: Data manipulation libraries that format, clean, and structure the raw database JSON into ML-ready algebraic matrices.
- **Joblib (`joblib`)**: Serializes (saves/loads) the trained models (`hospital_model.pkl` and `vectorizer.pkl`) so that patient queries can be serviced instantly entirely from server memory without needing to be recomputed for every request.
- **PyMongo (`pymongo`)**: Dynamically connects to the live `hospitals` collection directly from MongoDB during the `/retrain` function so the ML model can immediately pull down new facilities and incorporate their records into the new `.pkl` output.

---

## 11. Technical Deep-Dives (Interview Prep)

*If an interviewer or HR asks you "How did you build X?" or "Why did you choose Y?", use these robust technical explanations.*

### 1. How does the Video Calling actually work? (WebRTC & Signaling)
**The Concept**: Real-time video doesn't traverse the backend server (which would be incredibly slow and expensive). It goes directly from the Doctor's browser to the Patient's browser. This is called Peer-to-Peer (P2P).
**The Execution**:
- We use **WebRTC** under the hood, simplified by the `simple-peer` library.
- Before two browsers can connect P2P, they need to know how to find each other on the internet. This is called **Signaling**.
- We use **Socket.io** strictly as the Signaling Server. 
- **The Flow**:
  1. The Doctor clicks "Call". Their browser creates an "Offer" (an SDP object containing media capabilities and IP details).
  2. The Doctor sends this Offer to our Node.js server via `socket.emit('callUser')`.
  3. Node.js instantly relays this Offer to the specific Patient via `io.to(patientId).emit('callUser')`.
  4. The Patient clicks "Answer", generating an "Answer" SDP object.
  5. The Answer travels back through Socket.io to the Doctor.
  6. Once both browsers have exchanged these SDPs (and ICE Candidates to bypass firewalls), the WebRTC connection opens and the live video/audio stream begins. The backend server is no longer involved in the video feed!

### 2. How does the Machine Learning Hospital Recommendation work?
**The Concept**: The chatbot needs to understand human symptoms and match them to the best hospital mathematically, without relying on strict keyword `IF/THEN` statements.
**The Execution**:
- **TF-IDF Vectorization** (Term Frequency - Inverse Document Frequency): The Python `scikit-learn` library takes the patient's text (e.g., "sharp chest pain") and turns it into an algebraic matrix (a vector of numbers). It gives higher mathematical weight to rare, important words ("chest", "pain") and ignores filler words.
- **KNN** (K-Nearest Neighbors): We trained a KNN algorithm on a dataset of hospital profiles. Once the patient's symptoms are vectorized, the KNN algorithm plots that vector in a multi-dimensional space and finds the *"K"* (in our case, 3) hospital vectors that are physically closest to it.
- **The Microservice Integration**: The Node.js server cannot run Python ML models natively. So, Node.js fires an Axios HTTP `POST` request to `http://localhost:5001/predict` (our Flask API). Flask runs the algebraic math in milliseconds and returns the strings back to Node.js, which then pairs them with actual MongoDB data.

### 3. Why use Socket "Rooms" instead of standard Broadcasting?
**The Concept**: Notifications and chat messages must only go to the specific intended user, not every connected user.
**The Execution**:
- In Socket.io, when a user logs in, we execute `socket.emit("join_room", user._id)`. 
- The Node.js server listens for this and runs `socket.join(userId)`. 
- Now, that specific WebSocket connection is subscribed to a private "Room" named after their MongoDB ID.
- **The Benefit**: When a Doctor approves an appointment, Node.js doesn't have to loop through thousands of connected sockets to find the right patient. It simply executes `io.to(patientId).emit('new_appointment', data)`. This is highly optimized, O(1) time complexity message routing.

### 4. Why put 5 different User Roles into a single MongoDB Collection?
**The Concept**: Instead of having a `Patients` collection, a `Doctors` collection, and an `Admins` collection, everything is in one `Users` collection. This is called Single Table Inheritance.
**The Execution**:
- We use a shared Mongoose Schema with a `role` Enum (`patient`, `doctor`, `admin`, `driver`, `super-admin`).
- **The Benefit (Authentication)**: When a user logs in, we only have to query `User.findOne({ email })`. If they were in separate tables, we would have to query 5 different tables just to find out who is trying to log in!
- **The Benefit (Relational Ease)**: The `Appointment` schema simply references `patientId: ObjectId(User)` and `doctorId: ObjectId(User)`. If they were separate collections, Mongoose `populate()` logic would become incredibly complex and slow.
- **Handling Differences**: Fields unique to a role (like a doctor's `specialization` or a driver's `vehicleNumber`) simply remain `undefined` for roles that don't need them. In a NoSQL document database like MongoDB, this is perfectly acceptable and highly performant.

### 5. How is Patient Data Privacy enforced?
**The Concept**: Doctors should not be able to freely browse any patient's entire medical history unless the patient is actively consulting them and explicitly grants access.
**The Execution**:
- The `User` schema has a `privacySettings.profileAccess` Map object.
- When a doctor requests access, it sends an API call creating an entry in the patient's `accessRequests` array.
- The patient clicks "Approve". This executes a `PUT` request that inserts the Doctor's `ObjectId` into the `privacySettings.profileAccess` Map with `approved: true`.
- **The Security Check**: When the Doctor attempts to fetch the history via `GET /api/appointments/patient/:id`, the Backend Controller *first* queries the Patient's document and firmly rejects the API call with a `403 Forbidden` if `profileAccess[doctorId]?.approved !== true`. The frontend cannot bypass this.

---

## 12. Deployment & Local Setup

### Live Platform Infrastructure
| Layer | Platform | URI Protocol |
|---|---|---|
| Frontend | **Vercel** | https:// |
| Backend API | **Render** | https:// (Containerized Express) |
| Database | **MongoDB Atlas** | mongodb+srv:// |
| Email Service | **Brevo API** | SMTP / API Key |

*Note on Production Image Uploads: The current app uses local disk storage (`/uploads`). Upon transitioning to a multi-node load balanced setup in Render, this will need to be swapped for `multer-s3` (AWS S3) or Cloudinary to avoid ephemeral filesystem purge.*

### Running Locally

**Database & Configuration:**
Configure `.env` in the `server` directory:
```
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=supersecret
CLIENT_URL=http://localhost:5173
BREVO_API_KEY=xkeysib-xxxx
```

**1. Machine Learning Microservice:**
```bash
cd server
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python train_model.py  # Export base .pkl
python app.py          # Starts on http://localhost:5001
```

**2. Backend Server:**
```bash
cd server
npm install
node index.js
# Runs logic & Socket.io on http://localhost:5000
```

**3. Frontend (React/Vite):**
```bash
cd my-app
npm install
npm run dev
# Starts client on http://localhost:5173
```

---

*Documentation compiled: February 2026*
