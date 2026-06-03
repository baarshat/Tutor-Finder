import React, { useState } from "react";
import ReactDOM from "react-dom";
import { Star, MapPin, BookOpen } from "lucide-react";
import BookingModal from "./BookingModal";
import "./TutorCard.css";

const TutorCard = ({
  id, name, subjects, rating, reviews, hourlyRate, location, image, canBook = true,
}) => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const handleOpenBooking = () => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      window.location.href = "/login";
      return;
    }
    setIsBookingOpen(true);
  };

  return (
    <div className="tutor-card">
      <div className="tutor-header">
        <div className="tutor-avatar">
          {image ? (
            <img src={image} alt={name} />
          ) : (
            <div className="avatar-placeholder">{name.charAt(0)}</div>
          )}
        </div>
        <div className="tutor-info">
          <h3>{name}</h3>
          <div className="tutor-rating">
            <Star size={16} fill="#fbbf24" color="#fbbf24" />
            <span>{rating}</span>
            <span className="reviews">({reviews} reviews)</span>
          </div>
        </div>
      </div>

      <div className="tutor-details">
        <div className="detail-item">
          <BookOpen size={18} color="var(--primary)" />
          <span>{subjects.join(", ")}</span>
        </div>
        <div className="detail-item">
          <MapPin size={18} color="var(--primary)" />
          <span>{location}</span>
        </div>
      </div>

      <div className="tutor-footer">
        <div className="tutor-price">
          <span className="price">NPR {hourlyRate}</span>
          <span className="unit">/hr</span>
        </div>
        <button
          className="primary-btn"
          onClick={handleOpenBooking}
          disabled={!canBook}
        >
          {canBook ? "Book Now" : "Unavailable"}
        </button>
      </div>

      {/* Portal renders the modal directly on document.body, escaping tutor-card's CSS */}
      {isBookingOpen && ReactDOM.createPortal(
        <BookingModal
          tutor={{ id, name, subjects, location, hourlyRate }}
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
        />,
        document.body
      )}
    </div>
  );
};

export default TutorCard;