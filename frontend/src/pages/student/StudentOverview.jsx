import React, { useEffect, useState } from "react";
import { api } from "../../utils/api.js";

const StudentOverview = () => {
  const [profile, setProfile] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [attendance, setAttendance] = useState({
    summary: { Present: 0, Absent: 0, Late: 0, Excused: 0 },
    records: []
  });

  useEffect(() => {
    const load = async () => {
      const [pRes, sRes] = await Promise.all([
        api.get("/student/me"),
        api.get("/student/schedules")
      ]);
      setProfile(pRes.data);
      setSchedules(sRes.data);

      const attendanceRes = await api.get("/student/attendance");
      setAttendance(attendanceRes.data);
    };
    load();
  }, []);

  return (
    <div className="grid-responsive">
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl">
            👋
          </div>
          <div>
            <h2 className="text-xl font-bold">Hello, {profile?.user?.name || "Student"}</h2>
            <p className="text-sm text-gray-400">
              Instrument: <span className="text-purple-400">{profile?.instrument || "—"}</span> • 
              Level: <span className="text-blue-400">{profile?.courseLevel || "—"}</span>
            </p>
            <p className="text-sm text-gray-400">
              Contact: <span className="text-green-400">{profile?.user?.contactNumber || "—"}</span>
            </p>
          </div>
        </div>
        <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
          <p className="text-sm">
            <span className="font-semibold text-purple-400">Teacher:</span> {profile?.assignedTeacher?.user?.name || "Not assigned"}
          </p>
        </div>
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
            <div key={s._id} className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-gray-500/5 to-gray-600/5 border border-gray-500/10 hover:border-purple-500/30 transition-all duration-300">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{new Date(s.startTime).toLocaleString()}</p>
                <p className="text-xs text-gray-400">with {s.teacher?.user?.name || "Teacher"}</p>
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
            📋
          </div>
          <h2 className="text-xl font-bold">Attendance</h2>
        </div>

        <div className="grid-2" style={{ marginBottom: "12px" }}>
          <p><strong>Present:</strong> {attendance.summary?.Present || 0}</p>
          <p><strong>Absent:</strong> {attendance.summary?.Absent || 0}</p>
          <p><strong>Late:</strong> {attendance.summary?.Late || 0}</p>
          <p><strong>Excused:</strong> {attendance.summary?.Excused || 0}</p>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Class Time</th>
                <th>Status</th>
                <th>Teacher</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {(attendance.records || []).slice(0, 5).map((record) => (
                <tr key={record._id}>
                  <td>{new Date(record.date).toLocaleDateString()}</td>
                  <td>
                    {record.schedule?.startTime
                      ? `${new Date(record.schedule.startTime).toLocaleTimeString()} - ${new Date(record.schedule.endTime).toLocaleTimeString()}`
                      : "-"}
                  </td>
                  <td>{record.status}</td>
                  <td>{record.teacher?.user?.name || "Teacher"}</td>
                  <td>{record.notes || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentOverview;


