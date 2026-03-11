import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const navMap = {
  admin: [
    { label: "Dashboard", to: "/admin" },
    { label: "Students", to: "/admin/students" },
    { label: "Teachers", to: "/admin/teachers" },
    { label: "Reports", to: "/admin/reports" },
  ],
  teacher: [
    { label: "Dashboard", to: "/teacher" },
    { label: "Scan", to: "/teacher/scan" },
    { label: "History", to: "/teacher/history" },
  ],
  student: [
    { label: "Dashboard", to: "/student" },
    { label: "Attendance", to: "/student/history" },
  ],
};

export default function DashboardLayout({ title, children }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="flex">
        <aside className="w-72 min-h-screen border-r border-slate-800 bg-slate-950/90 p-6">
          <div className="mb-10">
            <div className="text-2xl font-bold">AttendAI</div>
            <div className="mt-2 text-sm uppercase tracking-[0.25em] text-cyan-400">{user?.role}</div>
          </div>
          <nav className="space-y-2">
            {navMap[user?.role || "student"].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`block rounded-xl px-4 py-3 ${location.pathname === item.to ? "bg-cyan-500/15 text-cyan-300" : "text-slate-400 hover:bg-slate-900"}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div className="font-semibold">{user?.name}</div>
            <div className="text-sm text-slate-400">{user?.email}</div>
            <button onClick={logout} className="mt-4 w-full rounded-xl bg-rose-500/15 px-4 py-2 text-rose-300">
              Sign out
            </button>
          </div>
        </aside>
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">{title}</h1>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
