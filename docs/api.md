# 🔌 API Specification: MediCare Plus

This document lists all discovered REST API endpoints, payload formats, authentication guards, and WebSocket real-time events.

---

## 🔒 Authentication Security Matrix

Most endpoints are guarded by JWT authorization. The token is delivered and verified securely via:
1. **Secure HTTP-Only Cookie**: Automatically sent by the browser under the key `token` (uses `SameSite: none`, `Secure: true`).
2. **Fallback Authorization Headers**:
   * **Header Key**: `Authorization` (with `Bearer <token>` format).
   * **Custom Header Key**: `x-auth-token`.
*   **Token Format**: JWT string containing `{ id, role }`.

| Endpoint Path | Authentication | Allowed Roles | Content-Type |
| :--- | :--- | :--- | :--- |
| `/register`, `/login`, `/verify-email` | 🔓 Public | All | `application/json` |
| `/logout` | 🔓 Public / Protected | All | `application/json` |
| `/api/chatbot` | 🔓 Public (or Patient) | All | `application/json` |
| `/api/doctors`, `/api/hospitals` | 🔓 Public (or Protected) | All | `application/json` |
| `/api/vitals/*`, `/api/appointments/book` | 🔑 Guarded | `patient` | `application/json` |
| `/api/appointments/:id/report` | 🔑 Guarded | `doctor` | `application/json` |
| `/api/admin/*` | 🔑 Guarded | `admin` | `application/json` |
| `/api/super-admin/hospital` | 🔑 Guarded | `super-admin` | `multipart/form-data` |
| `/api/super-admin/trigger-retrain` | 🔑 Guarded | `super-admin` | `application/json` |

---

## 📂 REST API Endpoint Index

### 1. Public Authentication Endpoints (`/`)

#### 🔹 Register User
*   **Path**: `POST /register`
*   **Request Body**:
    ```json
    {
      "name": "Jane Doe",
      "email": "jane@example.com",
      "password": "Password123",
      "role": "patient",
      "phone": "9876543210"
    }
    ```
*   **Response (201 Created)**:
    ```json
    {
      "message": "Registration successful. Please verify your email.",
      "userId": "65d83f12a8019a12c842b012"
    }
    ```

#### 🔹 Verify Email (OTP Verification)
*   **Path**: `POST /verify-email`
*   **Request Body**:
    ```json
    {
      "email": "jane@example.com",
      "otp": "123456"
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5...",
      "user": {
        "id": "65d83f12a8019a12c842b012",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "role": "patient",
        "isVerified": true
      }
    }
    ```

#### 🔹 User Login
*   **Path**: `POST /login`
*   **Request Body**:
    ```json
    {
      "email": "jane@example.com",
      "password": "Password123"
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5...",
      "user": {
        "id": "65d83f12a8019a12c842b012",
        "role": "patient",
        "name": "Jane Doe"
      }
    }
    ```

#### 🔹 User Logout
*   **Path**: `POST /logout`
*   **Response (200 OK)**:
    ```json
    {
      "message": "Logged out successfully"
    }
    ```
    *(Clears the secure `token` HttpOnly cookie).*

---

### 2. Protected Patient Operations (`/api/...`)

#### 🔹 Log Vitals
*   **Path**: `POST /api/vitals`
*   **Headers**: `x-auth-token: <token>`
*   **Request Body**:
    ```json
    {
      "systolic": 120,
      "diastolic": 80,
      "bloodSugar": 95,
      "heartRate": 72,
      "weight": 68
    }
    ```
*   **Response (201 Created)**:
    ```json
    {
      "message": "Vitals logged successfully",
      "vitals": {
        "patientId": "65d83f12a8019a12c842b012",
        "systolic": 120,
        "diastolic": 80,
        "bloodSugar": 95,
        "recordedAt": "2026-05-24T10:00:00Z"
      }
    }
    ```

#### 🔹 Book Appointment
*   **Path**: `POST /api/appointments/book`
*   **Headers**: `x-auth-token: <token>`
*   **Request Body**:
    ```json
    {
      "doctorId": "65d83f12a8019a12c842b555",
      "date": "2026-05-26T14:30:00.000Z",
      "symptoms": "Mild shortness of breath and cough",
      "isEmergency": false
    }
    ```
*   **Response (210 Created)**:
    ```json
    {
      "message": "Appointment requested successfully",
      "appointmentId": "65d83f88a8019a12c842c999"
    }
    ```

---

### 3. Protected Doctor Operations (`/api/...`)

#### 🔹 Submit Consultation Report
*   **Path**: `POST /api/appointments/:id/report`
*   **Headers**: `x-auth-token: <token>`
*   **Request Body**:
    ```json
    {
      "diagnosis": "Acute Bronchitis",
      "prescription": "Amoxicillin 500mg, Paracetamol 650mg",
      "dosage": "1 tablet twice daily",
      "duration": "5 days",
      "severity": "Medium",
      "recommendations": "Rest and plenty of warm fluids",
      "followUpDate": "2026-06-02T00:00:00.000Z"
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "message": "Report submitted successfully",
      "appointment": {
        "_id": "65d83f88a8019a12c842c999",
        "status": "completed",
        "doctorReport": {
          "diagnosis": "Acute Bronchitis",
          "severity": "Medium",
          "reportDate": "2026-05-24T11:00:00Z"
        }
      }
    }
    ```

---

### 4. Admin & Super Admin Core Control Endpoints

#### 🔹 Create Hospital & Admin (Super Admin Protected)
*   **Path**: `POST /api/super-admin/hospital`
*   **Headers**: `x-auth-token: <token>`
*   **Content-Type**: `multipart/form-data`
*   **Form Payload Fields**:
    *   `name`: "Metro General Hospital"
    *   `city`: "New York"
    *   `totalBeds`: "250"
    *   `availableBeds`: "210"
    *   `hasICU`: "true"
    *   `image`: `<File Upload binary>`
*   **Response (201 Created)**:
    ```json
    {
      "message": "Hospital and Admin account created successfully",
      "hospital": {
        "_id": "65d83f99a8019a12c842d001",
        "name": "Metro General Hospital",
        "image": "/uploads/1700000000000_image.jpg"
      },
      "adminAccount": {
        "email": "metro_admin@medicare.com",
        "role": "admin"
      }
    }
    ```

#### 🔹 Trigger ML Retrain (Super Admin / Background Processed)
*   **Path**: `POST /api/super-admin/trigger-retrain`
*   **Headers**: `x-auth-token: <token>`
*   **Response (200 OK)**:
    ```json
    {
      "status": "success",
      "message": "Background retraining pipeline triggered"
    }
    ```

---

### 5. Flask ML Service Ports (`http://localhost:5001/...`)

#### 🔹 Predict Recommendations
*   **Path**: `POST /predict`
*   **Request Body**:
    ```json
    {
      "symptoms": "sharp chest pain radiating down left arm"
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "hospitals": [
        {
          "hospitalId": "65d83f99a8019a12c842d001",
          "hospitalName": "Metro General Hospital",
          "matchScore": 96,
          "reason": "Specializes in Cardiology matching your symptoms. Top-rated (4.8⭐)",
          "waitTimeMins": 15,
          "cashlessAvailable": true
        }
      ]
    }
    ```

---

## 📡 WebSockets Event Channels

WebSocket triggers are routed through port `5000`:

| Event Trigger | Sender | Recipient | Payload Structure |
| :--- | :--- | :--- | :--- |
| `join_room` | Client | Server | `userId (string)` |
| `send_location` | Driver Client | Server | `{ lat: float, lng: float, driverId: string }` |
| `receive_location` | Server | All Clients | `{ lat: float, lng: float, driverId: string }` |
| `sos_alert` | Patient Client | All Drivers | `{ lat: float, lng: float, patientId: string }` |
| `callUser` | Doctor Peer | Patient Room | `{ userToCall: string, signalData: object, from: string }` |
| `answerCall` | Patient Peer | Doctor Room | `{ to: string, signal: object }` |

---

## ⚠️ Security Notes

*   **No Rate Limiting**: The Express endpoints do not mount rate-limiting middleware (`express-rate-limit`). Malicious bots could script denial-of-service attempts against login or registration pathways.
*   **Data Validation**: String limits are managed natively by browser forms, but lack comprehensive validation at the database driver layer. Stronger schema validators should be added.
