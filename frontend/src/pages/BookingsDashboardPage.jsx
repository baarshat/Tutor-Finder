import React, { useCallback, useEffect, useState } from "react";
import { Calendar, CalendarPlus, Clock, Star } from "lucide-react";
import { toast } from "react-toastify";
import SubmitReviewModal from "../components/SubmitReviewModal";
import BookingsCalendar from "../components/BookingsCalendar";
import "./BookingsDashboardPage.css";

const API_BASE = "http://localhost:8080";

const getAuthToken = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return (
    user.token ||
    user.accessToken ||
    user.jwtToken ||
    localStorage.getItem("token") ||
    ""
  );
};

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const formatTimeRange = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return `${startDate.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  })} - ${endDate.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  })}`;
};

const StarDisplay = ({ rating }) => (
  <span className="star-display">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        size={14}
        fill={s <= rating ? "#f59e0b" : "none"}
        color={s <= rating ? "#f59e0b" : "#cbd5e1"}
        strokeWidth={1.5}
      />
    ))}
    <span className="star-display__label">{rating}/5</span>
  </span>
);

const BookingsDashboardPage = () => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewTarget, setReviewTarget] = useState(null); // booking to review

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role || "STUDENT";

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = getAuthToken();
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const [upcomingRes, pastRes] = await Promise.all([
        fetch(`${API_BASE}/api/bookings?type=upcoming`, { headers }),
        fetch(`${API_BASE}/api/bookings?type=past`, { headers })
      ]);

      if (upcomingRes.status === 401 || pastRes.status === 401 || upcomingRes.status === 403 || pastRes.status === 403) {
        localStorage.clear();
        window.location.href = "/login";
        return;
      }

      const upcomingData = upcomingRes.ok ? await upcomingRes.json() : [];
      const pastData = pastRes.ok ? await pastRes.json() : [];
      
      const combined = [
        ...(Array.isArray(upcomingData) ? upcomingData : []),
        ...(Array.isArray(pastData) ? pastData : [])
      ];
      setBookings(combined);
    } catch (err) {
      setError(err?.message || "Failed to load bookings.");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const executeCancel = async (bookingId) => {
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/api/bookings/${bookingId}/cancel`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.clear();
        window.location.href = "/login";
        return;
      }

      if (!res.ok) {
        const message = await res.json().catch(() => ({}));
        throw new Error(message?.message || "Failed to cancel booking.");
      }

      toast.success("Booking cancelled successfully!");
      await loadBookings();
    } catch (err) {
      toast.error(err?.message || "Failed to cancel booking.");
    }
  };

  const executeComplete = async (bookingId) => {
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/api/bookings/${bookingId}/complete`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.clear();
        window.location.href = "/login";
        return;
      }

      if (!res.ok) {
        const message = await res.json().catch(() => ({}));
        throw new Error(message?.message || "Failed to complete session.");
      }

      toast.success("Session marked as completed!");
      await loadBookings();
    } catch (err) {
      toast.error(err?.message || "Failed to complete session.");
    }
  };

  const handleCancel = (bookingId) => {
    toast.info(
      <div>
        <p style={{ margin: "0 0 10px 0", fontWeight: "500", color: "#333" }}>
          Are you sure you want to cancel this booking?
        </p>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={async () => {
              toast.dismiss();
              await executeCancel(bookingId);
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
            Yes, Cancel
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
            No, Keep
          </button>
        </div>
      </div>,
      { autoClose: false, closeOnClick: false, draggable: false, icon: false }
    );
  };

  // The legacy card view has been removed.
  // All bookings are now displayed in the calendar.

  return (
    <div className="bookings-page">
      <div className="bookings-header">
        <h2>Your bookings</h2>
        <div className="bookings-tabs">
          <button
            type="button"
            className={activeTab === "upcoming" ? "is-active" : ""}
            onClick={() => setActiveTab("upcoming")}
          >
            Upcoming
          </button>
          <button
            type="button"
            className={activeTab === "past" ? "is-active" : ""}
            onClick={() => setActiveTab("past")}
          >
            Past
          </button>
        </div>
      </div>

      {error && <p className="booking-error">{error}</p>}
      {loading ? (
        <p>Loading bookings...</p>
      ) : bookings.length === 0 ? (
        <p>No {activeTab} bookings found.</p>
      ) : (
        <BookingsCalendar
          bookings={bookings}
          role={role}
          activeTab={activeTab}
          executeComplete={executeComplete}
          handleCancel={handleCancel}
          setReviewTarget={setReviewTarget}
        />
      )}

      {/* Review modal portal */}
      {reviewTarget &&
        ReactDOM.createPortal(
          <SubmitReviewModal
            booking={reviewTarget}
            onClose={() => setReviewTarget(null)}
            onReviewSubmitted={() => loadBookings(activeTab)}
          />,
          document.body
        )}
    </div>
  );
};

export default BookingsDashboardPage;
