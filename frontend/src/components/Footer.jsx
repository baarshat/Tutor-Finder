import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Github, Instagram } from "lucide-react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <img
            src="/src/public/removebg-logo.png"
            alt="TutorFinder Logo"
            className="footer-logo"
          />
          <p>Your journey to excellence starts here.</p>
          <div className="footer-socials">
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
            >
              <Facebook size={18} />
            </a>
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
            >
              <Instagram size={18} />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
            >
              <Github size={18} />
            </a>
          </div>
        </div>
        <div className="footer-links">
          <Link to="/about-us">About us</Link>
          <Link to="/contact-us">Contact us</Link>
          <Link to="/terms-and-conditions">Terms and Conditions</Link>
          <Link to="/privacy-policy">Privacy Policy</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} TutorFinder. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
