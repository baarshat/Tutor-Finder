import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Navbar.css';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const executeLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const confirmLogout = () => {
    toast.info(
      <div>
        <p style={{ margin: '0 0 10px 0', fontWeight: '500' }}>Are you sure you want to log out?</p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => { executeLogout(); toast.dismiss(); }} 
            style={{ background: '#dc3545', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
          >
            Yes, Log out
          </button>
          <button 
            onClick={() => toast.dismiss()} 
            style={{ background: '#e2e8f0', color: '#333', padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
          >
            Cancel
          </button>
        </div>
      </div>,
      { autoClose: false, closeOnClick: false, draggable: false, icon: false }
    );
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <Link to="/" className="navbar-logo">
            <img src="/src/public/removebg-logo.png" alt="TutorFinder Logo" />
            <span>TutorFinder</span>
          </Link>
          <div className="navbar-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/find-tutors" className="nav-link">Find Tutor</Link>
          </div>
        </div>
        <div className="navbar-actions">
          {user ? (
            <div className="user-profile">
              <div className="user-avatar" title={user.name}>
                {getInitials(user.name)}
              </div>
            </div>
          ) : (
            <>
              <Link to="/login">
                <button className="secondary-btn">Log In</button>
              </Link>
              <Link to="/register">
                <button className="primary-btn">Sign Up</button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
