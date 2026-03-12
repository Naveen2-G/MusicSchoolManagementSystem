import React, { useState, useEffect } from "react";
import { useAuth } from "../state/AuthContext";
import { api } from "../utils/api";
import { Navigate, useNavigate } from "react-router-dom";

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

const ProfileSetup = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [contactNumber, setContactNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Prefill if already exists
  useEffect(() => {
    if (user?.contactNumber) {
      setContactNumber(user.contactNumber);
    }
  }, [user]);

  // Redirect if profile already completed
  if (user?.contactNumber) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!contactNumber.trim()) {
      setError("Contact number is required");
      return;
    }

    const selectedCountry = countryCodes.find(c => c.code === countryCode);
    if (selectedCountry && contactNumber.length !== selectedCountry.length) {
      setError(`Contact number must be ${selectedCountry.length} digits for ${selectedCountry.country}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.put("/auth/profile", {
        contactNumber: contactNumber.trim(),
        countryCode: countryCode,
      });

      setUser(res.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="centered-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2 className="auth-title">Complete Your Profile</h2>
            <p className="auth-subtitle">
              Please provide your contact number to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="contactNumber" className="form-label">
                Contact Number *
              </label>
              <div className="phone-input-group">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
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
                  id="contactNumber"
                  value={contactNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    const selectedCountry = countryCodes.find(c => c.code === countryCode);
                    if (selectedCountry && value.length <= selectedCountry.length) {
                      setContactNumber(value);
                    }
                  }}
                  placeholder="Enter phone number"
                  maxLength={countryCodes.find(c => c.code === countryCode)?.length || 10}
                  required
                />
              </div>
              <small className="form-hint">
                {countryCode === "+91" ? "For India: 10 digits required" : `For ${countryCodes.find(c => c.code === countryCode)?.country}: ${countryCodes.find(c => c.code === countryCode)?.length} digits required`}
              </small>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "Updating..." : "Complete Profile"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
