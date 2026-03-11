import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import api from "../../services/api.js";

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState({});

  useEffect(() => {
    api.get("/admin/analytics").then(({ data }) => setAnalytics(data));
  }, []);

  const cards = [
    ["Total Students", analytics.totalStudents || 0],
    ["Total Teachers", analytics.totalTeachers || 0],
    ["Daily Attendance", analytics.dailyAttendance || 0],
    ["Attendance Statistics", analytics.attendanceStatistics || 0],
  ];

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="grid gap-4 md:grid-cols-4">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="text-sm text-slate-400">{label}</div>
            <div className="mt-3 text-4xl font-bold text-cyan-300">{value}</div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
