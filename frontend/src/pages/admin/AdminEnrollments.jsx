import React, { useEffect, useState } from "react";
import { api } from "../../utils/api.js";

const AdminEnrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEnrollments = async () => {
      try {
        const response = await api.get("/admin/enrollment-requests");
        setEnrollments(response.data);
      } catch (error) {
        console.error('Error loading enrollments:', error);
        setEnrollments([]);
      } finally {
        setLoading(false);
      }
    };
    loadEnrollments();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this enrollment request?')) {
      try {
        await api.delete(`/admin/enrollment-requests/${id}`);
        setEnrollments(enrollments.filter(enrollment => enrollment._id !== id));
      } catch (error) {
        console.error('Error deleting enrollment:', error);
        alert('Failed to delete enrollment request');
      }
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/admin/enrollment-requests/${id}/status`, { status });
      setEnrollments(enrollments.map(enrollment =>
        enrollment._id === id ? { ...enrollment, status } : enrollment
      ));
    } catch (error) {
      console.error('Error updating enrollment status:', error);
      alert('Failed to update enrollment status');
    }
  };

  if (loading) {
    return <div className="loading">Loading enrollment requests...</div>;
  }

  return (
    <div className="admin-enrollments">
      <div className="page-header">
        <h1>Enrollment Requests</h1>
        <p>Manage student enrollment applications</p>
      </div>

      <div className="table-container">
        {enrollments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No enrollment requests</h3>
            <p>New enrollment requests will appear here</p>
          </div>
        ) : (
          <table className="sticky-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Instrument</th>
                <th>Preferred Time</th>
                <th>Message</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((enrollment, index) => (
                <tr key={enrollment._id} style={{ backgroundColor:'gray' }}>
                  <td>{enrollment.name}</td>
                  <td>{enrollment.email}</td>
                  <td>{enrollment.phone}</td>
                  <td>{enrollment.instrument}</td>
                  <td>{enrollment.preferredTime}</td>
                  <td>{enrollment.message || 'N/A'}</td>
                  <td>{new Date(enrollment.createdAt).toLocaleString()}</td>
                  <td>
                    <span className={`status-badge status-${enrollment.status}`}>
                      {enrollment.status}
                    </span>
                  </td>
                  <td>
                    {enrollment.status === 'pending' && (
                      <>
                        <button
                          className="btn-success btn-sm"
                          onClick={() => handleStatusChange(enrollment._id, 'approved')}
                        >
                          Approve
                        </button>
                        <button
                          className="btn-warning btn-sm"
                          onClick={() => handleStatusChange(enrollment._id, 'declined')}
                        >
                          Decline
                        </button>
                      </>
                    )}
                    <button
                      className="btn-danger btn-sm"
                      onClick={() => handleDelete(enrollment._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminEnrollments;
