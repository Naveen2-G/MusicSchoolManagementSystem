import React, { useState } from 'react';
import { api } from '../utils/api';
import './TestimonialsSection.css';

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

const TestimonialsSection = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [countryCode, setCountryCode] = useState("+91");
  const [fieldErrors, setFieldErrors] = useState({});
  const testimonials = [
    {
      name: 'Sarah Johnson',
      instrument: 'Piano',
      level: 'Advanced',
      image: '👩‍🎨',
      quote: 'The instructors here are incredible! I went from knowing nothing about piano to performing in recitals. The personalized attention and structured curriculum made all the difference.',
      rating: 5,
      achievement: 'Performed in 3 school recitals'
    },
    {
      name: 'Michael Chen',
      instrument: 'Guitar',
      level: 'Intermediate',
      image: '👨‍🎤',
      quote: 'This school transformed my understanding of music. The practice logs and feedback system helped me improve consistently. Now I can play my favorite songs with confidence!',
      rating: 5,
      achievement: 'Learned 50+ songs in 2 years'
    },
    {
      name: 'Emily Rodriguez',
      instrument: 'Violin',
      level: 'Beginner to Intermediate',
      image: '👩‍🎻',
      quote: 'Starting violin as an adult was intimidating, but the supportive environment and patient teachers made it enjoyable. I\'ve grown so much in just one year.',
      rating: 5,
      achievement: 'Joined school orchestra'
    },
    {
      name: 'David Kim',
      instrument: 'Drums',
      level: 'Advanced',
      image: '👨‍🎸',
      quote: 'The drum program here is outstanding. Professional techniques, regular performances, and a community of fellow musicians. Best decision I ever made!',
      rating: 5,
      achievement: 'Won local talent competition'
    }
  ];

  const stats = [
    { number: '98%', label: 'Student Satisfaction' },
    { number: '500+', label: 'Students Taught' },
    { number: '50+', label: 'Expert Instructors' },
    { number: '1000+', label: 'Lessons Completed' }
  ];

  return (
    <section className="testimonials-section">
      <div className="testimonials-container">
        <div className="testimonials-header">
          <h2 className="testimonials-title">What Our Students Say</h2>
          <p className="testimonials-subtitle">
            Hear from our students about their musical journey and achievements
          </p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card" style={{ animationDelay: `${index * 0.15}s` }}>
              <div className="testimonial-header">
                <div className="student-avatar">
                  <span className="avatar-emoji">{testimonial.image}</span>
                </div>
                <div className="student-info">
                  <h4 className="student-name">{testimonial.name}</h4>
                  <p className="student-details">
                    {testimonial.instrument} • {testimonial.level}
                  </p>
                </div>
                <div className="rating">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="star">⭐</span>
                  ))}
                </div>
              </div>

              <blockquote className="testimonial-quote">
                "{testimonial.quote}"
              </blockquote>

              <div className="testimonial-achievement">
                <span className="achievement-icon">🏆</span>
                <span className="achievement-text">{testimonial.achievement}</span>
              </div>

              <div className="testimonial-decoration">
                <div className="quote-mark">"</div>
              </div>
            </div>
          ))}
        </div>

        <div className="stats-section">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-visual">
                  <div className="stat-bar">
                    <div className="stat-fill" style={{
                      width: stat.number.includes('%') ? stat.number : '85%',
                      animationDelay: `${index * 0.2}s`
                    }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="testimonials-cta">
          <div className="cta-card">
            <div className="cta-content">
              <h3>Ready to Join Our Music Family?</h3>
              <p>Start your musical journey today and be part of our growing community of musicians.</p>
              <div className="cta-features">
                <div className="cta-feature">
                  <span className="feature-check">✓</span>
                  <span>Free trial lesson</span>
                </div>
                <div className="cta-feature">
                  <span className="feature-check">✓</span>
                  <span>Flexible scheduling</span>
                </div>
                <div className="cta-feature">
                  <span className="feature-check">✓</span>
                  <span>Expert instructors</span>
                </div>
              </div>
            </div>
            <div className="cta-actions">
              <button
                className="btn-primary btn-lg"
                onClick={() => setShowSidebar(true)}
              >
                <span className="btn-icon">🎵</span>
                Book Free Trial
              </button>
              <button className="btn-ghost btn-lg">
                <span className="btn-icon">📞</span>
                Contact Us <br />
                <br />
                +91-1234567890
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enrollment Sidebar */}
      {showSidebar && (
        <div className="enrollment-sidebar-overlay" onClick={() => setShowSidebar(false)}>
          <div className="enrollment-sidebar" onClick={(e) => e.stopPropagation()}>
            <div className="sidebar-header">
              <h3>Book Free Trial</h3>
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
                  instrument: formData.get('instrument') || 'Not specified',
                  preferredTime: formData.get('preferredTime'),
                  message: formData.get('message') || '',
                  source: 'Testimonials Section'
                };

                try {
                  await api.post('/admin/enrollments', enrollmentData);
                  alert('Free trial booked successfully! Your request has been sent to the admin dashboard.');
                  setShowSidebar(false);
                } catch (error) {
                  alert('Failed to book free trial. Please try again.');
                  console.error('Free trial booking error:', error);
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
                    id="phone"
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
                <label htmlFor="instrument">Preferred Instrument</label>
                <select
                  id="instrument"
                  name="instrument"
                  required
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
                Book Free Trial
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default TestimonialsSection;