import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, Building2, Mail, ShieldCheck, Users } from "lucide-react";
import api from "../api/axios";
import AboutSection from "../components/AboutSection";
import ServicesShowcase from "../components/ServicesShowcase";
import ProcessSection from "../components/ProcessSection";
import WhyChooseUsSection from "../components/WhyChooseUsSection";
import BlogCard from "../components/BlogCard";
import HomeContactSection from "../components/HomeContactSection";
import VideoSection from "../components/VideoSection";
import heroImage from "../assets/Hero.png";
import { blogsFallback, settingsFallback } from "../data/fallbackData";
import useHeroIntro from "../hooks/useHeroIntro";
import useSectionReveal from "../hooks/useSectionReveal";

const Home = () => {
  const heroRef = useRef(null);
  const blogSectionRef = useRef(null);
  const [settings, setSettings] = useState(settingsFallback);
  const [blogs, setBlogs] = useState(blogsFallback);

  useHeroIntro(heroRef);
  useSectionReveal(blogSectionRef, {
    introSelector: "[data-reveal-intro]",
    itemSelector: "[data-reveal-item]",
    start: "top 82%",
    introY: 18,
    itemY: 24,
    itemStagger: 0.1
  });

  useEffect(() => {
    api.get("/api/settings").then((res) => setSettings({ ...settingsFallback, ...res.data })).catch(() => setSettings(settingsFallback));
    api.get("/api/blogs").then((res) => setBlogs(res.data)).catch(() => setBlogs(blogsFallback));
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
      <section className="bg-zinc-50 py-8 md:py-16" ref={blogSectionRef}>
        <div className="container-pad">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between md:mb-8" data-reveal-intro>
            <div>
              <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-chrome sm:text-sm">Blog</p>
              <h2 className="text-2xl font-black leading-tight text-black sm:text-4xl">Construction insights</h2>
            </div>
            <Link to="/blog" className="inline-flex w-fit items-center gap-2 rounded-md border border-chrome px-4 py-2 text-[11px] font-bold text-chrome transition-colors duration-200 hover:bg-chrome hover:text-black">
              <span>View All Blogs</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{blogs.slice(0, 3).map((blog) => <div key={blog._id} className="min-w-0" data-reveal-item><BlogCard blog={blog} /></div>)}</div>
        </div>
      </section>

      <VideoSection videos={settings.videos || []} />

      <HomeContactSection />
    </>
  );
};

export default Home;
