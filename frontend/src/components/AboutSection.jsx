import React, { useRef } from "react";
import { ArrowRight, Clock3, Handshake, ShieldCheck, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import useSectionReveal from "../hooks/useSectionReveal";

const features = [
  {
    title: "Quality First",
    description: "We never compromise on the quality of our work.",
    icon: ShieldCheck
  },
  {
    title: "Experienced Team",
    description: "Skilled professionals bringing expertise to every project.",
    icon: UsersRound
  },
  {
    title: "On-Time Delivery",
    description: "We value time and deliver every project as promised.",
    icon: Clock3
  },
  {
    title: "Client Satisfaction",
    description: "Building lasting relationships through trust and transparency.",
    icon: Handshake
  }
];

const AboutFeature = ({ title, description, icon: Icon }) => (
  <article className="about-feature-item" data-reveal-item>
    <div className="about-feature-icon" aria-hidden="true">
      <Icon size={24} strokeWidth={2.1} />
    </div>
    <div className="about-feature-copy">
      <h3 className="about-feature-title">{title}</h3>
      <p className="about-feature-description">{description}</p>
    </div>
  </article>
);

const AboutSection = () => {
  const sectionRef = useRef(null);

  useSectionReveal(sectionRef, {
    introSelector: "[data-reveal-intro]",
    itemSelector: "[data-reveal-item]",
    start: "top 82%",
    introY: 22,
    itemY: 24,
    itemStagger: 0.12
  });

  return (
    <section className="about-section" ref={sectionRef}>
      <div className="about-container">
        <div className="about-grid">
          <div className="about-copy" data-reveal-intro>
            <p className="about-eyebrow">ABOUT US</p>
            <h2 className="about-title">
              <span>Building Trust,</span>
              <span>Delivering Excellence</span>
            </h2>
            <div className="about-accent-line" aria-hidden="true" />
            <p className="about-paragraph">
              Quality Construction delivers reliable, high-quality building solutions for residential, commercial, and industrial projects.
            </p>
            <p className="about-paragraph">
              We focus on excellence, integrity, and client satisfaction to turn ideas into lasting structures.
            </p>
            <Link to="/about" className="about-cta">
              <span>Learn More About Us</span>
              <ArrowRight size={14} strokeWidth={2.4} />
            </Link>
          </div>

          <div className="about-features" aria-label="About us benefits">
            <div className="about-feature-column">
              <AboutFeature {...features[0]} />
              <div className="about-feature-divider" aria-hidden="true" />
              <AboutFeature {...features[2]} />
            </div>
            <div className="about-feature-column">
              <AboutFeature {...features[1]} />
              <div className="about-feature-divider" aria-hidden="true" />
              <AboutFeature {...features[3]} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
