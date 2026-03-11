import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import api from "../../services/api.js";

export default function StudentDashboard() {
  const [data, setData] = useState({ attendancePercentage: 0, records: [], profile: {} });
  useEffect(() => {
    api.get("/attendance/student/history").then(({ data }) => setData(data));
  }, []);

  return (
    <DashboardLayout title="Student Dashboard">
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="text-sm text-slate-400">Attendance Percentage</div>
          <div className="mt-3 text-5xl font-bold text-cyan-300">{data.attendancePercentage}%</div>
          <div className="mt-6 text-sm text-slate-400">Profile</div>
          <div className="mt-2">{data.profile?.name}</div>
          <div className="text-sm text-slate-400">{data.profile?.registrationNumber}</div>
          <div className="text-sm text-slate-400">{data.profile?.className}</div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-4 text-lg font-semibold">Attendance Records</div>
          <div className="space-y-3">
            {data.records.map((record) => (
              <div key={record._id} className="rounded-xl border border-slate-800 p-4">
                <div className="font-semibold">{record.classId?.name}</div>
                <div className="text-sm text-slate-400">{new Date(record.scanTimestamp).toLocaleString()}</div>
                <div className="text-sm text-emerald-300">{record.status}</div>
                {record.faceImage && <img src={record.faceImage} alt="scan" className="mt-3 h-24 rounded-xl object-cover" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
