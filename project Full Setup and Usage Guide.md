## Full Setup and Usage Guide

To use this project from GitHub, start by downloading the repository to your computer. You can do this either by cloning it with Git or by downloading the ZIP file from GitHub.

### 1. Download the project

If you have Git installed, open a terminal and run:

```bash
git clone <your-github-repo-link>
cd Attendance
```

If you do not use Git:
1. Open the GitHub repository in your browser.
2. Click `Code`.
3. Click `Download ZIP`.
4. Extract the ZIP file.
5. Open the extracted `Attendance` folder in your terminal or code editor.

### 2. Install frontend dependencies

Move into the frontend folder and install the required Node packages:

```bash
cd attendai
npm install
```

This installs all frontend dependencies such as React and Vite.

### 3. Start the frontend

Run the frontend development server:

```bash
npm run dev
```

After that, Vite will show a local URL, usually:

```bash
http://localhost:5173
```

Open that URL in your browser.

### 4. Set up the backend

Open a new terminal window and go back to the project root folder:

```bash
cd Attendance
```

If the virtual environment already exists in the repository, use it directly. Then install backend dependencies:

```bash
./venv/bin/pip install -r attendai-backend/requirements.txt
```

Now move into the backend folder:

```bash
cd attendai-backend
```

Start the FastAPI backend server:

```bash
../venv/bin/uvicorn server:app --host 127.0.0.1 --port 8000
```

The backend will run at:

```bash
http://127.0.0.1:8000
```

You can test it in the browser using:
- `http://127.0.0.1:8000/health`
- `http://127.0.0.1:8000/docs`

### 5. Login to the app

Once both frontend and backend are running, open the frontend in your browser and log in using one of the demo accounts:

- Admin: `admin@school.edu` / `admin123`
- Teacher: `teacher@school.edu` / `teach123`
- Student: `student@school.edu` / `student123`

### 6. How to use the app

#### Admin use
If you log in as admin, you can:
- view the system dashboard
- open the students page
- register a student face using the webcam
- manage the demo student records

This face registration is important because the teacher scan feature depends on registered faces.

#### Teacher use
If you log in as teacher, you can:
- open the teacher dashboard
- go to the scan page
- start a live attendance session
- let the camera detect a registered student face
- mark attendance in real time

#### Student use
If you log in as student, you can:
- view the student dashboard
- see attendance-related demo information
- check attendance history shown in the prototype

### 7. Important notes

- The project is a prototype.
- Some dashboard values and attendance records are mock data.
- Face data is currently stored in memory only, so if the backend restarts, registered faces are lost.
- The app is meant to demonstrate the concept of an AI-based attendance system, not serve as a production-ready biometric platform.

### 8. If someone is setting it up on a fresh machine

They should make sure these are installed first:
- `Node.js` and `npm`
- `Python 3`
- `pip`

Then they can follow the same steps:
1. clone/download the repo
2. install frontend dependencies with `npm install`
3. install backend dependencies with `pip install -r attendai-backend/requirements.txt`
4. start backend
5. start frontend
6. open the browser and use the demo accounts

### 9. Final summary

In short, the full process is:

```bash
git clone <repo-link>
cd Attendance
cd attendai
npm install
npm run dev
```

Open another terminal:

```bash
cd Attendance
./venv/bin/pip install -r attendai-backend/requirements.txt
cd attendai-backend
../venv/bin/uvicorn server:app --host 127.0.0.1 --port 8000
```

Then open `http://localhost:5173` and use the app.
