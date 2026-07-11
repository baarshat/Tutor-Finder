import React from "react";
import "./TermsAndConditionsPage.css";

const TermsAndConditionsPage = () => {
  return (
    <div className="terms-page">
      {/* Hero Section */}
      <section className="terms-hero">
        <div className="terms-hero-content">
          <h1>Terms and Conditions</h1>
          <p>Community Guidelines, Terms of Service & Privacy Policy</p>
        </div>
      </section>

      {/* Content Section */}
      <section className="terms-content">
        <div className="terms-container">
          {/* Community Guidelines */}
          <div className="terms-section">
            <h2>Community Guidelines</h2>
            <p>
              We maintain a community of reliable, verified, and trustworthy
              tutors and students. Everyone on TutorFinder is expected to follow
              these guidelines. TutorFinder may suspend or deactivate any
              account found in breach of them.
            </p>

            <div className="subsection">
              <h3>1. Requirements to be listed as a tutor</h3>
              <p>Tutors should meet at least one of the following:</p>
              <ul>
                <li>
                  A strong academic track record (distinctions or first division
                  at tertiary level)
                </li>
                <li>A relevant teaching qualification</li>
                <li>A relevant Bachelor's degree (completed or in progress)</li>
                <li>
                  1+ years of relevant tutoring, teaching, or coaching
                  experience
                </li>
              </ul>
              <p>
                <strong>Working with minors:</strong> Tutors teaching students
                under 18 must be able to demonstrate a trustworthy history
                working with children and, where applicable, hold a valid
                teaching registration. All tutor documents (citizenship/NID and
                certificates) are reviewed and verified by our admin team before
                a profile goes live.
              </p>
            </div>

            <div className="subsection">
              <h3>2. Staying on TutorFinder</h3>
              <ul>
                <li>
                  <strong>Messaging:</strong> Communicate only through
                  TutorFinder's in-app messaging. Don't share personal contact
                  details off-platform — this protects your safety and lets us
                  support you if something goes wrong.
                </li>
                <li>
                  <strong>Responsiveness:</strong> Reply to enquiries promptly,
                  even just to say you're unavailable.
                </li>
                <li>
                  <strong>Reliability:</strong> Honor scheduled sessions, give
                  notice of any changes, and avoid last-minute cancellations.
                </li>
                <li>
                  <strong>Booking:</strong> All sessions should be scheduled and
                  tracked through the platform so both parties have a clear
                  record.
                </li>
              </ul>
            </div>

            <div className="subsection">
              <h3>3. Protecting private information</h3>
              <p>
                Don't post contact details (phone numbers, emails, social
                profiles, external links) anywhere public on the platform,
                including in your profile. Physical addresses should only be
                shared privately, and only if a session is happening in person
                at a user's home.
              </p>
            </div>

            <div className="subsection">
              <h3>4. Pricing and payments</h3>
              <ul>
                <li>
                  <strong>Minimum rate:</strong> Rs. 100/hour, except for a free
                  first session both parties agree to.
                </li>
                <li>
                  <strong>Rates shown are indicative</strong> and may vary by
                  subject, level, location, and delivery mode
                  (online/in-person).
                </li>
                <li>
                  Tutors may update their rate for new students at any time, but
                  should not change rates for existing students without
                  discussing it with them first, and no more than once a year.
                </li>
                <li>
                  TutorFinder does not take a commission on session fees. Tutors
                  pay a flat annual subscription to be listed and verified on
                  the platform. Session payments between students and tutors are
                  arranged directly; TutorFinder integrates with{" "}
                  <strong>eSewa</strong> to process
                  the tutor subscription fee securely.
                </li>
              </ul>
            </div>

            <div className="subsection">
              <h3>5. Behavior and conduct</h3>
              <ul>
                <li>
                  Be respectful in all interactions — in messages, sessions,
                  profiles, and reviews. No harassment, discrimination, or
                  hateful conduct.
                </li>
                <li>
                  <strong>Reviews must be genuine.</strong> Don't use reviews to
                  inflate or damage a profile artificially; TutorFinder may
                  remove reviews that violate this.
                </li>
                <li>
                  Don't use TutorFinder for anything other than connecting
                  students and tutors — no lead generation, spam, promotion of
                  other businesses, or illegal activity.
                </li>
                <li>
                  No use of, promotion of, or being under the influence of
                  alcohol or drugs in connection with tutoring on the platform.
                </li>
              </ul>
            </div>

            <div className="subsection">
              <h3>6. Reputation</h3>
              <p>
                Everyone should aim to make tutoring a positive, productive
                experience. Accounts that repeatedly create a poor experience
                for others — tutors or students — may be restricted or removed
                at TutorFinder's discretion.
              </p>
            </div>

            <div className="subsection">
              <h3>7. Profile accuracy</h3>
              <p>
                Use your real identity and keep your profile — subjects,
                experience, rates, and availability — accurate and up to date.
                If you're a tutor no longer taking new students, please let us
                know.
              </p>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="terms-section">
            <h2>Terms and Conditions</h2>

            <div className="subsection">
              <h3>1. About</h3>
              <p>
                TutorFinder operates an online platform connecting Students with
                Tutors who provide independent Tutoring Services. These Terms,
                together with our Community Guidelines and Privacy Policy,
                govern your use of the platform.
              </p>
            </div>

            <div className="subsection">
              <h3>2. Our Service</h3>
              <ul>
                <li>
                  Creating an account is free for both Students and Tutors.
                </li>
                <li>TutorFinder does not charge commission on session fees.</li>
                <li>
                  Tutors pay an annual subscription to be listed and verified.
                </li>
                <li>
                  Students can search, message, and book Tutors directly through
                  the platform. Once a Student and Tutor agree on price, date,
                  time, and location, the Tutor is responsible for confirming
                  the session on TutorFinder.
                </li>
              </ul>
            </div>

            <div className="subsection">
              <h3>3. Tutors and Tutoring Services</h3>
              <ul>
                <li>
                  Tutors are independent providers, not employees, agents, or
                  contractors of TutorFinder. Any Tutoring Services are provided
                  directly by the Tutor, not by TutorFinder.
                </li>
                <li>
                  TutorFinder applies minimum listing standards (see Community
                  Guidelines) and may reject or remove any Tutor at its
                  discretion, but does not guarantee it has independently
                  verified every credential a Tutor claims. Users are
                  responsible for their own diligence — including any additional
                  background checks — before engaging a Tutor.
                </li>
                <li>
                  By listing on TutorFinder, Tutors represent that all
                  information on their profile is true and complete, that
                  they're legally entitled to provide the services offered, and
                  that they will meet their own tax obligations in Nepal in
                  relation to income earned through the platform.
                </li>
                <li>
                  TutorFinder makes no guarantee of lesson volume, platform
                  uptime, or the accuracy of Tutor-reported credentials, and
                  accepts no liability for the quality, delivery, or outcome of
                  Tutoring Services themselves.
                </li>
              </ul>
            </div>

            <div className="subsection">
              <h3>4. TutorFinder's role</h3>
              <p>
                Agreements for Tutoring Services are made directly between
                Student and Tutor. TutorFinder is not a party to that agreement
                and is not responsible for either party's conduct within it,
                though we may assist with disputes at our discretion (see
                Section 9).
              </p>
            </div>

            <div className="subsection">
              <h3>5. Fees and payment</h3>
              <ul>
                <li>Students are not charged a platform fee.</li>
                <li>
                  Tutors pay a fixed annual subscription (via eSewa/Khalti) to
                  remain listed and verified; no per-session commission applies.
                </li>
                <li>
                  Session prices are agreed directly between Student and Tutor
                  and paid by whatever method they agree on.
                </li>
                <li>
                  Tutors must not charge additional fees outside the agreed
                  session price without the Student's agreement.
                </li>
              </ul>
            </div>

            <div className="subsection">
              <h3>6. Cancellations</h3>
              <ul>
                <li>
                  Students may cancel a scheduled session at no charge with at
                  least 24 hours' notice.
                </li>
                <li>
                  Cancellations with less than 24 hours' notice may still be
                  charged, at the Tutor's discretion.
                </li>
                <li>
                  A Tutor may cancel and reschedule at any time but should give
                  as much notice as possible.
                </li>
                <li>
                  A Student is never liable for a cancellation caused by the
                  Tutor (e.g., a no-show or lateness of 10+ minutes).
                </li>
                <li>
                  Disputed cancellations or refunds should first be resolved
                  directly between Student and Tutor; TutorFinder may assist if
                  needed.
                </li>
              </ul>
            </div>

            <div className="subsection">
              <h3>7. User obligations</h3>
              <p>All users agree to:</p>
              <ul>
                <li>
                  Provide accurate information and keep their profile up to date
                </li>
                <li>
                  Be at least 18, or have a parent/guardian manage their account
                  if younger
                </li>
                <li>Keep their account secure and not share or transfer it</li>
                <li>
                  Use the platform only for its intended purpose — finding or
                  providing tutoring, not for academic dishonesty (e.g., asking
                  a Tutor to complete assignments on a Student's behalf), spam,
                  solicitation, or unlawful activity
                </li>
                <li>
                  Not attempt to bypass the platform to arrange tutoring
                  off-platform in a way that avoids TutorFinder's verification
                  and safety protections
                </li>
              </ul>
            </div>

            <div className="subsection">
              <h3>8. No bypassing the platform</h3>
              <p>
                Soliciting a Tutor met through TutorFinder to provide services
                outside the platform — in a way that competes with or bypasses
                TutorFinder — is not allowed and may result in account
                suspension.
              </p>
            </div>

            <div className="subsection">
              <h3>9. Reviews</h3>
              <p>
                Users may leave honest reviews after a session. TutorFinder may
                remove reviews that are defamatory, fraudulent, or otherwise
                violate these Terms.
              </p>
            </div>

            <div className="subsection">
              <h3>10. Intellectual property & confidentiality</h3>
              <p>
                TutorFinder retains all rights to its own platform and branding.
                Any confidential information shared through the platform must
                not be disclosed to third parties without permission.
              </p>
            </div>

            <div className="subsection">
              <h3>11. Privacy</h3>
              <p>
                Our collection and use of personal information is governed by
                our Privacy Policy, incorporated into these Terms by reference.
                Contact information and in-app messaging must only be used for
                arranging tutoring — not for any other purpose.
              </p>
            </div>

            <div className="subsection">
              <h3>12. Termination</h3>
              <p>
                Either party may terminate an account at any time. Termination
                doesn't cancel any existing agreement already made directly
                between a Student and Tutor. Provisions relating to disputes,
                liability, IP, privacy, and confidentiality survive termination.
              </p>
            </div>

            <div className="subsection">
              <h3>13. Liability</h3>
              <p>
                To the extent permitted by law, TutorFinder is not liable for
                losses arising from the interaction, agreements, or outcomes
                between Students and Tutors, and does not guarantee any
                particular academic result from using the platform.
                TutorFinder's liability, where it exists, is limited to fees
                actually paid to TutorFinder. No claim may be brought against
                TutorFinder more than two years after it arises.
              </p>
            </div>

            <div className="subsection">
              <h3>14. Academic integrity</h3>
              <p>
                TutorFinder exists to support genuine learning. Using the
                platform to complete assignments, exams, or coursework on a
                Student's behalf is prohibited and may violate the academic
                policies of your school or institution.
              </p>
            </div>

            <div className="subsection">
              <h3>15. Dispute resolution</h3>
              <p>
                Users are encouraged to resolve disputes directly. If that
                fails, either party may ask TutorFinder to help mediate;
                TutorFinder may make a reasonable determination based on the
                information provided, but users remain free to pursue the matter
                in court.
              </p>
            </div>

            <div className="subsection">
              <h3>16. Changes to these Terms</h3>
              <p>
                TutorFinder may update these Terms from time to time. Continued
                use of the platform after an update means you accept the revised
                Terms. If you disagree with a change, you may close your
                account.
              </p>
            </div>

            <div className="subsection">
              <h3>17. Governing law</h3>
              <p>
                These Terms are governed by the laws of Nepal, and any dispute
                is subject to the non-exclusive jurisdiction of the courts of
                Nepal.
              </p>
            </div>

            <div className="subsection">
              <h3>18. General</h3>
              <p>
                If any part of these Terms is found unenforceable, the rest
                remains in effect. These Terms, together with our Community
                Guidelines and Privacy Policy, form the entire agreement between
                you and TutorFinder.
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="terms-section terms-contact">
            <p>
              <strong>Questions?</strong> Contact us at{" "}
              <a href="mailto:support@tutorfinder.com.np">
                support@tutorfinder.com.np
              </a>
            </p>
            <p className="last-updated">Last updated: 2026</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TermsAndConditionsPage;
