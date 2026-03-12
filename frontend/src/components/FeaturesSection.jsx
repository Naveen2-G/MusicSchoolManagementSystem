import React, { useState } from 'react';
import { api } from '../utils/api';
import './FeaturesSection.css';

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

const FeaturesSection = () => {
  const [showEnrollment, setShowEnrollment] = useState(false);
  const [countryCode, setCountryCode] = useState("+91");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleEnrollNow = () => {
    setShowEnrollment(true);
  };

  const features = [
    {
      icon: '🎵',
      title: 'Comprehensive Curriculum',
      description: 'From beginner to advanced levels, our structured curriculum covers all major instruments and music theory.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: '👨‍🏫',
      title: 'Expert Instructors',
      description: 'Learn from professional musicians and educators with years of experience in music education.',
      color: 'from-blue-500 to-teal-500'
    },
    {
      icon: '📅',
      title: 'Flexible Scheduling',
      description: 'Book lessons at your convenience with our advanced scheduling system and real-time availability.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: '🎭',
      title: 'Performance Opportunities',
      description: 'Showcase your talent through regular recitals, concerts, and performance events throughout the year.',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: '📊',
      title: 'Progress Tracking',
      description: 'Monitor your musical journey with detailed progress reports and personalized feedback from instructors.',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: '🎼',
      title: 'Practice Logs',
      description: 'Keep detailed records of your practice sessions and receive guidance to improve your skills effectively.',
      color: 'from-cyan-500 to-blue-500'
    }
  ];

  return (
    <section className="features-section">
      <div className="features-container">
        <div className="features-header">
          <h2 className="features-title">Why Choose Our Music School?</h2>
          <p className="features-subtitle">
            Discover the perfect environment for your musical journey with our comprehensive music education platform
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="feature-icon-wrapper">
                <div className={`feature-icon bg-gradient-to-br ${feature.color}`}>
                  {feature.icon}
                </div>
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
              <div className="feature-hover-effect"></div>
            </div>
          ))}
        </div>

        <div className="features-cta">
          <div className="cta-content">
            <h3>Ready to Start Your Musical Journey?</h3>
            <p>Join hundreds of students who have discovered their passion for music with us.</p>
            <div className="cta-buttons">
              <button className="btn-primary btn-lg" onClick={handleEnrollNow}>
                <span className="btn-icon">🎵</span>
                Enroll Now
              </button>
              <button className="btn-ghost btn-lg">
                <span className="btn-icon">📞</span>
                Contact Us
              </button>
            </div>
          </div>
          <div className="cta-visual">
            <div className="music-wave">
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Enrollment Sidebar */}
      {showEnrollment && (
        <div className="enrollment-sidebar-overlay" onClick={() => setShowEnrollment(false)}>
          <div className="enrollment-sidebar" onClick={(e) => e.stopPropagation()}>
            <div className="sidebar-header">
              <h3>Enroll Now</h3>
              <button className="close-btn" onClick={() => setShowEnrollment(false)}>
                ×
              </button>
            </div>

            <form
              className="enrollment-form"
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const phoneNumber = formData.get('phone');

                // Validate phone number length
                const selectedCountry = countryCodes.find(c => c.code === countryCode);
                if (selectedCountry && phoneNumber.length !== selectedCountry.length) {
                  setFieldErrors({ phone: `Please enter a valid phone number for ${selectedCountry.country}. Required: ${selectedCountry.length} digits.` });
                  return;
                }
                setFieldErrors({});

                const enrollmentData = {
                  name: formData.get('name'),
                  email: formData.get('email'),
                  phone: phoneNumber,
                  instrument: formData.get('instrument') || 'Not specified',
                  preferredTime: formData.get('preferredTime'),
                  message: formData.get('message') || '',
                  source: 'Features Section'
                };

                try {
                  await api.post('/admin/enrollments', enrollmentData);
                  alert('Enrollment submitted successfully! Your request has been sent to the admin dashboard.');
                  setShowEnrollment(false);
                } catch (error) {
                  alert('Failed to submit enrollment. Please try again.');
                  console.error('Enrollment submission error:', error);
                }
              }}
            >
              <div className="form-group">
                <label htmlFor="features-name">
                  <span className="field-icon">👤</span>
                  Full Name
                </label>
                <input
                  type="text"
                  id="features-name"
                  name="name"
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="features-email">
                  <span className="field-icon">📧</span>
                  Email Address
                </label>
                <input
                  type="email"
                  id="features-email"
                  name="email"
                  required
                  placeholder="Enter your email address"
                />
              </div>

              <div className="form-group">
                <label htmlFor="features-phone">
                  <span className="field-icon">📞</span>
                  Phone Number
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
                    id="features-phone"
                    name="phone"
                    required
                    placeholder="Enter phone number"
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      const selectedCountry = countryCodes.find(c => c.code === countryCode);
                      if (selectedCountry && value.length <= selectedCountry.length) {
                        e.target.value = value;
                      } else {
                        e.target.value = value.slice(0, selectedCountry?.length || 10);
                      }
                    }}
                    maxLength={countryCodes.find(c => c.code === countryCode)?.length || 10}
                  />
                </div>
                <small className="form-hint">
                  {countryCode === "+91" ? "For India: 10 digits required" : `For ${countryCodes.find(c => c.code === countryCode)?.country}: ${countryCodes.find(c => c.code === countryCode)?.length} digits required`}
                </small>
                {fieldErrors.phone && (
                  <div className="field-error">
                    <span className="text-sm text-red-400">{fieldErrors.phone}</span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="features-instrument">
                  <span className="field-icon">🎵</span>
                  Preferred Instrument (Optional)
                </label>
                <select
                  id="features-instrument"
                  name="instrument"
                  defaultValue=""
                >
                  <option value="">Select an instrument...</option>
                  <option value="Piano">Piano</option>
                  <option value="Guitar">Guitar</option>
                  <option value="Violin">Violin</option>
                  <option value="Trumpet">Trumpet</option>
                  <option value="Drums">Drums</option>
                  <option value="Voice">Voice</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="features-preferred-time">
                  <span className="field-icon">🕐</span>
                  Preferred Time to Call
                </label>
                <select
                  id="features-preferred-time"
                  name="preferredTime"
                  required
                >
                  <option value="">Select preferred time...</option>
                  <option value="morning">Morning (9 AM - 12 PM)</option>
                  <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                  <option value="evening">Evening (5 PM - 8 PM)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="features-message">
                  <span className="field-icon">💬</span>
                  Additional Message (Optional)
                </label>
                <textarea
                  id="features-message"
                  name="message"
                  placeholder="Tell us about your musical background or any questions..."
                  rows="4"
                />
              </div>

              <button type="submit" className="btn-primary">
                Submit Enrollment
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default FeaturesSection;