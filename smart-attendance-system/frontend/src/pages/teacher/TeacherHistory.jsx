import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import api from "../../services/api.js";

export default function TeacherHistory() {
  const [history, setHistory] = useState([]);
  useEffect(() => {
    api.get("/attendance/teacher/overview").then(({ data }) => setHistory(data.history));
  }, []);

  return (
    <DashboardLayout title="Attendance History">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="space-y-3">
          {history.map((record) => (
            <div key={record._id} className="rounded-xl border border-slate-800 p-4">
              <div className="font-semibold">{record.studentId?.name}</div>
              <div className="text-sm text-slate-400">{record.classId?.name}</div>
              <div className="text-sm text-slate-500">{new Date(record.scanTimestamp).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
