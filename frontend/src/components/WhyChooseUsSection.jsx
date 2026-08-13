import React, { useRef } from "react";
import { BadgeCheck, Handshake, ShieldCheck, Clock3 } from "lucide-react";
import useSectionReveal from "../hooks/useSectionReveal";

const cards = [
  {
    title: "Quality First",
    description: "We use premium materials and follow best practices to ensure long lasting quality.",
    icon: BadgeCheck
  },
  {
    title: "Transparent Process",
    description: "Clear communication and regular updates at every stage of your project.",
    icon: Handshake
  },
  {
    title: "On-Time Delivery",
    description: "We respect your time and ensure your project is delivered as promised.",
    icon: Clock3
  },
  {
    title: "Safety Always",
    description: "Safety is our priority. We follow strict protocols to protect our team and your property.",
    icon: ShieldCheck
  }
];

const WhyChooseUsCard = ({ title, description, icon: Icon }) => (
  <article className="why-choose-us-card" data-reveal-item>
    <div className="why-choose-us-card__iconWrap" aria-hidden="true">
      <Icon className="why-choose-us-card__icon" size={38} strokeWidth={2} />
    </div>
    <h3 className="why-choose-us-card__title">{title}</h3>
    <p className="why-choose-us-card__description">{description}</p>
    <span className="why-choose-us-card__line" aria-hidden="true" />
  </article>
);

const WhyChooseUsSection = () => {
  const sectionRef = useRef(null);

  useSectionReveal(sectionRef, {
    introSelector: "[data-reveal-intro]",
    itemSelector: "[data-reveal-item]",
    start: "top 82%",
    introY: 20,
    itemY: 24,
    itemStagger: 0.12
  });

  return (
    <section className="why-choose-us-section" ref={sectionRef}>
      <div className="why-choose-us-section__container">
        <div className="why-choose-us-section__heading" data-reveal-intro>
          <div className="why-choose-us-section__eyebrow" aria-label="Why Choose Us">
            <span className="why-choose-us-section__eyebrowLine" />
            <span>WHY CHOOSE US</span>
            <span className="why-choose-us-section__eyebrowLine" />
          </div>
          <h2 className="why-choose-us-section__title">Your Vision. Our Commitment.</h2>
          <p className="why-choose-us-section__subtitle">
            We focus on what matters most - quality, transparency and results you can trust.
          </p>
        </div>

        <div className="why-choose-us-section__grid">
          {cards.map((card) => (
            <WhyChooseUsCard key={card.title} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;
