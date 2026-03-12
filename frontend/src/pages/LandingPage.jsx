import React from 'react';
import HeroSection from '../components/HeroSection.jsx';
import FeaturesSection from '../components/FeaturesSection.jsx';
import InstrumentsSection from '../components/InstrumentsSection.jsx';
import TestimonialsSection from '../components/TestimonialsSection.jsx';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <HeroSection />
      <FeaturesSection />
      <InstrumentsSection />
      <TestimonialsSection />

      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="footer-logo">
                <span className="logo-icon">🎵</span>
                <span className="logo-text">Music School</span>
              </div>
              <p className="footer-description">
                Nurturing musical talent and fostering creativity through comprehensive education and personalized instruction.
              </p>
            </div>

            <div className="footer-links">
              <div className="footer-section">
                <h4>Programs</h4>
                <ul>
                  <li><a href="#piano">Piano</a></li>
                  <li><a href="#guitar">Guitar</a></li>
                  <li><a href="#violin">Violin</a></li>
                  <li><a href="#voice">Voice</a></li>
                </ul>
              </div>

              <div className="footer-section">
                <h4>Resources</h4>
                <ul>
                  <li><a href="#schedule">Schedule</a></li>
                  <li><a href="#fees">Fees</a></li>
                  <li><a href="#faqs">FAQs</a></li>
                  <li><a href="#contact">Contact</a></li>
                </ul>
              </div>

              <div className="footer-section">
                <h4>Connect</h4>
                <div className="social-links">
                  <a href="#" className="social-link">📘 Facebook</a>
                  <a href="#" className="social-link">📷 Instagram</a>
                  <a href="#" className="social-link">🎵 YouTube</a>
                  <a href="#" className="social-link">🎼 TikTok</a>
                </div>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-bottom-content">
              <p>&copy; 2025 Music School Management System. All rights reserved.</p>
              <div className="footer-bottom-links">
                <a href="#privacy">Privacy Policy</a>
                <a href="#terms">Terms of Service</a>
                <a href="#accessibility">Accessibility</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;