import React, { useState, useEffect } from "react";
import { api } from "../utils/api.js";

const ProfileSidebar = ({ isOpen, onClose }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen]);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/auth/me");
      setProfile(response.data);
    } catch (err) {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={`profile-sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
        <div className={`profile-sidebar ${isOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
          {profile && (
            <>
              <div className="profile-header">
                <div className="profile-avatar">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="profile-info">
                  <h3>{profile.name}</h3>
                  <p>{profile.role}</p>
                </div>
              </div>

              <div className="profile-section">
                <h4 className="profile-section-title">Profile Information</h4>
                <div className="profile-menu">
                  <div className="profile-menu-item">
                    <span className="profile-menu-icon">📧</span>
                    <span className="profile-menu-text">{profile.email}</span>
                  </div>
                  <div className="profile-menu-item">
                    <span className="profile-menu-icon">👤</span>
                    <span className="profile-menu-text">{profile.username}</span>
                  </div>
                  <div className="profile-menu-item">
                    <span className="profile-menu-icon">📞</span>
                    <span className="profile-menu-text">{profile.contactNumber || "Not provided"}</span>
                  </div>
                </div>
              </div>



              <div className="profile-actions">
                <button className="btn-profile danger" onClick={onClose}>
                  <span>Close</span>
                </button>
              </div>
            </>
          )}

          {loading && (
            <div className="profile-section">
              <p>Loading profile...</p>
            </div>
          )}

          {error && (
            <div className="profile-section">
              <p className="error">{error}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfileSidebar;
