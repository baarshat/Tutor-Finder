import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Clock, Star, X, Calendar as CalendarIcon } from "lucide-react";
import "./BookingsCalendar.css";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const statusColors = {
  CONFIRMED: "#3b82f6",
  PENDING: "#f59e0b",
  COMPLETED: "#22c55e",
  CANCELLED: "#ef4444",
};

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

export default function BookingsCalendar({
  bookings = [],
  role = "STUDENT",
  activeTab = "upcoming",
  executeComplete,
  handleCancel,
  setReviewTarget,
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () =>
    setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () =>
    setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  // Group bookings by date key "YYYY-MM-DD"
  const bookingsByDate = useMemo(() => {
    const map = {};
    bookings.forEach((b) => {
      const d = new Date(b.startTime);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      if (!map[key]) map[key] = [];
      map[key].push(b);
    });
    return map;
  }, [bookings]);

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrev = new Date(year, month, 0).getDate();
    const cells = [];

    // Previous month padding
    for (let i = firstDay - 1; i >= 0; i--) {
      cells.push({ day: daysInPrev - i, inMonth: false, date: new Date(year, month - 1, daysInPrev - i) });
    }
    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, inMonth: true, date: new Date(year, month, d) });
    }
    // Next month padding
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      cells.push({ day: d, inMonth: false, date: new Date(year, month + 1, d) });
    }
    return cells;
  }, [year, month]);

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const selectedKey = selectedDate
    ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`
    : null;

  const selectedBookings = selectedKey ? bookingsByDate[selectedKey] || [] : [];

  return (
    <div className="bcal">
      {/* Calendar Main Grid (Left side) */}
      <div className="bcal__main">
        {/* Header */}
        <div className="bcal__header">
          <h3 className="bcal__title">
            {MONTHS[month]} {year}
          </h3>
          <div className="bcal__nav">
            <button className="bcal__nav-btn" onClick={prevMonth} aria-label="Previous month">
              <ChevronLeft size={18} />
            </button>
            <button className="bcal__today-btn" onClick={goToday}>Today</button>
            <button className="bcal__nav-btn" onClick={nextMonth} aria-label="Next month">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Day names */}
        <div className="bcal__grid bcal__days-header">
          {DAYS.map((d) => (
            <div key={d} className="bcal__day-name">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="bcal__grid bcal__cells">
          {calendarDays.map((cell, i) => {
            const key = `${cell.date.getFullYear()}-${String(cell.date.getMonth() + 1).padStart(2, "0")}-${String(cell.date.getDate()).padStart(2, "0")}`;
            const events = bookingsByDate[key] || [];
            const isToday = key === todayKey;
            const isSelected = key === selectedKey;
            
            const hasActiveTabEvents = events.some(b => {
               const start = new Date(b.startTime);
               if (activeTab === "upcoming") return start >= today;
               if (activeTab === "past") return start < today;
               return false;
            });

            return (
              <div
                key={i}
                className={`bcal__cell${cell.inMonth ? "" : " bcal__cell--muted"}${isToday ? " bcal__cell--today" : ""}${isSelected ? " bcal__cell--selected" : ""}${events.length > 0 ? " bcal__cell--has-events" : ""}${hasActiveTabEvents ? " bcal__cell--highlighted" : ""}`}
                onClick={() => cell.inMonth && setSelectedDate(cell.date)}
              >
                <span className="bcal__cell-num">{cell.day}</span>
                {events.length > 0 && (
                  <div className="bcal__dots">
                    {events.slice(0, 3).map((ev, j) => (
                      <span
                        key={j}
                        className="bcal__dot"
                        style={{ background: statusColors[ev.status] || "#94a3b8" }}
                      />
                    ))}
                    {events.length > 3 && <span className="bcal__dot-more">+{events.length - 3}</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="bcal__legend">
          {Object.entries(statusColors).map(([label, color]) => (
            <span key={label} className="bcal__legend-item">
              <span className="bcal__legend-dot" style={{ background: color }} />
              {label.charAt(0) + label.slice(1).toLowerCase()}
            </span>
          ))}
        </div>
      </div>

      {/* Sidebar / Detail panel (Right side) */}
      <div className="bcal__sidebar">
        {!selectedDate ? (
          <div className="bcal__sidebar-empty-state">
            <CalendarIcon size={48} color="#e2e8f0" strokeWidth={1} style={{ marginBottom: "1rem" }} />
            <p>Select a date on the calendar to see session details</p>
          </div>
        ) : (
          <div className="bcal__detail">
            <div className="bcal__detail-header">
              <h4>
                {selectedDate.toLocaleDateString(undefined, {
                  weekday: "long", month: "long", day: "numeric", year: "numeric",
                })}
              </h4>
              <button className="bcal__detail-close" onClick={() => setSelectedDate(null)} aria-label="Close">
                <X size={16} />
              </button>
            </div>
          {selectedBookings.length === 0 ? (
            <p className="bcal__detail-empty">No sessions on this day.</p>
          ) : (
            <div className="bcal__detail-list">
              {selectedBookings.map((b) => {
                const counterpart = role === "TUTOR" ? b.student : b.tutor;
                const isCancelled = b.status === "CANCELLED";
                const isCompleted = b.status === "COMPLETED";
                const hasReview = b.reviewed;

                return (
                  <div key={b.id} className="bcal__event-card">
                    <div
                      className="bcal__event-stripe"
                      style={{ background: statusColors[b.status] || "#94a3b8" }}
                    />
                    <div className="bcal__event-body">
                      <span className="bcal__event-name">
                        {counterpart?.name || "Session"}
                      </span>
                      <span className="bcal__event-time">
                        <Clock size={13} />
                        {formatTime(b.startTime)} – {formatTime(b.endTime)}
                      </span>
                      {b.notes && <p className="bcal__event-notes">"{b.notes}"</p>}
                      <span
                        className="bcal__event-status"
                        style={{ color: statusColors[b.status] || "#94a3b8" }}
                      >
                        {b.status}
                      </span>
                      
                      {/* Interaction Buttons from Dashboard */}
                      <div className="bcal__event-actions">
                        {role === "TUTOR" && !isCancelled && !isCompleted && (() => {
                          const canComplete = new Date() >= new Date(b.endTime);
                          return (
                            <div className="bcal__action-group">
                              <button
                                type="button"
                                className={`primary-btn booking-card__complete-btn ${!canComplete ? "disabled-btn" : ""}`}
                                onClick={() => canComplete && executeComplete && executeComplete(b.id)}
                                disabled={!canComplete}
                                title={!canComplete ? "You can only mark this session as completed after its scheduled end time." : ""}
                                style={!canComplete ? { opacity: 0.6, cursor: "not-allowed" } : {}}
                              >
                                Mark as Completed
                              </button>
                              {activeTab === "upcoming" && (
                                <button
                                  type="button"
                                  className="secondary-btn booking-card__cancel-btn"
                                  onClick={() => handleCancel && handleCancel(b.id)}
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          );
                        })()}

                        {role === "STUDENT" && (
                          <div className="booking-card__review-section no-border-top">
                            {isCancelled && <span className="cancelled-label">Cancelled</span>}
                            
                            {isCompleted && !hasReview && (
                              <button
                                type="button"
                                className="primary-btn booking-card__rate-btn bcal__rate-btn"
                                onClick={() => setReviewTarget && setReviewTarget(b)}
                              >
                                <Star size={15} />
                                Rate &amp; Review
                              </button>
                            )}

                            {isCompleted && hasReview && (
                              <div className="booking-card__reviewed">
                                <div className="star-display bcal__star-sm">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                      key={s}
                                      size={14}
                                      fill={s <= b.review.rating ? "#f59e0b" : "none"}
                                      color={s <= b.review.rating ? "#f59e0b" : "#cbd5e1"}
                                      strokeWidth={1.5}
                                    />
                                  ))}
                                  <span className="star-display__label">{b.review.rating}/5</span>
                                </div>
                                {b.review.comment && (
                                  <p className="booking-card__review-comment">
                                    "{b.review.comment}"
                                  </p>
                                )}
                              </div>
                            )}

                            {!isCompleted && !isCancelled && activeTab === "past" && (
                              <p className="awaiting-completion">
                                Awaiting completion by tutor to review
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
