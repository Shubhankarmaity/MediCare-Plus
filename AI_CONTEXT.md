# 🧠 AI Context: MediCare Plus

This document provides a comprehensive, production-grade overview of the **MediCare Plus** codebase, technology stack, folder structure, coding conventions, architectural decisions, and development guidelines for all future AI agents.

---

## 📌 Project Overview

*   **Application Purpose**: **MediCare Plus** is a multi-role, end-to-end Healthcare Management and Hospital Discovery platform. It bridges the gap between patients, healthcare professionals (doctors), hospital administrators, emergency ambulance services (drivers), and network administrators (super admins).
*   **Business Domain**: Digital Health, Telemedicine, Emergency Services, Electronic Health Records (EHR), and Hospital Referral Systems.
*   **Core Functionality**:
    *   **Secure Authentication**: Role-based access control (RBAC) with secure registration, hashed passwords, email verification via 6-digit OTP, and JWT-based session state.
    *   **Appointment Management**: Full booking lifecycle (Pending -> Approved/Rejected -> Consultation Completed -> Medical Report / Prescription issued).
    *   **Telehealth Consultation**: Real-time peer-to-peer browser video/audio streaming using WebRTC.
    *   **Emergency SOS Dispatch**: Real-time ambulance requests broadcasting patient GPS coordinates to nearby active drivers with live tracking via WebSockets.
    *   **Electronic Medical Records (EMR)**: Secure creation, storage, and retrieval of medical reports, prescriptions, and health vital charts.
    *   **Privacy Access Controls**: Patient-controlled data privacy maps regulating doctor-specific access to full medical history logs.
    *   **MediBot AI Chatbot**: Double-engine chatbot with local Node-NLP intent parsing for medical knowledge questions, and a Flask Python ML microservice for symptom-based hospital matching.
    *   **Dynamic ML Retraining**: Zero-downtime background KNN model and TF-IDF vectorizer retraining on hospital insertions or edits.

---

## 🛠️ Technology Stack

| Layer | Technologies | Version / Info | Description |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | **React** | `^19.2.0` | Client UI rendering |
| **Frontend Build Tool** | **Vite** | `^5.1.0` | Development server and compilation pipeline |
| **UI component Framework** | **MUI (Material UI)** | `^7.3.5` | Standardized UI inputs, grids, layouts, and dialogs |
| **Styling & Transitions** | **TailwindCSS** + **Framer Motion** | `^3.4.17` / `^12.29.2` | Utility CSS overrides and page/component animations |
| **Data Visualisation** | **Recharts** | `^3.7.0` | Medical vital trends rendering (Sugar, BP, Heart Rate) |
| **Real-time Engine** | **Socket.io Client** | `^4.8.1` | WebSockets bi-directional communication |
| **Consultation Stream** | **Simple-Peer** (WebRTC wrapper) | `^9.11.1` | P2P video/audio signaling and stream pipelines |
| **PDF Processing** | **jsPDF** + **html2canvas** | `^3.0.4` / `^1.4.1` | Captures DOM components and downloads clinical papers |
| **Backend Runtime** | **Node.js** + **Express** | Express `^5.1.0` | Core API runtime serving routes, controllers, and schemas |
| **Database ODM** | **Mongoose** (MongoDB Atlas) | `^8.20.0` | Object Data Modeling wrapping NoSQL collections |
| **WebSockets Server** | **Socket.io** | `^4.8.1` | Handles private rooms, SOS alerts, and WebRTC signal logs |
| **File Uploads** | **Multer** | `^2.0.2` | Handles multipart form image storage to disk |
| **Email Service** | **Nodemailer** + **Brevo API** | Nodemailer `^6.9.0` | Sends OTP codes via SMTP using Brevo API keys |
| **Local NLP Engine** | **Node-NLP** | `^5.0.0-alpha.5` | Processes chat intent, greeting cards, and general topics |
| **Fuzzy Matching** | **Fuse.js** | `^7.1.0` | Regex mapping and database lookup resolver for names |
| **Python Service** | **Flask** | 3.10+ | Exposes ML inference and model retraining pipelines |
| **ML Framework** | **Scikit-Learn** | Latest | Powers TF-IDF Text Vectorization and Nearest Neighbors math |
| **Data & Math** | **Pandas** + **NumPy** + **Joblib** | Latest | Data pre-processing, matrix algebra, and model serialization |
| **ML DB Driver** | **PyMongo** | Latest | Connects Flask to Mongo collection for live dataset retraining |

---

## 📂 Repository Structure

The codebase is split into three main modules:
*   **Root Directory (`/`)**: Contains Python ML service files, data files, base configurations, and global project context documentation.
*   **Frontend Client (`/my-app`)**: Single Page Application built with React/Vite.
*   **Backend Server (`/server`)**: Node.js/Express API, database schemas, and Socket.io socket server.

```text
D:\project\Hospital\
├── app.py                      # Python Flask entry point for ML prediction and retraining
├── train_model.py              # Script to build and serialize baseline ML model files
├── hospital_recommendation_dataset.csv # Base CSV file with hospital features
├── requirements.txt            # Python ML environment dependencies
├── package.json / package-lock.json # Root package scripts and dependencies
├── venv/                       # Local Python virtual environment
├── ml_model/                   # Serialized ML model artifacts (.pkl & .json)
│   ├── hospital_nn_model.pkl   # Serialized NearestNeighbors model file
│   ├── hospital_vectorizer.pkl # Serialized TF-IDF vectorizer model file
│   └── hospital_mapping.json   # Processed metadata mapping for fuzzy lookups
├── my-app/                     # Frontend Module (React SPA)
│   ├── index.html              # Main HTML mounting container
│   ├── vite.config.js          # Vite config (Polyfills, development proxy configurations)
│   ├── package.json            # Node dependencies for frontend
│   └── src/                    # React Source Files
│       ├── main.jsx            # DOM mounting root file
│       ├── App.jsx             # React routing entry point and app structure
│       ├── index.css / App.css # Global CSS / Tailwind injections and utilities
│       ├── config.js           # Base environment URL exports
│       ├── components/         # Reusable UI component blocks (Navbar, ChatWindow, etc.)
│       └── pages/              # Role-specific dashboard views and workflows
└── server/                     # Backend Module (Node.js REST API + Websocket server)
    ├── index.js                # Server entry point, DB connector, and Socket.io controller
    ├── package.json            # Node dependencies for backend
    ├── controllers/            # Route controllers handling business logic
    ├── middleware/             # Express middlewares (JWT Authenticator)
    ├── models/                 # Mongoose schema definitions (Users, Hospitals, etc.)
    ├── routes/                 # Express router splits mapped to controllers
    ├── utils/                  # Injected helper classes (Brevo Emailer, Spellcheckers, etc.)
    ├── nlp/                    # Node-NLP training and dictionary pipelines
    └── uploads/                # Dynamic local storage directory for uploaded assets
```

---

## 🔑 Important Entry Points

1.  **Frontend Entry Point**: [main.jsx](file:///D:/project/Hospital/my-app/src/main.jsx) & [App.jsx](file:///D:/project/Hospital/my-app/src/App.jsx)
    *   Mounts the React application.
    *   Defines SPA application routing mapping views via `react-router-dom`.
2.  **Backend Server Entry Point**: [index.js](file:///D:/project/Hospital/server/index.js)
    *   Bootstraps the Express application.
    *   Establishes the Mongoose connection to MongoDB Atlas.
    *   Wraps the HTTP server with `socket.io` for bi-directional communication.
    *   Mounts API routes and initializes static directory mappings.
3.  **ML Microservice Entry Point**: [app.py](file:///D:/project/Hospital/app.py)
    *   Bootstraps the Flask server.
    *   Initializes local model pipelines in memory (cold-starts from local `.pkl` or live Atlas database fetching).
    *   Exposes `/predict` and `/retrain` REST ports.

---

## 📐 Architecture Summary

MediCare Plus utilizes a decoupled client-server architecture with an integrated Python microservice:

```
                  ┌──────────────────────────────────────────────┐
                  │                 FRONTEND                     │
                  │              (React / Vite)                  │
                  └──────────────┬────────────────┬──────────────┘
                                 │                │
                        REST API │                │ WebSockets (Socket.io)
                    (Express 5)  │                │ (Real-time Events, WebRTC)
                                 ▼                ▼
                  ┌──────────────────────────────────────────────┐
                  │                  BACKEND                     │
                  │             (Express Server)                 │
                  └──────────────┬────────────────┬──────────────┘
                                 │                │
              Mongoose Schema    │                │ HTTP POST (Axios)
             (DB operations)     │                │ (/predict & /retrain)
                                 ▼                ▼
                  ┌─────────────────────────┐  ┌─────────────────────────┐
                  │       DATABASE          │  │     ML SERVICE          │
                  │    (MongoDB Atlas)      │  │   (Python Flask)        │
                  └─────────────────────────┘  └─────────────────────────┘
```

1.  **REST API Layer**: The Frontend calls specific Node.js router boundaries. These controllers handle authentication, database querying, vital insertion, and document retrieval.
2.  **Real-Time WebSocket Layer**: Used for instant updates. Active users establish a socket connection and subscribe to a private "room" defined by their MongoDB User ID. Video consultation handshakes (SDP/ICE exchanges) and SOS dispatches run entirely over this socket.
3.  **ML Inference Layer**: When a user submits symptoms, the backend routes the string to Flask `/predict`. Flask tokenizes the query, performs Cosine similarity, maps it to the top 5 nearest hospitals, and returns it. Node.js processes these names against its database.

---

## ⚡ Runtime Services

During local development, the platform runs on the following ports:
*   **Frontend Client**: `http://localhost:5173` (Vite dev server)
*   **Backend Server**: `http://localhost:5000` (Node.js API + Socket.io gateway)
*   **ML Microservice**: `http://localhost:5001` (Python Flask service)
*   **Database**: MongoDB Atlas cloud cluster (or local instance, if custom configured)

---

## 🛠️ Development Commands

### Backend (`/server`)
*   `node index.js`: Starts the Express and Socket.io services.
*   `node nlp/trainModel.js`: Retrains the local Node-NLP intent database.
*   `node seedHospitals.js` / `node seed_and_book.js`: Generates mock hospitals and accounts.
*   `node resetDb.js` / `node clear_patients.js`: Maintenance scripts to clean database state.

### Frontend (`/my-app`)
*   `npm run dev`: Starts the Vite development server on `localhost:5173`.
*   `npm run build`: Bundles the React codebase for production deployment.
*   `npm run preview`: Previews the production build locally.
*   `npm run lint`: Scans code for ESLint errors.

### ML Service (`/`)
*   `python train_model.py`: Fetches `hospital_recommendation_dataset.csv` and serializes model files to `/ml_model`.
*   `python app.py`: Starts the Flask service on port `5001`.

---

## ✏️ Coding Conventions

1.  **JavaScript & React**:
    *   **Functional Components**: Standard ES6 arrow functions with explicit hooks (`useState`, `useEffect`, `useMemo`).
    *   **Asynchronous Flow**: Strict use of `async/await` with `try/catch` blocks for cleaner stack traces.
    *   **Tailwind Overrides**: Use Tailwind utility classes directly alongside MUI component tags for fast styling.
2.  **Backend & Express**:
    *   **Single-Table Inheritance**: A unified `User` collection wrapping multiple roles via Enum fields.
    *   **Unified Middleware Verification**: REST routes are strictly wrapped in the `auth` middleware, reading `x-auth-token` from request headers.
    *   **Status Codes**: Proper HTTP response flags (`200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `500 Internal Error`).
3.  **Python & ML**:
    *   **Pure Functions**: Internal pre-processors and reasoning engines (`_build_hospital_profile`, `_generate_reason`) are kept modular.
    *   **Exception Isolation**: Wrapped heavily in try-catches returning `traceback.format_exc()` on 500 crashes to aid backend debugging.

---

## 🔒 Sensitive Areas

The following layers must never be altered without strict verification:
*   **Authentication Middleware (`server/middleware/auth.js`)**: Modifying this will expose all protected medical API layers.
*   **Socket Room Mapping**: Sockets rely on precise room names mapping to user `_id`. Changing event structures will break video calls and ambulance SOS routing.
*   **ML Pipeline Serialization (`app.py` & `train_model.py`)**: The data structures of `hospital_profile` must remain identical in both Flask and script retraining to prevent matrix transformation sizing mismatches.
*   **Medical Privacy Validations (`server/controllers/appointmentController.js`)**: Strict verification checks to reject doctors from fetching history logs if patient maps do not contain `approved: true`.

---

## ⚠️ Known Technical Debt

1.  **Ephemeral Uploads File Storage**: Uploaded hospital files are written locally to the backend disk (`/server/uploads`). In scaled production container servers (e.g., Render/Heroku), this filesystem is ephemeral and gets erased on boot. It must be refactored to an AWS S3 or Cloudinary stream.
2.  **WebRTC Simple-Peer Signaling Fallback**: Simple-peer signaling runs fine on local connections, but lacks custom STUN/TURN servers inside production routes. When running across strict mobile cellular networks or corporate firewalls, connections will fail to establish.
3.  **Local Storage JWT Session Store**: The client stores JWT tokens directly in browser `localStorage`. For secure production applications, these should be stored in HTTP-Only, Secure, SameSite cookies to shield against XSS token harvesting.

---

## 🎯 Current Development Focus

*   Establishing full documentation and project memory maps for onboarding and automated development.
*   Ensuring local environment setups and database seeding pipelines run flawlessly.
*   Preparing architectural specifications for high-capacity scaling.

---

## 🌐 External Integrations

*   **Brevo API**: Injected as an SMTP transporter in Node.js to fire 6-digit verification codes to newly created profiles.
*   **MongoDB Atlas Cloud**: Host database cluster for all schema models.
*   **Vercel CDN**: Hosts the production frontend application.
*   **Render Web Service**: Container host for the Express and Flask backend servers.
