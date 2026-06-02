import React, { useEffect, useMemo, useState } from "react";
import { Calendar, Clock, Mail, User, X } from "lucide-react";
import "./BookingModal.css";

const API_BASE = "http://localhost:8080";
const SESSION_DURATION_MINUTES = 60;
const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const pad = (value) => String(value).padStart(2, "0");

const formatDate = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const formatDateTimeLocal = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;

const buildCalendarCells = (activeMonth) => {
  const year = activeMonth.getFullYear();
  const month = activeMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];

  for (let i = 0; i < startWeekday; i += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
};

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

const BookingModal = ({ tutor, isOpen, onClose }) => {
  const subjectsLabel = Array.isArray(tutor?.subjects)
    ? tutor.subjects.join(", ")
    : tutor?.subjects;

  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [activeMonth, setActiveMonth] = useState(new Date());
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    notes: "",
  });

  useEffect(() => {
    if (!isOpen) {
      setSelectedDate(null);
      setSelectedTime(null);
      setSuccessMessage("");
      setError("");
      return;
    }

    if (!tutor?.id) {
      return;
    }

    setActiveMonth(new Date());
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      notes: "",
    });

    const loadAvailability = async () => {
      setLoading(true);
      setError("");
      try {
        const token = getAuthToken();
        const res = await fetch(
          `${API_BASE}/api/bookings/availability?tutorProfileId=${tutor.id}&durationMinutes=${SESSION_DURATION_MINUTES}`,
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
          throw new Error("Failed to load availability.");
        }

        const data = await res.json();
        setAvailability(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err?.message || "Failed to load availability.");
      } finally {
        setLoading(false);
      }
    };

    loadAvailability();
  }, [isOpen, tutor?.id, user?.email, user?.name]);

  const availabilityMap = useMemo(() => {
    const map = {};
    availability.forEach((day) => {
      map[day.date] = day.slots || [];
    });
    return map;
  }, [availability]);

  const calendarCells = useMemo(
    () => buildCalendarCells(activeMonth),
    [activeMonth],
  );

  const monthLabel = `${MONTHS[activeMonth.getMonth()]} ${activeMonth.getFullYear()}`;
  const today = new Date();
  const todayString = formatDate(today);
  const timeSlots = selectedDate ? availabilityMap[selectedDate] || [] : [];

  const handleTimeSelect = (slot) => {
    setSelectedTime(slot);
    setError("");
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedDate || !selectedTime) {
      setError("Please select a date and time slot.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const token = getAuthToken();
      const start = new Date(`${selectedDate}T${selectedTime}:00`);
      const end = new Date(
        start.getTime() + SESSION_DURATION_MINUTES * 60 * 1000,
      );

      const payload = {
        tutorProfileId: tutor.id,
        studentName: formData.name,
        studentEmail: formData.email,
        startTime: formatDateTimeLocal(start),
        endTime: formatDateTimeLocal(end),
        notes: formData.notes,
      };

      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.clear();
        window.location.href = "/login";
        return;
      }

      if (!res.ok) {
        const message = await res.json().catch(() => ({}));
        throw new Error(message?.message || "Failed to create booking.");
      }

      setSuccessMessage(
        `Booking confirmed for ${selectedDate} at ${selectedTime}.`,
      );
    } catch (err) {
      setError(err?.message || "Failed to create booking.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="booking-modal-overlay" onClick={onClose}>
      <div
        className="booking-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="booking-modal__close" onClick={onClose}>
          <X size={20} />
        </button>
        <div className="booking-modal__details">
          <h2>{tutor?.name || "Tutor Session"}</h2>
          <p className="booking-modal__subtitle">
            Book a 60-minute tutoring session
          </p>
          <div className="booking-modal__detail-item">
            <User size={18} />
            <span>{subjectsLabel || "Subject expertise"}</span>
          </div>
          <div className="booking-modal__detail-item">
            <Clock size={18} />
            <span>{SESSION_DURATION_MINUTES} minutes</span>
          </div>
          <div className="booking-modal__detail-item">
            <Calendar size={18} />
            <span>{tutor?.location || "Online / In-person"}</span>
          </div>
        </div>

        <div className="booking-modal__form">
          {loading ? (
            <p>Loading availability...</p>
          ) : successMessage ? (
            <div className="booking-modal__success">
              <h3>Booking successful!</h3>
              <p>{successMessage}</p>
            </div>
          ) : (
            <>
              <div className="booking-modal__calendar">
                <div className="calendar-header">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveMonth(
                        new Date(
                          activeMonth.getFullYear(),
                          activeMonth.getMonth() - 1,
                          1,
                        ),
                      )
                    }
                  >
                    ←
                  </button>
                  <span>{monthLabel}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveMonth(
                        new Date(
                          activeMonth.getFullYear(),
                          activeMonth.getMonth() + 1,
                          1,
                        ),
                      )
                    }
                  >
                    →
                  </button>
                </div>
                <div className="calendar-grid">
                  {WEEK_DAYS.map((day) => (
                    <div key={day} className="calendar-cell calendar-cell--day">
                      {day}
                    </div>
                  ))}
                  {calendarCells.map((date, index) => {
                    if (!date) {
                      return (
                        <div
                          key={`empty-${index}`}
                          className="calendar-cell calendar-cell--empty"
                        />
                      );
                    }

                    const dateString = formatDate(date);
                    const isPast = dateString < todayString;
                    const isAvailable = Boolean(availabilityMap[dateString]);
                    const isSelected = selectedDate === dateString;

                    return (
                      <button
                        key={dateString}
                        type="button"
                        className={`calendar-cell calendar-cell--date${
                          isAvailable ? " is-available" : ""
                        }${isSelected ? " is-selected" : ""}`}
                        disabled={isPast || !isAvailable}
                          onClick={() => {
                            setSelectedDate(dateString);
                            setSelectedTime(null);
                            setError("");
                          }}
                        >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="booking-modal__slots">
                <h3>Available time slots</h3>
                {selectedDate ? (
                  timeSlots.length > 0 ? (
                    <div className="slot-grid">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          className={`slot-button${
                            selectedTime === slot ? " is-active" : ""
                          }`}
                          onClick={() => handleTimeSelect(slot)}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p>No slots available for this date.</p>
                  )
                ) : (
                  <p>Select a date to view slots.</p>
                )}
              </div>

              {selectedTime && (
                <form
                  className="booking-modal__form-fields"
                  onSubmit={handleSubmit}
                >
                  <div className="form-row">
                    <label>
                      <User size={16} />
                      <input
                        name="name"
                        value={formData.name}
                        onChange={handleFormChange}
                        placeholder="Your name"
                        required
                      />
                    </label>
                    <label>
                      <Mail size={16} />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleFormChange}
                        placeholder="Your email"
                        required
                      />
                    </label>
                  </div>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleFormChange}
                    placeholder="Additional information"
                    rows={3}
                  />
                  {error && <p className="form-error">{error}</p>}
                  <button
                    type="submit"
                    className="primary-btn"
                    disabled={submitting}
                  >
                    {submitting ? "Scheduling..." : "Schedule Session"}
                  </button>
                </form>
              )}
            </>
          )}
          {error && !selectedTime && <p className="form-error">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
