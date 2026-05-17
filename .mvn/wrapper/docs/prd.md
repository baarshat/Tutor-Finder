PRODUCT REQUIREMENTS DOCUMENT
Online Tutor Finder: A Location-Based Tutor Discovery Platform

Document Title
Online Tutor Finder - PRD
Version
1.0
Date
May 2026
Status
In Development


1. Executive Summary
Online Tutor Finder is a location-based web platform that connects parents, students, and verified tutors in Nepal. The platform addresses the fragmented tutoring market by providing a centralized marketplace with transparent pricing, verified credentials, integrated reviews, and intelligent recommendations.
Problem Statement
Nepal lacks a centralized platform for discovering qualified tutors
Parents cannot verify tutor qualifications or compare pricing transparently
Tutors lack visibility and cannot build a professional digital presence
Students have no systematic way to find quality tutors matching their needs
Solution Overview
A three-tier marketplace platform enabling:
Location-based tutor discovery with proximity search
Admin-verified tutor profiles with credentials
Integrated review and rating system
Personalized tutor recommendations
Local payment gateway integration (eSewa/Khalti)
2. Product Vision & Goals
Vision
To become Nepal's trusted, centralized marketplace connecting quality tutors with students seeking supplementary education, establishing professional standards in the private tutoring sector.
Goals
Eliminate information asymmetry in Nepal's tutoring market
Enable verified tutors to reach students beyond their local networks
Provide transparent pricing and comparable tutor profiles
Build trust through admin verification and community reviews
Create sustainable revenue model through tutor subscription fees
3. Target Users & User Personas
3.1 Primary User Groups
A. Parents & Students
Seeking supplementary tutoring in specific subjects
Prefer in-person, local tuition services
Want transparent pricing and verified credentials
Located in urban and semi-urban areas of Nepal
B. Independent Tutors
Seeking to expand student base beyond current networks
Want to establish professional credibility
Willing to pay annual subscription for visibility
Have verifiable qualifications and experience
C. Platform Administrators
Verify tutor credentials and manage quality
Monitor platform activity and user interactions
Generate platform analytics and insights
Manage payments and platform sustainability
3.2 Target Market Segments
Secondary school students (Class 1-10)
Higher secondary students (+2)
Students preparing for competitive entrance exams
Urban and semi-urban areas across Nepal
4. Core Features & Functional Requirements
4.1 Parent/Student Features
User Registration & Profile
Register with email and phone verification
Create and manage student profile (name, class, subjects)
Set location preferences for local tutor search
Tutor Search & Discovery
Search tutors by location (proximity-based)
Filter by subject, curriculum (NEB/Cambridge/IB), experience level
View tutor profiles with qualifications and hourly rates
See 'Verified' badge for approved tutors
Receive personalized tutor recommendations
Reviews & Ratings
Submit star ratings (1-5) after session completion
Write detailed review feedback
View tutor review history and average rating
Session Management
Send messages to tutors
Book tutoring sessions
Track session history
4.2 Tutor Features
Registration & Verification
Register with email, phone, and location
Submit qualification documents for admin verification
Display 'Verified' badge upon admin approval
Profile Management
Create comprehensive profile (subjects, experience, qualifications)
Set hourly rates for different subjects
Define service area (geographic coverage)
Update availability and specializations
Subscription & Payment
Pay annual platform subscription fee
Local payment gateway integration (eSewa/Khalti)
Track subscription status and renewal dates
Student Communication & Management
Send and receive messages from students
Manage session bookings
View student feedback and ratings
4.3 Admin Features
Verification Dashboard
Review tutor credential submissions
Approve or reject verification requests
Track verification status and history
Platform Management
Monitor platform activity and user metrics
Manage user accounts and access
Content moderation and review management
View analytics (registrations, searches, engagement)
Financial Management
Track subscription payments
Generate revenue reports
Manage payment gateway reconciliation
5. Technical Architecture
5.1 System Architecture
Three-tier architecture with React.js frontend, Java Spring Boot backend, and MySQL database. Google Maps API integrated for location services.
5.2 Technology Stack
Layer
Technology
Purpose
Frontend
React.js
Component-based UI development


Tailwind CSS
Responsive styling


Google Maps API
Location services and mapping


WhatsApp API
In-app messaging


Calendly API
Session scheduling
Backend
Java + Spring Boot
RESTful API development


JWT + 2FA
Authentication and security


eSewa / Khalti API
Payment processing
Database
MySQL
Relational data storage


Postman
API testing and documentation
Tools
Git & GitHub
Version control


Figma
UI/UX design


VS Code / Spring Tool Suite
Development IDE


5.3 Key Integrations
Google Maps API - Location-based search and map visualization
eSewa & Khalti - Local payment gateway for subscriptions
WhatsApp API - Direct messaging between users
Calendly API - Scheduling and session management
6. Key User Workflows
6.1 Student Finding a Tutor
Student creates account and sets location
Searches for tutors by location, subject, curriculum, price
Reviews tutor profile, qualifications, and ratings
Sends message or books session
Leaves review and rating after session
6.2 Tutor Registration & Verification
Tutor registers with email, phone, and location
Submits qualification documents (certificates, ID)
Admin reviews and approves/rejects credentials
Tutor completes profile with subjects, rates, availability
Tutor pays annual subscription via eSewa/Khalti
Profile goes live with 'Verified' badge
6.3 Admin Verification Process
Admin logs into verification dashboard
Reviews pending tutor credential submissions
Verifies document authenticity and qualifications
Approves tutor and grants 'Verified' badge
Tutor profile becomes visible to students
7. Success Metrics & KPIs
7.1 User Growth
Number of registered students/parents
Number of registered and verified tutors
Monthly active users
Geographic coverage (number of cities/areas)
7.2 Engagement
Number of tutor searches per month
Number of session bookings
Average rating given to tutors
Review submission rate
7.3 Quality & Trust
Tutor verification completion rate
Average tutor rating (should be > 4.0)
Number of verified tutors
User satisfaction score
7.4 Revenue
Annual subscription revenue
Subscription renewal rate
Average revenue per tutor
Cost per acquisition
8. Non-Functional Requirements
Security
JWT-based authentication for all API endpoints
Two-factor authentication (2FA) for admin accounts
HTTPS for all data transmission
Password hashing with salting
Role-based access control (RBAC) for three user types
Performance
API response time < 500ms for 95th percentile
Database queries optimized with indexing
Proximity search within 10km radius < 1 second
Mobile-responsive design for all user roles
Availability
99% uptime SLA
Daily automated backups
Disaster recovery plan with RTO < 4 hours
Scalability
Horizontal scaling for web servers
Database connection pooling
Caching layer for frequently accessed data
Support for 100,000+ concurrent users
Compliance
GDPR-compliant data privacy policies
Regular security audits and penetration testing
Clear terms of service and privacy policy
9. Release Roadmap
Phase 1 (MVP) - Months 1-3
Core user authentication (student, tutor, admin)
Tutor profile creation and document upload
Admin verification dashboard
Basic location-based search
Google Maps integration
eSewa payment integration
Basic messaging between users
Phase 2 (v1.0) - Months 4-6
Advanced search filters (subject, curriculum, price)
Review and rating system
Session booking system
Khalti payment integration
Tutor recommendations
Platform analytics and admin dashboards
Phase 3 (v2.0) - Months 7+
Advanced recommendation engine (ML-based)
Mobile application (iOS/Android)
Video consultation support (optional)
Expanded payment gateway options
National expansion and localization
10. Constraints & Assumptions
Constraints
Platform supports physical in-person tutoring only
Tutor subscription model requires payment for visibility
Admin manual verification of tutor credentials
Limited to Nepal's current digital payment infrastructure
Focuses on school-level education (Class 1 to +2)
Assumptions
Parents/students have access to internet and smartphones
Tutors willing to pay annual subscription fee
Sufficient tutor supply in initial launch cities
Users actively participate in review and rating system
Google Maps API and payment gateways remain available
--- End of Document ---
