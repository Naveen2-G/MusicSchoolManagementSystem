import React, { useEffect, useState } from "react";
import { api } from "../../utils/api.js";

const TeacherAttendance = () => {
  const [schedules, setSchedules] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().slice(0, 10));
  const [attendanceByKey, setAttendanceByKey] = useState({});
  const [savedAttendanceByKey, setSavedAttendanceByKey] = useState({});
  const [attendanceNotesByKey, setAttendanceNotesByKey] = useState({});
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [confirmBox, setConfirmBox] = useState({
    open: false,
    schedule: null,
    presentCount: 0,
    absentCount: 0,
    enteredPresentCount: "",
    canUpdate: false
  });

  const formatLocalDate = (value) => {
    const date = new Date(value);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const getKey = (scheduleId, studentId) => `${scheduleId}:${studentId}`;

  const loadAttendance = async (date) => {
    const attendanceRes = await api.get(`/teacher/attendance/students?date=${date}`);
    const statusMap = {};
    const notesMap = {};

    for (const record of attendanceRes.data || []) {
      const key = getKey(record.schedule?._id || "no-schedule", record.student?._id);
      statusMap[key] = record.status;
      notesMap[key] = record.notes || "";
    }

    setAttendanceByKey(statusMap);
    setSavedAttendanceByKey(statusMap);
    setAttendanceNotesByKey(notesMap);
  };

  useEffect(() => {
    const load = async () => {
      const schedulesRes = await api.get("/teacher/schedules");
      setSchedules(schedulesRes.data || []);
      await loadAttendance(attendanceDate);
    };

    load();
  }, []);

  useEffect(() => {
    loadAttendance(attendanceDate);
  }, [attendanceDate]);

  const handleSaveSchedule = async (schedule) => {
    try {
      setSuccessMessage("");
      setError("");

      const requests = (schedule.students || []).map((student) => {
        const key = getKey(schedule._id, student._id);
        return api.post("/teacher/attendance/students", {
          studentId: student._id,
          scheduleId: schedule._id,
          status: attendanceByKey[key] || "Present",
          notes: attendanceNotesByKey[key] || "",
          date: attendanceDate
        });
      });

      await Promise.all(requests);

      setSuccessMessage("Attendance updated successfully.");
      setShowSuccessPopup(true);
      setTimeout(() => {
        setShowSuccessPopup(false);
      }, 4000);
      await loadAttendance(attendanceDate);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save attendance.");
    }
  };

  const openSaveConfirm = (schedule) => {
    const students = schedule.students || [];

    let presentCount = 0;
    let absentCount = 0;

    students.forEach((student) => {
      const key = getKey(schedule._id, student._id);
      const currentStatus = attendanceByKey[key] || "Present";

      if (currentStatus === "Absent") {
        absentCount += 1;
      } else {
        presentCount += 1;
      }
    });

    setConfirmBox({
      open: true,
      schedule,
      presentCount,
      absentCount,
      enteredPresentCount: "",
      canUpdate: false
    });
  };

  const handleConfirmUpdate = async () => {
    if (!confirmBox.schedule || !confirmBox.canUpdate) return;
    await handleSaveSchedule(confirmBox.schedule);
    setConfirmBox((prev) => ({ ...prev, open: false }));
  };

  const handleEnteredPresentCountChange = (value) => {
    const normalized = value.replace(/[^0-9]/g, "");
    const entered = normalized === "" ? null : Number(normalized);
    const canUpdate = entered !== null && entered === confirmBox.presentCount;

    setConfirmBox((prev) => ({
      ...prev,
      enteredPresentCount: normalized,
      canUpdate
    }));
  };

  return (
    <div className="card">
      <h2>Attendance Marker</h2>

      <div className="form-group" style={{ maxWidth: "220px" }}>
        <label>Date</label>
        <input
          type="date"
          value={attendanceDate}
          onChange={(e) => setAttendanceDate(e.target.value)}
        />
      </div>

      {showSuccessPopup ? (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 1200,
            background: "#166534",
            color: "#fff",
            padding: "10px 14px",
            borderRadius: "8px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.25)"
          }}
        >
          {successMessage}
        </div>
      ) : null}
      {error ? <p className="muted" style={{ color: "#b91c1c" }}>{error}</p> : null}

      {(schedules || [])
        .filter((schedule) => formatLocalDate(schedule.startTime) === attendanceDate)
        .map((schedule) => (
          <div key={schedule._id} style={{ marginTop: "14px" }}>
            <h3 style={{ marginBottom: "8px" }}>
              Class: {new Date(schedule.startTime).toLocaleTimeString()} - {new Date(schedule.endTime).toLocaleTimeString()} {schedule.room ? `(${schedule.room})` : ""}
            </h3>

            <div className="table-container" style={{ marginTop: "8px" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Status</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {(schedule.students || []).map((student) => {
                    const key = getKey(schedule._id, student._id);
                    return (
                      <tr key={key}>
                        <td>{student.user?.name}</td>
                        <td>
                          <select
                            value={attendanceByKey[key] || "Present"}
                            onChange={(e) =>
                              setAttendanceByKey((prev) => ({
                                ...prev,
                                [key]: e.target.value
                              }))
                            }
                          >
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                            <option value="Late">Late</option>
                            <option value="Excused">Excused</option>
                          </select>
                        </td>
                        <td>
                          <input
                            type="text"
                            placeholder="Optional note"
                            value={attendanceNotesByKey[key] || ""}
                            onChange={(e) =>
                              setAttendanceNotesByKey((prev) => ({
                                ...prev,
                                [key]: e.target.value
                              }))
                            }
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: "10px" }}>
              <button
                type="button"
                className="btn-primary btn-inline"
                onClick={() => openSaveConfirm(schedule)}
              >
                Save Attendance
              </button>
            </div>
          </div>
        ))}

      {(schedules || []).filter((schedule) => formatLocalDate(schedule.startTime) === attendanceDate).length === 0 ? (
        <p className="muted" style={{ marginTop: "12px" }}>No classes scheduled on this date.</p>
      ) : null}

      {confirmBox.open ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100
          }}
        >
          <div
            style={{
              width: "min(560px, 92vw)",
              background: "#0f172a",
              border: "1px solid rgba(148, 163, 184, 0.3)",
              borderRadius: "12px",
              padding: "18px"
            }}
          >
            <h3 style={{ marginTop: 0 }}>Confirm Attendance Update</h3>
            <p className="muted">
              Class: {confirmBox.schedule ? new Date(confirmBox.schedule.startTime).toLocaleTimeString() : "-"}
            </p>
            <p><strong>Absent Count:</strong> {confirmBox.absentCount}</p>
            <p><strong>Marked Present Count:</strong> {confirmBox.presentCount}</p>

            <div className="form-group" style={{ maxWidth: "240px", marginTop: "10px" }}>
              <label>Enter Present Head Count</label>
              <input
                type="number"
                min="0"
                value={confirmBox.enteredPresentCount}
                onChange={(e) => handleEnteredPresentCountChange(e.target.value)}
              />
            </div>

            {confirmBox.canUpdate ? null : (
              <p style={{ color: "#f59e0b" }}>
                Entered present head count must match marked present count.
              </p>
            )}

            <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
              <button
                type="button"
                className="btn-secondary btn-inline"
                onClick={() => setConfirmBox((prev) => ({ ...prev, open: false }))}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary btn-inline"
                onClick={handleConfirmUpdate}
                disabled={!confirmBox.canUpdate}
              >
                Confirm & Update
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default TeacherAttendance;
