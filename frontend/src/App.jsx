import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import FindTutorPage from './pages/FindTutorPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Superadmin Imports
import SuperadminLayout from './components/superadmin/Layout';
import SuperadminProtectedRoute from './components/superadmin/ProtectedRoute';
import SuperadminDashboard from './pages/superadmin/Dashboard';
import SuperadminTutors from './pages/superadmin/Tutors';
import SuperadminStudents from './pages/superadmin/Students';
import SuperadminAnalytics from './pages/superadmin/Analytics';
import SuperadminHistory from './pages/superadmin/History';

// CSS for superadmin layout
import './components/superadmin/Layout.css';

const SUPERADMIN_PATHS = ['/superadmin'];

function AppContent() {
  const location = useLocation();
  const hideNavbarFooter = ['/login', '/register'].includes(location.pathname) ||
    location.pathname.startsWith('/superadmin');

  return (
    <div className="app-container">
      {!hideNavbarFooter && <Navbar />}
      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/find-tutors" element={<FindTutorPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Superadmin Routes */}
          <Route
            path="/superadmin"
            element={
              <SuperadminProtectedRoute>
                <SuperadminLayout />
              </SuperadminProtectedRoute>
            }
          >
            <Route index element={<SuperadminDashboard />} />
            <Route path="dashboard" element={<SuperadminDashboard />} />
            <Route path="tutors" element={<SuperadminTutors />} />
            <Route path="students" element={<SuperadminStudents />} />
            <Route path="analytics" element={<SuperadminAnalytics />} />
            <Route path="history" element={<SuperadminHistory />} />
          </Route>
        </Routes>
      </main>
      {!hideNavbarFooter && <Footer />}
      <ToastContainer position="top-right" />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
