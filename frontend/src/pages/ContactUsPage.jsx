import React from "react";
import { BriefcaseBusiness, GraduationCap, Handshake, LifeBuoy } from "lucide-react";
import "./ContactUsPage.css";

const contactCards = [
  {
    title: "General Support",
    description:
      "Need help with your account, bookings, or technical issues? We are here to make your experience smooth and stress-free.",
    email: "support@tutorfinder.com.np",
    note: "We aim to respond within 24hrs",
    Icon: LifeBuoy,
  },
  {
    title: "Student Support",
    description:
      "Questions about lessons, learning, or bookings? We are here to help you learn better, faster, and smarter with clarity every step of the way.",
    email: "students@tutorfinder.com.np",
    Icon: GraduationCap,
  },
  {
    title: "Tutor Support",
    description:
      "Creating a professional profile or need guidance as a tutor? From your first lesson to scaling your impact, we have your back.",
    email: "tutors@tutorfinder.com.np",
    Icon: BriefcaseBusiness,
  },
  {
    title: "Partnership Enquiries",
    description:
      "Partner with TutorFinder to reach a growing education audience. Let us collaborate on promotions, partnerships, and impactful campaigns.",
    email: "partners@tutorfinder.com.np",
    Icon: Handshake,
  },
];

const ContactUsPage = () => {
  return (
    <div className="contact-page">
      <div className="contact-container">
        <header className="contact-header">
          <h1>Contact us</h1>
          <p>
            At TutorFinder, we believe support is not just about solving
            problems — it is about helping you grow with clarity and confidence.
          </p>
        </header>

        <div className="contact-grid">
          {contactCards.map(({ title, description, email, note, Icon }) => (
            <article key={title} className="contact-card">
              <div className="contact-card-icon">
                <Icon size={44} />
              </div>
              <h2>{title}</h2>
              <p>{description}</p>
              <a href={`mailto:${email}`}>{email}</a>
              {note && <em>{note}</em>}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactUsPage;
