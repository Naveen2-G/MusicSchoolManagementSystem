import React, { useEffect, useState } from "react";
import { api } from "../../utils/api.js";

const countryCodes = [
  { code: "+91", country: "India", length: 10 },
  { code: "+1", country: "USA", length: 10 },
  { code: "+44", country: "UK", length: 10 },
  { code: "+61", country: "Australia", length: 9 },
  { code: "+81", country: "Japan", length: 10 },
  { code: "+86", country: "China", length: 11 },
  { code: "+49", country: "Germany", length: 10 },
  { code: "+33", country: "France", length: 9 },
  { code: "+39", country: "Italy", length: 9 },
  { code: "+7", country: "Russia", length: 10 },
];

const emptyTeacher = {
  name: "",
  email: "",
  username: "",
  password: "",
  instruments: "",
  bio: "",
  salaryType: "monthly",
  salaryAmount: "",
  countryCode: "+91",
  contactNumber: ""
};

const emptyStudent = {
  name: "",
  email: "",
  username: "",
  password: "",
  assignedTeacherId: "",
  instrument: "",
  courseLevel: "",
  countryCode: "+91",
  contactNumber: ""
};

const AdminUsers = () => {
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [teacherForm, setTeacherForm] = useState(emptyTeacher);
  const [studentForm, setStudentForm] = useState(emptyStudent);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form visibility state
  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [showBulkAssignForm, setShowBulkAssignForm] = useState(false);

  // List visibility state
  const [showTeacherList, setShowTeacherList] = useState(false);
  const [showStudentList, setShowStudentList] = useState(false);

  // Bulk assignment state
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [bulkAssignLoading, setBulkAssignLoading] = useState(false);

  const load = async () => {
    const [tRes, sRes] = await Promise.all([
      api.get("/admin/teachers"),
      api.get("/admin/students")
    ]);
    setTeachers(tRes.data);
    setStudents(sRes.data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        ...teacherForm,
        instruments: teacherForm.instruments
          ? teacherForm.instruments.split(",").map((s) => s.trim())
          : []
      };
      await api.post("/admin/teachers", payload);
      setTeacherForm(emptyTeacher);
      setSuccess("Teacher created successfully!");
      await load();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to create teacher";
      setError(errorMsg);
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.post("/admin/students", studentForm);
      setStudentForm(emptyStudent);
      setSuccess("Student created successfully!");
      await load();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to create student";
      setError(errorMsg);
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const toggleTeacherActive = async (t) => {
    await api.put(`/admin/teachers/${t._id}`, { isActive: !t.user.isActive });
    load();
  };

  const toggleStudentActive = async (s) => {
    await api.put(`/admin/students/${s._id}`, { isActive: !s.user.isActive });
    load();
  };

  const handleBulkAssign = async (e) => {
    e.preventDefault();
    if (!selectedTeacherId || selectedStudentIds.length === 0) {
      setError("Please select a teacher and at least one student");
      return;
    }

    setBulkAssignLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Assign all selected students to the selected teacher
      await Promise.all(
        selectedStudentIds.map(studentId =>
          api.put(`/admin/students/${studentId}`, { assignedTeacherId: selectedTeacherId })
        )
      );

      setSuccess(`${selectedStudentIds.length} student(s) assigned to teacher successfully!`);
      setSelectedTeacherId("");
      setSelectedStudentIds([]);
      await load();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to assign students";
      setError(errorMsg);
      setTimeout(() => setError(null), 5000);
    } finally {
      setBulkAssignLoading(false);
    }
  };

  const handleStudentSelection = (studentId) => {
    setSelectedStudentIds(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const selectAllStudents = () => {
    setSelectedStudentIds(students.map(s => s._id));
  };

  const clearAllStudents = () => {
    setSelectedStudentIds([]);
  };

  return (
    <>
      {(error || success) && (
        <div className="alert-container">
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
        </div>
      )}
      <div className="grid-responsive">
        {/* Create Teacher Card */}
        <div className="card action-card" onClick={() => {
          setShowTeacherForm(!showTeacherForm);
          setShowStudentForm(false);
          setShowBulkAssignForm(false);
          setShowTeacherList(false);
          setShowStudentList(false);
        }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl">
              👨‍🎓
            </div>
            <div>
              <h3 className="text-lg font-semibold">Create a Teacher</h3>
              <p className="text-sm text-gray-400">Add a new instructor to the system</p>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-blue-400 text-sm">Click to create teacher</span>
          </div>
        </div>

        {/* Create Student Card */}
        <div className="card action-card" onClick={() => {
          setShowStudentForm(!showStudentForm);
          setShowTeacherForm(false);
          setShowBulkAssignForm(false);
          setShowTeacherList(false);
          setShowStudentList(false);
        }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white text-xl">
              🎓
            </div>
            <div>
              <h3 className="text-lg font-semibold">Create a Student</h3>
              <p className="text-sm text-gray-400">Add a new learner to the system</p>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-blue-400 text-sm">Click to create student</span>
          </div>
        </div>

        {/* Bulk Assign Card */}
        <div className="card action-card" onClick={() => {
          setShowBulkAssignForm(!showBulkAssignForm);
          setShowTeacherForm(false);
          setShowStudentForm(false);
          setShowTeacherList(false);
          setShowStudentList(false);
        }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-xl">
              👥
            </div>
            <div>
              <h3 className="text-lg font-semibold">Bulk Assign Students to Teacher</h3>
              <p className="text-sm text-gray-400">Assign multiple students to a teacher at once</p>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-blue-400 text-sm">Click to bulk assign</span>
          </div>
        </div>

        {/* Existing Teachers Card */}
        <div className="card action-card" onClick={() => {
          setShowTeacherList(!showTeacherList);
          setShowTeacherForm(false);
          setShowStudentForm(false);
          setShowBulkAssignForm(false);
          setShowStudentList(false);
        }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-xl">
              📚
            </div>
            <div>
              <h3 className="text-lg font-semibold">Existing Teachers</h3>
              <p className="text-sm text-gray-400">View and manage current instructors ({teachers.length} total)</p>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-blue-400 text-sm">Click to view teachers</span>
          </div>
        </div>

        {/* Existing Students Card */}
        <div className="card action-card" onClick={() => {
          setShowStudentList(!showStudentList);
          setShowTeacherForm(false);
          setShowStudentForm(false);
          setShowBulkAssignForm(false);
          setShowTeacherList(false);
        }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xl">
              👨‍🎓
            </div>
            <div>
              <h3 className="text-lg font-semibold">Existing Students</h3>
              <p className="text-sm text-gray-400">View and manage current learners ({students.length} total)</p>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-blue-400 text-sm">Click to view students</span>
          </div>
        </div>
      </div>

      {/* Teacher Form */}
      {showTeacherForm && (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <form className="card form-card" onSubmit={handleCreateTeacher}>
            <h3>Create Teacher</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Name</label>
                <input
                  value={teacherForm.name}
                  onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={teacherForm.email}
                  onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Username</label>
                <input
                  value={teacherForm.username}
                  onChange={(e) =>
                    setTeacherForm({ ...teacherForm, username: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Temp Password</label>
                <input
                  type="password"
                  value={teacherForm.password}
                  onChange={(e) =>
                    setTeacherForm({ ...teacherForm, password: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Contact Number</label>
                <div className="phone-input-group">
                  <select
                    value={teacherForm.countryCode}
                    onChange={(e) =>
                      setTeacherForm({ ...teacherForm, countryCode: e.target.value })
                    }
                    className="country-code-select"
                  >
                    {countryCodes.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.code} ({country.country})
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    value={teacherForm.contactNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      const selectedCountry = countryCodes.find(c => c.code === teacherForm.countryCode);
                      if (selectedCountry && value.length <= selectedCountry.length) {
                        setTeacherForm({ ...teacherForm, contactNumber: value });
                      }
                    }}
                    placeholder="Enter phone number"
                    maxLength={countryCodes.find(c => c.code === teacherForm.countryCode)?.length || 10}
                    required
                  />
                </div>
                <small className="form-hint">
                  {teacherForm.countryCode === "+91" ? "For India: 10 digits required" : `For ${countryCodes.find(c => c.code === teacherForm.countryCode)?.country}: ${countryCodes.find(c => c.code === teacherForm.countryCode)?.length} digits required`}
                </small>
              </div>
              <div className="form-group">
                <label>Instruments (comma separated)</label>
                <input
                  value={teacherForm.instruments}
                  onChange={(e) =>
                    setTeacherForm({ ...teacherForm, instruments: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Salary Type</label>
                <select
                  value={teacherForm.salaryType}
                  onChange={(e) =>
                    setTeacherForm({ ...teacherForm, salaryType: e.target.value })
                  }
                >
                  <option value="monthly">Monthly</option>
                  <option value="per_class">Per Class</option>
                  <option value="fixed">Fixed</option>
                </select>
              </div>
              <div className="form-group">
                <label>Salary Amount</label>
                <input
                  type="number"
                  value={teacherForm.salaryAmount}
                  onChange={(e) =>
                    setTeacherForm({ ...teacherForm, salaryAmount: e.target.value })
                  }
                />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Bio</label>
                <textarea
                  value={teacherForm.bio}
                  onChange={(e) => setTeacherForm({ ...teacherForm, bio: e.target.value })}
                />
              </div>
            </div>
            <div style={{ marginTop: '2rem' }}>
              <button className="btn-primary" disabled={loading}>
                {loading ? "Creating..." : "Create Teacher"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Student Form */}
      {showStudentForm && (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <form className="card form-card" onSubmit={handleCreateStudent}>
            <h3>Create Student</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Name</label>
                <input
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={studentForm.email}
                  onChange={(e) =>
                    setStudentForm({ ...studentForm, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Username</label>
                <input
                  value={studentForm.username}
                  onChange={(e) =>
                    setStudentForm({ ...studentForm, username: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Temp Password</label>
                <input
                  type="password"
                  value={studentForm.password}
                  onChange={(e) =>
                    setStudentForm({ ...studentForm, password: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Contact Number</label>
                <div className="phone-input-group">
                  <select
                    value={studentForm.countryCode}
                    onChange={(e) =>
                      setStudentForm({ ...studentForm, countryCode: e.target.value })
                    }
                    className="country-code-select"
                  >
                    {countryCodes.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.code} ({country.country})
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    value={studentForm.contactNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      const selectedCountry = countryCodes.find(c => c.code === studentForm.countryCode);
                      if (selectedCountry && value.length <= selectedCountry.length) {
                        setStudentForm({ ...studentForm, contactNumber: value });
                      }
                    }}
                    placeholder="Enter phone number"
                    maxLength={countryCodes.find(c => c.code === studentForm.countryCode)?.length || 10}
                    required
                  />
                </div>
                <small className="form-hint">
                  {studentForm.countryCode === "+91" ? "For India: 10 digits required" : `For ${countryCodes.find(c => c.code === studentForm.countryCode)?.country}: ${countryCodes.find(c => c.code === studentForm.countryCode)?.length} digits required`}
                </small>
              </div>
              <div className="form-group">
                <label>Assigned Teacher</label>
                <select
                  value={studentForm.assignedTeacherId}
                  onChange={(e) =>
                    setStudentForm({
                      ...studentForm,
                      assignedTeacherId: e.target.value
                    })
                  }
                >
                  <option value="">Select teacher</option>
                  {teachers.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.user.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Instrument</label>
                <input
                  value={studentForm.instrument}
                  onChange={(e) =>
                    setStudentForm({ ...studentForm, instrument: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Course Level</label>
                <input
                  value={studentForm.courseLevel}
                  onChange={(e) =>
                    setStudentForm({ ...studentForm, courseLevel: e.target.value })
                  }
                />
              </div>
            </div>
            <div style={{ marginTop: '2rem' }}>
              <button className="btn-primary" disabled={loading}>
                {loading ? "Creating..." : "Create Student"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bulk Assign Form */}
      {showBulkAssignForm && (
        <div className="bulk-assign-container">
          <form className="card form-card bulk-assign-form" onSubmit={handleBulkAssign}>
            <div className="form-header">
              <h3 className="form-title">Bulk Assign Students to Teacher</h3>
              <p className="form-subtitle">Select a teacher and choose students to assign</p>
            </div>

            {/* Teacher Selection Section */}
            <div className="form-section">
              <div className="form-group teacher-select-group">
                <label className="form-label">Select Teacher</label>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="form-select teacher-select"
                  required
                >
                  <option value="">Choose a teacher</option>
                  {teachers.filter(t => t.user?.isActive).map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.user.name} ({(t.instruments || []).join(", ")})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Student Selection Section */}
            <div className="form-section">
              <div className="form-group student-select-group">
                <label className="form-label">Select Students to Assign</label>

                {/* Selection Controls */}
                <div className="selection-controls">
                  <button
                    type="button"
                    className="btn-link small select-all-btn"
                    onClick={selectAllStudents}
                    disabled={students.length === 0}
                  >
                    Select All ({students.length})
                  </button>
                  <button
                    type="button"
                    className="btn-link small danger clear-all-btn"
                    onClick={clearAllStudents}
                    disabled={selectedStudentIds.length === 0}
                  >
                    Clear All ({selectedStudentIds.length})
                  </button>
                </div>

                {/* Student List Container */}
                <div className="student-list-container">
                  {students.length === 0 ? (
                    <div className="empty-state">
                      <p className="empty-text">No students available</p>
                    </div>
                  ) : (
                    <div className="student-list">
                      {students.map((s) => (
                        <label key={s._id} className="student-item">
                          <input
                            type="checkbox"
                            checked={selectedStudentIds.includes(s._id)}
                            onChange={() => handleStudentSelection(s._id)}
                            className="student-checkbox"
                          />
                          <div className="student-info">
                            <span className="student-name">{s.user?.name}</span>
                            <span className="student-details">
                              ({s.instrument || "No instrument"})
                              {s.assignedTeacher && (
                                <span className="current-teacher">
                                  - Currently: {s.assignedTeacher.user?.name}
                                </span>
                              )}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selection Summary */}
                {selectedStudentIds.length > 0 && (
                  <div className="selection-summary">
                    <span className="selected-count">
                      {selectedStudentIds.length} student{selectedStudentIds.length !== 1 ? 's' : ''} selected
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="form-actions">
              <button
                type="submit"
                className="btn-primary assign-btn"
                disabled={bulkAssignLoading || !selectedTeacherId || selectedStudentIds.length === 0}
              >
                {bulkAssignLoading ? (
                  <>
                    <div className="loading-spinner small"></div>
                    Assigning...
                  </>
                ) : (
                  `Assign ${selectedStudentIds.length || ''} Student${selectedStudentIds.length !== 1 ? 's' : ''} to Teacher`
                )}
              </button>

              <button
                type="button"
                className="btn-error unassign-btn"
                onClick={async () => {
                  if (selectedStudentIds.length === 0) {
                    setError("Please select students to unassign");
                    return;
                  }

                  setBulkAssignLoading(true);
                  setError(null);
                  setSuccess(null);

                  try {
                    await Promise.all(
                      selectedStudentIds.map(studentId =>
                        api.put(`/admin/students/${studentId}`, { assignedTeacherId: null })
                      )
                    );

                    setSuccess(`${selectedStudentIds.length} student(s) unassigned from teachers successfully!`);
                    setSelectedStudentIds([]);
                    await load();
                    setTimeout(() => setSuccess(null), 3000);
                  } catch (err) {
                    const errorMsg = err.response?.data?.message || err.message || "Failed to unassign students";
                    setError(errorMsg);
                    setTimeout(() => setError(null), 5000);
                  } finally {
                    setBulkAssignLoading(false);
                  }
                }}
                disabled={bulkAssignLoading || selectedStudentIds.length === 0}
              >
                {bulkAssignLoading ? "Unassigning..." : `Unassign ${selectedStudentIds.length || ''} Student${selectedStudentIds.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Existing Teachers Table */}
      {showTeacherList && (
        <div className="card">
          <h3>Existing Teachers</h3>
          <div className="table-container">
            <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Contact</th>
                <th>Instruments</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {teachers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
                    No teachers found. Create your first teacher above.
                  </td>
                </tr>
              ) : (
                teachers.map((t) => (
                  <tr key={t._id}>
                    <td>{t.user?.name || "—"}</td>
                    <td>{t.user?.email || "—"}</td>
                    <td>{t.user?.contactNumber || "—"}</td>
                    <td>{(t.instruments || []).join(", ") || "—"}</td>
                    <td>
                      <span
                        className={
                          t.user?.isActive ? "badge badge-success" : "badge badge-muted"
                        }
                      >
                        {t.user?.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-link"
                        onClick={() => toggleTeacherActive(t)}
                      >
                        {t.user?.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Existing Students Table */}
      {showStudentList && (
        <div className="card">
          <h3>Existing Students</h3>
          <div className="table-container">
            <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Contact</th>
                <th>Teacher</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
                    No students found. Create your first student above.
                  </td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr key={s._id}>
                    <td>{s.user?.name || "—"}</td>
                    <td>{s.user?.email || "—"}</td>
                    <td>{s.user?.contactNumber || "—"}</td>
                    <td>{s.assignedTeacher?.user?.name || "—"}</td>
                    <td>
                      <span
                        className={
                          s.user?.isActive ? "badge badge-success" : "badge badge-muted"
                        }
                      >
                        {s.user?.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-link"
                        onClick={() => toggleStudentActive(s)}
                      >
                        {s.user?.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminUsers;


