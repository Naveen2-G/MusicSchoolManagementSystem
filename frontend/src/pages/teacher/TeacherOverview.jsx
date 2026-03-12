import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../utils/api.js";

const TeacherOverview = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    const load = async () => {
      const [pRes, sRes] = await Promise.all([
        api.get("/teacher/me"),
        api.get("/teacher/schedules")
      ]);
      setProfile(pRes.data);
      setSchedules(sRes.data);
    };
    load();
  }, []);

  return (
    <div className="grid-responsive">
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-xl">
            👨‍🏫
          </div>
          <div>
            <h2 className="text-xl font-bold">Welcome, {profile?.user?.name || "Teacher"}</h2>
            <p className="text-sm text-gray-400">
              Instruments: <span className="text-purple-400">{(profile?.instruments || []).join(", ") || "—"}</span>
            </p>
            <p className="text-sm text-gray-400">
              Contact: <span className="text-blue-400">{profile?.user?.contactNumber || "—"}</span>
            </p>
          </div>
        </div>
        {profile?.bio && (
          <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
            <p className="text-sm italic">"{profile.bio}"</p>
          </div>
        )}
      </div>
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white text-xl">
            📅
          </div>
          <h2 className="text-xl font-bold">Next Lessons</h2>
        </div>
        <div className="space-y-3">
          {schedules.slice(0, 5).map((s, index) => (
            <div key={s._id} className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-gray-500/5 to-gray-600/5 border border-gray-500/10 hover:border-green-500/30 transition-all duration-300">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{new Date(s.startTime).toLocaleString()}</p>
                <p className="text-xs text-gray-400">
                  Students: {(s.students || []).map((st) => st.user?.name).join(", ") || "No students"}
                </p>
              </div>
            </div>
          ))}
          {schedules.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <div className="text-4xl mb-2">📭</div>
              <p>No upcoming lessons scheduled</p>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-xl">
            ✅
          </div>
          <h2 className="text-xl font-bold">Attendance Marker</h2>
        </div>
        <p className="muted" style={{ marginBottom: "12px" }}>
          Open the dedicated attendance screen for a wider view and faster marking.
        </p>
        <button type="button" className="btn-primary" onClick={() => navigate("/teacher/attendance")}>
          Open Attendance Marker
        </button>
      </div>
    </div>
  );
};

export default TeacherOverview;


