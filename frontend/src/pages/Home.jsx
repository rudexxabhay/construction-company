import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, HardHat } from "lucide-react";
import * as Icons from "lucide-react";
import api from "../api/axios";
import SectionTitle from "../components/SectionTitle";
import ServiceCard from "../components/ServiceCard";
import ProjectCard from "../components/ProjectCard";
import BlogCard from "../components/BlogCard";
import VideoSection from "../components/VideoSection";
import { blogsFallback, projectsFallback, servicesFallback, settingsFallback, trustedFallback, workflowFallback } from "../data/fallbackData";

const Home = () => {
  const [settings, setSettings] = useState(settingsFallback);
  const [workflow, setWorkflow] = useState(workflowFallback);
  const [trusted, setTrusted] = useState(trustedFallback);
  const [services, setServices] = useState(servicesFallback);
  const [projects, setProjects] = useState(projectsFallback);
  const [blogs, setBlogs] = useState(blogsFallback);

  useEffect(() => {
    api.get("/api/settings").then((res) => setSettings({ ...settingsFallback, ...res.data })).catch(() => setSettings(settingsFallback));
    api.get("/api/workflow").then((res) => setWorkflow(res.data)).catch(() => setWorkflow(workflowFallback));
    api.get("/api/trusted").then((res) => setTrusted(res.data.length ? res.data : trustedFallback)).catch(() => setTrusted(trustedFallback));
    api.get("/api/services").then((res) => setServices(res.data)).catch(() => setServices(servicesFallback));
    api.get("/api/projects").then((res) => setProjects(res.data)).catch(() => setProjects(projectsFallback));
    api.get("/api/blogs").then((res) => setBlogs(res.data)).catch(() => setBlogs(blogsFallback));
  }, []);

  const current = projects.filter((p) => p.status === "Current").slice(0, 3);
  const completed = projects.filter((p) => p.status === "Completed").slice(0, 3);

  return (
    <>
      <section className="hero-section relative overflow-hidden">
        <div className="hero-overlay" aria-hidden="true" />
        <div className="hero-content-wrap">
          <div className="hero-copy">
            <p className="hero-eyebrow">Premium Construction Company</p>
            <h1 className="hero-title">{settings.heroTitle}</h1>
            <p className="hero-subtitle">{settings.heroSubtitle}</p>
            <div className="hero-actions">
              <Link to="/contact" className="hero-cta hero-cta-primary">Get Estimate</Link>
              <Link to="/projects" className="hero-cta hero-cta-secondary">View Projects</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-8 md:py-16">
        <div className="container-pad grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[["18+", "Years Experience"], ["240+", "Projects Delivered"], ["98%", "Client Satisfaction"], ["32", "Active Specialists"]].map(([value, label]) => (
            <div key={label} className="rounded-xl border border-zinc-200 bg-white p-4 text-center shadow-md transition hover:-translate-y-1 hover:scale-[1.01] hover:shadow-premium md:p-6"><b className="text-2xl font-black text-black md:text-4xl">{value}</b><p className="mt-2 text-xs font-semibold text-zinc-600 md:text-sm">{label}</p></div>
          ))}
        </div>
      </section>

      <section className="bg-zinc-50 py-8 md:py-16">
        <div className="container-pad">
          <SectionTitle eyebrow="Services" title="Complete construction services" text="From drawings and approvals to structural execution, interiors, and final handover." align="center" />
          <div className="w-full overflow-hidden md:overflow-visible">
            <div className="flex snap-x snap-mandatory gap-2.5 overflow-x-auto pb-3 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible lg:grid-cols-3">{services.slice(0, 3).map((service) => <div key={service._id} className="min-w-[47vw] snap-start md:min-w-0"><ServiceCard service={service} /></div>)}</div>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-16">
        <div className="container-pad grid gap-6 lg:grid-cols-2 lg:items-center lg:gap-10">
          <div>
            <SectionTitle eyebrow="Why Choose Us" title="Premium finish, practical schedules, and accountable site management" text="Our team combines engineering discipline with clear communication, so every stage is documented and controlled." />
            <div className="grid gap-4">
              {["Transparent BOQ and milestone billing", "Experienced engineers and vendor network", "Quality checks for structure, waterproofing, MEP, and finishing", "Single point of contact from start to handover"].map((item) => (
                <div key={item} className="flex gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-md transition hover:-translate-y-1 hover:scale-[1.01] hover:shadow-premium"><CheckCircle2 className="shrink-0 text-chrome" /><span className="font-semibold leading-6">{item}</span></div>
              ))}
            </div>
          </div>
          <img className="h-auto min-h-[240px] w-full rounded-xl object-cover shadow-md md:min-h-[420px]" src="https://images.unsplash.com/photo-1590650153855-d9e808231d41?auto=format&fit=crop&w=1200&q=80" alt="Construction professionals" />
        </div>
      </section>

      <section className="bg-black py-8 text-white md:py-16">
        <div className="container-pad">
          <SectionTitle eyebrow="Current Projects" title="Work actively moving on site" text="Live projects with visible progress and disciplined supervision." theme="dark" />
          <div className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-3 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-3">{current.map((project) => <div key={project._id} className="min-w-[85%] snap-start md:min-w-0"><ProjectCard project={project} /></div>)}</div>
        </div>
      </section>

      <section className="py-8 md:py-16">
        <div className="container-pad">
          <SectionTitle eyebrow="Completed Projects" title="Delivered homes and commercial spaces" text="Completed projects with robust structure, careful finishing, and clean handover documentation." align="center" />
          <div className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-3 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-3">{completed.map((project) => <div key={project._id} className="min-w-[85%] snap-start md:min-w-0"><ProjectCard project={project} /></div>)}</div>
        </div>
      </section>

      <section className="bg-zinc-50 py-8 md:py-16">
        <div className="container-pad">
          <SectionTitle eyebrow="Process" title="A clear construction workflow" align="center" />
          <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 md:mx-0 md:grid md:grid-cols-4 md:gap-5 md:overflow-visible md:px-0">
            {workflow.map((step, index) => {
              const Icon = Icons[step.icon] || CheckCircle2;
              return (
                <div key={step._id || step.title} className="min-w-[75vw] snap-start rounded-xl border border-zinc-200 bg-white p-4 text-center shadow-md transition hover:-translate-y-1 hover:scale-[1.01] hover:shadow-premium md:min-w-0 md:p-6">
                  <Icon className="mx-auto text-chrome" size={26} />
                  <b className={`mt-3 block text-base md:text-lg ${step.fontStyle || ""}`}>{step.order || index + 1}. {step.title}</b>
                  <p className="mt-2 line-clamp-3 text-xs leading-5 text-zinc-600 md:text-sm md:leading-6">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-8 md:py-16">
        <div className="container-pad">
          <SectionTitle eyebrow="Trusted" title="Trusted by homeowners and business owners" text={settings.trustedText} align="center" />
          <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0">
            {trusted.map((item) => {
              const Icon = Icons[item.icon] || HardHat;
              return (
                <article key={item._id || item.title} className="min-w-[78vw] snap-start overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-md transition hover:-translate-y-1 hover:scale-[1.01] hover:shadow-premium md:min-w-0">
                  {item.imageUrl && <img className="h-28 w-full object-cover md:h-40" src={item.imageUrl} alt={item.title} />}
                  <div className="p-4 md:p-6">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-black text-chrome md:mb-4 md:h-11 md:w-11"><Icon size={18} /></div>
                    <h3 className="text-base font-black md:text-xl">{item.title}</h3>
                    <p className="mt-2 line-clamp-3 text-xs leading-5 text-zinc-600 md:mt-3 md:text-sm md:leading-6">{item.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-zinc-50 py-8 md:py-16">
        <div className="container-pad">
          <SectionTitle eyebrow="Blog" title="Construction insights" align="center" />
          <div className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-3 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-3">{blogs.slice(0, 3).map((blog) => <div key={blog._id} className="min-w-[85%] snap-start md:min-w-0"><BlogCard blog={blog} /></div>)}</div>
        </div>
      </section>

      <VideoSection videos={settings.videos || []} />

      <section className="bg-chrome py-8 md:py-16">
        <div className="container-pad flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
          <div><h2 className="text-2xl font-black leading-tight text-black md:text-4xl">Ready to start your construction project?</h2><p className="mt-3 max-w-2xl font-semibold leading-7 text-zinc-800">{settings.contactDescription}</p></div>
          <Link to="/contact" className="btn-dark">Contact Us</Link>
        </div>
      </section>
    </>
  );
};

export default Home;
