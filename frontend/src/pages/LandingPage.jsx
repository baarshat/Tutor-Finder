import React from 'react';
import { Link } from 'react-router-dom';
import { Search, ShieldCheck, Star, Zap, UserCheck, BookOpen, GraduationCap, MapPin, DollarSign, Globe, Calendar } from 'lucide-react';
import TutorCard from '../components/TutorCard';
import './LandingPage.css';

const LandingPage = () => {
  const featuredTutors = [
    { id: 101, name: 'Anjali Sharma', subjects: ['A-Levels Mathematics', 'Physics'], rating: 4.9, reviews: 45, hourlyRate: 1200, location: 'Kathmandu' },
    { id: 102, name: 'Rohan Adhikari', subjects: ['IB Economics', 'Business'], rating: 4.8, reviews: 32, hourlyRate: 1500, location: 'Kathmandu' },
    { id: 103, name: 'Sunita Gurung', subjects: ['NEB Grade 11/12 Chemistry'], rating: 4.7, reviews: 28, hourlyRate: 900, location: 'Kathmandu' },
    { id: 104, name: 'Bibek Thapa', subjects: ['A-Levels Computer Science'], rating: 5.0, reviews: 15, hourlyRate: 1100, location: 'Kathmandu' },
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Find Verified Tutors in Your Neighborhood</h1>
          <p>Location-based matching for NEB, Cambridge, and IB curriculums. Connect with top educators in your neighborhood.</p>
          <div className="hero-cta">
            <Link to="/find-tutors">
              <button className="primary-btn">Find a Tutor</button>
            </Link>
            <button className="secondary-btn">Become a Tutor</button>
          </div>
        </div>
        <div className="hero-image">
          <img src="/src/public/vitaly-gariev-TOuMSV0Nqjk-unsplash.jpg" alt="Local Education" />
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="features-section">
        <div className="section-header">
          <h2>Why Choose TutorFinder?</h2>
          <p>Nepal's leading platform for finding professional tutors within your local community.</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <ShieldCheck size={32} color="var(--primary)" />
            </div>
            <h3>Verified Tutors</h3>
            <p>Every educator undergoes a multi-step background check and credential verification process.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Star size={32} color="var(--primary)" />
            </div>
            <h3>Transparent Reviews</h3>
            <p>Read honest feedback from fellow students and parents. Verified session reviews only.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Zap size={32} color="var(--primary)" />
            </div>
            <h3>Flexible Booking</h3>
            <p>Book a tutor for free, negotiate and pay the tutor directly—no commission or service fee.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <UserCheck size={32} color="var(--primary)" />
            </div>
            <h3>1-on-1 Learning</h3>
            <p>Personalized matching ensures you find the most suitable tutor for your specific academic needs.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="section-header">
          <h2>How It Works</h2>
        </div>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Find a Tutor</h3>
            <p>Search for a tutor by subject, level, and preferences. Check their qualifications and expertise.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Start Learning</h3>
            <p>Effortlessly progress to lessons. Get personalized and creative feedback from your tutor.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Achieve Excellence</h3>
            <p>Master subjects and unlock your true potential with expert guidance. Repeat the process seamlessly.</p>
          </div>
        </div>
      </section>

      {/* Featured Tutors Section */}
      <section className="featured-tutors">
        <div className="section-header">
          <h2>Top Tutors in Kathmandu</h2>
          <p>Highly recommended educators currently available in your area.</p>
        </div>
        <div className="tutors-grid">
          {featuredTutors.map(tutor => (
            <TutorCard key={tutor.id} {...tutor} />
          ))}
        </div>
        <div className="view-all-container">
          <Link to="/find-tutors">
            <button className="secondary-btn">View All Tutors</button>
          </Link>
        </div>
      </section>

      {/* Become a Tutor Section */}
      <section className="become-tutor-section">
        <div className="promo-section">
          <div className="promo-image">
            <img src="/src/public/learning.png" alt="Empowering Tutors" />
          </div>
          <div className="promo-content">
            <h2>Empowering Local Educators</h2>
            <p>Join our community of professional tutors and make a lasting impact on students' lives while growing your career.</p>
            <div className="tutor-benefits">
              <div className="benefit-item">
                <Calendar size={20} color="var(--primary)" />
                <div>
                  <h4>Flexibility</h4>
                  <p>Choose your work hours and schedule sessions according to your availability.</p>
                </div>
              </div>
              <div className="benefit-item">
                <DollarSign size={20} color="var(--primary)" />
                <div>
                  <h4>Set Your Rates</h4>
                  <p>Decide your own fees. No middleman cutting into your hard-earned income.</p>
                </div>
              </div>
              <div className="benefit-item">
                <Globe size={20} color="var(--primary)" />
                <div>
                  <h4>Local & Global Reach</h4>
                  <p>Get discovered by students in your area and expand your impact without limits.</p>
                </div>
              </div>
              <div className="benefit-item">
                <GraduationCap size={20} color="var(--primary)" />
                <div>
                  <h4>Professional Growth</h4>
                  <p>Enhance your communication and problem-solving skills through diverse teaching experiences.</p>
                </div>
              </div>
            </div>
            <button className="primary-btn">Start Teaching Today</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
