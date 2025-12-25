# MediCare-Plus Hospital Management System - Workflow Diagram

## System Architecture Overview

```mermaid
graph TB
    A[Client - React/Vite] -->|API Calls| B((Server - Node.js/Express))
    B --> C[(Database - MongoDB)]
    B -->|Real-time| D[Socket.IO]
    D --> A
```

## User Authentication Flow

```mermaid
graph TD
    A[User Accesses Application] --> B[Login Page]
    B --> C{Valid Credentials?}
    C -->|Yes| D[JWT Token Generation]
    C -->|No| E[Show Error Message]
    D --> F{User Role?}
    F -->|Patient| G[Patient Dashboard]
    F -->|Doctor| H[Doctor Dashboard]
    F -->|Admin| I[Admin Dashboard]
    F -->|Driver| J[Driver Dashboard]
```

## Patient Workflow

```mermaid
graph TD
    A[Patient Dashboard] --> B{Select Action}
    B -->|Find Doctors| C[View Available Doctors]
    B -->|Book Ambulance| D[View Available Drivers]
    B -->|My Reports| E[View Medical Reports]
    
    C --> F[Select Doctor]
    F --> G[View Doctor Details]
    G --> H[Confirm Booking]
    H --> I[Send Booking Request]
    I --> J[Notification to Doctor]
    
    D --> K[Select Driver]
    K --> L[Confirm Ambulance Request]
    L --> M[Send Ambulance Request]
    M --> N[Notification to Driver]
    
    E --> O[View Appointment History]
    O --> P{Report Available?}
    P -->|Yes| Q[Display Medical Report]
    P -->|No| R[No Report Message]
```

## Doctor Workflow

```mermaid
graph TD
    A[Doctor Dashboard] --> B[View Appointments]
    B --> C{Appointment Status}
    C -->|Pending| D[Approve/Reject Appointment]
    C -->|Approved| E[Submit Medical Report]
    C -->|Any| F[View Appointment Details]
    
    D --> G[Update Appointment Status]
    G --> H[Notify Patient]
    
    E --> I[Fill Report Form]
    I --> J[Submit Report]
    J --> K[Save to Database]
    K --> L[Notify Patient of Report]
```

## Admin Workflow

```mermaid
graph TD
    A[Admin Dashboard] --> B[User Management]
    A --> C[Doctor Management]
    A --> D[System Monitoring]
    
    B --> E[View All Users]
    B --> F[Activate/Deactivate Accounts]
    B --> G[View User Details]
    
    C --> H[View Doctor Applications]
    C --> I[Approve/Reject Doctors]
    C --> J[Manage Doctor Profiles]
    
    D --> K[View System Stats]
    D --> L[Monitor Real-time Activity]
```

## Driver Workflow

```mermaid
graph TD
    A[Driver Dashboard] --> B[View Ambulance Requests]
    B --> C{Request Status}
    C -->|New| D[Accept/Decline Request]
    C -->|Accepted| E[Update Location]
    C -->|Any| F[View Request Details]
    
    D --> G[Update Request Status]
    G --> H[Notify Patient]
    
    E --> I[Send Location Updates]
    I --> J[Real-time Tracking for Patient]
```

## Data Flow Diagram

```mermaid
graph LR
    A[Frontend Components] --> B{API Layer}
    B --> C[Controllers]
    C --> D[Models]
    D --> E[(MongoDB)]
    E --> D
    D --> C
    C --> B
    B --> A
    
    F[Socket.IO Events] --> G[Real-time Communication]
    G --> A
    G --> H[Push Notifications]
```

## Detailed Appointment Process Flow

```mermaid
sequenceDiagram
    participant P as Patient
    participant F as Frontend
    participant S as Server
    participant D as Doctor
    participant DB as Database
    
    P->>F: Navigate to Doctors Tab
    F->>S: GET /api/doctors
    S->>DB: Query Doctors Collection
    DB-->>S: Return Doctors List
    S-->>F: Send Doctors Data
    F->>P: Display Doctors
    
    P->>F: Click Book Appointment
    F->>S: POST /api/appointments/book
    S->>DB: Save New Appointment
    DB-->>S: Confirmation
    S->>D: Socket.IO Notification
    S-->>F: Success Response
    F->>P: Show Booking Confirmation
    
    D->>F: Receive Notification
    D->>F: Open Doctor Dashboard
    F->>S: GET /api/appointments/my-appointments
    S->>DB: Query Appointments
    DB-->>S: Return Appointments
    S-->>F: Send Appointments Data
    F->>D: Display New Appointment
    
    D->>F: Click Approve
    F->>S: PUT /api/appointments/status/{id}
    S->>DB: Update Appointment Status
    DB-->>S: Confirmation
    S->>P: Socket.IO Notification
    S-->>F: Success Response
    F->>D: Update UI
    
    D->>F: Click Submit Report
    F->>S: PUT /api/appointments/report/{id}
    S->>DB: Save Doctor Report
    DB-->>S: Confirmation
    S->>P: Socket.IO Notification
    S-->>F: Success Response
    F->>D: Update UI
    
    P->>F: Navigate to My Reports Tab
    F->>S: GET /api/appointments/my-appointments
    S->>DB: Query Appointments with Reports
    DB-->>S: Return Appointments with Reports
    S-->>F: Send Data with Reports
    F->>P: Display Medical Reports
```

## Key Features Summary

1. **Role-Based Access Control**
   - Patients: Book appointments, view reports, request ambulances
   - Doctors: Manage appointments, submit reports
   - Admins: User management, system oversight
   - Drivers: Respond to ambulance requests

2. **Real-time Features**
   - Instant notifications via Socket.IO
   - Live ambulance tracking
   - Real-time appointment updates

3. **Data Management**
   - Secure JWT authentication
   - MongoDB for data persistence
   - RESTful API architecture

4. **User Experience**
   - Responsive dashboard layouts
   - Intuitive navigation
   - Visual indicators for status updates