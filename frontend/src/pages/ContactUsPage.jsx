import React from "react";
import {
  Mail,
  Headphones,
  Users,
  Building2,
  MessageCircle,
} from "lucide-react";
import "./ContactUsPage.css";

const ContactUsPage = () => {
  const contactChannels = [
    {
      id: 1,
      icon: Headphones,
      title: "General Support",
      description:
        "Need help with your account, bookings, or technical issues? We're here to make your experience smooth and stress-free.",
      email: "support@tutorfinder.com.np",
      note: "We aim to respond within 24 hrs",
    },
    {
      id: 2,
      icon: Users,
      title: "Student Support",
      description:
        "Questions about lessons, learning, or bookings? We're here to help you learn better, faster, and with more clarity — every step of the way.",
      email: "students@tutorfinder.com.np",
    },
    {
      id: 3,
      icon: MessageCircle,
      title: "Tutor Support",
      description:
        "Building your profile or need guidance as a tutor? From your first booking to growing your student base, we've got your back.",
      email: "tutors@tutorfinder.com.np",
    },
  ];

  return (
    <div className="contact-us-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="contact-hero-content">
          <h1>Contact Us</h1>
          <p>
            At TutorFinder, we believe support isn't just about solving problems
            - it's about helping you grow with clarity and confidence.
          </p>
        </div>
      </section>

      {/* Contact Channels Section */}
      <section className="contact-channels">
        <div className="channels-container">
          {contactChannels.map((channel) => {
            const IconComponent = channel.icon;
            return (
              <div key={channel.id} className="contact-card">
                <div className="card-icon">
                  <IconComponent size={48} strokeWidth={1.5} />
                </div>
                <h3>{channel.title}</h3>
                <p className="card-description">{channel.description}</p>
                <div className="contact-email">
                  <Mail size={18} />
                  <a href={`mailto:${channel.email}`}>{channel.email}</a>
                </div>
                {channel.note && (
                  <p className="contact-note">{channel.note}</p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Additional Info Section */}
      <section className="contact-additional">
        <div className="additional-content">
          <h2>Have Questions?</h2>
          <p>
            We're committed to providing exceptional support. Choose the channel that best
            matches your query, and we'll get back to you as soon as possible.
          </p>
        </div>
      </section>
    </div>
  );
};

export default ContactUsPage;
