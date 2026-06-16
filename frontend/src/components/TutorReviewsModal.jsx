import React, { useState, useEffect } from "react";
import { X, Star, Sparkles } from "lucide-react";
import "./TutorReviewsModal.css";

const API_BASE = "http://localhost:8080";

const TutorReviewsModal = ({ tutorId, tutorName, isOpen, onClose }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    averageRating: 0,
    reviewCount: 0,
    distribution: {},
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || !tutorId) return;

    const fetchReviews = async () => {
      setLoading(true);
      setError("");
      try {
        const [reviewsRes, statsRes] = await Promise.all([
          fetch(`${API_BASE}/api/reviews/tutor/${tutorId}`),
          fetch(`${API_BASE}/api/reviews/tutor/${tutorId}/stats`),
        ]);

        if (reviewsRes.ok) {
          setReviews(await reviewsRes.json());
        }
        if (statsRes.ok) {
          setStats(await statsRes.json());
        }
      } catch (err) {
        setError(err?.message || "Failed to load reviews.");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [isOpen, tutorId]);

  if (!isOpen) return null;

  return (
    <div className="reviews-modal-overlay" onClick={onClose}>
      <div
        className="reviews-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reviews-modal-title"
      >
        {/* Header */}
        <div className="reviews-modal__header">
          <div>
            <h2 id="reviews-modal-title">Reviews for {tutorName || "Tutor"}</h2>
            <p className="reviews-modal__subtitle">
              {stats.reviewCount} rating{stats.reviewCount !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            className="reviews-modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="reviews-modal__body">
          {loading ? (
            <div className="reviews-loading">
              <div className="spinner"></div>
              <p>Loading reviews...</p>
            </div>
          ) : error ? (
            <div className="reviews-error">
              <p>{error}</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="reviews-empty">
              <Sparkles size={48} color="#cbd5e1" />
              <h3>No reviews yet!</h3>
              <p>Be the first to share your experience with this tutor.</p>
            </div>
          ) : (
            <>
              {/* Stats Summary */}
              <div className="reviews-stats-summary">
                <div className="stats-rating-large">
                  {Number(stats.averageRating).toFixed(1)}
                </div>
                <div className="stats-stars-row">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={16}
                      fill={
                        s <= Math.round(stats.averageRating)
                          ? "#f59e0b"
                          : "#e2e8f0"
                      }
                      color={
                        s <= Math.round(stats.averageRating)
                          ? "#f59e0b"
                          : "#e2e8f0"
                      }
                    />
                  ))}
                </div>
                <p className="stats-sub-label">
                  Based on {stats.reviewCount} review
                  {stats.reviewCount !== 1 ? "s" : ""}
                </p>

                {/* Distribution bars */}
                <div className="stats-distribution">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = stats.distribution?.[star] || 0;
                    const pct =
                      stats.reviewCount > 0
                        ? Math.round((count / stats.reviewCount) * 100)
                        : 0;
                    return (
                      <div key={star} className="distribution-row">
                        <span className="dist-label">{star}★</span>
                        <div className="dist-bar">
                          <div
                            className="dist-bar-fill"
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                        <span className="dist-count">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reviews List */}
              <div className="reviews-list-section">
                <h3>All reviews</h3>
                <div className="reviews-list">
                  {reviews.map((review) => (
                    <div key={review.id} className="review-item">
                      <div className="review-item__header">
                        <div className="review-item__avatar">
                          {review.studentName?.charAt(0)?.toUpperCase() || "S"}
                        </div>
                        <div className="review-item__info">
                          <span className="review-item__name">
                            {review.studentName}
                          </span>
                          <span className="review-item__date">
                            {new Date(review.createdAt).toLocaleDateString(
                              undefined,
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </span>
                        </div>
                        <div className="review-item__rating">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={14}
                              fill={s <= review.rating ? "#f59e0b" : "#e2e8f0"}
                              color={s <= review.rating ? "#f59e0b" : "#e2e8f0"}
                              strokeWidth={1.5}
                            />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="review-item__comment">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorReviewsModal;
