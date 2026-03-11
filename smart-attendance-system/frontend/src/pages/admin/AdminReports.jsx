import DashboardLayout from "../../layouts/DashboardLayout.jsx";

export default function AdminReports() {
  return (
    <DashboardLayout title="Attendance Reports">
      <a href={`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/admin/reports/attendance.xlsx`} className="inline-flex rounded-xl bg-emerald-400 px-5 py-3 font-semibold text-slate-950">
        Download Excel Report
      </a>
    </DashboardLayout>
  );
}
