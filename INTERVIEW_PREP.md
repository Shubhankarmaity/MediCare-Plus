# Hospital Management System — Complete Interview Preparation Guide

> This document covers everything about this project: what every technology is, why it was chosen, how it works, and expected interview questions with answers.

---

## TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [Full Tech Stack](#2-full-tech-stack)
3. [System Architecture](#3-system-architecture)
4. [Backend — Node.js / Express](#4-backend--nodejs--express)
5. [Frontend — React](#5-frontend--react)
6. [Database — MongoDB](#6-database--mongodb)
7. [Authentication & Security](#7-authentication--security)
8. [AI Chatbot System](#8-ai-chatbot-system)
9. [Machine Learning — Hospital Recommendation](#9-machine-learning--hospital-recommendation)
10. [Real-Time Features — Socket.io & WebRTC](#10-real-time-features--socketio--webrtc)
11. [Email Service](#11-email-service)
12. [API Routes Reference](#12-api-routes-reference)
13. [Database Schemas — All 9 Models](#13-database-schemas--all-9-models)
14. [Expected Interview Questions & Answers](#14-expected-interview-questions--answers)

---

## 1. PROJECT OVERVIEW

**What is this project?**
A full-stack Hospital Management System that connects patients, doctors, hospital admins, ambulance drivers, and a super-admin. It includes an AI-powered medical chatbot, a machine learning hospital recommendation engine, real-time video calls between patients and doctors, live ambulance GPS tracking, and a health vitals monitoring system.

**User Roles (5 types):**
| Role | What they do |
|------|-------------|
| **Patient** | Book appointments, chat with doctors, track health vitals, request ambulance, view reports |
| **Doctor** | Manage appointments, write medical reports, video call patients, view patient history (with permission) |
| **Hospital Admin** | Approve doctors, assign appointment slots, manage hospital's users |
| **Ambulance Driver** | Accept/reject ambulance requests, share live GPS location |
| **Super Admin** | Manage all hospitals system-wide, trigger ML retraining, full platform control |

---

## 2. FULL TECH STACK

### Frontend
| Technology | Version | Why Used |
|-----------|---------|----------|
| **React** | 19.2.0 | Component-based UI, fast re-renders with virtual DOM |
| **Vite** | 5.1.0 | Extremely fast dev server (ESM-based, replaces Webpack) |
| **React Router DOM** | 7.9.6 | Client-side routing — no full page reloads |
| **Material-UI (MUI)** | 7.3.5 | Pre-built accessible components (buttons, modals, tables) |
| **Tailwind CSS** | 3.4.17 | Utility-first CSS — write styles directly in JSX |
| **Framer Motion** | 12.29.2 | Smooth page transitions and component animations |
| **Axios** | 1.13.4 | HTTP client — cleaner API calls than fetch, interceptor support |
| **Socket.io-client** | 4.8.1 | Real-time WebSocket communication with backend |
| **Simple-peer** | 9.11.1 | P2P WebRTC video calls (built on top of browser WebRTC API) |
| **Recharts** | 3.7.0 | Health vitals charts (blood pressure, blood sugar trends) |
| **Mapbox GL** | 3.17.0 | Map rendering for ambulance GPS tracking |
| **jsPDF** | 3.0.4 | Generate downloadable PDF medical reports |
| **html2canvas** | 1.4.1 | Convert HTML reports to images for PDF embedding |
| **Lucide React** | 0.554.0 | Icon library (1000+ clean icons) |
| **Emotion** | 11.14.0 | CSS-in-JS (required by MUI for component styling) |

### Backend
| Technology | Version | Why Used |
|-----------|---------|----------|
| **Node.js** | — | JavaScript runtime — same language as frontend (JS everywhere) |
| **Express** | 5.1.0 | Minimal web framework for REST API routing |
| **MongoDB** | — | NoSQL — flexible schema fits varied healthcare data |
| **Mongoose** | 8.20.0 | MongoDB ODM — schema validation, relationships, middleware hooks |
| **Socket.io** | 4.8.1 | WebSocket server for real-time features |
| **JSON Web Token (JWT)** | 9.0.2 | Stateless authentication — no session storage needed |
| **bcryptjs** | 3.0.3 | Password hashing — one-way, salted, timing-attack resistant |
| **Nodemailer / Brevo** | 6.9.0 | Send OTP and notification emails |
| **Multer** | 2.0.2 | Handle file uploads (profile pictures, documents) |
| **node-nlp** | 5.0.0 | Natural Language Processing for chatbot intent detection |
| **Fuse.js** | 7.1.0 | Fuzzy search — finds medical answers even with typos |
| **Axios** | 1.13.5 | HTTP client — Node.js uses it to call the Python ML service |
| **dotenv** | 16.3.1 | Load environment variables from .env file |

### Machine Learning (Python)
| Technology | Why Used |
|-----------|----------|
| **Python / Flask** | Separate microservice for ML — keeps Node.js backend clean |
| **scikit-learn** | KNN algorithm + TF-IDF vectorizer |
| **pandas** | Load and process hospital CSV dataset |
| **numpy** | Numerical operations for similarity scoring |
| **pymongo** | Connect Python ML service to MongoDB for live hospital data |

---

## 3. SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────┐
│                    REACT FRONTEND (Vite)                │
│  Port 5180 — SPA with 5 role-based dashboards           │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP (Axios) + WebSocket (Socket.io)
                       ▼
┌─────────────────────────────────────────────────────────┐
│               NODE.JS / EXPRESS BACKEND                 │
│  Port 5000 — REST API + Socket.io server                │
│  16 route files, 80+ endpoints                          │
└──────────┬────────────────────────┬────────────────────┘
           │ Mongoose ODM            │ Axios HTTP call
           ▼                         ▼
┌──────────────────┐      ┌──────────────────────────────┐
│  MongoDB Atlas   │      │   Python Flask ML Service    │
│  9 Collections   │      │   Port 5001                  │
│  (Cloud DB)      │      │   KNN + TF-IDF Prediction    │
└──────────────────┘      └──────────────────────────────┘
```

**Why microservice for ML?**
- Python has a vastly superior ML ecosystem (scikit-learn, numpy, pandas)
- Keeps Node.js focused on API and business logic
- ML service can be scaled independently
- Can retrain model without restarting the main server

---

## 4. BACKEND — NODE.JS / EXPRESS

### Main Server (server/index.js)

**Setup Flow:**
1. Load environment variables (dotenv)
2. Connect to MongoDB
3. Create Express app with CORS for frontend URLs
4. Register all 16 route files
5. Wrap Express with Node.js `http.createServer()` (required for Socket.io)
6. Attach Socket.io to the HTTP server
7. Register all Socket.io event handlers
8. Start listening on PORT 5000

**Why Express 5 (not 4)?**
Express 5 has native async error handling — no need to use `next(err)` in every async function.

**CORS Configuration:**
```javascript
// Allowed origins:
['http://localhost:5173', 'http://localhost:5179', 'http://localhost:5180', 'https://your-vercel-app.vercel.app']
```
Multiple localhost ports because Vite auto-increments port if busy.

**Socket.io Injection Pattern:**
```javascript
app.use((req, res, next) => {
  req.io = io; // Attach socket instance to every request
  next();
});
```
This lets controllers emit real-time events to clients.

### Controllers

**authController.js — Authentication:**
- `register()` — Role-specific registration, OTP generation, email verification
- `login()` — bcrypt comparison, JWT generation, role-based response
- `verifyEmail()` — Validates 6-digit OTP, marks user as verified
- `forgotPassword()` / `resetPassword()` — OTP-based password reset
- `updateProfile()` — Role-aware field updates
- `grantProfileAccess()` / `revokeProfileAccess()` — Patient controls who sees their records

**appointmentController.js — Appointment Flow:**
- `bookAppointment()` — Patient requests → status: "requested"
- `assignAppointment()` — Admin approves + sets date/time → status: "approved"
- `rejectAppointment()` — Admin rejects with reason
- `submitReport()` — Doctor marks complete + writes diagnosis/prescription → status: "completed"
- `getDoctorSlots()` — Returns doctor's available days/times + existing bookings

**Status flow:** `requested → approved → completed` (or `rejected`)

**chatbotController.js — AI Chatbot:**
(Covered in detail in Section 8)

**doctorController.js — Doctor Management:**
- `getAllDoctors()` — Scoped to patient's hospital (no cross-hospital visibility)
- `getPatientById()` — Checks privacy permission before returning patient data
- `getPublicDoctors()` — Top 8 doctors for public landing page

---

## 5. FRONTEND — REACT

### Project Structure
```
my-app/src/
├── App.jsx          — Root component
├── main.jsx         — App entry point with ErrorBoundary
├── config.js        — API URL from environment variable
├── components/      — 21 reusable components
├── pages/           — 17 page-level components
└── services/        — API service modules (axios calls)
```

### Routing (React Router v7)
All routes are defined in `AnimatedRoutes.jsx`. Every route is wrapped in a `PageTransition` component that uses Framer Motion for fade+slide animations.

**Public routes:** `/`, `/hospitals`, `/doctors`, `/ambulance`, `/lab-tests`
**Auth routes:** `/login`, `/signup`, `/forgot-password`
**Private dashboards:** `/patient-dashboard`, `/doctor-dashboard`, `/admin-dashboard`, `/driver-dashboard`, `/super-admin-dashboard`

### State Management
**No Redux** — intentionally kept simple:
- `useState` for local component state (forms, UI)
- `localStorage` for persisting auth token + user object
- `useRef` for video streams and socket connections

**Why no Redux?**
The app doesn't have complex shared state across many unrelated components. localStorage + component state was sufficient and simpler to implement.

### API Layer (services/)
**api.js — Axios instance with interceptor:**
```javascript
const api = axios.create({ baseURL: API_URL });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```
**Why interceptor?** Write the auth header code once. Every single API call is automatically authenticated without repeating `headers: { Authorization: ... }` everywhere.

### Key Pages

**PatientDashboard.jsx — 11 tabs:**
Overview, Find Doctors, My Appointments, Health Vitals, Prescriptions, Book Ambulance, My Reports, Access Requests, Messages, Payments, Settings

**DoctorDashboard.jsx:**
Active appointments, Completed appointments, Medical report writing, Video call initiation

**AdminDashboard.jsx:**
Doctor approval/rejection, Appointment assignment, User statistics, Slot management

### PDF Report Generation
```
Doctor fills in report form
    ↓
html2canvas captures the HTML element as canvas/image
    ↓
jsPDF converts to PDF binary
    ↓
Browser downloads the file
```

### Design System
- **Primary color:** Navy Blue `#1A365D` (trust, healthcare)
- **Accent:** Teal `#319795` (modern, clinical)
- **Background:** Off-white `#F7FAFC` (reduces eye strain)
- **Font:** Inter (clean, readable for medical text)
- Consistent spacing and shadow tokens across all components

---

## 6. DATABASE — MONGODB

### Why MongoDB (over SQL)?
| Reason | Explanation |
|--------|-------------|
| **Flexible schema** | Patient and Doctor profiles have very different fields — SQL would need complex joins |
| **JSON-native** | Data flows directly from frontend (JSON) → Node.js → MongoDB without format conversion |
| **Embedded documents** | `privacySettings` map embeds doctor access permissions directly in User document |
| **Horizontal scaling** | MongoDB Atlas handles sharding for growth |
| **Atlas cloud** | Free tier available, easy to deploy |

### Mongoose ODM
- Defines schemas with type validation
- `.populate()` replaces ObjectId references with actual documents
- Pre-save hooks (e.g., password hashing before saving)
- Virtuals for computed fields
- Index definitions for query performance

### Indexes Used
| Model | Field Indexed | Reason |
|-------|--------------|--------|
| User | `email` | Fast login lookup |
| User | `role` | Filter by user type |
| Hospital | `city` | Search hospitals by city |
| Appointment | `patientId`, `doctorId`, `hospitalId` | Fast appointment queries |
| ChatbotAnalytics | `matchSource`, `createdAt` | Analytics aggregations |
| Vitals | `patientId`, `date` (desc) | Time-series health queries |

---

## 7. AUTHENTICATION & SECURITY

### JWT (JSON Web Token)

**How it works:**
1. User logs in with email + password
2. Server verifies password with bcrypt
3. Server creates token: `jwt.sign({id, role}, JWT_SECRET, {expiresIn: '7d'})`
4. Frontend stores token in `localStorage`
5. Every request includes: `Authorization: Bearer <token>`
6. Server middleware decodes + verifies: `jwt.verify(token, JWT_SECRET)`
7. Decoded `{id, role}` attached to `req.user` for controllers to use

**Why JWT over Sessions?**
- Stateless — no server-side session storage needed
- Works perfectly with REST APIs
- Token contains the user's role so every controller knows who's calling
- Easy to use across multiple servers/microservices

**Token Structure (3 parts, Base64 encoded):**
```
HEADER.PAYLOAD.SIGNATURE
eyJhbGciOiJIUzI1NiJ9 . eyJpZCI6IjEyMyIsInJvbGUiOiJwYXRpZW50In0 . HMAC_SHA256_signature
```

### Password Security with bcryptjs
```javascript
// Registration — hash before saving
const salt = await bcrypt.genSalt(10);
user.password = await bcrypt.hash(plainPassword, salt);

// Login — compare
const isMatch = await bcrypt.compare(inputPassword, user.password);
```
**Why bcrypt?**
- One-way: cannot reverse the hash to get password
- Salt: random string added before hashing — prevents rainbow table attacks
- Cost factor 10: slow enough to resist brute force, fast enough for users

### OTP Email Verification
- 6-digit random OTP generated on registration
- Valid for 10 minutes (`otpExpires = now + 10min`)
- Stored hashed? No — stored plaintext for simplicity (improvement area)
- After verification: `isVerified = true`, OTP fields cleared

### Role-Based Access Control (RBAC)
Not via middleware — done inside each controller:
```javascript
// Example: Only doctors can submit reports
if (req.user.role !== 'doctor') return res.status(403).json({message: 'Forbidden'});
```

### Patient Privacy System
Doctors cannot see patient medical history by default. Patient must grant access:
```javascript
// Patient's document
privacySettings: {
  profileAccess: Map {
    "doctorId-123": {
      approved: true,
      expiresAt: Date,       // optional — access expires after time
      singleUse: true,       // optional — expires after first view
      used: false
    }
  }
}
```

---

## 8. AI CHATBOT SYSTEM

### Overall Pipeline (chatbotController.js)

```
User types query
     ↓
1. Spell Correction (Levenshtein distance)
     ↓
2. Synonym Expansion ("bp" → "blood pressure")
     ↓
3. Emergency Keyword Check (immediate response if matches)
     ↓
4. NLP Intent Classification (node-nlp model)
     ↓
5. Route to handler based on intent:
   ├── hospital.recommendation → Call Python ML service
   ├── medical.info → 3-tier KB lookup
   ├── emergency.sos → Emergency protocol
   └── website.navigation → Site help
     ↓
6. Log to ChatbotAnalytics collection
     ↓
7. Return response with confidence score
```

### Spell Correction (utils/spellCheck.js)
**Algorithm: Levenshtein Distance**
- Measures minimum edits (insert/delete/replace) to convert one word to another
- Edit distance ≤ 2 for a match (handles 2-character mistakes)
- Dictionary: 100+ medical terms
- Only corrects words ≥ 4 characters (prevents "is" → "ice" false corrections)
- Example: "diarrea" (distance 1) → "diarrhea" ✓

**What is Levenshtein distance?**
`"kitten"` → `"sitting"` = 3 operations (substitute k→s, substitute e→i, insert g)

### Synonym Expansion (utils/synonyms.js)
- 80+ mappings including abbreviations AND Hindi/colloquial terms
- Examples:
  - "bp" → "blood pressure"
  - "sugar problem" → "diabetes blood sugar"
  - "pet dard" (Hindi) → "stomach pain abdominal"
  - "loose motion" → "diarrhea loose stool"
- Checks full query, individual tokens, and bigrams (pairs of words)

### Emergency Detection
Hardcoded keyword array checked FIRST before any NLP:
```javascript
EMERGENCY_KEYWORDS = ['heart attack', 'stroke', 'can\'t breathe', 'unconscious',
  'severe bleeding', 'choking', 'poisoning', 'overdose', 'suicide',
  'anaphylaxis', 'cardiac arrest', ...]
```
Returns 🚨 response with emergency number 112 + first aid instructions.
**Why hardcoded?** Safety-critical — cannot risk NLP misclassifying emergencies.

### NLP Intent Detection (node-nlp)
- Pre-trained model loaded from `nlp_model.nlp` file on server startup
- 9 intent classes with 220+ training utterances
- Returns: `{intent, score}` — if score < 0.5, falls back to keyword matching
- Intents: `greeting`, `farewell`, `thanks`, `medical.info`, `hospital.recommendation`, `emergency.sos`, `website.navigation`, `appointment.query`, `insurance.query`

**What is NLP/Intent Detection?**
It's text classification — given a sentence, predict which category/intent it belongs to. `node-nlp` uses a neural network trained on labeled text examples.

### Medical Knowledge Base (medicalKnowledge.js)
- ~15,000+ lines of structured medical data
- Each entry: `{keywords[], category, severity, followUpQuestions[], answer}`
- Severity levels: `info` (green), `caution` (yellow), `danger` (red 🚨)

**3-Tier Lookup Strategy:**
1. **Direct keyword match** — exact string matching (fastest, 95% confidence)
2. **Fuse.js fuzzy search** — handles spelling variations, partial matches
3. **Fallback** — "I couldn't find that. Try rephrasing or I can recommend a hospital."

### Fuse.js Fuzzy Search
```javascript
const fuse = new Fuse(MEDICAL_KB, {
  keys: [
    {name: 'keywords', weight: 0.7},   // Keywords matter most
    {name: 'category', weight: 0.2},
    {name: 'answer', weight: 0.1}
  ],
  threshold: 0.35  // 0=perfect match, 1=match anything
});
```
**Why Fuse.js?** It uses a bitap algorithm for fuzzy matching — finds results even if query has typos or uses slightly different words than the keywords.

### Analytics Tracking (ChatbotAnalytics model)
Every chatbot query is logged:
- Original query, corrected query, expanded query
- Intent, confidence score, match source
- Response time in milliseconds
- User ID (if logged in)
- Feedback (helpful / not_helpful)

**Why track this?** To measure chatbot performance, find gaps in knowledge base, and identify common queries that are failing.

---

## 9. MACHINE LEARNING — HOSPITAL RECOMMENDATION

### Algorithm: KNN with TF-IDF (K-Nearest Neighbors + Term Frequency-Inverse Document Frequency)

**Why KNN?**
- Simple and interpretable — easy to explain: "we found the 3 hospitals most similar to your symptoms"
- No assumptions about data distribution
- Naturally handles multi-label scenarios (conditions can match multiple specialties)
- Fast inference (< 50ms) for real-time user queries

**Why TF-IDF?**
- Converts text (hospital profiles + symptoms) into numerical vectors
- TF (Term Frequency): How often does a word appear in this document?
- IDF (Inverse Document Frequency): How unique is this word across all documents?
- Result: common words like "hospital", "care" get low scores; specific terms like "cardiology", "ICU" get high scores
- Bigrams (1-2 word combinations): "chest pain", "heart attack" treated as single features

### Training Process (train_model.py / app.py)

**Step 1: Build Hospital Profiles**
For each hospital, create a weighted text string:
```python
profile = f"""
{specialties} {specialties} {specialties}   # Repeated 3x for heavy weight
emergency={hasEmergency} icu={hasICU} ot={hasOT}
insurance={insuranceCompany} cashless={cashlessAvailable}
"""
# PLUS symptom-to-specialty mapping injections:
# "cardiology" → also adds: "heart chest pain bp hypertension attack"
# "orthopedics" → also adds: "bone fracture joint spine back pain"
```

**Step 2: TF-IDF Vectorization**
```python
vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1,2))
X = vectorizer.fit_transform(hospital_profiles)
# Result: each hospital = vector of 500-2000 dimensions
```

**Step 3: Train KNN**
```python
knn = NearestNeighbors(n_neighbors=3, metric='cosine')
knn.fit(X)
```

**Step 4: Prediction**
```python
query_vector = vectorizer.transform([user_symptoms])
distances, indices = knn.kneighbors(query_vector)
# Distance 0 = identical, Distance 1 = completely different
score = 100 - (distance × 50)  # Convert to 50-99 match score
```

**Step 5: Filter & Return**
The Node.js backend calls `POST /predict` → gets hospital IDs + scores → cross-references MongoDB to get full hospital details → filters by user's insurance company → returns ranked list.

### Rule-Based Scoring (hospitals.js route)
A second, non-ML approach also exists:
| Criterion | Points |
|-----------|--------|
| Specialty matches condition | 35 pts |
| Has ICU (for serious conditions) | 20 pts |
| Has Emergency Services | 15 pts |
| Rating (0-5 → 0-15 pts) | 15 pts |
| NABH Accreditation | 10 pts |
| Cashless Available | 5 pts |
| **Total** | **100 pts** |

### Haversine Formula (Distance Calculation)
Used in `/ai-recommend` to factor in distance:
```javascript
// Earth's radius = 6371 km
// Converts lat/lng difference to actual distance in km
const dLat = (lat2 - lat1) × (π/180);
const dLon = (lon2 - lon1) × (π/180);
const a = sin²(dLat/2) + cos(lat1)×cos(lat2)×sin²(dLon/2);
const distance = 2 × arctan(√a, √(1-a)) × 6371;
```

---

## 10. REAL-TIME FEATURES — SOCKET.IO & WEBRTC

### Socket.io Architecture
```
Frontend                    Backend
socket.io-client     ←→     socket.io server
Port 5180            ←→     Port 5000 (same as REST API)
WebSocket protocol           Rooms = userId strings
```

**Why Socket.io over raw WebSockets?**
- Auto-reconnection on network drops
- Room management built-in
- Fallback to HTTP long-polling if WebSockets unavailable
- Cross-browser compatible

### Events

| Event | Direction | Purpose |
|-------|-----------|---------|
| `join_room(userId)` | Client → Server | User joins personal room for targeted messages |
| `send_location(data)` | Driver → Server | Ambulance GPS coordinates |
| `receive_location` | Server → All | Broadcast driver location to patients/admins |
| `sos_alert(data)` | Patient → Server | Emergency — dispatches all available drivers |
| `dispatch_ambulance` | Server → Drivers | Notifies all drivers of SOS |
| `callUser(data)` | Caller → Server | Initiate WebRTC call with signal |
| `answerCall(signal)` | Callee → Server | Accept call, send back signal |
| `ice-candidate(candidate)` | Both → Server | WebRTC ICE for NAT traversal |
| `endCall` | Either → Server | Terminate call |
| `receive_message` | Server → Client | New chat message |

### Video Calls — WebRTC + Simple-peer

**How WebRTC P2P video works:**

```
Step 1: SIGNALING (via Socket.io)
  Doctor clicks "Call Patient"
  → Peer A creates "offer" (contains SDP — Session Description Protocol)
  → Send offer to Patient via Socket.io (callUser event)
  
Step 2: ANSWER
  Patient receives call, accepts
  → Peer B creates "answer" SDP
  → Send answer back via Socket.io (answerCall event)

Step 3: ICE CANDIDATES
  Both peers discover public IPs via STUN server
  → Exchange ICE candidates via Socket.io
  → NAT traversal established

Step 4: P2P CONNECTION
  Video/audio streams flow DIRECTLY between browsers
  (No data goes through your server after signaling!)
```

**Why P2P?** Video data bypasses the server entirely after connection — massive bandwidth savings. The server only helps with the initial handshake.

**Simple-peer** is a wrapper that simplifies the raw WebRTC API into a simpler `Peer` object with event emitters.

---

## 11. EMAIL SERVICE

### Brevo (formerly Sendinblue) SMTP
- **Why not Gmail SMTP?** Gmail has send limits and requires less secure app setting — not production-suitable
- **Why Brevo?** Free tier (300 emails/day), reliable SMTP, good deliverability
- **Fallback:** If `BREVO_API_KEY` is missing, emails are logged to console (graceful degradation — server doesn't crash)

**Email Types Sent:**
1. OTP verification on registration (6-digit code, 10-min expiry)
2. OTP for password reset
3. Appointment confirmation notifications

---

## 12. API ROUTES REFERENCE

### Authentication Routes (`/`)
```
POST   /register                    — Register new user (5 roles)
POST   /login                       — Login with email+password
POST   /verify-email                — Submit OTP to verify email
POST   /resend-otp                  — Get a new OTP
POST   /forgot-password             — Request password reset OTP
POST   /reset-password              — Set new password with OTP
GET    /profile                     — Get own profile [auth required]
PUT    /profile                     — Update own profile [auth required]
POST   /profile/grant-access        — Patient grants doctor profile access
POST   /profile/revoke-access       — Patient revokes doctor access
```

### Hospital Routes (`/api/hospitals`)
```
GET    /                            — Get all hospitals
GET    /:id                         — Get hospital by ID
GET    /search?city=&insurance=     — Search hospitals
POST   /recommend                   — Rule-based recommendation (symptoms)
POST   /ai-recommend                — KNN ML recommendation (multi-factor)
```

### Appointment Routes (`/api/appointments`)
```
POST   /book                        — Patient books appointment [patient]
GET    /my-appointments             — Patient sees their appointments [patient]
GET    /doctor/my-appointments      — Doctor sees their appointments [doctor]
PUT    /assign/:id                  — Admin assigns date/time [admin]
PUT    /reject/:id                  — Admin rejects request [admin]
PUT    /submit-report/:id           — Doctor submits report [doctor]
GET    /hospital                    — Admin sees hospital's appointments [admin]
GET    /slots/:doctorId             — Get doctor's available slots
```

### Doctor Routes (`/api/doctors`)
```
GET    /                            — List approved doctors [auth]
GET    /public                      — Top 8 doctors (public, no auth)
GET    /patient/:patientId          — View patient details [doctor, with access]
PUT    /profile                     — Update doctor profile [doctor]
```

### Chatbot Routes (`/api/chatbot`)
```
POST   /ask                         — Ask medical question (public)
POST   /feedback                    — Submit feedback on answer
GET    /analytics                   — 30-day chatbot stats [admin]
GET    /health-summary/:patientId   — Personalized health summary [auth]
```

### Admin Routes (`/api/admin`)
```
GET    /dashboard                   — Hospital stats [admin]
GET    /users                       — All users in hospital [admin]
PUT    /approve-doctor/:id          — Approve doctor [admin]
PUT    /reject-doctor/:id           — Reject doctor [admin]
PUT    /assign-department/:id       — Assign department to doctor [admin]
DELETE /user/:id                    — Remove user from hospital [admin]
```

### Super Admin Routes (`/api/super-admin`)
```
GET    /stats                       — Global system statistics
POST   /hospital                    — Create new hospital + auto admin user
PUT    /hospital/:id                — Update hospital
DELETE /hospital/:id                — Delete hospital
GET    /users                       — All users system-wide
POST   /retrain-ml                  — Trigger ML model retraining
```

### Other Routes
```
POST   /api/ambulance/book          — Book ambulance
POST   /api/messages                — Send message
GET    /api/notifications           — Get notifications
POST   /api/vitals                  — Log health vitals
GET    /api/payments                — Payment history
```

---

## 13. DATABASE SCHEMAS — ALL 9 MODELS

### User Model
```javascript
{
  name, email, password (hashed),
  role: enum['patient','doctor','admin','super-admin','driver'],
  
  // Verification
  otp, otpExpires, isVerified: Boolean,
  
  // Doctor approval
  approvalStatus: enum['pending','approved','rejected'],
  approvedBy: ObjectId(ref:User),
  
  // Privacy system (patient)
  privacySettings: {
    profileAccess: Map<String, { approved, expiresAt, singleUse, used }>
  },
  accessRequests: Map<String, { status, respondedAt, expiresAt }>,
  
  // Patient fields
  phone, age, gender, bloodGroup, medicalHistory, allergies,
  emergencyContact, hasMediclaim, mediclaimProvider,
  hospitalId: ObjectId(ref:Hospital),
  
  // Doctor fields
  specialization, qualification, licenseNumber,
  consultationFee, availableDays, availableTime,
  
  // Driver fields
  driverLicenseNumber, vehicleNumber, isAvailable,
  location: { lat, lng }
}
```

### Hospital Model
```javascript
{
  name, address, city, phone, email, website,
  specialties, hospitalType,
  hasICU, hasEmergency, hasOT: Boolean,     // ML training features
  insuranceCompany, cashlessAvailable,       // ML feature + patient filter
  consultationFee, avgRoomCost, avgSurgeryCost,
  rating, totalReviews,
  naabhAccredited: Boolean,                  // Quality certification
  lat, lng, distanceFromCity,
  csvHospitalId: String (unique, sparse)    // For deduplication on bulk import
}
```

### Appointment Model
```javascript
{
  patientId, doctorId, hospitalId: ObjectId (all indexed),
  status: enum['requested','approved','completed','rejected','cancelled'],
  
  // Scheduling
  preferredDate: Date,     // Patient's requested date
  assignedDate: Date,      // Admin's assigned actual date
  assignedTimeSlot: String,
  assignedBy: ObjectId,    // Which admin approved it
  
  // Medical info
  symptoms: String,
  isEmergency: Boolean,
  
  // Doctor report (filled after visit)
  doctorReport: {
    diagnosis, prescription, dosage, duration,
    testsRecommended, followUpDate: Date,
    severity: enum['Low','Medium','High','Critical']
  }
}
```

### AmbulanceRequest Model
```javascript
{
  patientId, driverId: ObjectId,
  location: { lat, lng, address },
  status: enum['pending','accepted','completed','cancelled'],
  requestedAt, acceptedAt, completedAt: Date
}
```

### ChatbotAnalytics Model
```javascript
{
  query, correctedQuery, expandedQuery: String,
  intent, confidence: Number,
  matchSource: enum['nlp','fuse','keyword','fallback'],
  responseTimeMs: Number,
  userId: ObjectId,
  feedback: enum['helpful','not_helpful'],
  feedbackComment: String,
  // Indexes: matchSource, createdAt
}
```

### Message Model
```javascript
{ senderId, receiverId: ObjectId, content: String, read: Boolean }
```

### Notification Model
```javascript
{
  userId: ObjectId,
  type: enum['REGISTRATION','APPOINTMENT_REQUEST','APPOINTMENT_ASSIGNED',
             'APPOINTMENT_REJECTED','APPOINTMENT_CANCELLED'],
  message: String,
  read: Boolean,
  relatedId: ObjectId
}
```

### Payment Model
```javascript
{
  patientId, doctorId, appointmentId: ObjectId,
  amount: Number,
  currency: String (default: 'INR'),
  status: enum['pending','completed','failed','refunded']
}
```

### Vitals Model
```javascript
{
  patientId: ObjectId (indexed),
  date: Date (indexed desc),
  systolic, diastolic: Number,   // Blood pressure
  heartRate: Number,
  bloodSugar: Number,
  weight: Number,
  temperature: Number
}
```

---

## 14. EXPECTED INTERVIEW QUESTIONS & ANSWERS

### GENERAL PROJECT QUESTIONS

**Q: Tell me about this project.**
A: "I built a full-stack Hospital Management System. It connects 5 types of users — patients, doctors, hospital admins, ambulance drivers, and a super admin. The core features are: an AI medical chatbot that answers health questions and recommends hospitals using ML, real-time video consultations between patients and doctors using WebRTC, live ambulance tracking with Socket.io, and a health vitals tracker. Tech stack: React + Vite on the frontend, Node.js + Express + MongoDB on the backend, and a separate Python Flask microservice for the KNN recommendation ML model."

**Q: What was the most challenging part?**
A: "The most challenging was implementing the real-time video call system. WebRTC has a complex handshake: the caller creates an SDP offer, the callee creates an answer, then both sides must exchange ICE candidates for NAT traversal. I used Socket.io as the signaling server for this handshake and Simple-peer to simplify the WebRTC API. Getting the ICE candidate exchange right and handling edge cases like one party dropping mid-call took significant debugging."

**Q: How would you improve this project?**
A: "Several improvements: (1) Add Redis for caching frequently-queried hospital data, (2) Implement refresh tokens alongside JWT for better security, (3) Add rate limiting to prevent API abuse, (4) Set up Jest unit tests for controllers, (5) Add TURN server for WebRTC in restrictive corporate networks, (6) Hash OTPs before storing them in the database."

---

### REACT QUESTIONS

**Q: Why did you use React over Angular or Vue?**
A: "React has a huge ecosystem and the largest community. Its component-based architecture made it easy to build reusable pieces like the ChatWindow, VideoCall component, and Notification Bell. The virtual DOM handles efficient updates. Also, with 5 different dashboard types each with many tabs, React's composability was very helpful."

**Q: What is the Virtual DOM?**
A: "React maintains a lightweight copy of the real DOM in memory. When state changes, React first updates the virtual DOM, then diffs it with the previous version to find the minimum changes needed, then batch-applies only those changes to the real DOM. This avoids expensive full page re-renders."

**Q: What is Vite and why use it over Create React App?**
A: "Vite is a modern build tool that uses native ES modules during development — no bundling step needed, so the dev server starts in milliseconds. Create React App uses Webpack which bundles everything upfront, making startup slow on large projects. Vite also uses Rollup for production builds which produces smaller, optimized bundles."

**Q: How does authentication work on the frontend?**
A: "After successful login, the JWT token and user object are stored in localStorage. An Axios request interceptor automatically reads the token from localStorage and adds it as an `Authorization: Bearer <token>` header on every API request. This way, I write the auth logic once and it works for all 80+ API calls automatically. On logout, localStorage is cleared."

**Q: Why useState and localStorage instead of Redux?**
A: "For this project's scale, global state isn't needed. Each dashboard has its own data fetched from the API on mount. The only truly global data is the auth token and user info, which localStorage handles well. Adding Redux would add complexity (actions, reducers, store setup) without significant benefit."

**Q: What is React Router and what is the difference between client-side and server-side routing?**
A: "React Router handles navigation in a Single Page Application. In server-side routing, every URL change triggers a browser request to the server for a new HTML page. In client-side routing, the JavaScript code intercepts the URL change, fetches only the data needed, and replaces only the relevant part of the DOM — much faster because no full page reload. The Vercel config has a rewrite rule `/* → /index.html` so all routes return the React app and React Router handles the rest."

**Q: What is Framer Motion used for?**
A: "Page transitions. Every route change triggers a fade+slide animation (the `PageTransition` component wraps every page). This makes the app feel polished and professional. Framer Motion provides declarative animation via `initial`, `animate`, and `exit` props."

---

### NODE.JS / EXPRESS QUESTIONS

**Q: Why Node.js for the backend?**
A: "Node.js is event-driven and non-blocking — it handles many concurrent connections without spawning threads, making it perfect for real-time features and I/O-heavy operations like database queries. Using JavaScript on both frontend and backend also means no context switching in the codebase."

**Q: What is middleware in Express?**
A: "Functions that sit between the request and response, processing or checking the request. In this project, the `auth.js` middleware verifies the JWT token on every protected route. Middleware runs in a pipeline: `request → [cors] → [express.json()] → [auth middleware] → [route handler] → response`."

**Q: How does CORS work?**
A: "Browsers enforce the Same-Origin Policy — a page at `localhost:5180` cannot fetch from `localhost:5000` by default. CORS (Cross-Origin Resource Sharing) is a set of HTTP headers that the server sends to tell the browser which origins are allowed. My backend sets `Access-Control-Allow-Origin` to the allowed frontend URLs."

**Q: What is the difference between async/await and callbacks?**
A: "Callbacks lead to 'callback hell' — deeply nested code that's hard to read and error. Promises improved this with `.then()` chains. Async/await is syntactic sugar over Promises — makes async code look synchronous, much more readable. I used async/await throughout all controllers with try-catch for error handling."

**Q: How does Socket.io work?**
A: "Socket.io wraps WebSockets with fallbacks. When a client connects, it tries WebSocket first. If that fails (in some corporate networks), it falls back to HTTP long-polling. Rooms in Socket.io are like channels — `socket.join(userId)` lets the server target events to one specific user with `io.to(userId).emit(event, data)`."

---

### MONGODB QUESTIONS

**Q: Why MongoDB over PostgreSQL for this project?**
A: "The User schema is highly variable — patients have medicalHistory and insurance fields, doctors have specialization and licenseNumber, drivers have vehicle info. In SQL, this would require either many nullable columns or complex joined tables. MongoDB's flexible documents handle this naturally. Also, the `privacySettings.profileAccess` is a Map of dynamic keys (doctor IDs) which maps naturally to MongoDB subdocuments."

**Q: What is Mongoose and what does it add over the raw MongoDB driver?**
A: "Mongoose adds a schema layer with type validation, default values, and validators. It provides `.populate()` to automatically replace ObjectId references with actual documents (similar to SQL JOINs). It also adds lifecycle hooks like pre-save (used conceptually for password hashing) and instance/static methods."

**Q: What is an index in MongoDB and why is it important?**
A: "Without an index, MongoDB scans every document to find matches (O(n) full collection scan). An index is a sorted data structure (B-tree) over a specific field that makes queries O(log n). For example, `User` has an index on `email` so login queries find users in milliseconds even with millions of users. The `Vitals` collection has a compound index on `{patientId, date: -1}` for efficient time-series health data queries."

**Q: What is the ObjectId in MongoDB?**
A: "MongoDB auto-generates a 12-byte unique identifier for every document. It encodes: 4 bytes Unix timestamp + 5 bytes machine/process ID + 3 bytes random counter. This means ObjectIds are roughly sortable by creation time. References between collections (like `Appointment.patientId`) store these IDs and Mongoose `.populate()` resolves them."

---

### MACHINE LEARNING QUESTIONS

**Q: Explain the hospital recommendation ML model.**
A: "I used K-Nearest Neighbors with TF-IDF text vectorization. First, I build a text profile for each hospital by concatenating its specialties (repeated 3 times for emphasis), infrastructure flags (ICU, Emergency), and insurance info. TF-IDF converts these text profiles into numerical vectors where medically specific terms like 'cardiology' or 'ICU' score higher than generic words. I also inject symptom-to-specialty mappings so 'chest pain' and 'heart attack' semantically link to cardiology hospitals. KNN with cosine similarity then finds the 3 most similar hospital vectors to the user's symptom query vector."

**Q: What is TF-IDF?**
A: "TF-IDF stands for Term Frequency-Inverse Document Frequency. TF is how often a term appears in a document. IDF is the log of (total documents / documents containing the term) — rare terms get higher scores. Multiplying them gives a weight that rewards terms that are important in a specific document but rare across all documents. This filters out common words like 'the', 'and' and highlights domain-specific terms."

**Q: What is cosine similarity?**
A: "A measure of similarity between two vectors based on the angle between them. The dot product of two unit vectors gives cosine of the angle — 1 means identical direction (identical content), 0 means perpendicular (no overlap). For text, two documents about the same topic will have vectors pointing in similar directions even if they have different lengths."

**Q: Why a separate Python service for ML?**
A: "Python has the best ML ecosystem — scikit-learn, numpy, pandas are battle-tested and fast. While Node.js has some ML libraries, they're immature. By making it a microservice on port 5001, Node.js calls `POST /predict` via HTTP, gets results, and continues. This separation also means: the ML model can be retrained without restarting the main server, the service can be scaled independently, and any Python ML library can be swapped in."

---

### CHATBOT QUESTIONS

**Q: How does the NLP chatbot work?**
A: "It's a multi-stage pipeline. First, spell correction using Levenshtein distance fixes typos. Then synonym expansion converts abbreviations and colloquial terms to medical terms. Emergency keywords are checked immediately — if matched, an emergency response is returned instantly. Otherwise, node-nlp classifies the intent using a pre-trained neural model. Based on the intent, the query is routed: hospital recommendation goes to the Python ML service, medical info triggers a 3-tier search (direct keyword → Fuse.js fuzzy → fallback). Every query is logged for analytics."

**Q: What is the Levenshtein distance algorithm?**
A: "A dynamic programming algorithm that computes the minimum number of single-character edits (insertions, deletions, substitutions) needed to transform one string into another. The DP table has rows and columns for each character of the two strings. The final cell gives the total edit distance. I used distance ≤ 2 to find the closest medical dictionary word to fix typos."

**Q: What is Fuse.js used for?**
A: "Fuzzy string searching. Unlike exact match, Fuse.js finds results even when the query doesn't exactly match any keyword. It uses a weighted scoring where keywords get 70% weight, category 20%, and answer text 10% — making keyword matches most important for medical accuracy. Threshold 0.35 means moderately loose matching."

---

### WEBRTC / REAL-TIME QUESTIONS

**Q: How does WebRTC video calling work?**
A: "WebRTC is a browser API for peer-to-peer media communication. The process: (1) Caller creates an SDP offer (describes its media capabilities), (2) Offer is sent via Socket.io to the callee, (3) Callee creates an SDP answer and sends it back via Socket.io, (4) Both sides gather ICE candidates — network addresses discovered via STUN server — and exchange them via Socket.io, (5) Once ICE completes, a direct P2P connection is established and video/audio streams flow peer-to-peer without going through the server."

**Q: What is STUN/TURN?**
A: "STUN (Session Traversal Utilities for NAT) helps peers discover their public IP addresses behind NAT routers. TURN (Traversal Using Relays around NAT) is a relay server for cases where direct P2P is impossible (symmetric NAT, firewalls). This project uses only STUN — in production, TURN would be needed for reliability in corporate networks."

**Q: Why is Socket.io needed if WebRTC is P2P?**
A: "WebRTC needs a signaling channel to exchange SDP offers/answers and ICE candidates before the P2P connection is established. This signaling requires a server intermediary. Socket.io serves as that signaling server. Once the handshake is complete, the video stream is P2P and Socket.io is no longer involved in the call."

---

### SECURITY QUESTIONS

**Q: How do you prevent SQL injection?**
A: "This project uses MongoDB (NoSQL) with Mongoose. Mongoose schemas type-check all inputs — if a field expects a String, it won't execute as a query operator. For extra safety, any user input used in queries should validate that it's not an object with `$where` or `$gt` operators. This project could add `express-mongo-sanitize` as a middleware improvement."

**Q: How is XSS prevented?**
A: "The React framework itself prevents XSS by default — JSX expressions are automatically escaped so `<script>` tags in user input render as text, not code. API responses are also served as JSON, not HTML. An improvement would be adding a Content Security Policy header."

**Q: What security vulnerabilities exist in this project?**
A: "I can identify a few: (1) The JWT_SECRET has a default fallback value in middleware — this should throw an error if not set in production. (2) OTPs are stored plaintext — they should be hashed. (3) No rate limiting on login endpoint — vulnerable to brute force. (4) No CSRF protection for state-changing endpoints. These are good improvement points I'd address in production."

**Q: Why bcrypt over MD5 or SHA-256 for passwords?**
A: "MD5 and SHA-256 are fast hash functions — that's good for checksums but bad for passwords because attackers can try billions of hashes per second. bcrypt is intentionally slow (cost factor 10 makes it ~100ms per hash) and salted (random data added before hashing so identical passwords produce different hashes). This makes brute force and rainbow table attacks impractical."

---

### DEPLOYMENT QUESTIONS

**Q: How is this project deployed?**
A: "Frontend is deployed on Vercel. The `vercel.json` has a rewrite rule that sends all requests to `/index.html` so React Router works correctly. Backend would be on a Node.js hosting platform (Render, Railway, etc.) with environment variables set. The Python ML service runs as a separate service. MongoDB is hosted on MongoDB Atlas cloud."

**Q: What are environment variables and why use them?**
A: "Sensitive configuration values (database URI, JWT secret, API keys, email credentials) that should not be in source code. If hardcoded, they'd be exposed in git history. Environment variables are set on the server/hosting platform and loaded via `dotenv` in development. The `.env` file is gitignored."

---

### BEHAVIORAL / DESIGN QUESTIONS

**Q: How did you design the 5-role permission system?**
A: "I identified the different user types and their specific capabilities, then built role checks into each controller function. The JWT token stores the user's role, so every request knows who's calling. Rather than a complex permission matrix, each controller method has simple role checks at the top. The most complex permission is the patient-doctor privacy system which uses a Map with expiry and single-use flags."

**Q: Why did you use a microservices approach for ML?**
A: "Single Responsibility Principle — the Node.js backend's job is to handle business logic and API requests. The ML model's job is symptom-to-hospital matching. Separating them keeps each codebase focused, allows independent scaling, and lets me use the best tool for each job (JavaScript for web APIs, Python for ML)."

**Q: How does the ambulance tracking system work end-to-end?**
A: "Patient books ambulance via REST API, which creates an AmbulanceRequest in MongoDB and emits a Socket.io event to all available drivers. A driver accepts via API, which assigns them to the request. The driver's app then emits `send_location` events via Socket.io every few seconds with GPS coordinates. The server receives these and broadcasts them to the patient so they can see the ambulance moving on a Mapbox map in real time."

---

## QUICK REFERENCE — TECH DECISIONS SUMMARY

| Decision | Choice | Why |
|---------|--------|-----|
| Frontend framework | React 19 | Component model, ecosystem, virtual DOM |
| Build tool | Vite | Speed (ESM dev server), modern tooling |
| CSS approach | MUI + Tailwind | Pre-built components (MUI) + custom utility classes (Tailwind) |
| Animations | Framer Motion | Declarative, powerful, React-native |
| API calls | Axios + interceptor | Interceptor = write auth once, use everywhere |
| Backend | Node.js + Express | Non-blocking I/O, JS everywhere, lightweight |
| Database | MongoDB + Mongoose | Flexible schema for varied user types, JSON-native |
| Authentication | JWT | Stateless, role info embedded in token |
| Passwords | bcryptjs | Slow + salted = secure |
| Email verification | 6-digit OTP | Simple, no extra dependency |
| Real-time | Socket.io | Auto-reconnect, rooms, long-poll fallback |
| Video calls | WebRTC + Simple-peer | P2P = no server bandwidth for video |
| ML algorithm | KNN + TF-IDF | Simple, interpretable, fast inference |
| ML language | Python/Flask | Best ML ecosystem, scikit-learn |
| NLP | node-nlp | Intent classification without external API |
| Fuzzy search | Fuse.js | Handles typos in medical queries |
| Spell correction | Levenshtein DP | No external API, works offline |
| Deployment | Vercel (frontend) | Free, automatic CI/CD from GitHub |
| Cloud DB | MongoDB Atlas | Free tier, managed, replicated |
| Email service | Brevo SMTP | 300 free emails/day, reliable |

---

*Good luck with your interview! You built all of this — you know it better than anyone.*
