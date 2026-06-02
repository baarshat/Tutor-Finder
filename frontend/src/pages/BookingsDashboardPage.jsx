import React, { useCallback, useEffect, useState } from "react";
import { Calendar, Clock } from "lucide-react";
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

const BookingsDashboardPage = () => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role || "STUDENT";

  const loadBookings = useCallback(async (type) => {
    setLoading(true);
    setError("");
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/api/bookings?type=${type}`, {
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
        throw new Error("Failed to load bookings.");
      }

      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Failed to load bookings.");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings(activeTab);
  }, [activeTab, loadBookings]);

  const handleCancel = async (bookingId) => {
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

      await loadBookings(activeTab);
    } catch (err) {
      setError(err?.message || "Failed to cancel booking.");
    }
  };

  const bookingCards =
    bookings.length === 0 ? (
      <p>No {activeTab} bookings found.</p>
    ) : (
      <div className="booking-grid">
        {bookings.map((booking) => {
          const counterpart =
            role === "TUTOR" ? booking.student : booking.tutor;
          return (
            <div key={booking.id} className="booking-card">
              <div className="booking-card__header">
                <h3>{counterpart?.name || "Session"}</h3>
                <span className="booking-status">{booking.status}</span>
              </div>
              <p className="booking-card__subtitle">
                with {counterpart?.name || "Student"}
              </p>
              <div className="booking-card__meta">
                <div>
                  <Calendar size={16} />
                  <span>{formatDate(booking.startTime)}</span>
                </div>
                <div>
                  <Clock size={16} />
                  <span>
                    {formatTimeRange(booking.startTime, booking.endTime)}
                  </span>
                </div>
              </div>
              {booking.notes && (
                <p className="booking-card__notes">“{booking.notes}”</p>
              )}
              {activeTab === "upcoming" && (
                <button
                  type="button"
                  className="secondary-btn booking-card__cancel"
                  onClick={() => handleCancel(booking.id)}
                >
                  Cancel Booking
                </button>
              )}
            </div>
          );
        })}
      </div>
    );

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
      {loading ? <p>Loading bookings...</p> : bookingCards}
    </div>
  );
};

export default BookingsDashboardPage;
