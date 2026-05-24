# 🗺️ System Overview: MediCare Plus

This document describes the high-level system-wide topology, database connections, ML integrations, external APIs, and routing structures.

---

## 🏛️ System Topology

MediCare Plus is structured as a decoupled multi-service platform. It comprises a Single Page React application, a central Node.js REST + WebSocket server, a Python Flask machine learning server, a MongoDB database layer, and external SMTP services.

```mermaid
graph TD
    Client["React Frontend SPA (Vite)<br>Port: 5173 / Vercel"]
    
    NodeAPI["Node.js / Express API<br>Port: 5000 / Render"]
    SocketServer["Socket.io WebSocket Server<br>Port: 5000 / Render"]
    
    FlaskService["Python Flask ML Service<br>Port: 5001 / Render"]
    
    Database[("MongoDB Atlas Cloud Database")]
    BrevoAPI["Brevo SMTP Mail Service<br>(OTP Deliveries)"]

    %% Communication Pathways
    Client -->|HTTPS / JSON / Form-Data| NodeAPI
    Client <-->|WebSockets / P2P Signaling| SocketServer
    
    NodeAPI -->|Axios REST /predict & /retrain| FlaskService
    NodeAPI <-->|Mongoose ODM| Database
    NodeAPI -->|Nodemailer / SMTP| BrevoAPI
    
    FlaskService <-->|PyMongo Driver| Database
```

---

## 📡 Core System Services

### 1. React Frontend Client (`/my-app`)
*   **Role**: Handles user experience, routes views, tracks state, and coordinates streams.
*   **Key Packages**: `@mui/material` (UI theme structure), `tailwindcss` (custom views), `recharts` (health metrics rendering), `simple-peer` (WebRTC P2P handler), `socket.io-client` (WebSocket streams), `jsPDF` (clinical export triggers).
*   **State Store**: Employs synchronous local storage vectors (`localStorage`) to preserve JWT authorization headers and user role JSON fields.

### 2. Node.js Express API Server (`/server`)
*   **Role**: Coordinates business logic, manages user collections, and routes API requests.
*   **Key Packages**: `express` (routing layers), `mongoose` (data schemas), `multer` (multipart forms file uploads), `nodemailer` (SMTP connections), `node-nlp` (local intent processing), `jsonwebtoken` (session encryption).

### 3. Socket.io WebSockets Gateway (`/server`)
*   **Role**: Manages persistent bi-directional communication channels.
*   **Key Channels**:
    *   `join_room`: Registers user IDs to isolated virtual channels to route direct, private messages.
    *   `callUser` / `answerCall` / `ice-candidate`: WebRTC signaling transport.
    *   `sos_alert` / `dispatch_ambulance`: Coordinates emergency location broadcasts.

### 4. Flask Python ML Service (`/`)
*   **Role**: Coordinates NearestNeighbors predictions and processes dynamic, zero-downtime model retrains.
*   **Key Packages**: `Flask` (server skeleton), `scikit-learn` (vectorization and similarity calculations), `pandas` & `numpy` (matrix processing), `joblib` (in-memory pipeline loading), `pymongo` (MongoDB connectivity).

---

## 🔐 System Authentication & Request Lifecycle

Below is the procedural flow of a protected REST API call:

```mermaid
sequenceDiagram
    autonumber
    actor Patient as Patient Client
    participant Express as Express Gateway
    participant AuthMW as authMiddleware
    participant Controller as AppointmentController
    participant MongoDB as MongoDB Database

    Patient->>Express: POST /api/appointments/book <br> [Headers: x-auth-token]
    Note over Express, AuthMW: Handed to auth middleware
    AuthMW->>AuthMW: Extract token & Verify JWT
    alt Token is missing or invalid
        AuthMW-->>Patient: 401 Unauthorized / 403 Forbidden
    else Token is valid
        AuthMW->>Controller: Next() [Injects req.user]
        Controller->>Controller: Check target doctor and availability
        Controller->>MongoDB: User.findById() & Appointment.save()
        MongoDB-->>Controller: Return document
        Controller-->>Patient: 201 Created [JSON payload]
    end
```

---

## 🤖 AI Referral & Prediction Data Flow

The following sequence describes the integration pathway of symptom-based hospital matching:

```mermaid
sequenceDiagram
    autonumber
    actor Patient as Patient Chat UI
    participant Server as Express Server
    participant Flask as Flask ML (/predict)
    participant MongoDB as MongoDB Database

    Patient->>Server: POST /api/chatbot [Symptoms input]
    Server->>Server: Local Node-NLP scan (check intent)
    Note over Server: Intent = "hospital_recommendation"
    Server->>Flask: POST /predict { symptoms }
    Flask->>Flask: TF-IDF Vectorize symptom string
    Flask->>Flask: KNN Cosine Similarity search
    Flask-->>Server: Return 5 closest Hospital Names
    Server->>Server: Fuse.js Fuzzy match names to MongoDB IDs
    Server->>MongoDB: Fetch detailed Hospital Documents
    MongoDB-->>Server: Return records
    Server-->>Patient: Render hospital cards + Match Scores in chat
```
