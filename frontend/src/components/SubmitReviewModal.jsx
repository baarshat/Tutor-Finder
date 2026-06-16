import React, { useState } from "react";
import { X, Star } from "lucide-react";
import { toast } from "react-toastify";
import "./SubmitReviewModal.css";

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

const SubmitReviewModal = ({ booking, onClose, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const tutorName = booking?.tutor?.name || "the tutor";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a star rating.");
      return;
    }

    setSubmitting(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          bookingId: booking.id,
          rating,
          comment,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "Failed to submit review.");
      }

      toast.success("Your review has been submitted!");
      onReviewSubmitted();
      onClose();
    } catch (err) {
      toast.error(err?.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const starLabels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

  return (
    <div className="review-modal-overlay" onClick={onClose}>
      <div
        className="review-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-modal-title"
      >
        {/* Header */}
        <div className="review-modal__header">
          <div>
            <h2 id="review-modal-title">Rate your session</h2>
            <p className="review-modal__subtitle">with {tutorName}</p>
          </div>
          <button
            className="review-modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form className="review-modal__body" onSubmit={handleSubmit}>
          {/* Star Selector */}
          <div className="review-star-section">
            <p className="review-star-prompt">How was your experience?</p>
            <div className="review-stars-row">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`review-star-btn ${
                    star <= (hovered || rating) ? "active" : ""
                  }`}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setRating(star)}
                  aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                >
                  <Star
                    size={36}
                    fill={star <= (hovered || rating) ? "#f59e0b" : "none"}
                    color={star <= (hovered || rating) ? "#f59e0b" : "#cbd5e1"}
                    strokeWidth={1.5}
                  />
                </button>
              ))}
            </div>
            {(hovered || rating) > 0 && (
              <p className="review-star-label">
                {starLabels[hovered || rating]}
              </p>
            )}
          </div>

          {/* Comment Box */}
          <div className="review-comment-section">
            <label htmlFor="review-comment" className="review-comment-label">
              Write a review <span className="optional-tag">(optional)</span>
            </label>
            <textarea
              id="review-comment"
              className="review-comment-textarea"
              rows={4}
              placeholder={`Share your experience with ${tutorName}...`}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
            />
            <p className="review-char-count">{comment.length}/1000</p>
          </div>

          {/* Actions */}
          <div className="review-modal__actions">
            <button
              type="button"
              className="secondary-btn"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="primary-btn"
              disabled={submitting || rating === 0}
            >
              {submitting ? "Submitting…" : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitReviewModal;
