import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import "./DayScheduleView.css";

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

const DayScheduleView = ({
  tutorId,
  selectedDate,
  isOpen,
  onClose,
  onBookingClick,
}) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(selectedDate);

  useEffect(() => {
    if (isOpen && selectedDate) {
      setCurrentDate(selectedDate);
      fetchDayBookings(selectedDate);
    }
  }, [isOpen, selectedDate, tutorId]);

  const fetchDayBookings = async (date) => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/api/bookings?type=all`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        const data = await res.json();
        // Filter bookings for this tutor on this date
        const dayBookings = data.filter((b) => {
          if (b.tutor?.id !== tutorId || b.status === "CANCELLED") {
            return false;
          }
          const bookingDate = new Date(b.startTime);
          return (
            bookingDate.getDate() === date.getDate() &&
            bookingDate.getMonth() === date.getMonth() &&
            bookingDate.getFullYear() === date.getFullYear()
          );
        });
        setBookings(
          dayBookings.sort(
            (a, b) => new Date(a.startTime) - new Date(b.startTime),
          ),
        );
      }
    } catch (err) {
      console.error("Failed to load day bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevDay = () => {
    const prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 1);
    setCurrentDate(prevDate);
    fetchDayBookings(prevDate);
  };

  const handleNextDay = () => {
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1);
    setCurrentDate(nextDate);
    fetchDayBookings(nextDate);
  };

  const isToday = () => {
    const today = new Date();
    return (
      currentDate.getDate() === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      slots.push(hour);
    }
    return slots;
  };

  const getBookingsForTime = (hour) => {
    return bookings.filter((b) => {
      const startHour = new Date(b.startTime).getHours();
      return startHour === hour;
    });
  };

  const formatTime = (hour) => {
    return `${String(hour).padStart(2, "0")}:00`;
  };

  const formatDateDisplay = () => {
    return currentDate.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!isOpen) return null;

  const timeSlots = generateTimeSlots();

  return (
    <div className="day-schedule-overlay" onClick={onClose}>
      <div
        className="day-schedule-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="day-schedule-header">
          <button className="nav-btn" onClick={handlePrevDay}>
            <ChevronLeft size={20} />
          </button>
          <div className="date-info">
            <span className="date-display">{formatDateDisplay()}</span>
            {isToday() && <span className="today-badge">Today</span>}
          </div>
          <div className="header-actions">
            <button className="nav-btn" onClick={handleNextDay}>
              <ChevronRight size={20} />
            </button>
            <button className="close-btn" onClick={onClose} aria-label="Close">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Schedule Container */}
        <div className="day-schedule-container">
          {loading ? (
            <div className="schedule-loading">
              <div className="spinner"></div>
              <p>Loading schedule...</p>
            </div>
          ) : (
            <div className="time-grid">
              {/* Time Labels */}
              <div className="time-column">
                <div className="time-header">Time</div>
                {timeSlots.map((hour) => (
                  <div key={`time-${hour}`} className="time-slot">
                    {formatTime(hour)}
                  </div>
                ))}
              </div>

              {/* Bookings Column */}
              <div className="bookings-column">
                <div className="time-header">Bookings</div>
                <div className="bookings-grid">
                  {timeSlots.map((hour) => {
                    const hourBookings = getBookingsForTime(hour);
                    return (
                      <div
                        key={`booking-${hour}`}
                        className="booking-time-slot"
                      >
                        {hourBookings.map((booking) => {
                          const startTime = new Date(booking.startTime);
                          const endTime = new Date(booking.endTime);
                          const duration = (endTime - startTime) / (1000 * 60);
                          const minutes = startTime.getMinutes();

                          return (
                            <div
                              key={booking.id}
                              className="booking-card"
                              style={{
                                marginTop:
                                  minutes > 0
                                    ? `${(minutes / 60) * 100}%`
                                    : "0",
                                height: `${(duration / 60) * 100}%`,
                                minHeight: "60px",
                              }}
                              onClick={() => onBookingClick(booking)}
                              role="button"
                              tabIndex={0}
                            >
                              <div className="booking-card-content">
                                <div className="booking-name">
                                  {booking.student?.name || booking.tutor?.name}
                                </div>
                                <div className="booking-time">
                                  {startTime.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}{" "}
                                  -{" "}
                                  {endTime.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                                <div className="booking-status">
                                  {booking.status}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="day-schedule-footer">
          <span className="booking-count">
            {bookings.length} booking{bookings.length !== 1 ? "s" : ""} today
          </span>
        </div>
      </div>
    </div>
  );
};

export default DayScheduleView;
