import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BarChart2,
  History,
  MessageSquare,
  LogOut,
  Home,
  Search,
} from "lucide-react";
import ConfirmationModal from "./ConfirmationModal";
import "./Sidebar.css";

const API_BASE = "http://localhost:8080";

function Sidebar() {
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = React.useState(false);

  const navLinkClass = ({ isActive }) =>
    `sa-nav-link ${isActive ? "sa-nav-link--active" : ""}`;

  const handleLogout = async () => {
    setIsLogoutModalOpen(false);
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout API call failed:", error);
    }
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/login"; // Fully reload app state on logout
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role;

  let navItems = [];
  if (role === "SUPERADMIN") {
    navItems = [
      {
        to: "/superadmin/dashboard",
        icon: LayoutDashboard,
        label: "Dashboard",
      },
      { to: "/superadmin/students", icon: Users, label: "Students" },
      {
        to: "/superadmin/tutors",
        icon: GraduationCap,
        label: "Tutors & Verification",
      },
      { to: "/superadmin/analytics", icon: BarChart2, label: "Analytics" },
      { to: "/superadmin/history", icon: History, label: "History Logs" },
    ];
  } else {
    navItems = [
      { to: "/", icon: Home, label: "Home" },
      { to: "/find-tutors", icon: Search, label: "Find Tutor" },
    ];
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="sa-sidebar">
        <div className="sa-sidebar__top">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={navLinkClass} title={label}>
              <Icon size={24} strokeWidth={2} />
            </NavLink>
          ))}

          {/* Messages Placeholder Icon */}
          {role === "SUPERADMIN" && (
            <NavLink
              to="/superadmin/messages"
              className={navLinkClass}
              title="Messages & Support"
            >
              <MessageSquare size={24} strokeWidth={2} />
            </NavLink>
          )}
        </div>

        <button
          onClick={() => setIsLogoutModalOpen(true)}
          className="sa-logout-btn"
          title="Logout"
        >
          <LogOut size={24} strokeWidth={2} />
        </button>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="sa-mobile-nav">
        <div className="sa-mobile-nav__items">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sa-mobile-nav-link ${isActive ? "sa-mobile-nav-link--active" : ""}`
              }
            >
              <Icon size={20} />
              <span>{label.split(" ")[0]}</span>
            </NavLink>
          ))}
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="sa-mobile-nav-link sa-mobile-logout"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message="Are you sure you want to log out of your account?"
        confirmText="Logout"
        type="danger"
      />
    </>
  );
}

export default Sidebar;
