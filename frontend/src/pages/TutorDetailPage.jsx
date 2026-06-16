import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactDOM from "react-dom";
import {
  Star,
  MapPin,
  BookOpen,
  Calendar,
  Clock,
  MessageSquare,
  Heart,
  Award,
  GraduationCap,
  Sparkles,
  CheckCircle,
  Trash2,
} from "lucide-react";
import BookingModal from "../components/BookingModal";
import { toast } from "react-toastify";
import "./TutorDetailPage.css";

const API_BASE = "http://localhost:8080";

const API_REVIEWS = "http://localhost:8080";

const getAuthToken = () => {
  const u = JSON.parse(localStorage.getItem("user") || "{}");
  return u.token || u.accessToken || u.jwtToken || localStorage.getItem("token") || "";
};

export default function TutorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // UI states
  const [bioExpanded, setBioExpanded] = useState(false);
  const [educationExpanded, setEducationExpanded] = useState({});
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Review states
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ averageRating: 0, reviewCount: 0, distribution: {} });
  const currentUserId = JSON.parse(localStorage.getItem("user") || "{}")?.userId || JSON.parse(localStorage.getItem("user") || "{}")?.id;

  useEffect(() => {
    const fetchTutorDetail = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/api/tutors/${id}`);
        if (!res.ok) throw new Error("Tutor not found.");
        const data = await res.json();
        setTutor(data);
      } catch (err) {
        setError(err.message || "Failed to load tutor details.");
      } finally {
        setLoading(false);
      }
    };
    fetchTutorDetail();
  }, [id]);

  const fetchReviews = useCallback(async () => {
    if (!id) return;
    try {
      const [reviewsRes, statsRes] = await Promise.all([
        fetch(`${API_REVIEWS}/api/reviews/tutor/${id}`),
        fetch(`${API_REVIEWS}/api/reviews/tutor/${id}/stats`),
      ]);
      if (reviewsRes.ok) setReviews(await reviewsRes.json());
      if (statsRes.ok) setReviewStats(await statsRes.json());
    } catch { /* silently ignore review fetch errors */ }
  }, [id]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Delete your review? This cannot be undone.")) return;
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_REVIEWS}/api/reviews/${reviewId}`, {
        method: "DELETE",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (!res.ok) throw new Error("Failed to delete review.");
      toast.success("Review deleted.");
      fetchReviews();
    } catch (err) {
      toast.error(err?.message || "Failed to delete review.");
    }
  };

  // Enrich with premium mock structure for missing fields
  const profile = useMemo(() => {
    if (!tutor) return null;

    // Normalize subjects
    let subjectsList = [];
    if (tutor.subjects) {
      if (Array.isArray(tutor.subjects)) {
        subjectsList = tutor.subjects;
      } else if (typeof tutor.subjects === "string") {
        subjectsList = tutor.subjects.split(",").map(s => s.trim()).filter(Boolean);
      }
    }

    const defaultBio = `I am a Master's student pursuing a (Master's in Data Science) at the School of Mathematical Science (Tribhuvan University, Kritipur). I completed my Bachelor of Science from ASCOL (Amrit Science Campus, Lainchaur) with a major in Mathematics. I am a hardworking and sincere person ready to teach and help students in their academic journey. I enjoy utilizing modern and creative teaching methods to help students better understand concepts and apply them practically.`;

    const name = tutor.userName || tutor.name || "Tutor Profile";

    return {
      id: tutor.id,
      name: name,
      image: tutor.profilePicUrl ? `data:image/jpeg;base64,${tutor.profilePicUrl}` : null,
      headline: tutor.qualifications ? `Building strong foundations in ${subjectsList[0] || "subjects"} for success.` : "Dedicated educator offering personalized learning sessions.",
      location: tutor.location || "Kathmandu",
      subjects: subjectsList.length > 0 ? subjectsList : ["Mathematics", "Science"],
      hourlyRate: tutor.hourlyRate || 500,
      experienceYears: tutor.experienceYears || 2,
      bio: defaultBio,
      levels: ["Secondary (9-10)", "H Secondary (11-12)", "Undergraduate"],
      languages: ["English", "Nepali"],
      status: tutor.status || "VERIFIED",
      online: true,
      bookedSessions: 2,
      totalSessions: 203,
      responseTime: "2 hours",
      rating: reviewStats.averageRating || 0,
      reviewsCount: reviewStats.reviewCount || 0,
      education: [
        {
          id: 1,
          year: "2024 - Current",
          degree: "Masters in Data Science",
          institution: "Tribhuvan University, School of Mathematical Sciences",
          location: "Kathmandu, Nepal",
          description: "Master in Data Science (MDS) program of Tribhuvan University is implemented by the School of Mathematical Sciences under the Faculty of Humanities and Social Sciences. The curriculum covers advanced statistical tools, machine learning, big data analysis, and predictive modeling."
        },
        {
          id: 2,
          year: "2016 - 2021",
          degree: "Bsc, Bachelor of Science in Mathematics",
          institution: "Tribhuvan University, Amrit Science Campus",
          location: "Kathmandu, Nepal",
          description: "A Bachelor of Science in Mathematics is an undergraduate degree program that provides students with a solid foundation in core mathematical concepts, advanced proof structures, linear algebra, calculus, and abstract structures."
        },
        {
          id: 3,
          year: "2014 - 2016",
          degree: "+2 Science",
          institution: "Southwestern State College",
          location: "Kathmandu, Nepal",
          description: "+2 Science, spanning two years, is commonly selected by students targeting career development in medical, engineering, research, technology, and advanced science fields."
        }
      ]
    };
  }, [tutor]);


  const handleOpenBooking = () => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    setIsBookingOpen(true);
  };

  const toggleEducation = (eduId) => {
    setEducationExpanded(prev => ({
      ...prev,
      [eduId]: !prev[eduId]
    }));
  };

  if (loading) {
    return (
      <div className="tutor-detail-loading">
        <div className="spinner"></div>
        <p>Loading tutor profile details...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="tutor-detail-error-container">
        <h2>Oops! Profile Not Found</h2>
        <p>{error || "We couldn't retrieve information for this tutor profile."}</p>
        <button className="primary-btn" onClick={() => navigate("/find-tutors")}>
          Back to Find Tutors
        </button>
      </div>
    );
  }

  return (
    <div className="tutor-profile-page">
      <div className="tutor-profile-container">
        {/* Main Details (Left Column) */}
        <div className="tutor-profile-main">
          
          {/* Header Card */}
          <div className="tutor-detail-header-card">
            <div className="tutor-avatar-large">
              {profile.image ? (
                <img src={profile.image} alt={profile.name} />
              ) : (
                <div className="avatar-placeholder-large">{profile.name.charAt(0)}</div>
              )}
            </div>
            
            <div className="tutor-header-info">
              <div className="tutor-name-line">
                <h1>{profile.name}</h1>
                <CheckCircle className="verified-badge-icon" size={22} fill="#3b82f6" color="white" />
                <span className="location-badge">
                  <MapPin size={16} /> {profile.location}
                </span>
              </div>

              <p className="tutor-headline">"{profile.headline}"</p>

              <div className="badges-grid-info">
                <div className="info-badge-item">
                  <span className="badge-title">I can teach</span>
                  <span className="badge-value">{profile.subjects.slice(0, 2).join(", ")} {profile.subjects.length > 2 && `+${profile.subjects.length - 2} more`}</span>
                </div>
                <div className="info-badge-item">
                  <span className="badge-title">Level</span>
                  <span className="badge-value">{profile.levels.slice(0, 2).join(", ")} {profile.levels.length > 2 && `+${profile.levels.length - 2} more`}</span>
                </div>
                <div className="info-badge-item">
                  <span className="badge-title">I can speak</span>
                  <span className="badge-value">{profile.languages.join(", ")}</span>
                </div>
              </div>

              <div className="status-indicators">
                <span className={`status-pill ${profile.online ? "online" : "offline"}`}>
                  <span className="indicator-dot"></span>
                  {profile.online ? "online" : "offline"}
                </span>
                <span className="achievements-trigger">
                  <Award size={16} /> Achievements
                </span>
              </div>
            </div>
          </div>

          {/* About Me Section */}
          <section className="profile-detail-section">
            <h2>About me</h2>
            <div className="about-me-content">
              <p>
                {bioExpanded ? profile.bio : `${profile.bio.substring(0, 300)}...`}
              </p>
              <button 
                className="show-more-toggle-btn"
                onClick={() => setBioExpanded(!bioExpanded)}
              >
                {bioExpanded ? "Show less" : "Show more"}
              </button>
            </div>
          </section>

          {/* Education Timeline Section */}
          <section className="profile-detail-section">
            <h2>Education</h2>
            <div className="education-timeline-list">
              {profile.education.map((edu) => {
                const isExpanded = !!educationExpanded[edu.id];
                return (
                  <div key={edu.id} className="education-timeline-item">
                    <div className="edu-year-col">
                      <span>{edu.year}</span>
                    </div>
                    <div className="edu-details-col">
                      <div className="edu-degree-line">
                        <h3>{edu.degree}</h3>
                      </div>
                      <div className="edu-inst-line">
                        <GraduationCap size={16} />
                        <span>{edu.institution}</span>
                      </div>
                      <div className="edu-loc-line">
                        <MapPin size={14} />
                        <span>{edu.location}</span>
                      </div>
                      <p className="edu-description">
                        {isExpanded ? edu.description : `${edu.description.substring(0, 100)}...`}
                      </p>
                      <button 
                        className="show-more-toggle-btn"
                        onClick={() => toggleEducation(edu.id)}
                      >
                        {isExpanded ? "Show less" : "Show more"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Student Reviews Section */}
          <section className="profile-detail-section">
            <h2>Student reviews</h2>
            <div className="student-reviews-grid">

              {/* Ratings Summary Card */}
              <div className="ratings-summary-card">
                <div className="ratings-huge-score">
                  {profile.reviewsCount > 0 ? Number(profile.rating).toFixed(1) : "—"}
                </div>
                <div className="ratings-stars-row">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={18}
                      fill={s <= Math.round(profile.rating) && profile.reviewsCount > 0 ? "#f59e0b" : "#e2e8f0"}
                      color={s <= Math.round(profile.rating) && profile.reviewsCount > 0 ? "#f59e0b" : "#e2e8f0"}
                    />
                  ))}
                </div>
                <div className="ratings-sub-label">Based on {profile.reviewsCount} rating{profile.reviewsCount !== 1 ? "s" : ""}</div>

                <div className="rating-bars-breakdown">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviewStats.distribution?.[star] || 0;
                    const pct = profile.reviewsCount > 0 ? Math.round((count / profile.reviewsCount) * 100) : 0;
                    return (
                      <div key={star} className="rating-breakdown-row">
                        <span className="row-star-label">{star}.0</span>
                        <div className="row-bar-track">
                          <div className="row-bar-fill" style={{ width: `${pct}%` }}></div>
                        </div>
                        <span className="row-count-val">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reviews List */}
              <div className="reviews-list-container">
                {reviews.length === 0 ? (
                  <div className="empty-reviews-placeholder">
                    <Sparkles size={48} color="#cbd5e1" className="empty-sparkle-icon" />
                    <h3>No reviews yet!</h3>
                    <p>Be the first to share your experience with this tutor.</p>
                  </div>
                ) : (
                  <div className="reviews-list">
                    {reviews.map((review) => (
                      <div key={review.id} className="review-card">
                        <div className="review-card__header">
                          <div className="review-card__avatar">
                            {review.studentName?.charAt(0)?.toUpperCase() || "S"}
                          </div>
                          <div className="review-card__meta">
                            <span className="review-card__name">{review.studentName}</span>
                            <span className="review-card__date">
                              {new Date(review.createdAt).toLocaleDateString(undefined, {
                                year: "numeric", month: "short", day: "numeric",
                              })}
                            </span>
                          </div>
                          <div className="review-card__stars">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                size={14}
                                fill={s <= review.rating ? "#f59e0b" : "none"}
                                color={s <= review.rating ? "#f59e0b" : "#cbd5e1"}
                                strokeWidth={1.5}
                              />
                            ))}
                          </div>
                          {/* Delete button — only visible to the author */}
                          {review.studentId === currentUserId && (
                            <button
                              className="review-card__delete-btn"
                              onClick={() => handleDeleteReview(review.id)}
                              aria-label="Delete review"
                              title="Delete my review"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                        {review.comment && (
                          <p className="review-card__comment">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </section>

        </div>

        {/* Sidebar Booking / Stats Widget (Right Column) */}
        <aside className="tutor-profile-sidebar">
          <div className="sidebar-sticky-widget">
            
            <div className="sidebar-price-section">
              <span className="price-val">Rs. {profile.hourlyRate}</span>
              <span className="price-lesson-label">(60-min lesson)</span>
            </div>

            <button 
              className="primary-btn book-trial-btn"
              onClick={handleOpenBooking}
            >
              <Calendar size={18} /> Book trial lesson
            </button>

            <button className="secondary-btn send-message-btn">
              <MessageSquare size={18} /> Send message
            </button>

            <button 
              className={`favorite-action-btn ${isFavorite ? "active" : ""}`}
              onClick={() => setIsFavorite(!isFavorite)}
            >
              <Heart size={20} fill={isFavorite ? "#e11d48" : "none"} color={isFavorite ? "#e11d48" : "#64748b"} />
              {isFavorite ? "Saved to Favorites" : "Add to Favorites"}
            </button>

            {/* Sidebar Meta Stats List */}
            <div className="sidebar-meta-stats-list">
              <div className="meta-stat-row">
                <div className="stat-icon-wrapper">
                  <Star size={16} fill="#fbbf24" color="#fbbf24" />
                </div>
                <div className="stat-content">
                  <span className="stat-val">{profile.rating}</span>
                  <span className="stat-label">{profile.reviewsCount} reviews</span>
                </div>
              </div>

              <div className="meta-stat-row">
                <div className="stat-icon-wrapper user-icon">
                  <Sparkles size={16} color="var(--primary)" />
                </div>
                <div className="stat-content">
                  <span className="stat-val">{profile.bookedSessions}</span>
                  <span className="stat-label">Booked sessions</span>
                </div>
              </div>

              <div className="meta-stat-row">
                <div className="stat-icon-wrapper list-icon">
                  <BookOpen size={16} color="var(--primary)" />
                </div>
                <div className="stat-content">
                  <span className="stat-val">{profile.totalSessions}</span>
                  <span className="stat-label">Sessions</span>
                </div>
              </div>

              <div className="meta-stat-row">
                <div className="stat-icon-wrapper clock-icon">
                  <Clock size={16} color="var(--primary)" />
                </div>
                <div className="stat-content">
                  <span className="stat-val">{profile.responseTime}</span>
                  <span className="stat-label">Response time</span>
                </div>
              </div>
            </div>

          </div>
        </aside>
      </div>

      {/* Booking Modal Portal */}
      {isBookingOpen && ReactDOM.createPortal(
        <BookingModal
          tutor={{
            id: profile.id,
            name: profile.name,
            subjects: profile.subjects,
            location: profile.location,
            hourlyRate: profile.hourlyRate
          }}
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
        />,
        document.body
      )}
    </div>
  );
}
