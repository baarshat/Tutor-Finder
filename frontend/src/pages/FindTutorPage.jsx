import React, { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import TutorCard from '../components/TutorCard';
import './FindTutorPage.css';

const MOCK_TUTORS = [
  { id: 1, name: 'Sanjay Sharma', subjects: ['Mathematics', 'Physics'], rating: 4.8, reviews: 124, hourlyRate: 800, location: 'Kathmandu' },
  { id: 2, name: 'Anjali Karki', subjects: ['English', 'Literature'], rating: 4.9, reviews: 89, hourlyRate: 600, location: 'Lalitpur' },
  { id: 3, name: 'Rabin Shrestha', subjects: ['Chemistry', 'Biology'], rating: 4.7, reviews: 56, hourlyRate: 750, location: 'Bhaktapur' },
  { id: 4, name: 'Pooja Thapa', subjects: ['Computer Science', 'Programming'], rating: 5.0, reviews: 210, hourlyRate: 1000, location: 'Online' },
  { id: 5, name: 'Bikash Rai', subjects: ['Economics', 'Accounting'], rating: 4.6, reviews: 45, hourlyRate: 700, location: 'Kathmandu' },
  { id: 6, name: 'Sunita Gurung', subjects: ['Mathematics', 'Science'], rating: 4.8, reviews: 112, hourlyRate: 650, location: 'Pokhara' },
];

const FindTutorPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTutors = MOCK_TUTORS.filter(tutor => 
    tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tutor.subjects.some(sub => sub.toLowerCase().includes(searchTerm.toLowerCase())) ||
    tutor.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="find-tutor-page">
      {/* Search Header Banner */}
      <div className="search-banner">
        <div className="search-banner-content">
          <div className="search-text">
            <h1>Find Your Perfect Tutor</h1>
            <p>Search by subject, location, or tutor name to start learning today.</p>
            
            <div className="search-bar-container">
              <div className="search-input-wrapper">
                <Search className="search-icon" size={20} color="#9ca3af" />
                <input 
                  type="text" 
                  placeholder="What do you want to learn?" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="primary-btn search-btn">Search</button>
            </div>
          </div>
          <div className="search-illustration">
            <img src="/src/public/find tutor.png" alt="Find Tutor" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="find-tutor-content">
        {/* Filters Sidebar */}
        <aside className="filters-sidebar">
          <div className="filter-header">
            <h3>Filters</h3>
            <SlidersHorizontal size={20} />
          </div>
          
          <div className="filter-group">
            <h4>Subject</h4>
            <label className="checkbox-label"><input type="checkbox" /> Mathematics</label>
            <label className="checkbox-label"><input type="checkbox" /> Science</label>
            <label className="checkbox-label"><input type="checkbox" /> English</label>
            <label className="checkbox-label"><input type="checkbox" /> Computer Science</label>
          </div>
          
          <div className="filter-group">
            <h4>Location</h4>
            <label className="checkbox-label"><input type="checkbox" /> Online</label>
            <label className="checkbox-label"><input type="checkbox" /> Kathmandu</label>
            <label className="checkbox-label"><input type="checkbox" /> Lalitpur</label>
          </div>
          
          <div className="filter-group">
            <h4>Price Range</h4>
            <input type="range" min="0" max="2000" className="price-slider" />
            <div className="price-labels">
              <span>NPR 0</span>
              <span>NPR 2000+</span>
            </div>
          </div>
        </aside>

        {/* Results Area */}
        <main className="results-area">
          <div className="results-header">
            <h2>{filteredTutors.length} Tutors Available</h2>
            <select className="sort-select">
              <option>Recommended</option>
              <option>Highest Rated</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>
          
          <div className="tutors-grid">
            {filteredTutors.map(tutor => (
              <TutorCard key={tutor.id} {...tutor} />
            ))}
          </div>
          
          {filteredTutors.length === 0 && (
            <div className="no-results">
              <h3>No tutors found</h3>
              <p>Try adjusting your search or filters to find what you're looking for.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default FindTutorPage;
