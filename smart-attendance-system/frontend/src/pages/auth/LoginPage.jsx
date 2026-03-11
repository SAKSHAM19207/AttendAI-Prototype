import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function LoginPage() {
  const { role = "admin" } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      const user = await login({ ...form, role });
      navigate(`/${user.role}`);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white grid place-items-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl shadow-cyan-950/30">
        <div className="mb-6 text-center">
          <div className="text-3xl font-bold">AttendAI</div>
          <div className="mt-2 text-sm uppercase tracking-[0.3em] text-cyan-400">{role} login</div>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-6 text-xs">
          {["admin", "teacher", "student"].map((item) => (
            <button type="button" key={item} onClick={() => navigate(`/login/${item}`)} className={`rounded-xl px-3 py-2 ${item === role ? "bg-cyan-500/20 text-cyan-300" : "bg-slate-800 text-slate-400"}`}>
              {item}
            </button>
          ))}
        </div>
        <div className="space-y-4">
          <input className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        {error && <div className="mt-4 text-sm text-rose-400">{error}</div>}
        <button className="mt-6 w-full rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950">Login</button>
      </form>
    </div>
  );
}
