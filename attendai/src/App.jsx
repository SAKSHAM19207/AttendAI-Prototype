import { useState, useEffect, useRef, useCallback } from "react";

// ── Palette & theme ──────────────────────────────────────────────────────────
const THEME = {
  bg: "#0A0C10",
  surface: "#111318",
  card: "#161A22",
  border: "#1E2330",
  accent: "#00E5FF",
  accentDim: "#00B8CC",
  green: "#00FF88",
  amber: "#FFB800",
  red: "#FF4466",
  text: "#E8ECF4",
  muted: "#6B7490",
  purple: "#7C5CFC",
};

// ── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_USERS = {
  "admin@school.edu":   { password: "admin123",   role: "admin",   name: "Dr. Sarah Chen",    id: "u1" },
  "teacher@school.edu": { password: "teach123",   role: "teacher", name: "Prof. James Wright", id: "u2" },
  "student@school.edu": { password: "student123", role: "student", name: "Alex Johnson",       id: "u3" },
};

const MOCK_STUDENTS = [
  { id: "s1", code: "STU-001", name: "Alex Johnson",    dept: "Computer Science", year: 3, photo: "AJ", present: false, confidence: 0, hasEmbedding: false },
  { id: "s2", code: "STU-002", name: "Maria Garcia",    dept: "Computer Science", year: 3, photo: "MG", present: false, confidence: 0, hasEmbedding: false },
  { id: "s3", code: "STU-003", name: "Liam Patel",      dept: "Computer Science", year: 2, photo: "LP", present: false, confidence: 0, hasEmbedding: false },
  { id: "s4", code: "STU-004", name: "Sophie Turner",   dept: "Mathematics",      year: 4, photo: "ST", present: false, confidence: 0, hasEmbedding: false },
  { id: "s5", code: "STU-005", name: "Omar Hassan",     dept: "Computer Science", year: 3, photo: "OH", present: false, confidence: 0, hasEmbedding: false },
  { id: "s6", code: "STU-006", name: "Priya Sharma",    dept: "Physics",          year: 2, photo: "PS", present: false, confidence: 0, hasEmbedding: false },
];

const MOCK_CLASSES = [
  { id: "c1", code: "CS301", name: "Data Structures & Algorithms", teacher: "Prof. James Wright", enrolled: 6, schedule: "Mon/Wed 10:00", active: true },
  { id: "c2", code: "CS401", name: "Machine Learning Fundamentals", teacher: "Prof. James Wright", enrolled: 4, schedule: "Tue/Thu 14:00", active: true },
  { id: "c3", code: "MATH201", name: "Linear Algebra", teacher: "Dr. Anna Lee",    enrolled: 5, schedule: "Mon/Fri 09:00",  active: false },
];

const MOCK_ATTENDANCE = [
  { date: "2025-03-10", class: "CS301", status: "present", confidence: 0.94 },
  { date: "2025-03-08", class: "CS301", status: "present", confidence: 0.91 },
  { date: "2025-03-06", class: "CS401", status: "absent",  confidence: 0 },
  { date: "2025-03-05", class: "CS301", status: "present", confidence: 0.89 },
  { date: "2025-03-03", class: "CS401", status: "present", confidence: 0.96 },
  { date: "2025-03-01", class: "CS301", status: "late",    confidence: 0.88 },
];

const API_BASE_URL = "http://127.0.0.1:8000";

// ── Utilities ────────────────────────────────────────────────────────────────
function Avatar({ initials, size = 36, color = THEME.accent }) {
  const colors = { AJ: "#00E5FF", MG: "#7C5CFC", LP: "#00FF88", ST: "#FFB800", OH: "#FF4466", PS: "#FF6B35" };
  const bg = colors[initials] || color;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `${bg}22`, border: `1.5px solid ${bg}66`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.35, fontWeight: 700, color: bg, flexShrink: 0,
      fontFamily: "'DM Mono', monospace",
    }}>{initials}</div>
  );
}

function Badge({ label, color = THEME.accent }) {
  return (
    <span style={{
      padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
      background: `${color}18`, border: `1px solid ${color}44`, color,
      textTransform: "uppercase", letterSpacing: "0.06em",
    }}>{label}</span>
  );
}

function StatCard({ label, value, sub, color = THEME.accent, icon }) {
  return (
    <div style={{
      background: THEME.card, border: `1px solid ${THEME.border}`,
      borderRadius: 16, padding: "20px 24px", position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80,
        background: `radial-gradient(circle at top right, ${color}18, transparent 70%)` }} />
      <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color, fontFamily: "'DM Mono', monospace" }}>{value}</div>
      <div style={{ fontSize: 13, color: THEME.muted, marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: color, marginTop: 4, opacity: 0.7 }}>{sub}</div>}
    </div>
  );
}

function ScanLine() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: 12, pointerEvents: "none" }}>
      <div style={{
        position: "absolute", left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${THEME.accent}, transparent)`,
        animation: "scanline 2.5s linear infinite",
        boxShadow: `0 0 12px ${THEME.accent}`,
      }} />
      <style>{`@keyframes scanline { 0% { top: 0% } 100% { top: 100% } }`}</style>
    </div>
  );
}

function PulseRing({ color = THEME.green }) {
  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{
        width: 8, height: 8, borderRadius: "50%", background: color,
        display: "block", boxShadow: `0 0 6px ${color}`,
      }} />
      <span style={{
        position: "absolute", width: 16, height: 16, borderRadius: "50%",
        border: `1px solid ${color}`, animation: "pulse-ring 1.5s ease-out infinite",
      }} />
      <style>{`@keyframes pulse-ring { 0% { transform:scale(0.6);opacity:1 } 100% { transform:scale(1.8);opacity:0 } }`}</style>
    </span>
  );
}

function FaceRegistrationModal({ student, onClose, onRegistered }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraReady(true);
      } catch (err) {
        console.log("Registration camera error", err);
        setError("Camera access is required to register a face.");
      }
    };

    startCamera();

    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const handleCapture = async () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
      setError("Camera stream is not ready yet.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const image = canvas.toDataURL("image/jpeg", 0.92);

    try {
      setSaving(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/register-face`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_id: student.id,
          student_name: student.name,
          image,
        }),
      });

      if (!response.ok) {
        throw new Error(`Registration failed with ${response.status}`);
      }

      const data = await response.json();
      onRegistered(student.id, data);
      onClose();
    } catch (err) {
      console.log("Face registration error", err);
      setError("Unable to register face. Check backend availability and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(10,12,16,0.88)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 250,
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "min(720px, 100%)",
          background: THEME.card,
          border: `1px solid ${THEME.border}`,
          borderRadius: 20,
          padding: 24,
        }}
        onClick={event => event.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 18 }}>
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Register Face</h3>
            <div style={{ fontSize: 13, color: THEME.muted }}>{student.name} · {student.code}</div>
          </div>
          <Badge label={cameraReady ? "camera ready" : "starting"} color={cameraReady ? THEME.green : THEME.amber} />
        </div>

        <div style={{
          position: "relative",
          aspectRatio: "16 / 10",
          background: THEME.surface,
          borderRadius: 16,
          overflow: "hidden",
          border: `1px solid ${THEME.border}`,
          marginBottom: 16,
        }}>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            style={{ width: "100%", height: "100%", objectFit: "cover", opacity: cameraReady ? 1 : 0.2 }}
          />
          {!cameraReady && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: THEME.muted, fontSize: 13 }}>
              Waiting for camera access...
            </div>
          )}
        </div>

        <div style={{ fontSize: 12, color: THEME.muted, marginBottom: 14 }}>
          Position one face clearly in frame, then capture it as the reference image for this student.
        </div>

        {error && <div style={{ fontSize: 12, color: THEME.red, marginBottom: 12 }}>{error}</div>}

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: "11px", borderRadius: 10, border: `1px solid ${THEME.border}`,
              background: "transparent", color: THEME.muted, fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleCapture}
            disabled={!cameraReady || saving}
            style={{
              flex: 2, padding: "11px", borderRadius: 10, border: "none",
              background: !cameraReady || saving
                ? `${THEME.accent}33`
                : `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDim})`,
              color: "#0A0C10", fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {saving ? "Saving Face..." : "Capture & Save Face"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Login Page ───────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("teacher@school.edu");
  const [password, setPassword] = useState("teach123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const quickLogins = [
    { label: "Admin",   email: "admin@school.edu",   pw: "admin123",   color: THEME.purple },
    { label: "Teacher", email: "teacher@school.edu", pw: "teach123",   color: THEME.accent },
    { label: "Student", email: "student@school.edu", pw: "student123", color: THEME.green },
  ];

  const handleLogin = () => {
    setLoading(true); setError("");
    setTimeout(() => {
      const user = MOCK_USERS[email];
      if (user && user.password === password) onLogin({ ...user, email });
      else { setError("Invalid credentials. Try the quick-login buttons."); setLoading(false); }
    }, 800);
  };

  return (
    <div style={{
      minHeight: "100vh", background: THEME.bg, display: "flex",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0A0C10; }
        input:focus { outline: none; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #111318; } ::-webkit-scrollbar-thumb { background: #1E2330; border-radius: 4px; }
      `}</style>

      {/* Grid bg */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        backgroundImage: `linear-gradient(${THEME.border} 1px, transparent 1px), linear-gradient(90deg, ${THEME.border} 1px, transparent 1px)`,
        backgroundSize: "40px 40px", opacity: 0.4,
      }} />
      <div style={{
        position: "fixed", inset: 0, background:
          `radial-gradient(ellipse 80% 60% at 50% 0%, ${THEME.accent}10, transparent 70%)`,
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", width: 420, padding: "0 20px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 64, height: 64, borderRadius: 18,
            background: `linear-gradient(135deg, ${THEME.accent}22, ${THEME.purple}22)`,
            border: `1px solid ${THEME.accent}44`, marginBottom: 16,
          }}>
            <span style={{ fontSize: 28 }}>👁</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: THEME.text, letterSpacing: "-0.03em" }}>
            AttendAI
          </h1>
          <p style={{ fontSize: 13, color: THEME.muted, marginTop: 4 }}>
            Smart Face Recognition Attendance
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: THEME.card, border: `1px solid ${THEME.border}`,
          borderRadius: 20, padding: "32px 28px",
          boxShadow: `0 40px 80px ${THEME.accent}08`,
        }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, color: THEME.muted, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)}
              style={{
                display: "block", width: "100%", marginTop: 8,
                background: THEME.surface, border: `1px solid ${THEME.border}`,
                borderRadius: 10, padding: "11px 14px", color: THEME.text,
                fontSize: 14, fontFamily: "'DM Mono', monospace",
                transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = THEME.accent}
              onBlur={e => e.target.style.borderColor = THEME.border}
            />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={{ fontSize: 12, color: THEME.muted, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              style={{
                display: "block", width: "100%", marginTop: 8,
                background: THEME.surface, border: `1px solid ${THEME.border}`,
                borderRadius: 10, padding: "11px 14px", color: THEME.text,
                fontSize: 14, fontFamily: "'DM Mono', monospace",
              }}
              onFocus={e => e.target.style.borderColor = THEME.accent}
              onBlur={e => e.target.style.borderColor = THEME.border}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
            />
          </div>
          {error && <p style={{ fontSize: 12, color: THEME.red, marginBottom: 12 }}>{error}</p>}
          <button onClick={handleLogin} disabled={loading} style={{
            width: "100%", padding: "13px", borderRadius: 10, border: "none", cursor: "pointer",
            background: loading ? `${THEME.accent}44` : `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDim})`,
            color: loading ? THEME.muted : "#0A0C10", fontWeight: 700, fontSize: 14,
            fontFamily: "'DM Sans', sans-serif", marginTop: 8,
            transition: "all 0.2s",
          }}>
            {loading ? "Authenticating…" : "Sign In →"}
          </button>

          <div style={{ marginTop: 24, borderTop: `1px solid ${THEME.border}`, paddingTop: 20 }}>
            <p style={{ fontSize: 11, color: THEME.muted, marginBottom: 12, textAlign: "center", textTransform: "uppercase", letterSpacing: "0.08em" }}>Quick Demo Access</p>
            <div style={{ display: "flex", gap: 8 }}>
              {quickLogins.map(q => (
                <button key={q.label} onClick={() => { setEmail(q.email); setPassword(q.pw); }}
                  style={{
                    flex: 1, padding: "8px 4px", borderRadius: 8, border: `1px solid ${q.color}44`,
                    background: `${q.color}10`, color: q.color, fontSize: 11, fontWeight: 700,
                    cursor: "pointer", letterSpacing: "0.04em", fontFamily: "'DM Sans', sans-serif",
                  }}>
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Shell / Navigation ───────────────────────────────────────────────────────
function Shell({ user, onLogout, children, activePage, setPage }) {
  const navItems = user.role === "admin"
    ? [{ id: "dashboard", icon: "⬡", label: "Dashboard" }, { id: "students", icon: "◎", label: "Students" }, { id: "classes", icon: "▦", label: "Classes" }, { id: "reports", icon: "▤", label: "Reports" }]
    : user.role === "teacher"
    ? [{ id: "dashboard", icon: "⬡", label: "Dashboard" }, { id: "scan", icon: "◉", label: "Scan" }, { id: "sessions", icon: "▤", label: "Sessions" }]
    : [{ id: "dashboard", icon: "⬡", label: "Dashboard" }, { id: "attendance", icon: "▤", label: "Attendance" }];

  const roleColor = user.role === "admin" ? THEME.purple : user.role === "teacher" ? THEME.accent : THEME.green;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: THEME.bg, fontFamily: "'DM Sans', sans-serif", color: THEME.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #111318; } ::-webkit-scrollbar-thumb { background: #1E2330; border-radius: 4px; }
        button { cursor: pointer; }
      `}</style>

      {/* Sidebar */}
      <nav style={{
        width: 220, background: THEME.surface, borderRight: `1px solid ${THEME.border}`,
        display: "flex", flexDirection: "column", padding: "24px 0", position: "fixed",
        top: 0, left: 0, bottom: 0, zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{ padding: "0 20px", marginBottom: 32, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: `linear-gradient(135deg, ${THEME.accent}22, ${THEME.purple}22)`,
            border: `1px solid ${THEME.accent}44`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
          }}>👁</div>
          <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em", color: THEME.text }}>AttendAI</span>
        </div>

        {/* Role badge */}
        <div style={{ padding: "0 20px", marginBottom: 24 }}>
          <Badge label={user.role} color={roleColor} />
        </div>

        {/* Nav */}
        <div style={{ flex: 1, padding: "0 12px", display: "flex", flexDirection: "column", gap: 2 }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setPage(item.id)} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
              borderRadius: 10, border: "none", textAlign: "left", fontSize: 13, fontWeight: 500,
              background: activePage === item.id ? `${roleColor}18` : "transparent",
              color: activePage === item.id ? roleColor : THEME.muted,
              transition: "all 0.15s", fontFamily: "'DM Sans', sans-serif",
              borderLeft: activePage === item.id ? `2px solid ${roleColor}` : "2px solid transparent",
            }}>
              <span style={{ fontSize: 16, lineHeight: 1 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        {/* User */}
        <div style={{ padding: "16px 20px", borderTop: `1px solid ${THEME.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <Avatar initials={user.name.split(" ").map(n => n[0]).join("").slice(0, 2)} size={32} color={roleColor} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: THEME.text, lineHeight: 1.3 }}>{user.name}</div>
              <div style={{ fontSize: 10, color: THEME.muted }}>{user.email.split("@")[0]}</div>
            </div>
          </div>
          <button onClick={onLogout} style={{
            width: "100%", padding: "8px", borderRadius: 8, border: `1px solid ${THEME.border}`,
            background: "transparent", color: THEME.muted, fontSize: 11, fontWeight: 600,
            letterSpacing: "0.04em", fontFamily: "'DM Sans', sans-serif",
          }}>Sign Out</button>
        </div>
      </nav>

      {/* Main */}
      <main style={{ marginLeft: 220, flex: 1, padding: "32px 32px 32px 40px", minHeight: "100vh" }}>
        {children}
      </main>
    </div>
  );
}

// ── Admin Dashboard ──────────────────────────────────────────────────────────
function AdminDashboard() {
  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 4 }}>System Overview</h2>
      <p style={{ color: THEME.muted, fontSize: 13, marginBottom: 28 }}>Monday, March 10, 2025</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        <StatCard label="Total Students" value="248"  sub="+12 this month"  icon="◎" color={THEME.accent} />
        <StatCard label="Teachers"       value="18"   sub="6 departments"   icon="▦" color={THEME.purple} />
        <StatCard label="Active Classes" value="34"   sub="This semester"   icon="⬡" color={THEME.green} />
        <StatCard label="Avg Attendance" value="87%"  sub="↑ 3% vs last mo" icon="▤" color={THEME.amber} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
        {/* Recent Sessions */}
        <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Recent Sessions</h3>
            <Badge label="Today" color={THEME.green} />
          </div>
          {MOCK_CLASSES.map(c => (
            <div key={c.id} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 0", borderBottom: `1px solid ${THEME.border}`,
            }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: `${THEME.accent}14`, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700, color: THEME.accent, fontFamily: "'DM Mono', monospace",
                }}>{c.code.slice(0, 3)}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: THEME.muted }}>{c.schedule}</div>
                </div>
              </div>
              <Badge label={c.active ? "active" : "closed"} color={c.active ? THEME.green : THEME.muted} />
            </div>
          ))}
        </div>

        {/* Attendance Chart */}
        <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Weekly Attendance</h3>
          {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day, i) => {
            const pct = [92, 78, 88, 95, 84][i];
            return (
              <div key={day} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: THEME.muted }}>{day}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: pct > 85 ? THEME.green : THEME.amber, fontFamily: "'DM Mono', monospace" }}>{pct}%</span>
                </div>
                <div style={{ height: 6, background: THEME.border, borderRadius: 4, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${pct}%`,
                    background: `linear-gradient(90deg, ${THEME.accent}, ${pct > 85 ? THEME.green : THEME.amber})`,
                    borderRadius: 4, transition: "width 1s ease",
                  }} />
                </div>
              </div>
            );
          })}

          <div style={{ marginTop: 24, padding: 14, background: THEME.surface, borderRadius: 12 }}>
            <div style={{ fontSize: 11, color: THEME.muted, marginBottom: 4 }}>Face Embeddings Stored</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: THEME.purple, fontFamily: "'DM Mono', monospace" }}>1,240</div>
            <div style={{ fontSize: 11, color: THEME.muted, marginTop: 2 }}>avg 5 per student · 98.2% coverage</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Students Management ──────────────────────────────────────────────────────
function StudentsPage({ students, onFaceRegistered }) {
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const registeredCount = students.filter(student => student.hasEmbedding).length;
  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.code.includes(search)
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 4 }}>Students</h2>
          <p style={{ color: THEME.muted, fontSize: 13 }}>{students.length} enrolled · {registeredCount} face profiles registered</p>
        </div>
        <button onClick={() => setShowAddModal(true)} style={{
          padding: "10px 20px", borderRadius: 10, border: "none",
          background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDim})`,
          color: "#0A0C10", fontWeight: 700, fontSize: 13, fontFamily: "'DM Sans', sans-serif",
        }}>+ Add Student</button>
      </div>

      <div style={{ position: "relative", marginBottom: 20 }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search students…"
          style={{
            width: "100%", padding: "11px 14px 11px 42px",
            background: THEME.card, border: `1px solid ${THEME.border}`,
            borderRadius: 10, color: THEME.text, fontSize: 13,
            fontFamily: "'DM Sans', sans-serif",
          }} />
        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: THEME.muted }}>⌕</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {filtered.map(s => (
          <div key={s.id} style={{
            background: THEME.card, border: `1px solid ${THEME.border}`,
            borderRadius: 14, padding: 20, transition: "border-color 0.2s",
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = `${THEME.accent}44`}
            onMouseLeave={e => e.currentTarget.style.borderColor = THEME.border}
          >
            <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 14 }}>
              <Avatar initials={s.photo} size={44} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{s.name}</div>
                <div style={{ fontSize: 11, color: THEME.muted, fontFamily: "'DM Mono', monospace" }}>{s.code}</div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: THEME.muted, marginBottom: 4 }}>{s.dept} · Year {s.year}</div>
            <div style={{ display: "flex", gap: 6, marginTop: 12, marginBottom: 14 }}>
              <Badge label={s.hasEmbedding ? "Face Registered" : "No Face Yet"} color={s.hasEmbedding ? THEME.green : THEME.amber} />
              <Badge label={`Year ${s.year}`} color={THEME.purple} />
            </div>
            <button
              onClick={() => setSelectedStudent(s)}
              style={{
                width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${THEME.accent}44`,
                background: `${THEME.accent}10`, color: THEME.accent, fontWeight: 700, fontSize: 12,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {s.hasEmbedding ? "Update Face Registration" : "Register Face"}
            </button>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(10,12,16,0.85)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200,
        }} onClick={() => setShowAddModal(false)}>
          <div style={{
            background: THEME.card, border: `1px solid ${THEME.border}`,
            borderRadius: 20, padding: 32, width: 400,
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>Add New Student</h3>
            {["Full Name", "Student Code", "Email", "Department"].map(field => (
              <div key={field} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, color: THEME.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{field}</label>
                <input style={{
                  display: "block", width: "100%", marginTop: 6,
                  background: THEME.surface, border: `1px solid ${THEME.border}`,
                  borderRadius: 8, padding: "10px 12px", color: THEME.text, fontSize: 13,
                  fontFamily: "'DM Sans', sans-serif",
                }} />
              </div>
            ))}
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={() => setShowAddModal(false)} style={{
                flex: 1, padding: "11px", borderRadius: 8, border: `1px solid ${THEME.border}`,
                background: "transparent", color: THEME.muted, fontFamily: "'DM Sans', sans-serif",
              }}>Cancel</button>
              <button onClick={() => setShowAddModal(false)} style={{
                flex: 2, padding: "11px", borderRadius: 8, border: "none",
                background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDim})`,
                color: "#0A0C10", fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
              }}>Save & Generate Embedding</button>
            </div>
          </div>
        </div>
      )}

      {selectedStudent && (
        <FaceRegistrationModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onRegistered={onFaceRegistered}
        />
      )}
    </div>
  );
}

// ── Teacher Scan Page ────────────────────────────────────────────────────────
function ScanPage({ students }) {
  const videoRef = useRef(null);
  const intervalRef = useRef(null);
  const recognizedIdsRef = useRef(new Set());
  const scanningRef = useRef(false);

  const [sessionActive, setSessionActive] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [recognized, setRecognized] = useState([]);
  const [scanCount, setScanCount] = useState(0);
  const [selectedClass, setSelectedClass] = useState("c1");
  const [cameraOn, setCameraOn] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [error, setError] = useState("");

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraOn(true);
      }
      setError("");
      return true;
    } catch (err) {
      console.log("Camera error", err);
      setError("Unable to access camera. Check browser permissions and backend availability.");
      setCameraOn(false);
      return false;
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraOn(false);
  };

  const normalizeRecognitionResponse = (data) => {
    if (Array.isArray(data?.recognized)) return data.recognized;
    if (data?.student || data?.name) {
      return [{
        name: data.name || data.student,
        confidence: data.confidence || 0,
      }];
    }
    return [];
  };

  const simulateRecognize = useCallback(async () => {
    if (!videoRef.current || !scanningRef.current) return;

    const video = videoRef.current;
    if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) return;

    setScanCount(prev => prev + 1);

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    const image = canvas.toDataURL("image/jpeg");

    try {
      const res = await fetch(`${API_BASE_URL}/recognize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image }),
      });

      if (!res.ok) {
        throw new Error(`Recognition request failed with ${res.status}`);
      }

      const data = await res.json();
      const results = normalizeRecognitionResponse(data);
      if (results.length === 0) return;

      const result = results[0];
      const student = students.find(s => s.name === result.name);
      if (!student || recognizedIdsRef.current.has(student.id)) return;

      const detected = {
        ...student,
        confidence: result.confidence || 0.9,
        markedAt: new Date().toLocaleTimeString(),
      };

      recognizedIdsRef.current.add(student.id);
      setRecognized(prev => [...prev, detected]);
      setLastResult(detected);
      setError("");
    } catch (err) {
      console.log("Recognition error", err);
      setError("Recognition service is unavailable. Start the backend on port 8000.");
    }
  }, [students]);

  const startSession = async () => {
    if (sessionActive) return;
    setSessionActive(true);
    setScanning(true);
    scanningRef.current = true;
    setRecognized([]);
    setScanCount(0);
    setLastResult(null);
    recognizedIdsRef.current = new Set();

    const cameraStarted = await startCamera();
    if (!cameraStarted) {
      setSessionActive(false);
      setScanning(false);
      scanningRef.current = false;
      return;
    }

    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(simulateRecognize, 2200);
  };

  const stopSession = () => {
    setSessionActive(false);
    setScanning(false);
    scanningRef.current = false;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    stopCamera();
  };

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      stopCamera();
    };
  }, [students]);

  const cls = MOCK_CLASSES.find(c => c.id === selectedClass);
  const attendanceRate = cls ? Math.round((recognized.length / cls.enrolled) * 100) : 0;
  const registeredCount = students.filter(student => student.hasEmbedding).length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, gap: 20 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 4 }}>Live Attendance Scan</h2>
          <p style={{ color: THEME.muted, fontSize: 13 }}>Run a session, capture faces, and mark students in real time.</p>
          <p style={{ color: registeredCount > 0 ? THEME.green : THEME.amber, fontSize: 12, marginTop: 8 }}>
            {registeredCount > 0
              ? `${registeredCount} face profile${registeredCount > 1 ? "s are" : " is"} available for matching.`
              : "No registered faces yet. Log in as admin and register a student face first."}
          </p>
        </div>
        <div style={{ minWidth: 220 }}>
          <label style={{ display: "block", fontSize: 11, color: THEME.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
            Active Class
          </label>
          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            disabled={sessionActive}
            style={{
              width: "100%",
              padding: "11px 14px",
              background: THEME.card,
              border: `1px solid ${THEME.border}`,
              borderRadius: 10,
              color: THEME.text,
              fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {MOCK_CLASSES.filter(c => c.teacher === "Prof. James Wright").map(option => (
              <option key={option.id} value={option.id}>
                {option.code} · {option.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.5fr) minmax(320px, 0.9fr)", gap: 20, alignItems: "start" }}>
        <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 18, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <PulseRing color={sessionActive ? THEME.green : THEME.muted} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{cls?.name}</div>
                <div style={{ fontSize: 11, color: THEME.muted }}>{cls?.code} · {cls?.schedule}</div>
              </div>
            </div>
            <Badge
              label={scanning ? "scanning" : cameraOn ? "camera ready" : "idle"}
              color={scanning ? THEME.green : cameraOn ? THEME.accent : THEME.muted}
            />
          </div>

          <div style={{
            position: "relative",
            aspectRatio: "16 / 10",
            background: `linear-gradient(180deg, ${THEME.surface}, ${THEME.bg})`,
            border: `1px solid ${THEME.border}`,
            borderRadius: 14,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              style={{ width: "100%", height: "100%", objectFit: "cover", opacity: cameraOn ? 1 : 0.18 }}
            />
            {cameraOn && scanning && <ScanLine />}
            {!cameraOn && (
              <div style={{ position: "absolute", textAlign: "center", padding: 24 }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>◉</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Camera offline</div>
                <div style={{ fontSize: 12, color: THEME.muted }}>Start a session to request webcam access.</div>
              </div>
            )}
          </div>

          {error && <div style={{ marginTop: 14, fontSize: 12, color: THEME.red }}>{error}</div>}

          <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
            <button
              onClick={sessionActive ? stopSession : startSession}
              style={{
                padding: "12px 20px",
                borderRadius: 10,
                border: "none",
                background: sessionActive
                  ? `${THEME.red}18`
                  : `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDim})`,
                color: sessionActive ? THEME.red : "#0A0C10",
                fontWeight: 700,
                fontSize: 13,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {sessionActive ? "Stop Session" : "Start Session"}
            </button>
            <button
              onClick={() => {
                setRecognized([]);
                recognizedIdsRef.current = new Set();
                setScanCount(0);
                setLastResult(null);
              }}
              disabled={recognized.length === 0}
              style={{
                padding: "12px 18px",
                borderRadius: 10,
                border: `1px solid ${THEME.border}`,
                background: "transparent",
                color: recognized.length === 0 ? THEME.border : THEME.muted,
                fontWeight: 600,
                fontSize: 13,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Reset Marks
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <StatCard label="Detected" value={recognized.length} sub={`${cls?.enrolled || 0} enrolled`} icon="◎" color={THEME.green} />
            <StatCard label="Scan Cycles" value={scanCount} sub="Recognition attempts" icon="◉" color={THEME.accent} />
          </div>

          <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700 }}>Session Summary</h3>
              <Badge label={`${attendanceRate}% present`} color={attendanceRate >= 75 ? THEME.green : THEME.amber} />
            </div>
            <div style={{ fontSize: 12, color: THEME.muted, marginBottom: 8 }}>Camera</div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14, color: cameraOn ? THEME.text : THEME.muted }}>
              {cameraOn ? "Streaming live" : "Waiting for device access"}
            </div>
            <div style={{ fontSize: 12, color: THEME.muted, marginBottom: 8 }}>Last recognition</div>
            {lastResult ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12, background: THEME.surface, borderRadius: 12, padding: 12 }}>
                <Avatar initials={lastResult.photo} size={40} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{lastResult.name}</div>
                  <div style={{ fontSize: 11, color: THEME.muted }}>
                    {(lastResult.confidence * 100).toFixed(0)}% match · {lastResult.markedAt}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 12, color: THEME.muted }}>No faces confirmed yet in this session.</div>
            )}
          </div>

          <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700 }}>Recognized Students</h3>
              <span style={{ fontSize: 11, color: THEME.muted }}>{recognized.length}/{cls?.enrolled || 0}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 420, overflowY: "auto" }}>
              {recognized.length === 0 && (
                <div style={{ fontSize: 12, color: THEME.muted }}>Students will appear here as the backend confirms matches.</div>
              )}
              {recognized.map(student => (
                <div
                  key={student.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: 12,
                    borderRadius: 12,
                    background: THEME.surface,
                    border: `1px solid ${THEME.border}`,
                  }}
                >
                  <Avatar initials={student.photo} size={40} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{student.name}</div>
                    <div style={{ fontSize: 11, color: THEME.muted }}>{student.code} · {student.markedAt}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: THEME.green, fontFamily: "'DM Mono', monospace" }}>
                      {(student.confidence * 100).toFixed(0)}%
                    </div>
                    <div style={{ fontSize: 10, color: THEME.muted }}>match</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Teacher Sessions ─────────────────────────────────────────────────────────
function SessionsPage() {
  const sessions = [
    { id: 1, class: "CS301", date: "Mar 10", time: "10:00 AM", present: 5, total: 6, status: "closed" },
    { id: 2, class: "CS401", date: "Mar 09", time: "14:00 PM", present: 3, total: 4, status: "closed" },
    { id: 3, class: "CS301", date: "Mar 08", time: "10:00 AM", present: 6, total: 6, status: "closed" },
    { id: 4, class: "CS401", date: "Mar 06", time: "14:00 PM", present: 2, total: 4, status: "closed" },
  ];

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 28 }}>Past Sessions</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {sessions.map(s => {
          const pct = Math.round((s.present / s.total) * 100);
          return (
            <div key={s.id} style={{
              background: THEME.card, border: `1px solid ${THEME.border}`,
              borderRadius: 14, padding: "18px 24px",
              display: "flex", alignItems: "center", gap: 20,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: `${THEME.accent}14`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, color: THEME.accent, fontFamily: "'DM Mono', monospace",
              }}>{s.class.slice(0, 3)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{s.class}</div>
                <div style={{ fontSize: 12, color: THEME.muted }}>{s.date} · {s.time}</div>
              </div>
              <div style={{ width: 120 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: THEME.muted }}>{s.present}/{s.total}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: pct >= 80 ? THEME.green : THEME.amber, fontFamily: "'DM Mono', monospace" }}>{pct}%</span>
                </div>
                <div style={{ height: 4, background: THEME.border, borderRadius: 4 }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: pct >= 80 ? THEME.green : THEME.amber, borderRadius: 4 }} />
                </div>
              </div>
              <Badge label="closed" color={THEME.muted} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Teacher Dashboard ────────────────────────────────────────────────────────
function TeacherDashboard({ setPage }) {
  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 4 }}>Welcome back, Prof. Wright</h2>
      <p style={{ color: THEME.muted, fontSize: 13, marginBottom: 28 }}>Monday, March 10, 2025</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard label="My Classes"       value="3"   icon="▦" color={THEME.accent} />
        <StatCard label="Sessions Today"   value="1"   icon="◉" color={THEME.green}  />
        <StatCard label="Avg Attendance"   value="82%" icon="▤" color={THEME.amber}  />
      </div>

      {/* Quick start */}
      <div style={{
        background: `linear-gradient(135deg, ${THEME.accent}14, ${THEME.purple}14)`,
        border: `1px solid ${THEME.accent}33`, borderRadius: 16, padding: 28,
        display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20,
      }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Start Attendance Scan</div>
          <div style={{ fontSize: 13, color: THEME.muted }}>CS301 — Data Structures · Today 10:00 AM</div>
        </div>
        <button onClick={() => setPage("scan")} style={{
          padding: "12px 24px", borderRadius: 10, border: "none",
          background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDim})`,
          color: "#0A0C10", fontWeight: 700, fontSize: 14, fontFamily: "'DM Sans', sans-serif",
        }}>▶ Scan Now</button>
      </div>

      <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>My Classes</h3>
        {MOCK_CLASSES.filter(c => c.teacher === "Prof. James Wright").map(c => (
          <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${THEME.border}` }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
              <div style={{ fontSize: 11, color: THEME.muted }}>{c.code} · {c.schedule} · {c.enrolled} students</div>
            </div>
            <button onClick={() => setPage("scan")} style={{
              padding: "7px 16px", borderRadius: 8, border: `1px solid ${THEME.accent}44`,
              background: `${THEME.accent}10`, color: THEME.accent, fontSize: 11,
              fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
            }}>Scan →</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Student Dashboard ────────────────────────────────────────────────────────
function StudentDashboard() {
  const overall = Math.round((MOCK_ATTENDANCE.filter(a => a.status === "present").length / MOCK_ATTENDANCE.length) * 100);

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 4 }}>My Attendance</h2>
      <p style={{ color: THEME.muted, fontSize: 13, marginBottom: 28 }}>Alex Johnson · STU-001 · Computer Science</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard label="Overall Rate"    value={`${overall}%`} sub="This semester" icon="◎" color={overall >= 75 ? THEME.green : THEME.red} />
        <StatCard label="Classes Present" value="4"             sub="of 6 total"    icon="✓" color={THEME.accent} />
        <StatCard label="Low Attendance"  value="1"             sub="Below 75%"     icon="⚠" color={THEME.amber} />
      </div>

      {/* Per-class */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        {[{ code: "CS301", name: "Data Structures", present: 8, total: 9, color: THEME.green },
          { code: "CS401", name: "Machine Learning", present: 4, total: 7, color: THEME.amber }].map(c => {
          const pct = Math.round((c.present / c.total) * 100);
          return (
            <div key={c.code} style={{ background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 14, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: THEME.muted, fontFamily: "'DM Mono', monospace" }}>{c.code}</div>
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: c.color, fontFamily: "'DM Mono', monospace" }}>{pct}%</div>
              </div>
              <div style={{ height: 6, background: THEME.border, borderRadius: 4 }}>
                <div style={{ height: "100%", width: `${pct}%`, background: c.color, borderRadius: 4 }} />
              </div>
              <div style={{ fontSize: 11, color: THEME.muted, marginTop: 8 }}>{c.present}/{c.total} sessions attended</div>
            </div>
          );
        })}
      </div>

      {/* History */}
      <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Recent History</h3>
        {MOCK_ATTENDANCE.map((a, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "10px 0", borderBottom: `1px solid ${THEME.border}` }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: a.status === "present" ? `${THEME.green}14` : a.status === "late" ? `${THEME.amber}14` : `${THEME.red}14`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
            }}>
              {a.status === "present" ? "✓" : a.status === "late" ? "⏱" : "✕"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{a.class}</div>
              <div style={{ fontSize: 11, color: THEME.muted }}>{a.date}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <Badge
                label={a.status}
                color={a.status === "present" ? THEME.green : a.status === "late" ? THEME.amber : THEME.red}
              />
              {a.confidence > 0 && (
                <div style={{ fontSize: 10, color: THEME.muted, marginTop: 4, fontFamily: "'DM Mono', monospace" }}>
                  {(a.confidence * 100).toFixed(0)}% match
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Classes Page ─────────────────────────────────────────────────────────────
function ClassesPage() {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 4 }}>Classes</h2>
          <p style={{ color: THEME.muted, fontSize: 13 }}>Manage courses and enrollments</p>
        </div>
        <button style={{
          padding: "10px 20px", borderRadius: 10, border: "none",
          background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDim})`,
          color: "#0A0C10", fontWeight: 700, fontSize: 13, fontFamily: "'DM Sans', sans-serif",
        }}>+ New Class</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {MOCK_CLASSES.map(c => (
          <div key={c.id} style={{
            background: THEME.card, border: `1px solid ${THEME.border}`,
            borderRadius: 16, padding: "20px 24px",
            display: "flex", alignItems: "center", gap: 20,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12, flexShrink: 0,
              background: `${THEME.purple}14`, border: `1px solid ${THEME.purple}33`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700, color: THEME.purple, fontFamily: "'DM Mono', monospace",
            }}>{c.code.slice(0, 4)}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 3 }}>{c.name}</div>
              <div style={{ fontSize: 12, color: THEME.muted }}>{c.teacher} · {c.schedule}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: THEME.accent, fontFamily: "'DM Mono', monospace" }}>{c.enrolled}</div>
              <div style={{ fontSize: 10, color: THEME.muted }}>students</div>
            </div>
            <Badge label={c.active ? "active" : "inactive"} color={c.active ? THEME.green : THEME.muted} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Reports Page ─────────────────────────────────────────────────────────────
function ReportsPage() {
  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 28 }}>Reports</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
        {[
          { title: "Attendance Summary", desc: "Class-by-class breakdown for current semester", icon: "▤", color: THEME.accent },
          { title: "At-Risk Students",   desc: "Students below 75% attendance threshold",    icon: "⚠", color: THEME.red },
          { title: "AI Accuracy Report", desc: "Face recognition confidence statistics",      icon: "◉", color: THEME.purple },
          { title: "Monthly Export",     desc: "Download full attendance CSV / PDF",          icon: "↓", color: THEME.green },
        ].map(r => (
          <div key={r.title} style={{
            background: THEME.card, border: `1px solid ${THEME.border}`,
            borderRadius: 16, padding: 24, cursor: "pointer",
            transition: "border-color 0.2s",
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = `${r.color}55`}
            onMouseLeave={e => e.currentTarget.style.borderColor = THEME.border}
          >
            <div style={{ fontSize: 28, marginBottom: 12, color: r.color }}>{r.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{r.title}</div>
            <div style={{ fontSize: 12, color: THEME.muted }}>{r.desc}</div>
            <div style={{ marginTop: 16, fontSize: 12, color: r.color, fontWeight: 600 }}>Generate →</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [students, setStudents] = useState(MOCK_STUDENTS);

  const handleLogin = (u) => { setUser(u); setPage("dashboard"); };
  const handleLogout = () => { setUser(null); setPage("dashboard"); };
  const handleFaceRegistered = (studentId) => {
    setStudents(prev => prev.map(student =>
      student.id === studentId
        ? { ...student, hasEmbedding: true }
        : student
    ));
  };

  if (!user) return <LoginPage onLogin={handleLogin} />;

  const renderPage = () => {
    if (user.role === "admin") {
      if (page === "dashboard") return <AdminDashboard />;
      if (page === "students")  return <StudentsPage students={students} onFaceRegistered={handleFaceRegistered} />;
      if (page === "classes")   return <ClassesPage />;
      if (page === "reports")   return <ReportsPage />;
    }
    if (user.role === "teacher") {
      if (page === "dashboard") return <TeacherDashboard setPage={setPage} />;
      if (page === "scan")      return <ScanPage students={students} />;
      if (page === "sessions")  return <SessionsPage />;
    }
    if (user.role === "student") {
      if (page === "dashboard" || page === "attendance") return <StudentDashboard />;
    }
    return <div style={{ color: THEME.muted }}>Page not found</div>;
  };

  return (
    <Shell user={user} onLogout={handleLogout} activePage={page} setPage={setPage}>
      {renderPage()}
    </Shell>
  );
}
