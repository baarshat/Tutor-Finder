import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:8080';

export default function SuperadminProtectedRoute({ children }) {
  const [authState, setAuthState] = useState('checking'); // 'checking' | 'authorized' | 'unauthorized'
  const [countdown, setCountdown] = useState(3);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      if (user && (user.role === 'SUPERADMIN')) {
        setAuthState('authorized');
      } else {
        setAuthState('unauthorized');
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (authState !== 'unauthorized') return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [authState, navigate]);

  if (authState === 'checking') {
    return (
      <div className="sa-protect__loading">
        <div className="sa-protect__spinner" />
        <p>Verifying access...</p>
      </div>
    );
  }

  if (authState === 'unauthorized') {
    return (
      <div className="sa-protect__denied">
        <div className="sa-protect__denied-glow" />
        <div className="sa-protect__denied-content">
          <div className="sa-protect__icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1>Access Denied</h1>
          <p className="sa-protect__denied-msg">You do not have authority to access this page.</p>
          <p className="sa-protect__denied-sub">This area is restricted to authorized superadmins only.</p>
          <div className="sa-protect__countdown">
            Redirecting to home in <strong>{countdown}</strong> seconds...
          </div>
        </div>
      </div>
    );
  }

  return children;
}
