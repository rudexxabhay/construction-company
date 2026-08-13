import React, { useRef } from "react";
import { ArrowRight, Building2, ClipboardCheck, Home, Paintbrush } from "lucide-react";
import { Link } from "react-router-dom";
import useSectionReveal from "../hooks/useSectionReveal";

const cards = [
  {
    number: "01",
    title: ["Residential", "Construction"],
    description: "Creating dream homes with precision, quality and care.",
    icon: Home
  },
  {
    number: "02",
    title: ["Commercial", "Construction"],
    description: "Delivering functional and sustainable spaces for businesses.",
    icon: Building2
  },
  {
    number: "03",
    title: ["Renovation &", "Remodeling"],
    description: "Transforming spaces with modern designs and superior finishes.",
    icon: Paintbrush
  },
  {
    number: "04",
    title: ["Project", "Supervision"],
    description: "Keeping every stage on track with quality checks and updates.",
    icon: ClipboardCheck
  }
];

const ServiceCard = ({ number, title, description, icon: Icon }) => (
  <article className="services-showcase-card" data-reveal-item>
    <span className="services-showcase-card__badge">{number}</span>
    <div className="services-showcase-card__iconWrap" aria-hidden="true">
      <span className="services-showcase-card__accent" />
      <Icon className="services-showcase-card__icon" size={58} strokeWidth={2} />
    </div>
    <h3 className="services-showcase-card__title">
      {title.map((line) => (
        <span key={line}>{line}</span>
      ))}
    </h3>
    <p className="services-showcase-card__description">{description}</p>
    <Link to="/services" className="services-showcase-card__link">
      <span>Learn More</span>
      <ArrowRight size={12} strokeWidth={2.4} />
    </Link>
  </article>
);

const ServicesShowcase = () => {
  const sectionRef = useRef(null);

  useSectionReveal(sectionRef, {
    introSelector: "[data-reveal-intro]",
    itemSelector: "[data-reveal-item]",
    start: "top 82%",
    introY: 20,
    itemY: 26,
    itemStagger: 0.12
  });

  return (
    <section className="services-showcase" ref={sectionRef}>
      <div className="services-showcase__container">
        <div className="services-showcase__header" data-reveal-intro>
          <div className="services-showcase__headingGroup">
            <p className="services-showcase__eyebrow">WHAT WE DO</p>
            <h2 className="services-showcase__title">Our Services</h2>
          </div>
          <Link to="/services" className="services-showcase__cta">
            <span>View All Services</span>
            <ArrowRight size={13} strokeWidth={2.5} />
          </Link>
        </div>

        <div className="services-showcase__row">
          <div className="services-showcase__grid">
            {cards.map((card) => (
              <ServiceCard key={card.number} {...card} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesShowcase;
