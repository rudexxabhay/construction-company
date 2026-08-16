import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, Building2, Mail, ShieldCheck, Users } from "lucide-react";
import api from "../api/axios";
import AboutSection from "../components/AboutSection";
import ServicesShowcase from "../components/ServicesShowcase";
import ProcessSection from "../components/ProcessSection";
import WhyChooseUsSection from "../components/WhyChooseUsSection";
import HomeContactSection from "../components/HomeContactSection";
import VideoSection from "../components/VideoSection";
import VideoShowcase from "../components/VideoShowcase";
import heroImage from "../assets/Hero.png";
import { settingsFallback } from "../data/fallbackData";
import useHeroIntro from "../hooks/useHeroIntro";

const Home = () => {
  const heroRef = useRef(null);
  const [settings, setSettings] = useState(settingsFallback);

  useHeroIntro(heroRef);

  useEffect(() => {
    api.get("/api/settings").then((res) => setSettings({ ...settingsFallback, ...res.data })).catch(() => setSettings(settingsFallback));
  }, []);

  const heroStats = [
    {
      icon: ShieldCheck,
      value: "10+",
      label: "Years Experience"
    },
    {
      icon: Building2,
      value: "150+",
      label: "Projects Completed"
    },
    {
      icon: Users,
      value: "100+",
      label: "Happy Clients"
    },
    {
      icon: BadgeCheck,
      value: "100%",
      label: "Quality Commitment"
    }
  ];

  const heroButtons = [
    {
      to: "/services",
      label: "Our Services",
      icon: Building2
    },
    {
      to: "/contact",
      label: "Contact Us",
      icon: Mail
    }
  ];

  return (
    <>
      <section className="hero-section">
        <div className="hero-shell" ref={heroRef}>
          <div className="hero-media" aria-hidden="true" data-hero-reveal="media" style={{ backgroundImage: `url(${heroImage})` }} />
          <div className="hero-overlay" aria-hidden="true" />
          <div className="hero-inner">
            <div className="hero-copy">
              <p className="hero-eyebrow" data-hero-reveal="eyebrow">BUILDING A BETTER TOMORROW</p>
              <h1 className="hero-title">
                <span className="hero-title-line hero-title-line-light" data-hero-reveal="title">WE BUILD QUALITY,</span>
                <span className="hero-title-line hero-title-line-accent" data-hero-reveal="title">YOU LIVE BETTER.</span>
              </h1>
              <p className="hero-subtitle" data-hero-reveal="subtitle">
                From concept to completion, we deliver safe, sustainable and high-quality construction solutions that stand the test of time.
              </p>
              <div className="hero-actions" data-hero-reveal="actions">
                {heroButtons.map(({ to, label, icon: Icon }) => (
                  <Link key={label} to={to} className={`hero-button ${label === "Our Services" ? "hero-button-primary" : "hero-button-secondary"}`}>
                    <Icon size={15} strokeWidth={2.4} />
                    <span>{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="hero-stats-wrap" data-hero-reveal="stats">
            <div className="hero-stats-grid">
              {heroStats.map(({ icon: Icon, value, label }) => (
                <article key={label} className="hero-stat">
                  <Icon className="hero-stat-icon" size={34} strokeWidth={2} />
                  <div className="hero-stat-copy">
                    <strong>{value}</strong>
                    <span>{label}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <AboutSection />

      <ServicesShowcase />

      <ProcessSection />

      <WhyChooseUsSection />

      <VideoShowcase />

      <VideoSection videos={settings.videos || []} />

      <HomeContactSection />
    </>
  );
};

export default Home;
