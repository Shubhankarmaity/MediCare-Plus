# MediCare Plus

A production-style, multi-role Hospital Management System built with the MERN ecosystem, real-time communication, and ML-assisted hospital recommendations.

[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-0f172a?logo=react)](my-app)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-065f46?logo=node.js)](server)
[![Database](https://img.shields.io/badge/Database-MongoDB-14532d?logo=mongodb)](server/models)
[![Realtime](https://img.shields.io/badge/Realtime-Socket.io-111827?logo=socketdotio)](server/index.js)

## Live Demo

- Application: https://medi-care-plus-gules.vercel.app/

## Why This Project

MediCare Plus connects patients, doctors, hospital admins, drivers, and super admins on one platform with:

- secure authentication and role-based access
- appointment workflows and doctor approvals
- real-time messaging, signaling, and ambulance alerts
- hospital discovery and recommendation support
- downloadable clinical records and reports

## Core Features

### Multi-Role Workflows

- Patient: appointment booking, reports, vitals, payments, access requests, chatbot assistance
- Doctor: appointment queue, consultation actions, patient communication, reporting
- Admin: hospital-scoped operational controls and approvals
- Driver: ambulance dispatch, availability status, live location updates
- Super Admin: global hospital operations and centralized control

### Real-Time and Communication

- Socket.io-powered events for messaging, location sharing, ambulance dispatch, and call signaling
- user-specific rooms for targeted notifications and communication

### AI and Recommendations

- NLP and knowledge-base assisted chatbot in backend controllers
- optional Python ML microservice integration for hospital recommendations

## Tech Stack

### Frontend

- React 19, Vite 5, React Router
- Tailwind CSS, MUI, Framer Motion
- Axios, Recharts, Mapbox GL, jsPDF, html2canvas

### Backend

- Node.js, Express 5
- MongoDB + Mongoose
- JWT, bcryptjs, multer, Socket.io

### ML (Optional Service)

- Python service for model training and prediction
- integrated from backend via configurable service URL

## Repository Structure

```text
.
|- server/        # Express API, models, routes, controllers, socket server
|- my-app/        # React + Vite frontend
|- app.py         # Python ML service entrypoint
|- train_model.py # Model training script
|- README.md
```

## Quick Start (Local Development)

### Prerequisites

- Node.js 18+
- npm 9+
- MongoDB connection string

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd Hospital

cd server
npm install

cd ../my-app
npm install
```

### 2. Configure Environment

Create `server/.env`:

```env
PORT=5000
MONGODB_URI=<your_mongodb_uri>
JWT_SECRET=<your_jwt_secret>
CLIENT_URL=http://localhost:5173
ML_SERVICE_URL=http://localhost:5001
```

### 3. Run Backend

```bash
cd server
node index.js
```

Backend runs at http://localhost:5000

### 4. Run Frontend

```bash
cd my-app
npm run dev
```

Frontend runs at the Vite URL shown in terminal (commonly http://localhost:5173 or http://localhost:5180)

### 5. Optional: Run ML Service

```bash
python app.py
```

## API Surface (High Level)

- Auth and profile: `/register`, `/login`, `/verify-email`, `/profile`
- Doctors: `/api/doctors/*`
- Appointments: `/api/appointments/*`
- Hospitals: `/api/hospitals/*`
- Ambulance: `/api/ambulance/*`
- Chatbot: `/api/chatbot/*`
- Notifications and messages: `/api/notifications/*`, `/api/messages/*`

## Security Notes

- keep `.env` out of version control
- rotate credentials before production release
- use a strong `JWT_SECRET` per environment
- restrict CORS origins for deployed environments

## Scripts

### Backend (`server/package.json`)

- `node index.js` to start API server

### Frontend (`my-app/package.json`)

- `npm run dev` for development
- `npm run build` for production build
- `npm run preview` for build preview
- `npm run lint` for lint checks

## Documentation

- Detailed project documentation: `DOCUMENTATION.md`
- Architecture and workflow notes: `PROJECT_OVERVIEW.md`, `workflow-diagram.md`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit clear, focused changes
4. Open a pull request with test notes and screenshots (if UI changes)

## License

This project is intended for educational and portfolio use unless otherwise specified by the repository owner.
