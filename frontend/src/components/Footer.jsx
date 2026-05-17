import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <img src="/src/public/removebg-logo.png" alt="TutorFinder Logo" className="footer-logo" />
          <p>Your journey to excellence starts here.</p>
        </div>
        <div className="footer-links">
          <div className="link-group">
            <h3>Company</h3>
            <a href="#">About Us</a>
            <a href="#">Careers</a>
            <a href="#">Contact</a>
          </div>
          <div className="link-group">
            <h3>Resources</h3>
            <a href="#">Blog</a>
            <a href="#">Help Center</a>
            <a href="#">Guidelines</a>
          </div>
          <div className="link-group">
            <h3>Legal</h3>
            <a href="#">Terms of Service</a>
            <a href="#">Privacy Policy</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} TutorFinder. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
