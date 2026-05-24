# 💻 Local Setup Guide: MediCare Plus

This document provides a step-by-step setup manual to initialize and run the MediCare Plus frontend, backend, and machine learning services locally.

---

## 📋 Prerequisites

Ensure your development machine has the following runtimes installed:
*   **Node.js**: Version `18.x` or `20.x` (Recommended LTS)
*   **Python**: Version `3.10.x` or `3.11.x`
*   **Database**: A MongoDB Atlas Cloud URI cluster (or a local MongoDB Community Server running on port `27017`).
*   **Package Managers**: `npm` (packaged with Node) and `pip` (packaged with Python).

---

## 🚀 Step 1: Clone the Repository

Open your terminal and navigate to the project directory:
```bash
git clone <repository-url>
cd Hospital
```

---

## ⚙️ Step 2: Configure Environment Variables

Create a secure local configuration file named `.env` in the `/server` folder:

```bash
touch server/.env
```

Open `server/.env` and paste the following keys, replacing placeholders with your secure credentials:

```env
# Server Network Port
PORT=5000

# Database Connections
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/medicare?retryWrites=true&w=majority

# JWT Token Cryptography Secret
JWT_SECRET=f8c3a9d28ef40316499876e5dcd44a21d0124c8c

# Whitelisted Frontend URL
CLIENT_URL=http://localhost:5173

# ML Service URL Connection
ML_SERVICE_URL=http://localhost:5001

# SMTP Email Dispatch Credentials (Brevo API)
# Get a key from your Brevo Dashboard -> SMTP & API
BREVO_API_KEY=xkeysib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 🐍 Step 3: Set up the Python ML Microservice

Navigate to the project root and spin up an isolated Python virtual environment:

### Windows (PowerShell)
```powershell
# Set execution permissions if blocked
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned

# Initialize virtual environment
python -m venv venv

# Activate the environment
.\venv\Scripts\Activate.ps1

# Install required dependencies
pip install -r requirements.txt
```

### macOS / Linux
```bash
# Initialize virtual environment
python3 -m venv venv

# Activate the environment
source venv/bin/activate

# Install required dependencies
pip install -r requirements.txt
```

### Pre-Train Baseline Models
Before launching the service, pre-compile the local vectors from the hospital dataset to disk:
```bash
python train_model.py
```
This generates the model files under `/ml_model`:
*   `hospital_nn_model.pkl`
*   `hospital_vectorizer.pkl`
*   `hospital_mapping.json`

---

## 🟢 Step 4: Install Node.js Dependencies

Open two separate terminal shells to install your packages:

### 1. Backend Server Environment
```bash
cd Hospital/server
npm install
```

### 2. Frontend Client Environment
```bash
cd Hospital/my-app
npm install
```

---

## 🗄️ Step 5: Seed the Database

Populate your MongoDB database with rich, mock hospitals, administrators, active doctor accounts, and drivers:

```bash
cd Hospital/server

# Run the master seeder
node seed_and_book.js

# Or run individual seeders
node seedHospitals.js
node create_city_admin.js
```

---

## 🚀 Step 6: Startup & Running Locally

To run the entire platform, start the three services in separate terminals:

### 1. Python ML Microservice Terminal
*(Ensure your virtual environment is active)*
```bash
# In project root
python app.py
```
*Flask starts up on port `5001`.*

### 2. Express Backend API Server Terminal
```bash
cd Hospital/server
node index.js
```
*Express & Socket.io start up on port `5000`.*

### 3. React Frontend Client Terminal
```bash
cd Hospital/my-app
npm run dev
```
*Vite serves the client interface on `http://localhost:5173`.*

---

## 🛠️ Recovery & Troubleshooting Commands

### 1. Flask Fails to Connect to MongoDB
*   **Problem**: You see a MongoClient connection timeout on cold-start.
*   **Resolution**: Set the environment variable `MONGODB_URI` in your terminal shell before running Python:
    *   Windows: `$env:MONGODB_URI="your-uri-string"`
    *   Mac/Linux: `export MONGODB_URI="your-uri-string"`

### 2. Database Corruption or Dirty State
*   **Problem**: Duplicate accounts or hospitals prevent new signups.
*   **Resolution**: Run the reset script to purge all test data and re-run seeders:
    ```bash
    cd Hospital/server
    node resetDb.js
    node seed_and_book.js
    ```

### 3. Port Collisions
*   **Problem**: You see `EADDRINUSE: address already in use :::5000`.
*   **Resolution**: Kill whatever local process is occupying that port:
    *   Windows: `Stop-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess -Force`
    *   Mac/Linux: `kill -9 $(lsof -t -i:5000)`
