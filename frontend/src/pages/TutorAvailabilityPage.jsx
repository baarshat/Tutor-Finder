import React, { useEffect, useMemo, useState } from "react";
import "./TutorAvailabilityPage.css";

const API_BASE = "http://localhost:8080";

const WEEK_DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const defaultAvailability = {
  monday: { isAvailable: false, startTime: "09:00", endTime: "17:00" },
  tuesday: { isAvailable: false, startTime: "09:00", endTime: "17:00" },
  wednesday: { isAvailable: false, startTime: "09:00", endTime: "17:00" },
  thursday: { isAvailable: false, startTime: "09:00", endTime: "17:00" },
  friday: { isAvailable: false, startTime: "09:00", endTime: "17:00" },
  saturday: { isAvailable: false, startTime: "09:00", endTime: "17:00" },
  sunday: { isAvailable: false, startTime: "09:00", endTime: "17:00" },
  timeGap: 0,
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

const TutorAvailabilityPage = () => {
  const [availability, setAvailability] = useState(defaultAvailability);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 0; hour < 24; hour += 1) {
      for (let minute = 0; minute < 60; minute += 30) {
        slots.push(
          `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
        );
      }
    }
    return slots;
  }, []);

  useEffect(() => {
    let isActive = true;
    const loadAvailability = async () => {
      setLoading(true);
      setError("");
      try {
        const token = getAuthToken();
        const res = await fetch(`${API_BASE}/api/bookings/tutor/availability`, {
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
          throw new Error("Unable to load availability.");
        }

        const data = await res.json();
        if (isActive) {
          setAvailability({ ...defaultAvailability, ...data });
        }
      } catch (err) {
        if (isActive) {
          setError(err?.message || "Unable to load availability.");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadAvailability();
    return () => {
      isActive = false;
    };
  }, []);

  const handleDayToggle = (day) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        isAvailable: !prev[day].isAvailable,
      },
    }));
  };

  const handleTimeChange = (day, field, value) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/api/bookings/tutor/availability`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(availability),
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.clear();
        window.location.href = "/login";
        return;
      }

      if (!res.ok) {
        const message = await res.json().catch(() => ({}));
        throw new Error(message?.message || "Failed to update availability.");
      }

      const data = await res.json();
      setAvailability({ ...defaultAvailability, ...data });
      setSuccess("Availability updated successfully.");
    } catch (err) {
      setError(err?.message || "Failed to update availability.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="availability-page">
      <div className="availability-header">
        <h2>Set your availability</h2>
        <p>Choose the days and time blocks when students can book you.</p>
      </div>

      <form className="availability-form" onSubmit={handleSubmit}>
        {loading ? (
          <p>Loading availability...</p>
        ) : (
          WEEK_DAYS.map((day) => (
            <div key={day} className="availability-row">
              <label className="availability-day">
                <input
                  type="checkbox"
                  checked={availability[day].isAvailable}
                  onChange={() => handleDayToggle(day)}
                />
                <span>{day.charAt(0).toUpperCase() + day.slice(1)}</span>
              </label>

              {availability[day].isAvailable && (
                <div className="availability-time">
                  <select
                    value={availability[day].startTime}
                    onChange={(event) =>
                      handleTimeChange(day, "startTime", event.target.value)
                    }
                  >
                    {timeSlots.map((slot) => (
                      <option key={`${day}-start-${slot}`} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                  <span>to</span>
                  <select
                    value={availability[day].endTime}
                    onChange={(event) =>
                      handleTimeChange(day, "endTime", event.target.value)
                    }
                  >
                    {timeSlots.map((slot) => (
                      <option key={`${day}-end-${slot}`} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ))
        )}

        <div className="availability-gap">
          <label>
            Minimum gap before booking (minutes)
            <input
              type="number"
              value={availability.timeGap}
              min="0"
              onChange={(event) =>
                setAvailability((prev) => {
                  const value = Number(event.target.value);
                  return {
                    ...prev,
                    timeGap: Number.isNaN(value) ? 0 : value,
                  };
                })
              }
            />
          </label>
        </div>

        {error && <p className="availability-error">{error}</p>}
        {success && <p className="availability-success">{success}</p>}

        <button type="submit" className="primary-btn" disabled={saving}>
          {saving ? "Updating..." : "Update Availability"}
        </button>
      </form>
    </div>
  );
};

export default TutorAvailabilityPage;
