import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminReports from "./pages/admin/AdminReports.jsx";
import AdminStudents from "./pages/admin/AdminStudents.jsx";
import AdminTeachers from "./pages/admin/AdminTeachers.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import StudentDashboard from "./pages/student/StudentDashboard.jsx";
import TeacherDashboard from "./pages/teacher/TeacherDashboard.jsx";
import TeacherHistory from "./pages/teacher/TeacherHistory.jsx";
import TeacherScan from "./pages/teacher/TeacherScan.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login/admin" replace />} />
      <Route path="/login/:role" element={<LoginPage />} />

      <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/students" element={<ProtectedRoute roles={["admin"]}><AdminStudents /></ProtectedRoute>} />
      <Route path="/admin/teachers" element={<ProtectedRoute roles={["admin"]}><AdminTeachers /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute roles={["admin"]}><AdminReports /></ProtectedRoute>} />

      <Route path="/teacher" element={<ProtectedRoute roles={["teacher"]}><TeacherDashboard /></ProtectedRoute>} />
      <Route path="/teacher/scan" element={<ProtectedRoute roles={["teacher"]}><TeacherScan /></ProtectedRoute>} />
      <Route path="/teacher/history" element={<ProtectedRoute roles={["teacher"]}><TeacherHistory /></ProtectedRoute>} />

      <Route path="/student" element={<ProtectedRoute roles={["student"]}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/history" element={<ProtectedRoute roles={["student"]}><StudentDashboard /></ProtectedRoute>} />
    </Routes>
  );
}
