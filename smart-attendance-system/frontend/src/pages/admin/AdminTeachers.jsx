import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import api from "../../services/api.js";

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", password: "Teacher@123", role: "teacher" });

  const loadTeachers = () => api.get("/admin/users?role=teacher").then(({ data }) => setTeachers(data));
  useEffect(() => { loadTeachers(); }, []);

  const createTeacher = async (event) => {
    event.preventDefault();
    await api.post("/admin/users", form);
    setForm({ name: "", email: "", password: "Teacher@123", role: "teacher" });
    loadTeachers();
  };

  return (
    <DashboardLayout title="Teachers">
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <form onSubmit={createTeacher} className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
          <div className="text-lg font-semibold">Add Teacher</div>
          {["name", "email", "password"].map((field) => (
            <input key={field} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3" placeholder={field} value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} />
          ))}
          <button className="w-full rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950">Create Teacher</button>
        </form>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-4 text-lg font-semibold">Teachers</div>
          <div className="space-y-3">
            {teachers.map((teacher) => (
              <div key={teacher._id} className="rounded-xl border border-slate-800 p-4">
                <div className="font-semibold">{teacher.name}</div>
                <div className="text-sm text-slate-400">{teacher.email}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
