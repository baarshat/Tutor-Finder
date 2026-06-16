import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import "./ScheduleCalendarModal.css";

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

const ScheduleCalendarModal = ({ tutorId, isOpen, onClose, onDaySelected }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && tutorId) {
      fetchBookings();
    }
  }, [isOpen, tutorId, currentDate]);

  const fetchBookings = async () => {
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
        // Filter bookings for this tutor
        const tutorBookings = data.filter(
          (b) => b.tutor?.id === tutorId && b.status !== "CANCELLED",
        );
        setBookings(tutorBookings);
      }
    } catch (err) {
      console.error("Failed to load bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const hasBooking = (day) => {
    const targetDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day,
    );
    return bookings.some((booking) => {
      const bookingDate = new Date(booking.startTime);
      return (
        bookingDate.getDate() === day &&
        bookingDate.getMonth() === targetDate.getMonth() &&
        bookingDate.getFullYear() === targetDate.getFullYear()
      );
    });
  };

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1),
    );
  };

  const handleDayClick = (day) => {
    const selectedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day,
    );
    onDaySelected(selectedDate);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const booked = hasBooking(day);
      const isToday =
        day === new Date().getDate() &&
        currentDate.getMonth() === new Date().getMonth() &&
        currentDate.getFullYear() === new Date().getFullYear();

      days.push(
        <div
          key={day}
          className={`calendar-day ${isToday ? "today" : ""} ${booked ? "booked" : ""}`}
          onClick={() => handleDayClick(day)}
          title={booked ? "Has bookings" : ""}
        >
          <div className="day-number">{day}</div>
          {booked && <div className="booking-indicator">●</div>}
        </div>,
      );
    }

    return days;
  };

  if (!isOpen) return null;

  const monthName = currentDate.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="schedule-calendar-overlay" onClick={onClose}>
      <div
        className="schedule-calendar-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="calendar-header">
          <div className="calendar-title">
            <button className="nav-btn" onClick={handlePrevMonth}>
              <ChevronLeft size={20} />
            </button>
            <span className="month-year">{monthName}</span>
            <button className="nav-btn" onClick={handleNextMonth}>
              <ChevronRight size={20} />
            </button>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="calendar-container">
          {/* Weekday headers */}
          <div className="weekday-headers">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="weekday-header">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="calendar-grid">{renderCalendar()}</div>
        </div>

        {/* Legend */}
        <div className="calendar-legend">
          <div className="legend-item">
            <div className="legend-dot today-dot"></div>
            <span>Today</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot booked-dot"></div>
            <span>Has bookings</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleCalendarModal;
