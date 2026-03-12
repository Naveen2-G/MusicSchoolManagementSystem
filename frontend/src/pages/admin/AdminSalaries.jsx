import React, { useEffect, useState } from "react";
import { api } from "../../utils/api.js";

const AdminSalaries = () => {
  const [teachers, setTeachers] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [form, setForm] = useState({
    teacherId: "",
    period: "",
    type: "monthly",
    amount: "",
    status: "Not Credited"
  });
  const [editingId, setEditingId] = useState(null);
  const [editingAmount, setEditingAmount] = useState("");
  const [editingStatus, setEditingStatus] = useState("");

  const load = async () => {
    const [tRes, sRes] = await Promise.all([
      api.get("/admin/teachers"),
      api.get("/admin/salaries")
    ]);
    setTeachers(tRes.data);
    setSalaries(sRes.data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post("/admin/salaries", form);
    load();
  };

  const handleEdit = (salary) => {
    setEditingId(salary._id);
    setEditingAmount(salary.amount.toString());
    setEditingStatus(salary.status);
  };

  const handleSaveEdit = async (salaryId) => {
    try {
      await api.post("/admin/salaries", {
        teacherId: salaries.find(s => s._id === salaryId).teacher._id,
        period: salaries.find(s => s._id === salaryId).period,
        type: salaries.find(s => s._id === salaryId).type,
        amount: Number(editingAmount),
        status: editingStatus
      });
      setEditingId(null);
      setEditingAmount("");
      setEditingStatus("");
      load();
    } catch (error) {
      console.error("Error updating salary:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingAmount("");
    setEditingStatus("");
  };

  return (
    <div className="two-column">
      <form className="card form-card" onSubmit={handleSubmit}>
        <h2>Update Teacher Salary</h2>
        <div className="form-group">
          <label>Teacher</label>
          <select
            value={form.teacherId}
            onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
            required
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
          <label>Period (e.g. 2025-01)</label>
          <input
            value={form.period}
            onChange={(e) => setForm({ ...form, period: e.target.value })}
            required
          />
        </div>
        <div className="grid-2">
          <div className="form-group">
            <label>Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="monthly">Monthly</option>
              <option value="per_class">Per Class</option>
              <option value="fixed">Fixed</option>
            </select>
          </div>
          <div className="form-group">
            <label>Amount</label>
            <input
              type="number"
              value={form.amount}
              onChange={(e) =>
                setForm({ ...form, amount: Number(e.target.value) })
              }
              required
            />
          </div>
        </div>
        <div className="form-group">
          <label>Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="Not Credited">Not Credited</option>
            <option value="Credited">Credited</option>
          </select>
        </div>
        <button className="btn-primary">Save Salary</button>
      </form>

      <div className="card">
        <h2>Salary History</h2>
        <div className="table-container">
          <table className="table">
          <thead>
            <tr>
              <th>Teacher</th>
              <th>Period</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {salaries.map((s) => (
              <tr key={s._id}>
                <td>{s.teacher?.user?.name}</td>
                <td>{s.period}</td>
                <td>{s.type}</td>
                <td>
                  {editingId === s._id ? (
                    <input
                      type="number"
                      value={editingAmount}
                      onChange={(e) => setEditingAmount(e.target.value)}
                      style={{ width: '80px' }}
                    />
                  ) : (
                    `₹${s.amount.toFixed(2)}`
                  )}
                </td>
                <td>
                  {editingId === s._id ? (
                    <select
                      value={editingStatus}
                      onChange={(e) => setEditingStatus(e.target.value)}
                      style={{ width: '100px' }}
                    >
                      <option value="Not Credited">Not Credited</option>
                      <option value="Credited">Credited</option>
                    </select>
                  ) : (
                    <span
                      className={
                        s.status === "Credited"
                          ? "badge badge-success"
                          : "badge badge-warning"
                      }
                    >
                      {s.status}
                    </span>
                  )}
                </td>
                <td>
                  {editingId === s._id ? (
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleSaveEdit(s._id)}
                      >
                        Save
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleEdit(s)}
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

export default AdminSalaries;


