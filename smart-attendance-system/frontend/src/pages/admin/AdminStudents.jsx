import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import api from "../../services/api.js";

export default function AdminStudents() {
  const webcamRef = useRef(null);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", password: "Student@123", role: "student", registrationNumber: "", className: "" });
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const loadStudents = () => api.get("/admin/users?role=student").then(({ data }) => setStudents(data));
  useEffect(() => { loadStudents(); }, []);

  const createStudent = async (event) => {
    event.preventDefault();
    await api.post("/admin/users", form);
    setForm({ name: "", email: "", password: "Student@123", role: "student", registrationNumber: "", className: "" });
    loadStudents();
  };

  const registerFace = async () => {
    const image = webcamRef.current?.getScreenshot();
    if (!image || !selectedStudentId) return;
    await api.post(`/admin/students/${selectedStudentId}/register-face`, { image });
    loadStudents();
  };

  return (
    <DashboardLayout title="Students">
      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <form onSubmit={createStudent} className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
          <div className="text-lg font-semibold">Add Student</div>
          {["name", "email", "registrationNumber", "className", "password"].map((field) => (
            <input key={field} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3" placeholder={field} value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} />
          ))}
          <button className="w-full rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950">Create Student</button>
          <div className="border-t border-slate-800 pt-4">
            <div className="mb-3 text-lg font-semibold">Register Student Face</div>
            <select className="mb-3 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3" value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)}>
              <option value="">Select student</option>
              {students.map((student) => <option key={student._id} value={student._id}>{student.name}</option>)}
            </select>
            <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="w-full rounded-2xl" />
            <button type="button" onClick={registerFace} className="mt-3 w-full rounded-xl bg-emerald-400 px-4 py-3 font-semibold text-slate-950">
              Capture Face
            </button>
          </div>
        </form>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-4 text-lg font-semibold">Registered Students</div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Reg No</th>
                  <th className="pb-3">Class</th>
                  <th className="pb-3">Face Data</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id} className="border-t border-slate-800">
                    <td className="py-3">{student.name}</td>
                    <td className="py-3">{student.registrationNumber}</td>
                    <td className="py-3">{student.className}</td>
                    <td className="py-3">{student.faceEmbeddings?.length ? "Registered" : "Pending"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
