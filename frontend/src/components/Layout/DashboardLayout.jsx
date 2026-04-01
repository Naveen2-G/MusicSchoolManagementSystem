import React, { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../state/AuthContext.jsx";
import ProfileSidebar from "../ProfileSidebar.jsx";
import ChangePassword from "../ChangePassword.jsx";
import SchoolChatbot from "../SchoolChatbot.jsx";

export const DashboardLayout = ({ role, children }) => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const navRef = useRef(null);
  const profileRef = useRef(null);

  const navItemsByRole = {
    admin: [
      { to: "/admin", label: "Overview", icon: "📊" },
      { to: "/admin/users", label: "Users", icon: "👥" },
      { to: "/admin/schedules", label: "Schedules", icon: "📅" },
      { to: "/admin/fees", label: "Fees", icon: "💰" },
      { to: "/admin/salaries", label: "Salaries", icon: "💵" },
      { to: "/admin/recitals", label: "Recitals", icon: "🎭" },
      { to: "/admin/faqs", label: "FAQs", icon: "❓" }
    ],
    teacher: [
      { to: "/teacher", label: "Overview", icon: "📊" },
      { to: "/teacher/students", label: "Students", icon: "👨‍🎓" },
      { to: "/teacher/schedules", label: "Schedules", icon: "📅" },
      { to: "/teacher/attendance", label: "Attendance", icon: "✅" },
      { to: "/teacher/practice-logs", label: "Practice Logs", icon: "🎼" },
      { to: "/teacher/salaries", label: "Salary", icon: "💵" },
      { to: "/teacher/recitals", label: "Recitals", icon: "🎭" },
      { to: "/teacher/faqs", label: "FAQs", icon: "❓" }
    ],
    student: [
      { to: "/student", label: "Overview", icon: "📊" },
      { to: "/student/schedules", label: "Schedule", icon: "📅" },
      { to: "/student/practice-logs", label: "Practice Logs", icon: "🎼" },
      { to: "/student/fees", label: "Fees", icon: "💰" },
      { to: "/student/recitals", label: "Recitals", icon: "🎭" },
      { to: "/student/faqs", label: "FAQs", icon: "❓" }
    ]
  };

  const items = navItemsByRole[role] || [];

  // Close mobile menu and profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target) && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target) && isProfileDropdownOpen) {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isMobileMenuOpen || isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMobileMenuOpen, isProfileDropdownOpen]);

  return (
    <div className="dash-shell">
      {/* Modern Horizontal Navigation Header */}
      <header className="dash-nav-header" ref={navRef}>
        <div className="nav-brand">
          <div className="brand-logo">
            <span className="brand-icon">🎵</span>
            <span className="brand-text">Music School</span>
          </div>
        </div>

        {/* Mobile Menu Toggle - Always visible on mobile */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>

        <nav className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          {items.map((item, index) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="nav-actions">
          <div
            className="user-profile"
            ref={profileRef}
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
          >
            <div className="user-avatar">
              <div className="avatar-circle">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
            </div>
            <div className="user-details">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role?.toUpperCase()}</div>
            </div>
            <div className={`dropdown-arrow ${isProfileDropdownOpen ? 'open' : ''}`}>
              ▼
            </div>
          </div>

          {/* Profile Dropdown Menu */}
          {isProfileDropdownOpen && (
            <div className="profile-dropdown">
              <div className="dropdown-item" onMouseDown={() => {
                setIsProfileDropdownOpen(false);
                setIsProfileSidebarOpen(true);
              }}>
                <span className="dropdown-icon">👤</span>
                <span>View Profile</span>
              </div>
              <div className="dropdown-item" onMouseDown={() => {
                setIsProfileDropdownOpen(false);
                setIsChangePasswordOpen(true);
              }}>
                <span className="dropdown-icon">🔒</span>
                <span>Change Password</span>
              </div>
              <div className="dropdown-item logout-item" onMouseDown={() => {
                setIsProfileDropdownOpen(false);
                logout();
              }}>
                <span className="dropdown-icon">🚪</span>
                <span>Logout</span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="dash-main">
        <div className="main-content">
          {children}
        </div>
      </main>

      {/* Profile Sidebar */}
      <ProfileSidebar
        isOpen={isProfileSidebarOpen}
        onClose={() => setIsProfileSidebarOpen(false)}
      />

      {/* Change Password Modal */}
      <ChangePassword
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />

      <SchoolChatbot role={role} />
    </div>
  );
};


