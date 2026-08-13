import React, { useRef } from "react";
import { House, MessagesSquare, PencilRuler, Construction } from "lucide-react";
import useSectionReveal from "../hooks/useSectionReveal";

const steps = [
  {
    number: "01",
    title: "Consult & Plan",
    description:
      "We listen to your ideas, understand your needs, and create a smart plan that fits your vision and budget.",
    icon: MessagesSquare
  },
  {
    number: "02",
    title: "Design & Prepare",
    description:
      "Our team creates detailed designs and prepares everything needed to start the project the right way.",
    icon: PencilRuler
  },
  {
    number: "03",
    title: "Build & Execute",
    description:
      "We bring plans to life with skilled workmanship, quality materials, and strict attention to detail.",
    icon: Construction
  },
  {
    number: "04",
    title: "Deliver & Support",
    description:
      "We complete the project on time and ensure everything is perfect, even after handover.",
    icon: House
  }
];

const ProcessCard = ({ number, title, description, icon: Icon }) => (
  <article className="process-card" data-reveal-item>
    <span className="process-card__badge">{number}</span>
    <div className="process-card__iconWrap" aria-hidden="true">
      <span className="process-card__accent" />
      <Icon className="process-card__icon" size={34} strokeWidth={2} />
    </div>
    <h3 className="process-card__title">{title}</h3>
    <p className="process-card__description">{description}</p>
  </article>
);

const ProcessSection = () => {
  const sectionRef = useRef(null);

  useSectionReveal(sectionRef, {
    introSelector: "[data-reveal-intro]",
    itemSelector: "[data-reveal-item]",
    connectorSelector: "[data-reveal-connector]",
    start: "top 82%",
    introY: 20,
    itemY: 26,
    itemStagger: 0.12
  });

  return (
    <section className="process-section" ref={sectionRef}>
      <div className="process-section__container">
        <div className="process-section__heading" data-reveal-intro>
          <div className="process-section__eyebrow" aria-label="Our Process">
            <span className="process-section__eyebrowLine" />
            <span>OUR PROCESS</span>
            <span className="process-section__eyebrowLine" />
          </div>
          <h2 className="process-section__title">From Concept to Completion</h2>
          <p className="process-section__subtitle">
            A simple, transparent process that ensures quality at every step.
          </p>
        </div>

        <div className="process-section__gridWrap">
          <div className="process-section__connector" aria-hidden="true" data-reveal-connector>
            <span className="process-section__connectorLine" />
            <span className="process-section__connectorDot process-section__connectorDot--1" />
            <span className="process-section__connectorDot process-section__connectorDot--2" />
            <span className="process-section__connectorDot process-section__connectorDot--3" />
          </div>

          <div className="process-section__grid">
            {steps.map((step) => (
              <ProcessCard key={step.number} {...step} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
