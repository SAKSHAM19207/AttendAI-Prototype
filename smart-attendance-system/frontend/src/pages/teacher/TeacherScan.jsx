import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import api from "../../services/api.js";

export default function TeacherScan() {
  const webcamRef = useRef(null);
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState("");
  const [session, setSession] = useState(null);
  const [recognized, setRecognized] = useState([]);

  useEffect(() => {
    api.get("/attendance/teacher/overview").then(({ data }) => {
      setClasses(data.classes);
      if (data.classes[0]) setClassId(data.classes[0]._id);
    });
  }, []);

  useEffect(() => {
    if (!session?._id) return;
    const interval = setInterval(async () => {
      const image = webcamRef.current?.getScreenshot();
      if (!image) return;
      const { data } = await api.post("/attendance/recognize", { sessionId: session._id, image });
      if (data.recognized && !data.recognized.duplicate) {
        setRecognized((prev) => [data.recognized, ...prev]);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [session]);

  const startSession = async () => {
    const { data } = await api.post("/attendance/sessions/start", { classId });
    setSession(data);
    setRecognized([]);
  };

  const stopSession = async () => {
    if (!session?._id) return;
    await api.post(`/attendance/sessions/${session._id}/end`);
    setSession(null);
  };

  return (
    <DashboardLayout title="Live Attendance Scan">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-4 flex gap-3">
            <select className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3" value={classId} onChange={(e) => setClassId(e.target.value)}>
              {classes.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
            </select>
            <button onClick={session ? stopSession : startSession} className={`rounded-xl px-5 py-3 font-semibold ${session ? "bg-rose-500/20 text-rose-300" : "bg-cyan-400 text-slate-950"}`}>
              {session ? "Stop Session" : "Start Session"}
            </button>
          </div>
          <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="w-full rounded-3xl" />
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-4 text-lg font-semibold">Recognized Students</div>
          <div className="space-y-3">
            {recognized.map((student) => (
              <div key={student.studentId} className="rounded-xl border border-slate-800 p-4">
                <div className="font-semibold">{student.name}</div>
                <div className="text-sm text-slate-400">{student.registrationNumber}</div>
                <div className="text-sm text-emerald-300">{Math.round(student.confidence * 100)}% confidence</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
