# Smart Attendance System

Full-stack attendance application with role-based portals, automated attendance recognition, an Express API, a FastAPI face service, MongoDB, and Docker.

## Services

- `frontend`: React + Tailwind + React Router
- `backend`: Node.js + Express + MongoDB + JWT
- `ai-service`: FastAPI + OpenCV + DeepFace

## Quick Start

1. Copy env files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp ai-service/.env.example ai-service/.env
```

2. Start with Docker:

```bash
docker compose up --build
```

3. Open:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000/api/health`
- AI service docs: `http://localhost:8000/docs`

## Demo Users

Seed these via the database or create them through the admin API:

- Admin: `admin@school.edu / Admin@123`
- Teacher: `teacher@school.edu / Teacher@123`
- Student: `student@school.edu / Student@123`

## Local Development

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### AI Service

```bash
cd ai-service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
