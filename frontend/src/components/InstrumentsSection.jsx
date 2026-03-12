import React, { useState } from 'react';
import { api } from '../utils/api';
import './InstrumentsSection.css';

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

const InstrumentsSection = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const [countryCode, setCountryCode] = useState("+91");
  const [fieldErrors, setFieldErrors] = useState({});

  const instruments = [
    {
      name: 'Piano',
      icon: '🎹',
      description: 'Classical and contemporary piano instruction',
      level: 'All Levels',
      students: 45,
      color: 'from-purple-500 to-indigo-500',
      learnMoreUrl: 'https://en.wikipedia.org/wiki/Piano'
    },
    {
      name: 'Guitar',
      icon: '🎸',
      description: 'Acoustic and electric guitar techniques',
      level: 'Beginner to Advanced',
      students: 62,
      color: 'from-blue-500 to-cyan-500',
      learnMoreUrl: 'https://en.wikipedia.org/wiki/Guitar'
    },
    {
      name: 'Violin',
      icon: '🎻',
      description: 'String instrument mastery and technique',
      level: 'All Levels',
      students: 28,
      color: 'from-green-500 to-teal-500',
      learnMoreUrl: 'https://en.wikipedia.org/wiki/Violin'
    },
    {
      name: 'Trumpet',
      icon: '🎺',
      description: 'Brass instrument fundamentals and performance',
      level: 'Beginner to Intermediate',
      students: 19,
      color: 'from-orange-500 to-red-500',
      learnMoreUrl: 'https://en.wikipedia.org/wiki/Trumpet'
    },
    {
      name: 'Drums',
      icon: '🥁',
      description: 'Percussion and rhythm development',
      level: 'All Levels',
      students: 34,
      color: 'from-pink-500 to-rose-500',
      learnMoreUrl: 'https://en.wikipedia.org/wiki/Drum'
    },
    {
      name: 'Voice',
      icon: '🎤',
      description: 'Vocal training and performance techniques',
      level: 'All Levels',
      students: 51,
      color: 'from-yellow-500 to-orange-500',
      learnMoreUrl: 'https://en.wikipedia.org/wiki/Singing'
    }
  ];

  return (
    <section className="instruments-section">
      <div className="instruments-container">
        <div className="instruments-header">
          <h2 className="instruments-title">Our Instrument Programs</h2>
          <p className="instruments-subtitle">
            Choose from our comprehensive range of musical instruments and start your musical journey today
          </p>
        </div>

        <div className="instruments-grid">
          {instruments.map((instrument, index) => (
            <div key={index} className="instrument-card" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="instrument-header">
                <div className={`instrument-icon bg-gradient-to-br ${instrument.color}`}>
                  <span className="icon-main">{instrument.icon}</span>
                  <div className="icon-glow"></div>
                </div>
                <div className="instrument-stats">
                  <div className="stat-number">{instrument.students}</div>
                  <div className="stat-label">Students</div>
                </div>
              </div>

              <div className="instrument-content">
                <h3 className="instrument-name">{instrument.name}</h3>
                <p className="instrument-description">{instrument.description}</p>
                <div className="instrument-level">
                  <span className="level-badge">{instrument.level}</span>
                </div>
              </div>

              <div className="instrument-actions">
                <button
                  className="btn-primary btn-sm"
                  onClick={() => window.open(instrument.learnMoreUrl, '_blank')}
                >
                  Learn More
                </button>
                <button
                  className="btn-ghost btn-sm"
                  onClick={() => {
                    setSelectedInstrument(instrument);
                    setShowSidebar(true);
                  }}
                >
                  Enroll
                </button>
              </div>

              <div className="instrument-decoration">
                <div className="decoration-line"></div>
                <div className="decoration-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="instruments-showcase">
          <div className="showcase-content">
            <h3>Professional Instruction</h3>
            <p>Learn from experienced musicians and educators who are passionate about sharing their knowledge and helping you achieve your musical goals.</p>
            <div className="showcase-features">
              <div className="feature-item">
                <span className="feature-icon">🎯</span>
                <span>Personalized Learning Plans</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📈</span>
                <span>Regular Progress Assessments</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🏆</span>
                <span>Performance Opportunities</span>
              </div>
            </div>
          </div>
          <div className="showcase-visual">
            <div className="floating-elements">
              <div className="floating-note note-1">♪</div>
              <div className="floating-note note-2">♫</div>
              <div className="floating-note note-3">♪</div>
              <div className="floating-note note-4">♫</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enrollment Sidebar */}
      {showSidebar && (
        <div className="enrollment-sidebar-overlay" onClick={() => setShowSidebar(false)}>
          <div className="enrollment-sidebar" onClick={(e) => e.stopPropagation()}>
            <div className="sidebar-header">
              <h3>Enroll Now</h3>
              <button className="close-btn" onClick={() => setShowSidebar(false)}>
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
                  instrument: formData.get('instrument') || selectedInstrument?.name || 'Not specified',
                  preferredTime: formData.get('preferredTime'),
                  message: formData.get('message') || '',
                  source: 'Instruments Section'
                };

                try {
                  await api.post('/admin/enrollments', enrollmentData);
                  alert('Enrollment submitted successfully! Your request has been sent to the admin dashboard.');
                  setShowSidebar(false);
                } catch (error) {
                  alert('Failed to submit enrollment. Please try again.');
                  console.error('Enrollment submission error:', error);
                }
              }}
            >
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  placeholder="Enter your email address"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <div className="phone-input-group">
                  <select
                    value={countryCode}
                    onChange={(e) => {
                      setCountryCode(e.target.value);
                      setFieldErrors((prev) => ({ ...prev, phone: undefined }));
                    }}
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
                    id="phone"
                    name="phone"
                    required
                    placeholder="Enter phone number"
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      const selectedCountry = countryCodes.find(c => c.code === countryCode);
                      setFieldErrors((prev) => ({ ...prev, phone: undefined }));
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
                <label htmlFor="instrument">Selected Instrument</label>
                <input
                  type="text"
                  id="instrument"
                  name="instrument"
                  value={selectedInstrument?.name || ''}
                  readOnly
                  placeholder="No instrument selected"
                />
              </div>

              <div className="form-group">
                <label htmlFor="preferred-time">Preferred Time to Call</label>
                <select
                  id="preferred-time"
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
                <label htmlFor="message">Additional Message (Optional)</label>
                <textarea
                  id="message"
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

export default InstrumentsSection;