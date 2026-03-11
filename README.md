# AttendAI Prototype

AttendAI Prototype is a facial-recognition attendance demo that shows how a modern classroom attendance workflow could work with camera-based face registration, live recognition, and role-based dashboards for admins, teachers, and students.

This repository is a prototype, not a production-ready biometric system. It is intended to demonstrate product direction, user flow, and technical feasibility. If engineered properly with secure identity handling, stronger ML models, compliance controls, and persistent infrastructure, the same concept could be applied in real educational or workplace attendance systems.

## Live Demo

The deployed frontend is available at:

- https://attend-ai-prototype.vercel.app/

You can open the live app directly from GitHub and use the demo login credentials listed below.

## What It Does

- Provides a React frontend with admin, teacher, and student demo views.
- Lets an admin register a student's face using the device camera.
- Sends captured image data to a FastAPI backend.
- Creates a lightweight image signature and matches it against registered faces.
- Lets a teacher run a live attendance scan session.
- Shows mock analytics, class summaries, and student attendance views for demonstration purposes.

## Current Prototype Scope

The project currently mixes real and simulated behavior:

- Real:
  - Webcam capture in the browser
  - Face registration requests to the backend
  - Face recognition requests to the backend
  - CORS-enabled FastAPI service
- Simulated:
  - Login and roles
  - Student, teacher, class, and attendance datasets
  - Dashboard analytics and historical records
  - Persistent biometric storage

## Tech Stack

- Frontend: React 19, Vite
- Backend: FastAPI, Uvicorn
- Image processing: Pillow, NumPy
- Runtime: Node.js, Python

## Project Structure

```text
Attendance/
├── attendai/           # React + Vite frontend
├── attendai-backend/   # FastAPI backend
├── venv/               # Local Python virtual environment
└── README.md
```

## How To Run

### 1. Start the frontend

```bash
cd attendai
npm install
cp .env.example .env
npm run dev
```

The frontend usually runs at `http://localhost:5173`.

### 2. Start the backend

From the repository root:

```bash
./venv/bin/pip install -r attendai-backend/requirements.txt
cd attendai-backend
cp .env.example .env
../venv/bin/uvicorn server:app --host 127.0.0.1 --port 8000
```

The backend runs at `http://127.0.0.1:8000`.

### 3. Open the app

- Frontend: `http://localhost:5173`
- Backend health check: `http://127.0.0.1:8000/health`
- Backend API docs: `http://127.0.0.1:8000/docs`

### Live deployed version

If you do not want to run the project locally, use the deployed frontend:

- https://attend-ai-prototype.vercel.app/

## Demo Login Credentials

Use these demo accounts from the frontend login screen:

- Admin: `admin@school.edu` / `admin123`
- Teacher: `teacher@school.edu` / `teach123`
- Student: `student@school.edu` / `student123`

## Typical Demo Flow

1. Log in as `Admin`.
2. Open the students page.
3. Register a face for a student using the webcam.
4. Log out and sign in as `Teacher`.
5. Open the scan page and start a recognition session.
6. Present the registered face to the camera and observe the attendance marking flow.

## Backend API Summary

- `GET /`
  - Basic backend status and route listing
- `GET /health`
  - Health check and registered face count
- `GET /registered-faces`
  - Returns all currently registered faces in memory
- `POST /register-face`
  - Registers a student's reference image
- `POST /recognize`
  - Attempts to match a live image against the registered set

## Important Limitations

- Registered faces are stored in memory only and are lost when the server restarts.
- The current matching logic is a simplified image-signature comparison, not a robust biometric recognition pipeline.
- There is no database, authentication backend, audit logging, or access-control enforcement.
- There is no liveness detection, spoof protection, encryption, or privacy management.
- The dashboards use mock academic and attendance data.
- This project should not be used as-is for real biometric attendance collection.

## How This Could Become Real-World Ready

To turn this prototype into a deployable system, the next version would need:

- A proper authentication and authorization system
- Persistent storage for users, classes, sessions, and attendance records
- Secure biometric template storage instead of raw image-style matching
- A stronger face recognition pipeline with calibration and threshold testing
- Liveness detection and anti-spoofing controls
- Consent, privacy, retention, and compliance workflows
- Admin audit trails and operational monitoring
- Device management, classroom session controls, and failure recovery paths
- Real reporting, exports, and institutional integrations

## Recommended Use Case For This Repository

This repository is best used for:

- Final-year project demonstrations
- portfolio presentations
- hackathon prototypes
- UI/UX experimentation for attendance automation
- early validation of a smart attendance product concept

## Notes For Contributors

- The frontend API base URL is controlled by `VITE_API_BASE_URL` and defaults to `http://127.0.0.1:8000`.
- The backend CORS allowlist is controlled by `ALLOWED_ORIGINS` and defaults to local Vite origins.
- If camera access fails, verify browser permissions first.

## License

No license is currently defined in this repository. Add one before publishing if you want others to reuse the code.
