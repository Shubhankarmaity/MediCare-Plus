# 🔄 System Workflows: MediCare Plus

This document describes the end-to-end procedural flows of core platform operations, utilizing sequence diagrams to trace client-server-database lifecycles.

---

## 🔐 1. Authentication & Verification Workflow

Enforces registration, password cryptology, OTP email delivery, and JWT creation:

```mermaid
sequenceDiagram
    autonumber
    actor Client as User Client
    participant Express as Express Server
    participant Brevo as Brevo SMTP API
    participant MongoDB as MongoDB Database

    Client->>Express: POST /register { email, password, role, name }
    Express->>MongoDB: Check for existing User by Email
    MongoDB-->>Express: Returns null (Safe to register)
    Express->>Express: Hash Password using bcryptjs (salt: 10)
    Express->>Express: Generate random 6-digit OTP & hash it
    Express->>MongoDB: Save User Document [isVerified: false, otp: hashedOtp]
    Express->>Brevo: Trigger SMTP email with plain text OTP
    Brevo-->>Client: Deliver 6-digit OTP code to Inbox
    Express-->>Client: 201 Created (Redirect to verify page)
    
    Client->>Express: POST /verify-email { email, otp }
    Express->>MongoDB: Fetch User Document
    MongoDB-->>Express: Returns Document
    Express->>Express: Compare inputs with hashed OTP
    Express->>MongoDB: Update Document [isVerified: true, otp: null]
    Express->>Express: Sign stateless JWT token { id, role } (expires: 7 days)
    Express-->>Client: 200 OK [token, user JSON]
```

---

## 📅 2. Appointment Booking Lifecycle

A multi-stage coordination pipeline between patients, hospital administrators, and doctors:

```mermaid
sequenceDiagram
    autonumber
    actor Patient as Patient Client
    participant Express as Express Server
    actor Doctor as Doctor Client
    participant Sockets as Sockets Gateway
    participant MongoDB as MongoDB Database

    Patient->>Express: POST /api/appointments/book { doctorId, date, symptoms }
    Express->>MongoDB: Verify Doctor exists & matches Patient hospital scope
    MongoDB-->>Express: Returns verified Doctor
    Express->>MongoDB: Save Appointment Document [status: 'requested']
    Express->>Sockets: Emit 'new_appointment' event
    Sockets-->>Doctor: Alert Doctor in real-time
    Express-->>Patient: Return success JSON

    Doctor->>Express: PUT /api/appointments/:id/status { status: 'approved' }
    Express->>MongoDB: Update Appointment Document [status: 'approved']
    Express->>Sockets: Emit 'appointment_approved' event
    Sockets-->>Patient: Send real-time notification
    Express-->>Doctor: Return success JSON
```

---

## 📹 3. WebRTC Video Consultation signaling Flow

Establishes a Peer-to-Peer browser video/audio connection without traversing backend resource pipelines:

```mermaid
sequenceDiagram
    autonumber
    actor Doctor as Doctor Browser (Host)
    participant Sockets as Sockets Gateway (Signaler)
    actor Patient as Patient Browser (Peer)

    Note over Doctor: Request user Media Stream <br> [navigator.mediaDevices.getUserMedia]
    Doctor->>Sockets: emit('callUser', { userToCall: patientId, signalData: offerSDP })
    Sockets->>Patient: emit('callUser', { signal: offerSDP, from: doctorId })
    
    Note over Patient: Prompt user "Incoming Call" <br> Request user Media Stream
    Patient->>Sockets: emit('answerCall', { to: doctorId, signal: answerSDP })
    Sockets->>Doctor: emit('callAccepted', answerSDP)
    
    Note over Doctor, Patient: Exchange ICE Candidates via Sockets Gateway <br> emit('ice-candidate')
    
    Note over Doctor: Direct P2P Connection Established!
    Note over Patient: Direct P2P Connection Established!
```

---

## 🚨 4. Emergency SOS Ambulance Dispatch Workflow

Establishes live tracking coordinates between a distress call and on-duty ambulance drivers:

```mermaid
sequenceDiagram
    autonumber
    actor Patient as Patient Client (SOS)
    participant Sockets as Sockets Gateway
    actor Driver as Active Driver Client
    participant MongoDB as MongoDB Database

    Patient->>Sockets: emit('sos_alert', { lat, lng, patientId })
    Sockets->>Driver: emit('dispatch_ambulance', { lat, lng, patientId })
    Note over Driver: Receives SOS notification! <br> Accepts emergency request.
    
    Driver->>Express: PUT /api/ambulance/accept { requestId }
    Express->>MongoDB: Update AmbulanceRequest [status: 'dispatched']
    Express-->>Driver: Return verified status
    
    loop Real-time Coordinate Streaming
        Driver->>Sockets: emit('send_location', { lat, lng, driverId })
        Sockets->>Patient: emit('receive_location', { lat, lng, driverId })
        Note over Patient: Renders ambulance icon moving <br> on Mapbox GL Canvas
    end
```

---

## 🧠 5. AI Chatbot Inference & Dynamic Recommendation

Combines general health inquiries with dynamic, ML-powered hospital recommendations:

```mermaid
sequenceDiagram
    autonumber
    actor Patient as Patient Chat UI
    participant Server as Express Server
    participant Flask as Flask Service
    participant MongoDB as MongoDB Database

    Patient->>Server: POST /api/chatbot { symptoms }
    Server->>Server: Scan Node-NLP matching keywords
    
    alt Request is for generic medical information
        Server-->>Patient: Return direct knowledge response
    else Request matches Referral Intent
        Server->>Flask: POST /predict { symptoms }
        Flask->>Flask: Vectorize text using TF-IDF
        Flask->>Flask: Execute K-Nearest Neighbors mathematical match
        Flask-->>Server: Return 5 closest Hospital Names
        Server->>Server: Fuzzy-resolve names to MongoDB IDs
        Server->>MongoDB: Fetch detailed Hospital Documents
        MongoDB-->>Server: Return documents
        Server-->>Patient: Render interactive Hospital cards + Match Scores in chat
    end
```
