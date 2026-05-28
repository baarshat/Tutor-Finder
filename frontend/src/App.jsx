import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Outlet,
  useNavigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LandingPage from "./pages/LandingPage";
import FindTutorPage from "./pages/FindTutorPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

// Superadmin Imports
import SuperadminLayout from "./components/superadmin/Layout";
import Sidebar from "./components/superadmin/Sidebar";
import SuperadminProtectedRoute from "./components/superadmin/ProtectedRoute";
import SuperadminDashboard from "./pages/superadmin/Dashboard";
import SuperadminTutors from "./pages/superadmin/Tutors";
import SuperadminStudents from "./pages/superadmin/Students";
import SuperadminAnalytics from "./pages/superadmin/Analytics";
import SuperadminHistory from "./pages/superadmin/History";

// Tutor Verification Imports
import TutorVerificationPage from "./pages/TutorVerificationPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import PaymentFailurePage from "./pages/PaymentFailurePage";

// CSS for superadmin layout
import "./components/superadmin/Layout.css";

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const hideNavbarFooter = ["/login", "/register"].includes(location.pathname);
  const API_BASE = "http://localhost:8080";

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const [tutorStatus, setTutorStatus] = useState("UNKNOWN");
  const [tutorStatusLoaded, setTutorStatusLoaded] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadTutorStatus = async () => {
      if (!user || user.role !== "TUTOR") {
        if (isActive) {
          setTutorStatus("UNKNOWN");
          setTutorStatusLoaded(false);
        }
        return;
      }

      const userId = user.userId || user.id;
      if (!userId) {
        if (isActive) {
          setTutorStatus("UNKNOWN");
          setTutorStatusLoaded(true);
        }
        return;
      }

      const token =
        user.token ||
        user.accessToken ||
        user.jwtToken ||
        localStorage.getItem("token") ||
        "";

      try {
        const res = await fetch(`${API_BASE}/api/tutors/user/${userId}`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) {
          if (isActive) {
            setTutorStatus("UNKNOWN");
            setTutorStatusLoaded(true);
          }
          return;
        }

        const tutorProfile = await res.json();
        const status = String(tutorProfile?.status || "UNKNOWN").toUpperCase();

        if (status === "VERIFIED" && user && !user.verified) {
          const updatedUser = { ...user, verified: true };
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }

        if (isActive) {
          setTutorStatus(status);
          setTutorStatusLoaded(true);
        }
      } catch {
        if (isActive) {
          setTutorStatus("UNKNOWN");
          setTutorStatusLoaded(true);
        }
      }
    };

    loadTutorStatus();

    return () => {
      isActive = false;
    };
  }, [user]);

  useEffect(() => {
    if (user && user.role === "TUTOR") {
      const allowedPaths = [
        "/tutor/verify",
        "/tutor/payment-success",
        "/tutor/payment-failure",
      ];
      const isVerified =
        user.verified || (tutorStatusLoaded && tutorStatus === "VERIFIED");
      if (
        !isVerified &&
        tutorStatusLoaded &&
        !allowedPaths.includes(location.pathname)
      ) {
        navigate("/tutor/verify");
      }
    }
  }, [user, tutorStatus, tutorStatusLoaded, location, navigate]);

  const isPublicPage = ["/", "/find-tutors"].includes(location.pathname);

  useEffect(() => {
  const link = document.createElement('link');
  link.href = 'https://assets.calendly.com/assets/external/widget.css';
  link.rel = 'stylesheet';
  document.head.appendChild(link);

  const script = document.createElement('script');
  script.src = 'https://assets.calendly.com/assets/external/widget.js';
  script.async = true;
  document.body.appendChild(script);
}, []);

  return (
    <div className="app-container">
      {!hideNavbarFooter && <Navbar />}
      <main className="main-content">
        {user && !hideNavbarFooter ? (
          <div className="sa-layout">
            <Sidebar />
            <div className="sa-layout__main">
              <div className="sa-layout__content">
                <div
                  className={`sa-layout__page ${isPublicPage ? "sa-layout__page--public" : ""}`}
                >
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/find-tutors" element={<FindTutorPage />} />

                    {/* Superadmin Routes */}
                    <Route
                      path="/superadmin"
                      element={
                        <SuperadminProtectedRoute>
                          <Outlet />
                        </SuperadminProtectedRoute>
                      }
                    >
                      <Route index element={<SuperadminDashboard />} />
                      <Route
                        path="dashboard"
                        element={<SuperadminDashboard />}
                      />
                      <Route path="tutors" element={<SuperadminTutors />} />
                      <Route path="students" element={<SuperadminStudents />} />
                      <Route
                        path="analytics"
                        element={<SuperadminAnalytics />}
                      />
                      <Route path="history" element={<SuperadminHistory />} />
                    </Route>

                    {/* Tutor Verification Routes */}
                    <Route
                      path="/tutor/verify"
                      element={<TutorVerificationPage />}
                    />
                    <Route
                      path="/tutor/payment-success"
                      element={<PaymentSuccessPage />}
                    />
                    <Route
                      path="/tutor/payment-failure"
                      element={<PaymentFailurePage />}
                    />
                  </Routes>
                </div>
              </div>
            </div>
          </div>
        ) : (
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
        )}
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
