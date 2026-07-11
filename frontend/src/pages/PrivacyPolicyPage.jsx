import React from "react";
import "./PrivacyPolicyPage.css";

const PrivacyPolicyPage = () => {
  return (
    <div className="privacy-page">
      {/* Hero Section */}
      <section className="privacy-hero">
        <div className="privacy-hero-content">
          <h1>Privacy Policy</h1>
          <p>How we collect, use, and protect your information</p>
        </div>
      </section>

      {/* Content Section */}
      <section className="privacy-content">
        <div className="privacy-container">
          <div className="privacy-section">
            <h2>Introduction</h2>
            <p>
              TutorFinder is committed to protecting your privacy. This policy
              explains what information we collect, how we use it, and the
              choices you have — in plain language.
            </p>
            <p>
              This Privacy Policy applies to everyone who uses TutorFinder —
              students, tutors, and visitors — and explains how we collect, use,
              share, and protect your information.
            </p>
          </div>

          <div className="privacy-section">
            <h2>1. Information We Collect</h2>

            <div className="subsection">
              <h3>Account information</h3>
              <p>
                Name, email address, username, and password, used to create and
                manage your account.
              </p>
            </div>

            <div className="subsection">
              <h3>Profile information</h3>
              <p>
                Profile picture, academic background, subjects, and preferences
                — used to power search and matching between students and tutors.
              </p>
            </div>

            <div className="subsection">
              <h3>Verification documents</h3>
              <p>
                For tutors, this includes citizenship/NID and academic
                certificates, submitted for admin review before your profile is
                listed.
              </p>
            </div>

            <div className="subsection">
              <h3>Session & booking data</h3>
              <p>
                Booking history, session status, and in-app chat messages
                between students and tutors, used to run the booking and
                messaging features and resolve any disputes.
              </p>
            </div>

            <div className="subsection">
              <h3>Payment information</h3>
              <p>
                Tutor subscription payments are processed through eSewa/Khalti.
                TutorFinder does not store your card or wallet credentials —
                these are handled directly by our payment partners.
              </p>
            </div>

            <div className="subsection">
              <h3>Technical information</h3>
              <p>
                IP address, device, and browser data, used to keep the platform
                secure, diagnose issues, and prevent fraud.
              </p>
            </div>
          </div>

          <div className="privacy-section">
            <h2>2. How We Use Your Information</h2>
            <ul>
              <li>To connect students with suitable, verified tutors</li>
              <li>To personalize search results and recommendations</li>
              <li>
                To send account, booking, and platform-related communications
              </li>
              <li>To review tutor verification documents</li>
              <li>
                To improve the platform based on usage patterns and feedback
              </li>
              <li>
                For aggregated, anonymized research and analytics — never in a
                way that identifies you individually
              </li>
            </ul>
          </div>

          <div className="privacy-section">
            <h2>3. When We Share Information</h2>

            <div className="subsection">
              <h3>Between students and tutors</h3>
              <p>
                Only what's needed for a booking — name, profile, and session
                details.
              </p>
            </div>

            <div className="subsection">
              <h3>Service providers</h3>
              <p>
                Hosting, analytics, and payment processing partners
                (eSewa/Khalti), who are contractually required to keep your data
                confidential and use it only to provide their service to us.
              </p>
            </div>

            <div className="subsection">
              <h3>Legal requirements</h3>
              <p>
                If required by law, to enforce our Terms, or to respond to a
                valid legal request.
              </p>
            </div>

            <div className="subsection">
              <h3>Business transfers</h3>
              <p>
                If TutorFinder is ever acquired or merged, your information may
                transfer to the new entity, who will remain bound by this
                policy. We'll notify you if this happens.
              </p>
            </div>

            <p className="highlight">
              We do not sell your personal information.
            </p>
          </div>

          <div className="privacy-section">
            <h2>4. Data Security and Retention</h2>
            <p>
              We use industry-standard safeguards — encryption, secure storage,
              and regular security reviews — to protect your data. We keep
              information only as long as needed for the purposes above, or as
              required by law, and delete it securely afterward. Keep your
              account secure: use a strong password and let us know immediately
              if you notice suspicious activity.
            </p>
          </div>

          <div className="privacy-section">
            <h2>5. Cookies</h2>
            <p>
              We use cookies (session, persistent, and limited third-party
              cookies) to keep you logged in, remember preferences, and
              understand how the platform is used. You can manage cookie
              preferences in your account or browser settings.
            </p>
          </div>

          <div className="privacy-section">
            <h2>6. Your Choices</h2>
            <ul>
              <li>
                Update or correct your profile information at any time in your
                account settings
              </li>
              <li>Manage what notifications and emails you receive</li>
              <li>
                Request a copy of your data, or request that we delete it, by
                contacting us (see Section 10)
              </li>
            </ul>
          </div>

          <div className="privacy-section">
            <h2>7. Children's Privacy</h2>
            <p>
              TutorFinder's platform is intended for use by individuals 18 and
              older. Students under 18 may use the platform only with a parent
              or guardian managing their account and consenting on their behalf.
              We do not knowingly collect personal information directly from
              children without such consent, and tutors working with minors are
              held to the additional standards set out in our Community
              Guidelines.
            </p>
          </div>

          <div className="privacy-section">
            <h2>8. Changes to This Policy</h2>
            <p>
              If we make material changes to this policy, we'll notify you
              through the platform. Continuing to use TutorFinder after an
              update means you accept the revised policy.
            </p>
          </div>

          <div className="privacy-section">
            <h2>9. Contact Us</h2>
            <p>
              Questions, concerns, or requests about your data can be sent to{" "}
              <a href="mailto:support@tutorfinder.com.np">
                <strong>support@tutorfinder.com.np</strong>
              </a>
              . We'll respond to access, correction, or deletion requests within
              a reasonable time.
            </p>
          </div>

          <div className="privacy-section">
            <h2>10. Governing Law</h2>
            <p>
              This policy is governed by the laws of Nepal. Any disputes about
              how we handle your data will first go through direct resolution
              with our support team before any other proceedings.
            </p>
          </div>

          <div className="privacy-section privacy-footer">
            <p className="last-updated">Last updated: 2026</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicyPage;
