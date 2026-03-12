import React, { useEffect, useState } from "react";
import { api } from "../../utils/api.js";

const AdminFees = () => {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [summaryYear, setSummaryYear] = useState(new Date().getFullYear());
  const [paymentSummary, setPaymentSummary] = useState({
    paidStudents: [],
    unpaidStudents: [],
    paidCount: 0,
    unpaidCount: 0
  });
  const [activeStatusTab, setActiveStatusTab] = useState("paid");
  const [sortConfig, setSortConfig] = useState({
    paid: { key: "name", direction: "asc" },
    unpaid: { key: "name", direction: "asc" }
  });
  const [editingId, setEditingId] = useState(null);
  const [editingAmount, setEditingAmount] = useState("");
  const [form, setForm] = useState({
    studentId: "",
    year: new Date().getFullYear(),
    instrument: "",
    courseLevel: "",
    yearlyFee: "",
    amountPaid: ""
  });

  const handleStudentChange = (studentId) => {
    const selectedStudent = students.find(s => s._id === studentId);
    setForm({
      ...form,
      studentId,
      instrument: selectedStudent?.instrument || "",
      courseLevel: selectedStudent?.courseLevel || ""
    });
  };

  const load = async () => {
    const [feesRes, studentsRes] = await Promise.all([
      api.get("/admin/fees"),
      api.get("/admin/students")
    ]);
    setFees(feesRes.data);
    setStudents(studentsRes.data);
  };

  const loadPaymentSummary = async (year = summaryYear) => {
    const summaryRes = await api.get(`/admin/fees/payment-summary?year=${year}`);
    setPaymentSummary(summaryRes.data);
  };

  useEffect(() => {
    load();
    loadPaymentSummary();
  }, []);

  useEffect(() => {
    loadPaymentSummary(summaryYear);
  }, [summaryYear]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post("/admin/fees", form);
    load();
    loadPaymentSummary();
  };

  const handleEdit = (fee) => {
    setEditingId(fee._id);
    setEditingAmount(fee.amountPaid.toString());
  };

  const handleSaveEdit = async (feeId) => {
    try {
      await api.post("/admin/fees", {
        studentId: fees.find(f => f._id === feeId).student._id,
        year: fees.find(f => f._id === feeId).year,
        instrument: fees.find(f => f._id === feeId).instrument,
        courseLevel: fees.find(f => f._id === feeId).courseLevel,
        yearlyFee: fees.find(f => f._id === feeId).yearlyFee,
        amountPaid: Number(editingAmount)
      });
      setEditingId(null);
      setEditingAmount("");
      load();
      loadPaymentSummary();
    } catch (error) {
      console.error("Error updating fee:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingAmount("");
  };

  const getStatusBadge = (fee) => {
    const balance = fee.yearlyFee - fee.amountPaid;
    if (balance < 0) return <span className="badge badge-info">Overpaid</span>;
    if (balance === 0) return <span className="badge badge-success">Paid</span>;
    if (fee.amountPaid > 0) return <span className="badge badge-warning">Partially Paid</span>;
    return <span className="badge badge-danger">Pending</span>;
  };

  const handleSort = (tab, key) => {
    setSortConfig((prev) => {
      const current = prev[tab];
      const nextDirection =
        current.key === key && current.direction === "asc" ? "desc" : "asc";
      return {
        ...prev,
        [tab]: { key, direction: nextDirection }
      };
    });
  };

  const getSortedStudents = (students, tab) => {
    const { key, direction } = sortConfig[tab];
    const sorted = [...students].sort((a, b) => {
      let valueA = a[key];
      let valueB = b[key];

      if (["amountPaid", "balance", "yearlyFee"].includes(key)) {
        valueA = Number(valueA ?? 0);
        valueB = Number(valueB ?? 0);
      } else {
        valueA = String(valueA ?? "").toLowerCase();
        valueB = String(valueB ?? "").toLowerCase();
      }

      if (valueA < valueB) return direction === "asc" ? -1 : 1;
      if (valueA > valueB) return direction === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  };

  const sortArrow = (tab, key) => {
    const current = sortConfig[tab];
    if (current.key !== key) return "";
    return current.direction === "asc" ? " ▲" : " ▼";
  };

  const paidStudents = getSortedStudents(paymentSummary.paidStudents || [], "paid");
  const unpaidStudents = getSortedStudents(paymentSummary.unpaidStudents || [], "unpaid");

  return (
    <div className="two-column">
      <form className="card form-card" onSubmit={handleSubmit}>
        <h2>Update Yearly Fee</h2>
        <div className="form-group">
          <label>Student</label>
          <select
            value={form.studentId}
            onChange={(e) => handleStudentChange(e.target.value)}
            required
          >
            <option value="">Select student</option>
            {students.map((s) => (
              <option key={s._id} value={s._id}>
                {s.user.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid-2">
          <div className="form-group">
            <label>Year</label>
            <input
              type="number"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
              required
            />
          </div>
          <div className="form-group">
            <label>Instrument</label>
            <input
              value={form.instrument}
              readOnly
              required
            />
          </div>
        </div>
        <div className="grid-2">
          <div className="form-group">
            <label>Course Level</label>
            <input
              value={form.courseLevel}
              onChange={(e) => setForm({ ...form, courseLevel: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Yearly Fee</label>
            <input
              type="number"
              value={form.yearlyFee}
              onChange={(e) =>
                setForm({ ...form, yearlyFee: Number(e.target.value) })
              }
              required
            />
          </div>
        </div>
        <div className="form-group">
          <label>Amount Paid (manual entry)</label>
          <input
            type="number"
            value={form.amountPaid}
            onChange={(e) =>
              setForm({ ...form, amountPaid: Number(e.target.value) })
            }
          />
        </div>
        <button className="btn-primary">Save Fee</button>
      </form>

      <div className="card">
        <h2>Yearly Fees</h2>
        <div className="table-container">
          <table className="table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Year</th>
              <th>Instrument / Level</th>
              <th>Yearly Fee</th>
              <th>Paid</th>
              <th>Balance</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {fees.map((f) => {
              const balance = f.yearlyFee - f.amountPaid;
              return (
                <tr key={f._id}>
                  <td>{f.student?.user?.name}</td>
                  <td>{f.year}</td>
                  <td>
                    {f.instrument} / {f.courseLevel}
                  </td>
                  <td>₹{f.yearlyFee.toFixed(2)}</td>
                  <td>
                    {editingId === f._id ? (
                      <input
                        type="number"
                        value={editingAmount}
                        onChange={(e) => setEditingAmount(e.target.value)}
                        style={{ width: '80px' }}
                      />
                    ) : (
                      `₹${f.amountPaid.toFixed(2)}`
                    )}
                  </td>
                  <td>₹{balance.toFixed(2)}</td>
                  <td>{getStatusBadge(f)}</td>
                  <td>
                    {editingId === f._id ? (
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleSaveEdit(f._id)}
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
                        onClick={() => handleEdit(f)}
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>

      <div className="card" style={{ marginTop: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <h2 style={{ margin: 0 }}>Fee Payment Status</h2>
          <div className="form-group" style={{ margin: 0, minWidth: "140px" }}>
            <label>Year</label>
            <input
              type="number"
              value={summaryYear}
              onChange={(e) => setSummaryYear(Number(e.target.value))}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", marginTop: "12px", marginBottom: "12px" }}>
          <button
            type="button"
            className={activeStatusTab === "paid" ? "btn-primary" : "btn-secondary"}
            onClick={() => setActiveStatusTab("paid")}
          >
            Paid ({paymentSummary.paidCount || 0})
          </button>
          <button
            type="button"
            className={activeStatusTab === "unpaid" ? "btn-primary" : "btn-secondary"}
            onClick={() => setActiveStatusTab("unpaid")}
          >
            Not Paid ({paymentSummary.unpaidCount || 0})
          </button>
        </div>

        {activeStatusTab === "paid" ? (
          <div>
            <h3 style={{ color: "#166534" }}>Paid Students</h3>
            {paidStudents.length ? (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ cursor: "pointer" }} onClick={() => handleSort("paid", "name")}>Student{sortArrow("paid", "name")}</th>
                      <th style={{ cursor: "pointer" }} onClick={() => handleSort("paid", "instrument")}>Instrument{sortArrow("paid", "instrument")}</th>
                      <th style={{ cursor: "pointer" }} onClick={() => handleSort("paid", "courseLevel")}>Course Level{sortArrow("paid", "courseLevel")}</th>
                      <th style={{ cursor: "pointer" }} onClick={() => handleSort("paid", "amountPaid")}>Amount Paid{sortArrow("paid", "amountPaid")}</th>
                      <th style={{ cursor: "pointer" }} onClick={() => handleSort("paid", "status")}>Status{sortArrow("paid", "status")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paidStudents.map((student) => (
                      <tr key={`paid-${student.studentId}`}>
                        <td>{student.name}</td>
                        <td>{student.instrument || "N/A"}</td>
                        <td>{student.courseLevel || "N/A"}</td>
                        <td>₹{Number(student.amountPaid || 0).toFixed(2)}</td>
                        <td>{student.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="muted">No paid students for this year.</p>
            )}
          </div>
        ) : (
          <div>
            <h3 style={{ color: "#991b1b" }}>Not Paid Students</h3>
            {unpaidStudents.length ? (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ cursor: "pointer" }} onClick={() => handleSort("unpaid", "name")}>Student{sortArrow("unpaid", "name")}</th>
                      <th style={{ cursor: "pointer" }} onClick={() => handleSort("unpaid", "instrument")}>Instrument{sortArrow("unpaid", "instrument")}</th>
                      <th style={{ cursor: "pointer" }} onClick={() => handleSort("unpaid", "courseLevel")}>Course Level{sortArrow("unpaid", "courseLevel")}</th>
                      <th style={{ cursor: "pointer" }} onClick={() => handleSort("unpaid", "amountPaid")}>Amount Paid{sortArrow("unpaid", "amountPaid")}</th>
                      <th style={{ cursor: "pointer" }} onClick={() => handleSort("unpaid", "balance")}>Balance{sortArrow("unpaid", "balance")}</th>
                      <th style={{ cursor: "pointer" }} onClick={() => handleSort("unpaid", "status")}>Status{sortArrow("unpaid", "status")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unpaidStudents.map((student) => (
                      <tr key={`unpaid-${student.studentId}`}>
                        <td>{student.name}</td>
                        <td>{student.instrument || "N/A"}</td>
                        <td>{student.courseLevel || "N/A"}</td>
                        <td>₹{Number(student.amountPaid || 0).toFixed(2)}</td>
                        <td>
                          {student.status === "No Fee Record"
                            ? "N/A"
                            : `₹${Number(student.balance || 0).toFixed(2)}`}
                        </td>
                        <td>{student.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="muted">All students are fully paid for this year.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFees;


