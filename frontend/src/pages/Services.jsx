import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  Check,
  Clock3,
  HardHat,
  Hammer,
  Mail,
  MapPin,
  MessagesSquare,
  Phone,
  Home,
  ShieldCheck,
  UsersRound
} from "lucide-react";
import api from "../api/axios";
import { settingsFallback } from "../data/fallbackData";
import useSectionReveal from "../hooks/useSectionReveal";

const services = [
  {
    number: "01",
    title: "Residential",
    description: "Custom homes, luxury villas and residential projects built around the client's lifestyle.",
    icon: Home,
    items: ["Custom Home Construction", "Luxury Villas", "Home Planning", "Turnkey Solutions"]
  },
  {
    number: "02",
    title: "Commercial",
    description: "Modern offices, retail and commercial spaces built for functionality, efficiency and business growth.",
    icon: Building2,
    items: ["Office Buildings", "Retail Spaces", "Industrial Buildings", "Warehousing"]
  },
  {
    number: "03",
    title: "Renovations",
    description: "Complete renovation, remodeling and structural upgrade solutions for existing properties.",
    icon: Hammer,
    items: ["Home Renovation", "Kitchen Upgrades", "Extensions", "Modernization"]
  }
];

const benefits = [
  {
    icon: ShieldCheck,
    title: "Quality Assurance",
    text: "Uncompromised materials, careful supervision, and standards that hold up over time."
  },
  {
    icon: UsersRound,
    title: "Experienced Team",
    text: "Skilled professionals bringing practical construction expertise to every phase."
  },
  {
    icon: Clock3,
    title: "On-Time Delivery",
    text: "Disciplined scheduling and site coordination to keep work moving on time."
  },
  {
    icon: MessagesSquare,
    title: "Customer-Focused",
    text: "Transparent communication, quick updates, and a client-first project approach."
  }
];

const contactItems = (settings) => [
  {
    icon: Phone,
    label: "Call Us",
    value: "+91 9935363400",
    href: "tel:+919935363400"
  },
  {
    icon: Mail,
    label: "Email Us",
    value: "singhindiamzp@gmail.com",
    href: "mailto:singhindiamzp@gmail.com"
  },
  {
    icon: MapPin,
    label: "Our Location",
    value: "Rampur, Kalana, Mirzapur, 231303"
  },
  {
    icon: Clock3,
    label: "Working Hours",
    value: settings.workingHours || settingsFallback.workingHours
  }
];

const ServiceListItem = ({ text }) => (
  <li className="services-page__serviceItem">
    <span className="services-page__serviceBullet" aria-hidden="true">
      <Check size={11} strokeWidth={3} />
    </span>
    <span>{text}</span>
  </li>
);

const ServiceCard = ({ number, title, description, icon: Icon, items }) => (
  <article className="services-page__serviceCard" data-reveal-item>
    <span className="services-page__serviceBadge" aria-hidden="true">
      {number}
    </span>
    <div className="services-page__serviceIconWrap" aria-hidden="true">
      <Icon className="services-page__serviceIcon" size={30} strokeWidth={2} />
    </div>
    <h3 className="services-page__serviceTitle">{title}</h3>
    <p className="services-page__serviceDescription">{description}</p>
    <div className="services-page__serviceRule" aria-hidden="true" />
    <ul className="services-page__serviceList">
      {items.map((item) => (
        <ServiceListItem key={item} text={item} />
      ))}
    </ul>
    <a className="services-page__serviceLink" href="#services-contact" aria-label={`Learn more about ${title}`}>
      <span>Learn More</span>
      <ArrowRight size={13} strokeWidth={2.5} />
    </a>
  </article>
);

const BenefitCard = ({ icon: Icon, title, text }) => (
  <article className="services-page__benefit" data-reveal-item>
    <div className="services-page__benefitIconWrap" aria-hidden="true">
      <Icon size={22} strokeWidth={2.1} />
    </div>
    <h3 className="services-page__benefitTitle">{title}</h3>
    <p className="services-page__benefitText">{text}</p>
  </article>
);

const ContactItem = ({ icon: Icon, label, value, href }) => {
  const content = (
    <>
      <span className="services-page__contactIconWrap" aria-hidden="true">
        <Icon size={18} strokeWidth={2.1} />
      </span>
      <span className="services-page__contactCopy">
        <span className="services-page__contactLabel">{label}</span>
        <span className="services-page__contactValue">{value}</span>
      </span>
    </>
  );

  return href ? (
    <a className="services-page__contactItem" href={href}>
      {content}
    </a>
  ) : (
    <div className="services-page__contactItem" role="text">
      {content}
    </div>
  );
};

const Services = () => {
  const introRef = useRef(null);
  const servicesRef = useRef(null);
  const [settings, setSettings] = useState(settingsFallback);

  useSectionReveal(introRef, {
    introSelector: "[data-reveal-intro]",
    itemSelector: "[data-reveal-item]",
    start: "top 82%",
    introY: 18,
    itemY: 18,
    itemStagger: 0.08
  });

  useSectionReveal(servicesRef, {
    introSelector: "[data-reveal-intro]",
    itemSelector: "[data-reveal-item]",
    start: "top 82%",
    introY: 18,
    itemY: 20,
    itemStagger: 0.08
  });

  useEffect(() => {
    api
      .get("/api/settings")
      .then((res) => setSettings({ ...settingsFallback, ...res.data }))
      .catch(() => setSettings(settingsFallback));
  }, []);

  const contactList = contactItems(settings);

  return (
    <main className="services-page">
      <section className="services-page__introSection" ref={introRef}>
        <div className="services-page__container">
          <div className="services-page__intro">
            <p className="services-page__eyebrow" data-reveal-intro>
              OUR SERVICES
            </p>
            <h1 className="services-page__heroTitle" data-reveal-intro>
              <span className="services-page__heroLine">Built on Experience.</span>
              <span className="services-page__heroLine">
                Delivered with <span className="services-page__heroAccent">Excellence.</span>
              </span>
            </h1>
            <p className="services-page__heroText" data-reveal-intro>
              Quality Construction delivers residential, commercial, and renovation services with disciplined
              supervision, transparent communication, and quality finishes that last.
            </p>
          </div>
        </div>
      </section>

      <section className="services-page__section" ref={servicesRef}>
        <div className="services-page__container">
          <div className="services-page__sectionHeader" data-reveal-intro>
            <p className="services-page__eyebrow">WHAT WE DO</p>
            <h2 className="services-page__sectionTitle">
              Our Specialized <span>Services</span>
            </h2>
            <p className="services-page__sectionText">
              From custom homes to commercial spaces and renovation work, we plan every project around quality,
              efficiency, and a clean execution process.
            </p>
          </div>

          <div className="services-page__cardsGrid" aria-label="Service categories">
            {services.map((service) => (
              <ServiceCard key={service.number} {...service} />
            ))}
          </div>

          <div className="services-page__benefitsStrip" data-reveal-item>
            <div className="services-page__benefitsGrid" aria-label="Construction benefits">
              {benefits.map((benefit) => (
                <BenefitCard key={benefit.title} {...benefit} />
              ))}
            </div>
          </div>

          <div className="services-page__ctaBanner" data-reveal-item>
            <div className="services-page__ctaCopy">
              <div className="services-page__ctaIconWrap" aria-hidden="true">
                <HardHat size={20} strokeWidth={2.2} />
              </div>
              <div className="services-page__ctaTextWrap">
                <h3 className="services-page__ctaTitle">Have a Project in Mind?</h3>
                <p className="services-page__ctaText">Let&apos;s build something remarkable together.</p>
              </div>
            </div>
            <Link className="services-page__ctaButton" to="/contact">
              <span>Get a Free Consultation</span>
              <ArrowRight size={15} strokeWidth={2.5} />
            </Link>
          </div>

          <div className="services-page__contactStrip" id="services-contact" data-reveal-item>
            <div className="services-page__contactGrid" aria-label="Contact information">
              {contactList.map((item) => (
                <ContactItem key={item.label} {...item} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Services;
