import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react'; // Using Compass as a placeholder logo icon if image isn't available
import './AuthLayout.css';

const AuthLayout = ({ children }) => {
  return (
    <div className="auth-layout">
      <div className="auth-left-panel">
        <div className="auth-brand">
          <Link to="/" className="auth-logo">
            {/* You can replace this with an img tag if you prefer */}
            <Compass size={32} color="var(--primary)" />
            <span>TutorFinder</span>
          </Link>
        </div>
        
        <div className="auth-feature-content">
          <div className="auth-image-container">
            {/* The user will add the image here */}
            <img src="/src/public/tutoring.png" alt="Tutoring session" className="auth-hero-image" onError={(e) => { e.target.style.display = 'none'; }} />
          </div>
          
          <div className="auth-feature-text">
            <div className="auth-feature-badge">
              <Compass size={24} color="var(--primary)" />
            </div>
            <p>
              Begin your learning journey today and experience the transformative power of personalized education.
            </p>
          </div>
        </div>
      </div>
      
      <div className="auth-right-panel">
        <div className="auth-form-container">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
