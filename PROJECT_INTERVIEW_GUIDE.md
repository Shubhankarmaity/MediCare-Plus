# 🏥 MediCare-Plus — Complete Interview Preparation Guide

> **Purpose:** This guide prepares you to confidently answer ANY technical interview question about your Hospital Management project. Every section maps to real code in your codebase with exact file paths, function names, and logic flows.

---

## 1. Project Overview

### What is MediCare-Plus?
MediCare-Plus is a **full-stack Hospital Management System** that unifies **5 distinct user roles** — Patients, Doctors, Hospital Admins, Ambulance Drivers, and a Super Admin — into a single real-time platform. It combines appointment management, tele-consultations, AI-powered medical assistance, live ambulance tracking, and a Machine Learning hospital recommendation engine.

### What problem does it solve?
Healthcare in India is fragmented. Patients juggle multiple platforms — one for booking appointments, another for tele-health, separate phone calls for ambulances, and zero digital control over who sees their medical records. MediCare-Plus eliminates this fragmentation by providing:

1. **One platform, five portals** — each user role gets a tailored dashboard within the same app.
2. **Zero-latency video consultations** — WebRTC peer-to-peer calls that bypass the server entirely.
3. **AI symptom analysis** — An NLP chatbot that understands misspellings, slang, and medical abbreviations.
4. **Intelligent hospital matching** — A Python ML service that maps patient symptoms to the best-fit hospitals using TF-IDF + KNN.
5. **Patient-controlled privacy** — Patients explicitly grant/revoke access to their medical records, with expiry timestamps and single-use flags.

### Core Features (with the actual tech behind each)

| Feature | What it does | Tech used |
|---------|-------------|-----------|
| **Video Consultations** | Doctor-Patient P2P video calls | `simple-peer` (WebRTC) + `Socket.io` signaling |
| **MediBot (AI Chatbot)** | Answers medical queries, recommends hospitals | `node-nlp`, `Fuse.js`, Levenshtein spell correction |
| **Hospital Recommendation** | ML-powered hospital matching by symptoms | Python Flask + `scikit-learn` (TF-IDF + KNN) |
| **Live Ambulance Tracking** | Real-time GPS broadcast from driver to patient | `Socket.io` + `Mapbox GL` |
| **Privacy System** | Granular record access with expiry + single-use | MongoDB `Map` type in User schema |
| **Health Vitals Tracking** | BP, heart rate, blood sugar charts | `Recharts` + medical threshold analyzer |
| **PDF Reports** | Downloadable medical reports/prescriptions | `html2canvas` + `jsPDF` |
| **OTP Email Verification** | Secure registration with 6-digit OTP | `Brevo API` (formerly Sendinblue) |
| **Appointment Workflow** | Request → Admin Assign → Doctor Report → Complete | Express REST API + Socket.io notifications |
| **Health Summary AI** | Analyzes vitals against medical thresholds + diet tips | Custom `healthAnalyzer.js` utility |

---

## 2. Architecture & Workflow

### System Architecture (Text Diagram)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT (React SPA)                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │ Patient   │  │ Doctor   │  │ Admin    │  │ Driver   │  + SuperAdmin│
│  │ Dashboard │  │ Dashboard│  │ Dashboard│  │ Dashboard│           │
│  └─────┬─────┘  └─────┬────┘  └─────┬────┘  └─────┬────┘           │
│        └───────────────┴──────────────┴──────────────┘               │
│                         │ Axios (JWT in header)                      │
│                         │ Socket.io-client (WebSocket)               │
└─────────────────────────┼───────────────────────────────────────────┘
                          │
              ┌───────────▼───────────┐
              │   Node.js / Express   │ ← Port 5000
              │   (server/index.js)   │
              │                       │
              │  ┌─────────────────┐  │
              │  │   Socket.io     │  │ ← Video signaling, chat,
              │  │   Server        │  │    ambulance GPS, notifications
              │  └─────────────────┘  │
              │                       │
              │  ┌─────────────────┐  │
              │  │  REST Routes    │  │ ← 16 route files
              │  │  (16 modules)   │  │
              │  └────────┬────────┘  │
              │           │           │
              │  ┌────────▼────────┐  │
              │  │  Controllers    │  │ ← Business logic
              │  │  (4 files)      │  │    auth, appointment, chatbot, doctor
              │  └────────┬────────┘  │
              └───────────┼───────────┘
                          │
              ┌───────────▼───────────┐
              │   MongoDB Atlas       │ ← 9 Mongoose models
              │   (Cloud Database)    │    User, Hospital, Appointment,
              │                       │    Message, Notification, Payment,
              │                       │    Vitals, AmbulanceRequest,
              │                       │    ChatbotAnalytics
              └───────────────────────┘

              ┌───────────────────────┐
              │  Python Flask         │ ← Port 5001
              │  ML Microservice      │    TF-IDF + KNN
              │  (app.py)             │    Hospital recommendation
              └───────────────────────┘
```

### How Data Flows — Step by Step

**Flow 1: Patient Books an Appointment**
```
1. Patient fills form in React → POST /api/appointments/book
2. Axios interceptor auto-attaches JWT from localStorage
3. auth middleware verifies JWT → extracts { id, role } into req.user
4. appointmentController.bookAppointment() runs:
   a. Fetches doctor's hospitalId
   b. Checks patient isn't admitted elsewhere (hospital exclusivity)
   c. Creates Appointment document (status: 'requested')
   d. Creates Notification for hospital admin
   e. Emits socket event: io.to(adminId).emit('notification_' + adminId)
5. Admin sees real-time notification → assigns date/time
6. Doctor completes checkup → submits report (diagnosis, prescription, severity)
7. Patient receives completion notification via socket
```

**Flow 2: AI Chatbot Hospital Recommendation**
```
1. Patient types "I have chest pain" in MediBot
2. POST /api/chatbot/ask → chatbotController.ask() runs:
   a. Step 1 — Spell Correction: autocorrectQuery("chst pain") → "chest pain"
              Uses Levenshtein distance against 100+ medical term dictionary
   b. Step 2 — Synonym Expansion: expandQuery("chest pain") → adds "cardiac heart"
              Checks full query, individual words, and bigrams
   c. Step 3 — Emergency Check: scans against 18 emergency keywords
              ("heart attack", "stroke", "not breathing", "cardiac arrest"...)
              If match → return emergency response with "Call 112" immediately
   d. Step 4 — NLP Classification: nlpManager.process('en', correctedQuery)
              Returns { intent: 'hospital.recommendation', score: 0.87 }
   e. Step 5 — Route to ML Service: Axios POST to Python Flask at /predict
              Payload: { symptoms: "chest pain cardiac heart" }
   f. Step 6 — Python ML runs:
              - TF-IDF vectorizer transforms symptoms into numerical vector
              - KNN finds 5 nearest hospital profiles in vector space
              - Returns hospital IDs + distances
   g. Step 7 — Node.js populates full hospital data from MongoDB
   h. Step 8 — Logs to ChatbotAnalytics collection
3. React frontend displays hospital cards with ratings, specialties, insurance info
```

**Flow 3: WebRTC Video Call**
```
1. Doctor clicks "Call" on patient → frontend creates SimplePeer instance
2. SimplePeer generates SDP Offer (Session Description Protocol)
3. socket.emit("callUser", { signalData, userToCall, from, name })
4. Node.js routes signal: io.to(userToCall).emit("callUser", { signal, from, name })
5. Patient sees incoming call UI → clicks "Accept"
6. Patient's SimplePeer creates SDP Answer
7. socket.emit("answerCall", { signal, to: doctorId })
8. Node.js routes: io.to(doctorId).emit("callAccepted", signal)
9. Both peers exchange ICE candidates via socket: "ice-candidate" event
10. Direct P2P connection established → video streams bypass server entirely
11. Either party clicks "End" → socket.emit("endCall", { to }) → cleanup
```

### All 16 Route Modules Mounted in `server/index.js`

```
app.use('/',                   authRoutes)           → /register, /login, /verify-email, /profile
app.use('/api/doctors',        doctorRoutes)         → List, patient details, profile update
app.use('/api/appointments',   appointmentRoutes)    → Book, status, reports, admin assign/reject
app.use('/api/admin',          adminRoutes)          → Dashboard stats, approve/reject doctors
app.use('/api/ambulance',      ambulanceRoutes)      → List drivers, book, toggle availability
app.use('/api/access-requests',accessRequestRoutes)  → Patient access request management
app.use('/api/messages',       messageRoutes)        → Doctor-Patient direct messaging
app.use('/api/notifications',  notificationRoutes)   → Real-time notification CRUD
app.use('/api/super-admin',    superAdminRoutes)     → System-wide admin operations
app.use('/api/hospitals',      hospitalRoutes)       → Search, filter, AI recommendations
app.use('/api/debug',          debugRoutes)          → Development debugging endpoints
app.use('/api/seed',           seedRoutes)           → Database seeding
app.use('/api/vitals',         vitalsRoutes)         → Health vitals CRUD
app.use('/api/payments',       paymentRoutes)        → Payment history
app.use('/api/chatbot',        chatbotRoutes)        → AI chatbot + analytics
app.use('/api/health-summary', healthSummaryRoutes)  → AI health analysis
```

---

## 3. Technologies Used (with WHY for each)

### Frontend Stack

| Technology | Version | Why I chose it |
|-----------|---------|----------------|
| **React** | 19.2.0 | Component-based architecture ideal for building 5 separate role-based dashboards that share common components |
| **Vite** | 5.1.0 | Near-instant dev server using native ES modules; HMR (Hot Module Replacement) for rapid iteration |
| **Material UI (MUI)** | 7.3.5 | Production-ready accessible components — DataGrids, Modals, Tabs, Cards — that follow design standards |
| **Tailwind CSS** | 3.4.17 | Utility-first styling without CSS file bloat; combined with MUI for layout precision |
| **Framer Motion** | 12.29.2 | Declarative animations for page transitions and micro-interactions |
| **Socket.io Client** | 4.8.1 | Persistent WebSocket connection for real-time notifications, chat, and ambulance tracking |
| **Simple-peer** | 9.11.1 | Simplifies the WebRTC API for P2P video — handles SDP/ICE negotiation with clean events |
| **Recharts** | 3.7.0 | React-native charting for health vitals visualization (BP trends, sugar levels over time) |
| **Mapbox GL** | 3.17.0 | High-performance map rendering for live ambulance GPS tracking |
| **Axios** | 1.13.4 | HTTP client with interceptors — auto-attaches JWT token to every request header |
| **html2canvas + jsPDF** | 1.4.1 / 3.0.4 | Client-side PDF generation for downloadable medical reports and prescriptions |
| **React Router** | 7.9.6 | Client-side routing with nested layouts and route guards |

### Backend Stack

| Technology | Version | Why I chose it |
|-----------|---------|----------------|
| **Node.js + Express** | 5.1.0 | Event-driven, non-blocking I/O — perfect for handling concurrent WebSocket connections alongside REST APIs |
| **MongoDB + Mongoose** | 8.20.0 | Flexible document model for 5 different user roles with wildly different field structures in a single collection |
| **Socket.io** | 4.8.1 | Bi-directional real-time communication — handles video signaling, chat, ambulance GPS, and notifications |
| **JWT (jsonwebtoken)** | 9.0.2 | Stateless authentication — no session table needed; the token itself proves identity and role |
| **bcryptjs** | 3.0.3 | Password hashing with salt rounds (cost factor 10) — prevents rainbow table attacks |
| **node-nlp** | 5.0.0-alpha.5 | NLP intent classification — trained on 50+ medical utterances to detect query types |
| **Fuse.js** | 7.1.0 | Weighted fuzzy search — searches medical KB with configurable keyword/category/answer weights |
| **Multer** | 2.0.2 | Multipart form parsing for profile image and document uploads |
| **dotenv** | 16.3.1 | Environment variable management for secrets (JWT_SECRET, MONGODB_URI, API keys) |
| **Brevo API** | — | Transactional email service for OTP delivery (formerly Sendinblue) |

### Machine Learning Stack

| Technology | Purpose |
|-----------|---------|
| **Python 3 + Flask** | Lightweight HTTP microservice — chosen because Python has the superior ML ecosystem |
| **scikit-learn** | TF-IDF Vectorizer converts symptom text into numerical vectors; NearestNeighbors (KNN) finds closest hospital profiles |
| **pandas** | DataFrame operations for hospital data preprocessing |
| **joblib** | Serializes trained models to `.pkl` files for fast cold-start loading |
| **pymongo** | Direct MongoDB connection to fetch hospital data for model training at runtime |

---

## 4. File & Folder Structure (Complete)

```
Hospital/
│
├── app.py                              ← Python ML microservice (Flask, TF-IDF, KNN)
├── train_model.py                      ← Offline ML model training script
├── hospital_recommendation_dataset.csv ← Training data for hospital matching
├── requirements.txt                    ← Python dependencies
│
├── ml_model/
│   ├── hospital_nn_model.pkl           ← Serialized KNN model
│   ├── hospital_vectorizer.pkl         ← Serialized TF-IDF vectorizer
│   └── hospital_mapping.json           ← Hospital metadata (13 hospitals)
│
├── server/                             ← Node.js Backend
│   ├── index.js                        ← Entry point: Express + MongoDB + Socket.io setup
│   ├── medicalKnowledge.js             ← Medical KB: keyword arrays, answers, severity levels
│   ├── nlp_model.nlp                   ← Pre-trained NLP model (intent classification)
│   │
│   ├── controllers/
│   │   ├── authController.js           ← Register, Login, OTP, JWT, Privacy Access
│   │   ├── appointmentController.js    ← Book, assign, reject, report, patient history
│   │   ├── chatbotController.js        ← 8-step AI pipeline: spell→synonym→NLP→KB→ML
│   │   └── doctorController.js         ← List doctors, patient access control, profiles
│   │
│   ├── models/                         ← 9 Mongoose Schemas
│   │   ├── User.js                     ← 5 roles, privacy settings, access requests
│   │   ├── Hospital.js                 ← 25+ fields (insurance, facilities, geo, costs)
│   │   ├── Appointment.js              ← Full medical workflow + doctor reports
│   │   ├── Message.js                  ← Doctor-Patient direct messages
│   │   ├── Notification.js             ← System notifications (8 types)
│   │   ├── Payment.js                  ← Transaction records (INR currency)
│   │   ├── Vitals.js                   ← BP, heart rate, sugar, weight, temperature
│   │   ├── AmbulanceRequest.js         ← Ambulance booking + status tracking
│   │   └── ChatbotAnalytics.js         ← Query logging, intent, confidence, feedback
│   │
│   ├── middleware/
│   │   └── auth.js                     ← JWT verification + req.user injection
│   │
│   ├── routes/                         ← 16 route files (REST endpoints)
│   │   ├── auth.js                     ← /register, /login, /verify-email, /profile/*
│   │   ├── doctors.js                  ← /api/doctors/*
│   │   ├── appointments.js             ← /api/appointments/*
│   │   ├── chatbot.js                  ← /api/chatbot/ask, feedback, analytics
│   │   ├── hospitals.js                ← /api/hospitals/*, /recommend
│   │   ├── ambulance.js                ← /api/ambulance/*
│   │   ├── vitals.js                   ← /api/vitals (GET/POST)
│   │   ├── admin.js, superAdmin.js     ← Admin endpoints
│   │   ├── messages.js, notifications.js
│   │   ├── payments.js, accessRequests.js
│   │   └── seed.js, debug.js, healthSummary.js
│   │
│   ├── utils/
│   │   ├── spellCheck.js               ← Levenshtein distance algorithm + 100+ term dictionary
│   │   ├── synonyms.js                 ← 100+ medical abbreviation/slang mappings
│   │   ├── emailService.js             ← Brevo API integration for OTP emails
│   │   └── healthAnalyzer.js           ← Medical thresholds + diet recommendations
│   │
│   ├── nlp/
│   │   └── trainModel.js              ← NLP model training (50+ medical utterances)
│   │
│   └── uploads/                        ← User-uploaded files (Multer destination)
│
└── my-app/                             ← React Frontend
    ├── src/
    │   ├── App.jsx                     ← Root: MUI theme, Router, global components
    │   ├── config.js                   ← API_URL configuration
    │   ├── main.jsx                    ← React DOM entry point
    │   │
    │   ├── components/                 ← 22 Reusable Components
    │   │   ├── MediBot.jsx             ← AI chatbot floating widget (280+ lines)
    │   │   ├── VideoCall.jsx           ← WebRTC video call (simple-peer + Socket.io)
    │   │   ├── ChatWindow.jsx          ← Direct messaging interface
    │   │   ├── AnimatedRoutes.jsx      ← All route definitions + Framer Motion transitions
    │   │   ├── DashboardLayout.jsx     ← Responsive sidebar/content layout
    │   │   ├── HealthVitals.jsx        ← Vital signs tracking + Recharts visualization
    │   │   ├── HospitalRecommendWizard.jsx ← Step-by-step hospital recommendation flow
    │   │   ├── NotificationBell.jsx    ← Real-time notification dropdown
    │   │   ├── Navbar.jsx              ← Top navigation bar
    │   │   ├── PatientDetails.jsx      ← Patient profile view (privacy-gated)
    │   │   ├── PatientSettings.jsx     ← Privacy controls & preferences
    │   │   ├── PatientPaymentHistory.jsx ← Payment records table
    │   │   ├── PrescriptionManager.jsx ← Prescription view/management
    │   │   ├── HealthSummaryPanel.jsx  ← AI health analysis display
    │   │   ├── DoctorAnalytics.jsx     ← Doctor dashboard analytics
    │   │   ├── DoctorReports.jsx       ← Doctor's submitted reports view
    │   │   ├── DoctorSettings.jsx      ← Doctor profile settings
    │   │   ├── AIDecisionSupport.jsx   ← AI-powered clinical decision support
    │   │   ├── ScrollProgress.jsx      ← Page scroll progress indicator
    │   │   ├── BackToTop.jsx           ← Floating scroll-to-top button
    │   │   ├── PageTransition.jsx      ← Animation wrapper
    │   │   └── ScrollToHash.jsx        ← Auto-scroll to URL hash
    │   │
    │   ├── pages/                      ← 17 Page Components
    │   │   ├── Home.jsx                ← Landing page with service overview
    │   │   ├── Login.jsx               ← Login form (all roles)
    │   │   ├── Signup.jsx              ← Registration form (role-based fields)
    │   │   ├── ForgotPassword.jsx      ← Password reset flow
    │   │   ├── PatientDashboard.jsx    ← Patient portal (appointments, vitals, history)
    │   │   ├── DoctorDashboard.jsx     ← Doctor portal (patients, appointments, reports)
    │   │   ├── AdminDashboard.jsx      ← Hospital admin panel (approve/reject, assign)
    │   │   ├── DriverDashboard.jsx     ← Ambulance driver request management
    │   │   ├── SuperAdminDashboard.jsx ← System-level admin (all hospitals/users)
    │   │   ├── Doctors.jsx             ← Browse available doctors
    │   │   ├── DoctorDetails.jsx       ← Individual doctor profile
    │   │   ├── HospitalSearch.jsx      ← Search & filter hospitals
    │   │   ├── HospitalDetails.jsx     ← Individual hospital info
    │   │   ├── AmbulanceServices.jsx   ← Ambulance booking interface
    │   │   ├── LabTests.jsx            ← Lab tests catalog
    │   │   ├── Profile.jsx             ← Profile view/edit
    │   │   └── ProjectTeam.jsx         ← Development team info
    │   │
    │   └── services/                   ← API Service Layer
    │       ├── api.js                  ← Axios instance + JWT interceptor
    │       ├── authService.js          ← Auth API calls (login, register, verify, reset)
    │       └── hospitalService.js      ← Hospital search + recommendation APIs
    │
    ├── vite.config.js                  ← Vite build configuration
    ├── tailwind.config.js              ← Tailwind CSS configuration
    └── vercel.json                     ← Vercel deployment config (SPA rewrites)
```

---

## 5. Important Code Explanations

### 5.1 Authentication System (`authController.js`)

**Registration Flow:**
```javascript
// 1. Check duplicate email
const existingUser = await User.findOne({ email: email.toLowerCase() });

// 2. Hash password with bcrypt (salt rounds = 10)
const hashedPassword = await bcrypt.hash(req.body.password, 10);

// 3. Generate 6-digit OTP with 10-minute expiry
const otp = Math.floor(100000 + Math.random() * 900000).toString();
const otpExpires = Date.now() + 10 * 60 * 1000;

// 4. Role-based verification rules:
//    - Patient, Doctor, Driver → must verify via OTP email
//    - Admin, Super-Admin → auto-verified (isVerified = true)

// 5. For Admins: validate hospitalId exists + hospital doesn't already have admin
//    Then link: Hospital.findByIdAndUpdate(hospitalId, { adminId: newUser._id })

// 6. For Doctors: approval required before login
//    approvalStatus starts as 'pending' → admin approves/rejects
```

**Login Flow:**
```javascript
// 1. Find user with password field (normally excluded)
const user = await User.findOne({ email }).select('+password');

// 2. bcrypt.compare(plaintext, hash)
const isMatch = await bcrypt.compare(password, user.password);

// 3. If not verified → generate new OTP → send to email → return requiresVerification
// 4. If doctor not approved → return "pending admin approval" or rejection reason
// 5. Sign JWT with 7-day expiry:
const token = jwt.sign(
  { id: user._id, role: user.role },
  process.env.JWT_SECRET || "supersecretkey123",
  { expiresIn: '7d' }
);
```

**Auth Middleware (`middleware/auth.js`):**
```javascript
const auth = (req, res, next) => {
  const token = req.header("Authorization").replace("Bearer ", "");
  const verified = jwt.verify(token, process.env.JWT_SECRET);
  req.user = verified; // { id, role } available in all controllers
  next();
};
```

### 5.2 Chatbot Pipeline — The 8-Step AI System (`chatbotController.js`)

**How to explain in an interview:**
> "My chatbot uses a multi-layered pipeline. When a user types a query, it first goes through spell correction using Levenshtein distance, then synonym expansion to handle medical abbreviations. Next, it checks for emergency keywords. Then NLP classifies the intent — is this a medical info request or a hospital recommendation? Based on that, it either searches a structured medical knowledge base using Fuse.js for fuzzy matching, or calls a Python ML microservice for hospital recommendations."

**The actual code flow:**

```javascript
// Step 1: Spell Correction (utils/spellCheck.js)
// Uses Levenshtein distance algorithm against 100+ medical terms
// Example: "diarrea" → "diarrhea", "chst pain" → "chest pain"
const spellResult = autocorrectQuery(query);
const correctedQuery = spellResult.corrected;

// Step 2: Synonym Expansion (utils/synonyms.js)
// Maps abbreviations/slang → medical terms
// "bp" → "blood pressure", "tummy" → "stomach abdominal"
// "ecg" → "electrocardiogram heart", "fits" → "seizure epilepsy"
const expandedQuery = expandQuery(correctedQuery);

// Step 3: Emergency Detection
// 18 keywords: 'heart attack', 'stroke', 'not breathing', 'cardiac arrest'...
if (EMERGENCY_KEYWORDS.some(kw => queryLower.includes(kw))) {
    // Return immediately: "CALL 112 IMMEDIATELY"
    // Log to ChatbotAnalytics with intent: 'emergency.sos'
}

// Step 4: NLP Intent Classification
const nlpResponse = await nlpManager.process('en', correctedQuery);
// Returns: { intent: 'medical.info' | 'hospital.recommendation', score: 0.87 }

// Step 5: Route based on intent
if (intent === 'hospital.recommendation' && score > 0.5) {
    // → Call Python ML service
} else if (intent === 'medical.info' && score > 0.5) {
    // → Search Medical KB
}

// Step 6: Medical Knowledge Base Search (TWO strategies)
// Strategy A — Direct keyword match (confidence: 95%)
const directMatch = findMedicalAnswer(expandedQuery);

// Strategy B — Fuse.js fuzzy search if no keyword match
const fuse = new Fuse(MEDICAL_KB, {
    keys: [
        { name: 'keywords', weight: 0.7 },   // keyword match highest priority
        { name: 'category', weight: 0.2 },    // category match medium
        { name: 'answer', weight: 0.1 }       // answer text lowest
    ],
    threshold: 0.35,                          // 65% match required
    ignoreLocation: true                      // match anywhere in string
});

// Step 7: If recommendation → call Python Flask at /predict endpoint
const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict`, {
    symptoms: `${queryLower} ${medicalHistory}`
});

// Step 8: Log everything to ChatbotAnalytics
await ChatbotAnalytics.create({
    query, correctedQuery, expandedQuery,
    intent, intentConfidence: nlpScore,
    matchSource: 'nlp' | 'fuse' | 'keyword' | 'fallback',
    responseTime: Date.now() - startTime,
    userId
});
```

**Medical Knowledge Base Structure (`medicalKnowledge.js`):**
```javascript
{
  keywords: ['diabetes', 'blood sugar', 'sugar level', 'insulin', 'glucometer'],
  category: 'Chronic Disease',
  severity: 'caution',              // 'info' | 'caution' | 'danger'
  followUpQuestions: ['What diet is best for diabetes?', ...],
  answer: '**Diabetes** is a chronic condition...\n• **Type 1** — ...\n• **Type 2** — ...'
}
```

### 5.3 ML Hospital Recommendation Engine (`app.py`)

**How to explain in an interview:**
> "I built a separate Python Flask microservice for hospital recommendations. When the Node.js chatbot detects a recommendation intent, it sends the patient's symptoms to the Python service. The service uses TF-IDF to convert the symptom text into a numerical vector, then uses K-Nearest Neighbors with cosine similarity to find the hospitals whose profiles are closest in that vector space. The hospital profiles are enriched with specialty-to-symptom mappings — for example, a Cardiology hospital's profile includes terms like 'heart', 'chest pain', 'cardiac arrest'."

**How the ML model works step-by-step:**

```python
# STEP 1: Build hospital profiles from MongoDB data
def create_hospital_profile(row):
    features = []
    
    # Triple-weight specialties (most important signal)
    specialty_str = str(row.get('specialties', ''))
    features.append(specialty_str)
    features.append(specialty_str)  # repeated 3x for emphasis
    features.append(specialty_str)
    
    # Add infrastructure features
    if row.get('hasICU'): features.append('ICU intensive care critical')
    if row.get('hasEmergency'): features.append('Emergency trauma accident')
    if row.get('hasOT'): features.append('Operation Theatre surgery')
    if row.get('cashlessAvailable'): features.append('Cashless insurance')
    
    # Specialty-to-symptom mappings (domain knowledge injection)
    if 'cardiology' in specialty_lower:
        features.append('heart chest pain cardiac arrest coronary')
    if 'orthopedics' in specialty_lower:
        features.append('bone joint pain fracture knee hip')
    if 'neurology' in specialty_lower:
        features.append('brain headache migraine stroke seizure')
    # ... for pediatrics, gynecology, endocrinology, nephrology, oncology, pulmonology
    
    return ' '.join(features)

# STEP 2: Train TF-IDF + KNN
vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))
X_profiles = vectorizer.fit_transform(df['hospital_profile'])

nn_model = NearestNeighbors(n_neighbors=5, metric='cosine')
nn_model.fit(X_profiles)

# STEP 3: Prediction endpoint
@app.route('/predict', methods=['POST'])
def predict():
    symptoms = request.json.get('symptoms', '')
    symptom_vector = vectorizer.transform([symptoms])
    distances, indices = nn_model.kneighbors(symptom_vector)
    # Return top 5 hospitals with distance scores
```

**Why TF-IDF + KNN?**
- TF-IDF converts text into numerical vectors where important words get higher weights and common words get lower weights
- KNN with cosine similarity measures the "angle" between the symptom vector and each hospital profile — small angle = high relevance
- This combination is ideal because the data is text-heavy and the feature space is naturally sparse

### 5.4 WebRTC Video Calling (`VideoCall.jsx` + Socket.io)

**Socket.io event flow in `server/index.js`:**
```javascript
// Doctor initiates call
socket.on("callUser", ({ userToCall, signalData, from, name }) => {
    io.to(userToCall).emit("callUser", { signal: signalData, from, name });
});

// Patient accepts call
socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal);
});

// ICE candidate exchange (network discovery)
socket.on("ice-candidate", ({ target, candidate }) => {
    io.to(target).emit("ice-candidate", candidate);
});

// Either party ends call
socket.on("endCall", ({ to }) => {
    io.to(to).emit("callEnded");
});
```

**Why the server is NOT involved in video streaming:**
> "WebRTC creates a direct peer-to-peer connection between the two browsers. The Node.js server only acts as a 'Signaling Server' — it relays the SDP offers/answers and ICE candidates so the two browsers can discover each other. Once the P2P connection is established, all video/audio data flows directly between the browsers. This means zero server bandwidth is consumed for media, and latency is minimized."

### 5.5 Patient Privacy System (`User.js` + `authController.js`)

```javascript
// In User.js schema:
privacySettings: {
    profileAccess: {
        type: Map,
        of: {
            approved: Boolean,
            approvedAt: Date,
            approvedById: { type: mongoose.Schema.Types.ObjectId },
            expiresAt: Date,
            singleUse: { type: Boolean, default: false },
            used: { type: Boolean, default: false }
        },
        default: new Map()
    }
}

// In doctorController.getPatientById — the access check:
const accessEntry = patient.privacySettings?.profileAccess?.get(doctorId);
if (!accessEntry || !accessEntry.approved) return res.status(403);  // DENIED
if (accessEntry.expiresAt && accessEntry.expiresAt < new Date()) return 403; // EXPIRED
if (accessEntry.singleUse && accessEntry.used) return 403; // ALREADY USED
// If singleUse, mark as used after this access
```

### 5.6 Real-Time Ambulance Tracking

```javascript
// Driver broadcasts GPS location continuously
socket.on("send_location", (data) => {
    // data = { lat, lng, driverId }
    io.emit("receive_location", data);  // broadcast to ALL connected clients
});

// SOS emergency alert
socket.on("sos_alert", (data) => {
    io.emit("dispatch_ambulance", data);  // alert ALL drivers
});
```
Frontend uses **Mapbox GL** to render the driver's moving marker on a map in real-time.

### 5.7 Health Vitals Analysis (`healthAnalyzer.js`)

```javascript
// Medical thresholds used for AI health summaries
const THRESHOLDS = {
    bloodPressure: {
        normal:   { systolic: [0, 120],  diastolic: [0, 80] },
        elevated: { systolic: [120, 129], diastolic: [0, 80] },
        stage1:   { systolic: [130, 139], diastolic: [80, 89] },
        stage2:   { systolic: [140, 300], diastolic: [90, 200] },
        crisis:   { systolic: [180, 999], diastolic: [120, 999] }
    },
    heartRate:  { low: [0, 60], normal: [60, 100], high: [100, 300] },
    bloodSugar: { low: [0, 70], normal: [70, 100], prediabetic: [100, 126], diabetic: [126, 999] },
    temperature: { /* hypothermia, normal, fever, high fever */ },
    bmi:         { /* underweight, normal, overweight, obese */ }
};

// Diet recommendations based on abnormal readings
// High BP → eat: bananas, leafy greens, oats | avoid: salt, processed food
// High Sugar → eat: whole grains, nuts | avoid: sugary drinks, white rice
```

### 5.8 Axios Interceptor — Auto JWT Injection (`services/api.js`)

```javascript
import axios from 'axios';
import { API_URL } from '../config';

const api = axios.create({
    baseURL: API_URL,                           // http://localhost:5000
    headers: { 'Content-Type': 'application/json' }
});

// Every API call auto-attaches the JWT from localStorage
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
```

---

## 6. Design Decisions & Tradeoffs

### Why MongoDB over PostgreSQL/MySQL?

> "My User model stores 5 completely different user types in one collection. A Patient has `medicalHistory`, `allergies`, `bloodGroup`. A Doctor has `specialization`, `licenseNumber`, `consultationFee`. A Driver has `vehicleNumber`, `location.lat/lng`. In SQL, this would require either: (a) a sparse table with 50+ nullable columns, or (b) 5 separate tables with complex JOINs. MongoDB's document model handles this naturally — each document only stores the fields it needs, with Mongoose providing runtime schema validation."

### Why a Python Microservice instead of ML in Node.js?

> "Two concrete reasons: (1) Python's `scikit-learn` provides battle-tested TF-IDF and KNN implementations that would require massive effort to replicate in Node.js. (2) ML inference involves CPU-heavy matrix operations. If I ran this on the Node.js event loop, it would block ALL concurrent HTTP requests and WebSocket connections. The microservice architecture isolates the computational burden — Node handles I/O, Python handles math."

### Why WebRTC instead of server-relayed video?

> "If I streamed video through the Node server, every concurrent call would consume server bandwidth proportional to the video bitrate — roughly 2-4 Mbps per call. With WebRTC, once the P2P connection is established, the server bandwidth for that call drops to zero. The server only handles the signaling handshake, which is a few kilobytes. The tradeoff is that WebRTC requires STUN/TURN servers for NAT traversal, and my current implementation only uses STUN — which can fail behind strict corporate firewalls."

### Why Socket.io instead of plain WebSockets?

> "Socket.io adds critical reliability features: automatic reconnection with exponential backoff, room-based broadcasting (essential for user-specific notifications), and transparent fallback to HTTP long-polling if WebSockets fail. In my project, rooms are crucial — `socket.join(userId)` creates a private room, and I use `io.to(userId).emit()` to send targeted notifications, call signals, and messages."

### Why no Redux?

> "Each dashboard (Patient, Doctor, Admin, Driver, Super Admin) operates independently with its own data needs. There's no global state that multiple dashboards share simultaneously. Using `useState` + `useEffect` per component keeps the code modular. The only 'global' state is the JWT token, which I persist in localStorage and inject via the Axios interceptor — no Redux needed for that."

### Why Fuse.js for medical search instead of Elasticsearch?

> "For the scale of my medical knowledge base (dozens of entries), Elasticsearch would be severe over-engineering. Fuse.js runs entirely in-memory, requires zero infrastructure, and supports weighted fuzzy searching with configurable thresholds. I weight keyword matches at 0.7, category at 0.2, and answer text at 0.1 — so a direct keyword match always ranks higher than a vague answer match."

### Why a single User collection for 5 roles?

> "This was a deliberate decision to simplify authentication. With a single collection, I have one `/login` endpoint, one JWT structure `{ id, role }`, and one auth middleware. The `role` field dictates what logic the controller executes. The alternative — 5 separate User tables — would require 5 login endpoints, 5 JWT verifiers, and significantly more complex middleware to determine which table to query."

---

## 7. Interview Questions & Answers (25 Q&As)

### Architecture & System Design

**Q1: "Walk me through the complete architecture of your project."**
> "My project follows a three-tier architecture. The frontend is a React SPA built with Vite, using MUI and Tailwind for UI. It communicates with a Node.js/Express backend via REST APIs (Axios with JWT interceptor) and WebSocket (Socket.io for real-time features). The backend connects to MongoDB Atlas through Mongoose. Additionally, I have a Python Flask microservice running on a separate port that handles the ML hospital recommendation — the Node.js backend calls it via HTTP when the chatbot detects a recommendation intent. All real-time features — video calls, ambulance tracking, chat, notifications — go through Socket.io."

**Q2: "Why did you use a microservice architecture for ML?"**
> "Node.js is single-threaded with an event loop optimized for I/O. Heavy matrix operations like TF-IDF vectorization and KNN distance computation would block the event loop and freeze all concurrent requests. By extracting this into a Python Flask microservice, the ML computation runs in a separate process. This also lets me retrain the model in-memory without restarting the main Node server."

**Q3: "How does your system handle 5 different user roles?"**
> "I use a single MongoDB User collection with a `role` enum field: patient, doctor, admin, driver, super-admin. The JWT payload contains `{ id, role }`. My auth middleware extracts this from the token and attaches it to `req.user`. Controllers then use `req.user.role` to execute role-specific logic. Each role has different fields in the schema — a patient has `medicalHistory` and `allergies`, a doctor has `specialization` and `licenseNumber`, a driver has `vehicleNumber` and `location`."

### Authentication & Security

**Q4: "How does your authentication system work?"**
> "Registration: The user registers with their role. Passwords are hashed with bcrypt (salt rounds = 10). For patients, doctors, and drivers, a 6-digit OTP is emailed via the Brevo API with a 10-minute expiry. Admins are auto-verified. Doctors additionally require admin approval before they can log in.
>
> Login: The backend finds the user, compares the password hash, checks verification and approval status. If everything passes, it signs a JWT with `{ id, role }` and a 7-day expiry. The frontend stores this in localStorage and an Axios interceptor auto-attaches it to every API request as `Bearer ${token}`."

**Q5: "How do you protect patient data privacy?"**
> "I implemented a granular access control system in the User schema. Each patient has a `privacySettings.profileAccess` Map where keys are doctor IDs and values contain `approved`, `expiresAt`, and `singleUse` flags. When a doctor tries to view a patient's profile, my controller checks: (1) does the doctor have an entry? (2) is it approved? (3) has it expired? (4) if single-use, was it already used? Only if all checks pass does the doctor see the medical history. The frontend cannot bypass this because the check happens server-side."

**Q6: "What happens if someone forges a JWT?"**
> "JWT tokens are signed with a secret key stored in an environment variable. `jwt.verify()` in my auth middleware validates the signature. If the token is tampered with, the signature won't match the payload, and the middleware returns a 400 'Invalid Token' response. The user is never granted access."

### AI & Machine Learning

**Q7: "Explain your chatbot pipeline in detail."**
> "It's an 8-step pipeline:
> 1. **Spell Correction** — Levenshtein distance algorithm compares each word against a 100+ term medical dictionary. If the distance is below a threshold, it auto-corrects (e.g., 'diarrea' → 'diarrhea').
> 2. **Synonym Expansion** — Maps medical abbreviations and colloquial terms: 'bp' → 'blood pressure', 'tummy ache' → 'stomach abdominal pain'.
> 3. **Emergency Detection** — Scans for 18 emergency keywords like 'heart attack', 'not breathing'. If found, immediately returns 'Call 112' with 100% confidence.
> 4. **NLP Classification** — `node-nlp` classifies the intent as either `medical.info` or `hospital.recommendation` with a confidence score.
> 5. **Query Type Routing** — If recommendation intent with >50% confidence, route to ML. If medical info, route to KB.
> 6. **Medical KB Keyword Match** — Direct keyword lookup in the knowledge base (95% confidence).
> 7. **Fuse.js Fuzzy Search** — If no keyword match, fuzzy search with weighted keys (keywords: 0.7, category: 0.2, answer: 0.1).
> 8. **Fallback** — Suggests available categories if nothing matches.
> Everything is logged to ChatbotAnalytics for analytics."

**Q8: "How does TF-IDF work in your recommendation engine?"**
> "TF-IDF stands for Term Frequency–Inverse Document Frequency. It converts text into a numerical vector. Term Frequency measures how often a word appears in a document. Inverse Document Frequency penalizes words that appear in many documents (like 'hospital'). In my system, each hospital has a profile string built from its specialties, facilities, and symptom-related keywords. When a patient says 'chest pain', TF-IDF creates a vector where 'chest' and 'pain' have high weights. KNN with cosine similarity then finds the hospitals whose profile vectors have the smallest angle to this query vector — meaning 'Cardiology' hospitals rank highest."

**Q9: "Why did you add specialty-to-symptom mappings?"**
> "A patient says 'chest pain', not 'cardiology.' Without mappings, TF-IDF wouldn't connect 'chest pain' to a 'Cardiology' hospital because the words are different. I manually inject domain knowledge: if a hospital specializes in Cardiology, its profile includes 'heart chest pain cardiac arrest coronary'. This bridges the semantic gap between patient language and medical terminology. I do this for 9 specialties including orthopedics, neurology, gynecology, and pulmonology."

### Real-Time Features

**Q10: "Explain how WebRTC video calls work in your project."**
> "WebRTC is a browser technology that enables peer-to-peer communication. In my project:
> 1. The doctor initiates a call — simple-peer generates an SDP offer containing media capabilities.
> 2. This offer is sent through Socket.io to the server, which routes it to the patient's specific socket room.
> 3. The patient's browser receives the offer, creates an SDP answer, and sends it back through Socket.io.
> 4. Both sides exchange ICE candidates — these are network addresses discovered via STUN servers to traverse NATs/firewalls.
> 5. Once the handshake completes, a direct P2P connection opens and all media data flows directly between the browsers. The Node.js server is completely out of the loop for the actual video."

**Q11: "How does live ambulance tracking work?"**
> "The ambulance driver's browser uses the Geolocation API to get GPS coordinates. These are emitted via Socket.io: `socket.emit('send_location', { lat, lng, driverId })`. The server broadcasts this to all clients: `io.emit('receive_location', data)`. On the patient's side, Mapbox GL renders the driver's position as a moving marker on the map. For emergencies, `sos_alert` broadcasts to ALL drivers via `io.emit('dispatch_ambulance', data)`."

**Q12: "Why Socket.io rooms for notifications?"**
> "When a user connects, they join a room named after their user ID: `socket.join(userId)`. When I need to send a targeted notification — like telling an admin about a new appointment — I emit to their specific room: `io.to(adminId).emit('notification_' + adminId, data)`. This is much more efficient than broadcasting to all clients and filtering on the frontend."

### Database & Data Modeling

**Q13: "Explain your User schema design for 5 roles."**
> "I use a single User collection with a `role` enum: patient, doctor, admin, driver, super-admin. Common fields like name, email, password exist for all roles. Role-specific fields are optional: patients have `medicalHistory`, `allergies`, `bloodGroup`. Doctors have `specialization`, `consultationFee`, `availableDays`. Drivers have `vehicleNumber`, `isAvailable`, `location { lat, lng }`. Mongoose doesn't enforce that a patient has a `vehicleNumber` — it simply doesn't store what doesn't exist. This is much cleaner than SQL with 50+ nullable columns."

**Q14: "How did you design the Appointment lifecycle?"**
> "An appointment has 6 statuses: `requested → approved → completed` (happy path), or `requested → rejected` or `requested → cancelled`. When a patient books, the status is 'requested'. The hospital admin sees the request via a Socket.io notification and assigns a date/time (status: 'approved'). After the checkup, the doctor submits a report containing diagnosis, prescription, severity, and follow-up instructions (status: 'completed'). The report is stored as a nested `doctorReport` subdocument. I added compound indexes on `(doctorId, status)` and `(hospitalId, status)` for efficient querying."

**Q15: "Why compound indexes?"**
> "The most frequent queries in my app are 'show me all approved appointments for this doctor' and 'show me all requested appointments for this hospital.' Without compound indexes, MongoDB would scan the entire Appointment collection. With `(doctorId: 1, status: 1)`, MongoDB can jump directly to the doctor's appointments and filter by status in a single index operation — O(log n) instead of O(n)."

### Frontend Architecture

**Q16: "How did you structure the React frontend?"**
> "Pages represent full views (17 total) — one for each dashboard role plus public pages. Components are reusable blocks (22 total) — MediBot, VideoCall, ChatWindow, HealthVitals, etc. Services abstract API calls — `api.js` creates an Axios instance with a JWT interceptor, `authService.js` exports login/register/verify functions. Routes are centralized in `AnimatedRoutes.jsx` with Framer Motion transitions. The `App.jsx` sets up the MUI theme (primary: #0066cc, secondary: #0d9488), wraps everything in a ThemeProvider and Router, and renders global components like MediBot and BackToTop."

**Q17: "Why didn't you use Redux for state management?"**
> "Each dashboard is self-contained. The Patient dashboard fetches its own appointments and vitals. The Doctor dashboard fetches its own patients and schedules. There's no shared state between dashboards — they're never rendered simultaneously. useState + useEffect handles component-level data fetching perfectly. The only 'global' state is the JWT token, which persists in localStorage and gets auto-injected by the Axios interceptor. Redux would add significant boilerplate for zero benefit."

**Q18: "How does the MediBot component work?"**
> "MediBot is a floating chatbot widget (280+ lines) rendered globally in App.jsx. It maintains conversation state locally. When the user submits a message, it POSTs to `/api/chatbot/ask` with the query, insurance company, and patient info (medical history, allergies). The backend returns a structured response with type (medical_info/recommendation/emergency), confidence level, matched category, follow-up questions, and match source. The UI renders different card styles based on the response type — hospital cards for recommendations, info panels for medical queries, and emergency alerts for dangerous symptoms."

### Deployment & DevOps

**Q19: "How is your project deployed?"**
> "The React frontend is deployed on Vercel with SPA rewrites configured in `vercel.json` — all routes redirect to `index.html` for client-side routing. The Node.js backend runs on a cloud server with MongoDB Atlas as the hosted database. The Python ML service runs alongside the Node server. I use environment variables for all secrets: `MONGODB_URI`, `JWT_SECRET`, `BREVO_API_KEY`, `ML_SERVICE_URL`."

**Q20: "How do you handle CORS?"**
> "In `server/index.js`, I configure CORS to only allow requests from specific origins — `localhost:5173` (Vite dev), `localhost:5179/5180` (alternate ports), and the production Vercel URL. The `credentials: true` flag allows cookies and auth headers to be sent cross-origin. Any request from an unlisted origin is blocked by the browser's CORS policy before it reaches my server."

### Scalability & Performance

**Q21: "What's the bottleneck in your system?"**
> "The ML model retrains the TF-IDF vectorizer synchronously at Flask startup by fetching all hospitals from MongoDB. With thousands of hospitals, this initialization would be slow. I mitigate this by caching the trained model to `.pkl` files — on subsequent starts, it loads from disk if available, only retraining when hospitals change. The second bottleneck is ambulance GPS broadcasting — `io.emit()` sends to ALL connected clients. In production, I'd filter by geographic proximity."

**Q22: "How would you scale this?"**
> "Three immediate improvements: (1) Add Redis for caching frequent queries like `/api/doctors/public` and `/api/hospitals`. (2) Use Socket.io's Redis adapter for horizontal scaling across multiple Node instances. (3) Implement a TURN server for WebRTC — currently I only use STUN, which fails behind strict NATs. For the ML service, I'd containerize it with Docker and add health checks, and potentially use a message queue (RabbitMQ) to decouple the Node→Python communication."

### Error Handling & Edge Cases

**Q23: "What happens if the ML service is down?"**
> "In `chatbotController.js`, the Axios call to the Python service is wrapped in a try-catch. If the service is unreachable, the chatbot falls back to the medical knowledge base search. The user still gets a response — just not a hospital recommendation. The error is logged but doesn't crash the Node server."

**Q24: "What if a doctor's access to a patient expires mid-session?"**
> "The access check happens on every API call, not just once. When the doctor calls `GET /api/doctors/patient/:id`, the controller reads the patient's `privacySettings.profileAccess` Map in real-time and checks `expiresAt` against `new Date()`. If it's expired, the request gets a 403 — even if the doctor had valid access 5 minutes ago. For single-use access, once `used` is set to `true`, any subsequent call is denied."

**Q25: "How do you handle the OTP expiry race condition?"**
> "The 10-minute OTP window is enforced server-side by checking `Date.now() > user.otpExpires`. If a user tries to verify after 10 minutes, it fails and they must request a new OTP via the `/resend-otp` endpoint, which generates a fresh 6-digit code with a new 10-minute window. The old OTP is overwritten, not appended."

---

## 8. Possible Improvements

### Current Limitations (be honest about these in interviews)

| Area | Limitation | Why it matters |
|------|-----------|---------------|
| **Authentication** | No refresh token rotation — JWT is valid for 7 days with no sliding session | If a token is stolen, attacker has 7 days of access |
| **OTP Storage** | OTPs stored in plaintext in the database | Should be hashed like passwords |
| **ML Cold Start** | Model rebuilds TF-IDF from MongoDB on every Flask restart | Slow startup with large hospital datasets |
| **Ambulance GPS** | `io.emit()` broadcasts to ALL clients | Should filter by geographic proximity for efficiency |
| **WebRTC NAT** | Only STUN server — no TURN fallback | Video calls fail behind strict corporate firewalls |
| **Rate Limiting** | No request rate limiting on login or chatbot endpoints | Vulnerable to brute-force attacks |
| **Testing** | No automated test suites | Should have unit tests for controllers and integration tests for API flows |
| **Input Validation** | Basic validation only | Should use `Joi` or `express-validator` for comprehensive schema validation |

### Future Improvements (good to mention proactively)

1. **Redis Caching** — Cache `/api/doctors/public`, `/api/hospitals`, and frequent chatbot queries
2. **TURN Server** — Deploy Coturn for WebRTC behind restrictive firewalls
3. **Rate Limiting** — `express-rate-limit` on `/login` (10 attempts/15min) and `/api/chatbot/ask` (50/min)
4. **Refresh Token Rotation** — Short-lived access tokens (15min) + long-lived refresh tokens in HTTP-only cookies
5. **Elasticsearch** — Replace Fuse.js as the medical KB grows beyond in-memory capacity
6. **Docker Compose** — Containerize Node + Python + MongoDB for consistent deployments
7. **Webhook for ML Retrain** — Auto-retrain model when new hospitals are added to DB
8. **Geographic Ambulance Filtering** — Use MongoDB geospatial queries `$near` to only broadcast to nearby drivers

---

## 9. Resume Explanation

### 30-Second Elevator Pitch
> "I built MediCare-Plus, a full-stack Hospital Management platform using React, Node.js, Express, MongoDB, and Python. It serves 5 different user roles — patients, doctors, hospital admins, ambulance drivers, and a super admin. Key highlights: I built a peer-to-peer video consultation system using WebRTC with Socket.io for signaling. I created an AI chatbot with NLP intent classification, Levenshtein spell correction, and fuzzy search. And I wrote a Python ML microservice that uses TF-IDF and KNN to recommend hospitals based on patient symptoms. I also implemented a patient privacy system where patients control exactly who can see their medical records, with expiry timestamps and single-use access."

### 2-Minute Deep Dive (STAR Format)

**Situation:**
> "Healthcare platforms in India are fragmented. Patients use separate apps for booking, consultations, and emergency services. There's no unified system that also gives patients control over their medical record privacy."

**Task:**
> "I set out to build a single platform that unifies 5 user roles with role-based dashboards, real-time features, AI-powered medical assistance, and granular patient privacy controls."

**Action:**
> "I built the frontend with React 19 and Vite, using Material UI and Tailwind CSS for the UI. The backend runs on Node.js with Express 5, connected to MongoDB Atlas through Mongoose. I implemented 9 database models and 16 REST API route modules.
>
> For real-time features, I deployed Socket.io to handle four concurrent use cases: WebRTC video call signaling, doctor-patient messaging, live ambulance GPS tracking, and push notifications.
>
> The AI chatbot uses an 8-step processing pipeline — spell correction via Levenshtein distance, synonym expansion for medical abbreviations, emergency keyword detection, NLP intent classification using node-nlp, and a dual-strategy medical knowledge base search using Fuse.js for fuzzy matching.
>
> Recognizing that Node.js's event loop shouldn't handle CPU-intensive math, I extracted the hospital recommendation engine into a Python Flask microservice. It uses scikit-learn's TF-IDF vectorizer to convert symptoms into numerical vectors and K-Nearest Neighbors with cosine similarity to match patients to hospitals.
>
> For security, I used bcrypt password hashing, JWT stateless authentication, and built a custom privacy system where patients grant doctors time-limited, single-use access to their records — enforced entirely server-side."

**Result:**
> "The platform handles real-time peer-to-peer video consultations with zero server-side media processing, dynamically recommends hospitals in milliseconds, and gives patients complete control over their medical data. It demonstrates a microservice architecture, real-time WebSocket programming, NLP/ML integration, and production-level role-based access control."
