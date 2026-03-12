import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../utils/api.js";

const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [teachers, students, schedules] = await Promise.all([
          api.get("/admin/teachers"),
          api.get("/admin/students"),
          api.get("/admin/schedules")
        ]);
        const enrollmentRequests = await api.get("/admin/enrollment-requests");
        setStats({
          teachers: teachers.data.length,
          students: students.data.length,
          lessons: schedules.data.length,
          enrollmentRequests: enrollmentRequests.data.length
        });
      } catch {
        setStats({ teachers: 0, students: 0, lessons: 0, enrollmentRequests: 0 });
      }
    };
    load();
  }, []);

  const handleCardClick = async (cardType) => {
    if (selectedCard === cardType) {
      setSelectedCard(null);
      setDetails(null);
      return;
    }

    setSelectedCard(cardType);
    setLoading(true);

    try {
      let data;
      switch (cardType) {
        case 'teachers':
          data = await api.get("/admin/teachers");
          setDetails({ type: 'teachers', data: data.data });
          break;
        case 'students':
          data = await api.get("/admin/students");
          setDetails({ type: 'students', data: data.data });
          break;
        case 'lessons':
          data = await api.get("/admin/schedules");
          setDetails({ type: 'lessons', data: data.data });
          break;
        case 'enrollments':
          data = await api.get("/admin/enrollment-requests");
          setDetails({ type: 'enrollments', data: data.data });
          break;
        default:
          break;
      }
    } catch (error) {
      console.error("Error fetching details:", error);
      setDetails({ type: cardType, data: [], error: "Failed to load details" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid-responsive">
      <Link to="/admin/users" className="card-link">
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl">
              👨‍🎓
            </div>
            <div>
              <h3 className="text-lg font-semibold">Total Teachers</h3>
              <p className="text-sm text-gray-400">Active instructors</p>
            </div>
          </div>
          <p className="big-number">{stats?.teachers ?? "—"}</p>
          <div className="mt-4">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${Math.min((stats?.teachers || 0) / 20 * 100, 100)}%` }}></div>
            </div>
          </div>
        </div>
      </Link>
      <Link to="/admin/users" className="card-link">
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white text-xl">
              🎓
            </div>
            <div>
              <h3 className="text-lg font-semibold">Total Students</h3>
              <p className="text-sm text-gray-400">Enrolled learners</p>
            </div>
          </div>
          <p className="big-number">{stats?.students ?? "—"}</p>
          <div className="mt-4">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${Math.min((stats?.students || 0) / 50 * 100, 100)}%` }}></div>
            </div>
          </div>
        </div>
      </Link>
      <Link to="/admin/schedules" className="card-link">
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-xl">
              📅
            </div>
            <div>
              <h3 className="text-lg font-semibold">Scheduled Lessons</h3>
              <p className="text-sm text-gray-400">This month</p>
            </div>
          </div>
          <p className="big-number">{stats?.lessons ?? "—"}</p>
          <div className="mt-4">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${Math.min((stats?.lessons || 0) / 30 * 100, 100)}%` }}></div>
            </div>
          </div>
        </div>
      </Link>
      <Link to="/admin/enrollments" className="card-link">
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white text-xl">
              📝
            </div>
            <div>
              <h3 className="text-lg font-semibold">Enrollment Requests</h3>
              <p className="text-sm text-gray-400">Pending applications</p>
            </div>
          </div>
          <p className="big-number">{stats?.enrollmentRequests ?? "—"}</p>
          <div className="mt-4">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${Math.min((stats?.enrollmentRequests || 0) / 10 * 100, 100)}%` }}></div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default AdminOverview;


