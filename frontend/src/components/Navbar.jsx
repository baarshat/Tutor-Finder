import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { toast } from "react-toastify";
import "./Navbar.css";

const Navbar = () => {
  const [user, setUser] = useState(null);
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
          <div className="navbar-links">
            <Link to="/" className="nav-link">
              Home
            </Link>
            <Link to="/find-tutors" className="nav-link">
              Find Tutor
            </Link>
            {user && (
              <Link to="/bookings" className="nav-link">
                Bookings
              </Link>
            )}
            {user?.role === "TUTOR" && (
              <Link to="/tutor/availability" className="nav-link">
                Availability
              </Link>
            )}
          </div>
        </div>
        <div className="navbar-actions">
          {user ? (
            <div className="user-profile">
              <div className="notification-wrapper">
                <button
                  className="notification-button"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  type="button"
                >
                  <Bell size={20} />
                  {notifications.length > 0 && (
                    <span className="notification-badge">
                      {notifications.length}
                    </span>
                  )}
                </button>
                {dropdownOpen && (
                  <div className="notification-dropdown">
                    <div className="notification-header">
                      <span>Notifications</span>
                      {notifications.length > 0 && (
                        <button
                          type="button"
                          className="notification-clear"
                          onClick={async () => {
                            const token =
                              user.token ||
                              user.accessToken ||
                              user.jwtToken ||
                              localStorage.getItem("token") ||
                              "";
                            await fetch(
                              "http://localhost:8080/api/notifications/read-all",
                              {
                                method: "PUT",
                                headers: {
                                  "Content-Type": "application/json",
                                  ...(token
                                    ? { Authorization: `Bearer ${token}` }
                                    : {}),
                                },
                              },
                            );
                            setNotifications([]);
                          }}
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <p className="notification-empty">
                        No new notifications.
                      </p>
                    ) : (
                      notifications.map((note) => (
                        <div key={note.id} className="notification-item">
                          <p>{note.message}</p>
                          <button
                            type="button"
                            onClick={async () => {
                              const token =
                                user.token ||
                                user.accessToken ||
                                user.jwtToken ||
                                localStorage.getItem("token") ||
                                "";
                              await fetch(
                                `http://localhost:8080/api/notifications/${note.id}/read`,
                                {
                                  method: "PUT",
                                  headers: {
                                    "Content-Type": "application/json",
                                    ...(token
                                      ? { Authorization: `Bearer ${token}` }
                                      : {}),
                                  },
                                },
                              );
                              setNotifications((prev) =>
                                prev.filter((item) => item.id !== note.id),
                              );
                            }}
                          >
                            Mark read
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              <div className="user-avatar-container" title={user.name}>
                {user.profilePicUrl ? (
                  <img
                    src={user.profilePicUrl}
                    alt={user.name}
                    className="user-avatar-img"
                    onClick={() => setAvatarDropdownOpen((prev) => !prev)}
                  />
                ) : (
                  <div
                    className="user-avatar"
                    onClick={() => setAvatarDropdownOpen((prev) => !prev)}
                  >
                    {getInitials(user.name)}
                  </div>
                )}

                {avatarDropdownOpen && (
                  <div className="avatar-dropdown-menu">
                    <div className="dropdown-user-header">
                      <span className="dropdown-user-name">{user.name}</span>
                      <span className="dropdown-user-role">{user.role}</span>
                    </div>
                    <hr className="dropdown-divider" />
                    <Link
                      to="/settings"
                      className="dropdown-item"
                      onClick={() => setAvatarDropdownOpen(false)}
                    >
                      Personal Settings
                    </Link>
                    {user.role === "TUTOR" && (
                      <Link
                        to="/tutor/availability"
                        className="dropdown-item"
                        onClick={() => setAvatarDropdownOpen(false)}
                      >
                        Availability
                      </Link>
                    )}
                    <Link
                      to="/bookings"
                      className="dropdown-item"
                      onClick={() => setAvatarDropdownOpen(false)}
                    >
                      Bookings
                    </Link>
                    <hr className="dropdown-divider" />
                    <button
                      type="button"
                      className="dropdown-item logout-btn"
                      onClick={() => {
                        setAvatarDropdownOpen(false);
                        confirmLogout();
                      }}
                    >
                      Log Out
                    </button>
                  </div>
                )}
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
