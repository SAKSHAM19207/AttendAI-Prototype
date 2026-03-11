import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import api from "../../services/api.js";

export default function TeacherDashboard() {
  const [overview, setOverview] = useState({ classes: [], history: [] });
  useEffect(() => {
    api.get("/attendance/teacher/overview").then(({ data }) => setOverview(data));
  }, []);

  return (
    <DashboardLayout title="Teacher Dashboard">
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-4 text-lg font-semibold">Assigned Classes</div>
          <div className="space-y-3">
            {overview.classes.map((item) => (
              <div key={item._id} className="rounded-xl border border-slate-800 p-4">
                <div className="font-semibold">{item.name}</div>
                <div className="text-sm text-slate-400">{item.code}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-4 text-lg font-semibold">Recent Attendance</div>
          <div className="space-y-3">
            {overview.history.slice(0, 8).map((record) => (
              <div key={record._id} className="rounded-xl border border-slate-800 p-4">
                <div className="font-semibold">{record.studentId?.name}</div>
                <div className="text-sm text-slate-400">{record.classId?.name} · {new Date(record.scanTimestamp).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
