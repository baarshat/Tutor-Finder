import React from "react";
import "./LegalInfoPage.css";

const PrivacyPolicyPage = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1>Privacy Policy</h1>
        <p className="legal-subtitle">
          TutorFinder is committed to protecting your privacy. This policy
          explains what information we collect, how we use it, and the choices
          you have.
        </p>

        <section>
          <h2>1. Introduction</h2>
          <p>
            This Privacy Policy applies to everyone who uses TutorFinder —
            students, tutors, and visitors — and explains how we collect, use,
            share, and protect your information.
          </p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>
          <p>
            <strong>Account information:</strong> Name, email address, username,
            and password to create and manage your account.
          </p>
          <p>
            <strong>Profile information:</strong> Profile picture, academic
            background, subjects, and preferences.
          </p>
          <p>
            <strong>Verification documents:</strong> For tutors, citizenship/NID
            and academic certificates submitted for admin review.
          </p>
          <p>
            <strong>Session &amp; booking data:</strong> Booking history, session
            status, and in-app chat messages.
          </p>
          <p>
            <strong>Payment information:</strong> Tutor subscription payments are
            processed through eSewa/Khalti. TutorFinder does not store your card
            or wallet credentials.
          </p>
          <p>
            <strong>Technical information:</strong> IP address, device, and
            browser data for security and fraud prevention.
          </p>
        </section>

        <section>
          <h2>3. How We Use Your Information</h2>
          <ul>
            <li>To connect students with suitable, verified tutors</li>
            <li>To personalize search results and recommendations</li>
            <li>To send account, booking, and platform communications</li>
            <li>To review tutor verification documents</li>
            <li>To improve the platform using usage patterns and feedback</li>
            <li>
              For aggregated, anonymized analytics and research that do not
              identify individuals
            </li>
          </ul>
        </section>

        <section>
          <h2>4. When We Share Information</h2>
          <ul>
            <li>
              <strong>Between students and tutors:</strong> Only information
              needed for booking and sessions.
            </li>
            <li>
              <strong>Service providers:</strong> Hosting, analytics, and payment
              partners under confidentiality obligations.
            </li>
            <li>
              <strong>Legal requirements:</strong> If required by law or to
              enforce our Terms.
            </li>
            <li>
              <strong>Business transfers:</strong> In case of acquisition or
              merger, with notice to users.
            </li>
          </ul>
          <p>We do not sell your personal information.</p>
        </section>

        <section>
          <h2>5. Data Security and Retention</h2>
          <p>
            We use industry-standard safeguards, including encryption, secure
            storage, and regular security reviews. We retain data only as long as
            necessary for legitimate purposes or as required by law.
          </p>
        </section>

        <section>
          <h2>6. Cookies</h2>
          <p>
            We use cookies to keep you logged in, remember preferences, and
            understand platform usage. You can manage cookie preferences in your
            account or browser settings.
          </p>
        </section>

        <section>
          <h2>7. Your Choices</h2>
          <ul>
            <li>Update or correct your profile information at any time</li>
            <li>Manage notifications and emails</li>
            <li>
              Request a copy of your data, or request deletion, by contacting us
            </li>
          </ul>
        </section>

        <section>
          <h2>8. Children&apos;s Privacy</h2>
          <p>
            TutorFinder is intended for users 18 and older. Students under 18 may
            use the platform only with parent/guardian management and consent.
          </p>
        </section>

        <section>
          <h2>9. Changes to This Policy</h2>
          <p>
            If we make material changes, we will notify you through the platform.
            Continuing to use TutorFinder means you accept the revised policy.
          </p>
        </section>

        <section>
          <h2>10. Contact Us</h2>
          <p>
            Questions, concerns, or requests can be sent to{" "}
            <a href="mailto:support@tutorfinder.com.np">
              support@tutorfinder.com.np
            </a>
            .
          </p>
        </section>

        <section>
          <h2>11. Governing Law</h2>
          <p>
            This policy is governed by the laws of Nepal. Any disputes about data
            handling should first go through direct resolution with our support
            team.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
