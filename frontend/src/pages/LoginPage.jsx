import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext.jsx";

const LoginPage = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();
  const { login } = useAuth();

  // Clear field errors after 3 seconds
  useEffect(() => {
    if (Object.keys(fieldErrors).length > 0) {
      const timer = setTimeout(() => {
        setFieldErrors({});
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [fieldErrors]);

  const validateForm = () => {
    const errors = {};
    if (!identifier.trim()) {
      errors.identifier = "Email or Username is required";
    }
    if (!password.trim()) {
      errors.password = "Password is required";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      setError("");
      setFieldErrors({});

      if (!validateForm()) {
        return;
      }

      setLoading(true);
      try {
        const user = await login(identifier, password);
        if (user.role === "admin") navigate("/admin");
        else if (user.role === "teacher") navigate("/teacher");
        else if (user.role === "student") navigate("/student");
      } catch (err) {
        // Show authentication error as field error to prevent page refresh and provide specific feedback
        const errorMessage = err?.response?.data?.message || "Invalid email or password";
        if (errorMessage.includes("username") || errorMessage.includes("email")) {
          setFieldErrors({ identifier: errorMessage });
        } else if (errorMessage.includes("password")) {
          setFieldErrors({ password: errorMessage });
        } else {
          setFieldErrors({ password: errorMessage });
        }
      } finally {
        setLoading(false);
      }
    } catch (error) {
      // Fallback to prevent page refresh even if something goes wrong
      console.error("Form submission error:", error);
      setFieldErrors({ password: "An error occurred. Please try again." });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card slide-in-up">
        <div className="auth-header">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-3xl">
              🎵
            </div>
          </div>
          <h1 className="text-center">Music School</h1>
          <p className="text-center text-gray-400">Login to your dashboard</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form" noValidate action="">
          <div className="form-group">
            <label>Email or Username</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="username"
              className="form-floating"
            />
            {fieldErrors.identifier && (
              <div className="field-error">
                <span className="text-sm text-red-400">{fieldErrors.identifier}</span>
              </div>
            )}
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              className="form-floating"
            />
            {fieldErrors.password && (
              <div className="field-error">
                <span className="text-sm text-red-400">{fieldErrors.password}</span>
              </div>
            )}
          </div>
          {error && (
            <div className="error-banner status-error">
              <span className="text-sm">⚠️ {error}</span>
            </div>
          )}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <>
                <div className="loading-spinner"></div>
                Logging in...
              </>
            ) : (
              <>
                Login
                <span className="ml-2">→</span>
              </>
            )}
          </button>
          <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
            <p className="hint text-center text-sm text-gray-400">
              <span className="font-semibold text-blue-400">💡 Tip:</span> Contact your organisation if you dont have credntials.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;


