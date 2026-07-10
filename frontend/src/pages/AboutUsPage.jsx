import React from "react";
import "./LegalInfoPage.css";

const AboutUsPage = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1>About Us</h1>
        <p className="legal-subtitle">
          Transforming Nepal&apos;s education with trusted, local connections
        </p>

        <section>
          <h2>Connecting learners &amp; educators</h2>
          <p>
            TutorFinder is a location-based learning platform that connects
            students across Nepal with verified, qualified tutors for
            personalized 1-on-1 learning. We&apos;re making quality education
            easier to find and access, helping students grow academically while
            giving tutors a trusted platform to share their expertise and earn a
            fair living.
          </p>
        </section>

        <section>
          <h2>Community-built trust</h2>
          <p>
            TutorFinder is built on transparency: every tutor is verified, every
            session is trackable, and every review is honest. This shared
            accountability between students and tutors is what makes learning on
            our platform effective, safe, and sustainable.
          </p>
        </section>

        <section>
          <h2>Our journey</h2>
          <p>
            Education should be a right, not a privilege — and finding the right
            tutor shouldn&apos;t depend on who you happen to know. TutorFinder
            replaces word-of-mouth guesswork with a searchable, verified
            marketplace where students choose tutors based on subject, location,
            price, and real reviews.
          </p>
          <p>
            We also stand firmly behind tutors. Many talented educators in Nepal
            struggle to find consistent, fairly paid work despite years of
            experience. TutorFinder gives them visibility, a secure way to get
            paid, and room to grow professionally — because empowering tutors is
            how we empower students.
          </p>
        </section>

        <section>
          <h2>Our impact</h2>
          <p>
            We believe that lifting one student or one tutor creates a ripple
            effect across families and communities. Every verified match on
            TutorFinder is a small step toward a more accessible, more
            trustworthy education system — one where opportunity depends on
            effort, not connections.
          </p>
        </section>
      </div>
    </div>
  );
};

export default AboutUsPage;
