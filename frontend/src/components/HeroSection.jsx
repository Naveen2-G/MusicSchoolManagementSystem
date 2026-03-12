import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HeroSection.css';

const HeroSection = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <section className="hero-section">
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title hero-title-gradient">
              Music School Management System
            </h1>
            <p className="hero-subtitle">
              Master Your Musical Journey with Expert Guidance. Join our premier music school where passion meets perfection. From beginner to virtuoso,
              our expert instructors will guide you through an enriching musical experience.
            </p>
            <div className="hero-buttons">
              <button className="btn-primary btn-lg" onClick={handleGetStarted}>
                <span className="btn-icon">🎵</span>
                Get Started
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="music-notes">
              <div className="note note-1">♪</div>
              <div className="note note-2">♫</div>
              <div className="note note-3">♪</div>
              <div className="note note-4">♫</div>
              <div className="note note-5">♪</div>
            </div>
            <div className="instrument-icons">
              <div className="instrument piano">🎹</div>
              <div className="instrument guitar">🎸</div>
              <div className="instrument violin">🎻</div>
              <div className="instrument trumpet">🎺</div>
              <div className="instrument drum">🥁</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
