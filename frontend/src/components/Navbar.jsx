import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { toast } from "react-toastify";
import "./Navbar.css";

const Navbar = () => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [notifications, setNotifications] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    };
    handleStorageChange();
    window.addEventListener("storage", handleStorageChange);

    const handleOutsideClick = (e) => {
      if (!e.target.closest(".user-avatar-container") && !e.target.closest(".notification-wrapper")) {
        setAvatarDropdownOpen(false);
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    const loadNotifications = async () => {
      if (!user) {
        setNotifications([]);
        return;
      }

      try {
        const token =
          user.token ||
          user.accessToken ||
          user.jwtToken ||
          localStorage.getItem("token") ||
          "";

        const res = await fetch(
          "http://localhost:8080/api/notifications/unread",
          {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          },
        );

        if (res.status === 401 || res.status === 403) {
          localStorage.clear();
          window.location.href = "/login";
          return;
        }

        if (!res.ok) {
          return;
        }

        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
      } catch {
        setNotifications([]);
      }
    };

    loadNotifications();
  }, [user]);

  const getInitials = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const executeLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };

  const confirmLogout = () => {
    toast.info(
      <div>
        <p style={{ margin: "0 0 10px 0", fontWeight: "500" }}>
          Are you sure you want to log out?
        </p>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => {
              executeLogout();
              toast.dismiss();
            }}
            style={{
              background: "#dc3545",
              color: "white",
              padding: "6px 12px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            Yes, Log out
          </button>
          <button
            onClick={() => toast.dismiss()}
            style={{
              background: "#e2e8f0",
              color: "#333",
              padding: "6px 12px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            Cancel
          </button>
        </div>
      </div>,
      { autoClose: false, closeOnClick: false, draggable: false, icon: false },
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
          {!user && (
            <div className="navbar-links">
              <NavLink to="/" className="nav-link" end>
                Home
              </NavLink>
              <NavLink to="/find-tutors" className="nav-link">
                Find Tutor
              </NavLink>
            </div>
          )}
        </div>
        <div className="navbar-actions">
          {!user && (
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
