import React from 'react';
import { Star, MapPin, BookOpen } from 'lucide-react';
import './TutorCard.css';

const TutorCard = ({ name, subjects, rating, reviews, hourlyRate, location, image }) => {
  return (
    <div className="tutor-card">
      <div className="tutor-header">
        <div className="tutor-avatar">
          {image ? <img src={image} alt={name} /> : <div className="avatar-placeholder">{name.charAt(0)}</div>}
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
          <span>{subjects.join(', ')}</span>
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
        <button className="primary-btn">Book Now</button>
      </div>
    </div>
  );
};

export default TutorCard;
