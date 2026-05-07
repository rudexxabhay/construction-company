import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import api from "../api/axios";
import SectionTitle from "../components/SectionTitle";
import ServiceCard from "../components/ServiceCard";
import { servicesFallback, settingsFallback } from "../data/fallbackData";

const Services = () => {
  const [services, setServices] = useState(servicesFallback);
  const [settings, setSettings] = useState(settingsFallback);
  useEffect(() => {
    api.get("/api/settings").then((res) => setSettings({ ...settingsFallback, ...res.data })).catch(() => setSettings(settingsFallback));
    api.get("/api/services").then((res) => setServices(res.data)).catch(() => setServices(servicesFallback));
  }, []);
  const categories = useMemo(() => [...new Set(services.map((service) => service.category).filter(Boolean))], [services]);

  return (
    <main>
      <section className="bg-black py-20 text-white">
        <div className="container-pad">
          <p className="mb-4 text-sm font-black uppercase tracking-[0.22em] text-chrome">{settings.companyName} Services</p>
          <h1 className="max-w-4xl text-4xl font-black leading-tight sm:text-5xl">Professional construction services for planning, execution, supervision, and handover.</h1>
          <p className="mt-5 max-w-2xl leading-7 text-zinc-300">Complete house construction and finishing services with accountable coordination, practical timelines, and quality checks.</p>
        </div>
      </section>
      <section className="bg-zinc-50 py-16">
        <div className="container-pad">
          <SectionTitle eyebrow="Categories" title="Service capability by construction stage" align="center" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => <div key={category} className="rounded-lg border border-zinc-200 bg-white p-5 text-center font-black shadow-sm">{category}</div>)}
          </div>
        </div>
      </section>
      <section className="py-20">
        <div className="container-pad">
          <SectionTitle eyebrow="What We Do" title="A to Z construction capability" text="Each service is managed from the admin panel, including category, features, image, and detailed description." align="center" />
          <div className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-3 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-3">{services.map((service) => <div key={service._id} className="min-w-[85%] snap-start md:min-w-0"><ServiceCard service={service} /></div>)}</div>
        </div>
      </section>
      <section className="bg-black py-20 text-white">
        <div className="container-pad grid gap-10 lg:grid-cols-2 lg:items-center">
          <SectionTitle eyebrow={`Why Choose ${settings.companyName}`} title="Clear scope, supervised sites, and premium finishing standards" text="Our process keeps budgets visible, material choices documented, and daily site execution aligned with the approved plan." theme="dark" />
          <div className="grid gap-4">
            {["Transparent estimates and milestone billing", "Skilled labour with site supervision", "Material coordination and quality checks", "Practical timelines with regular updates"].map((item) => (
              <div key={item} className="flex gap-3 rounded-lg border border-zinc-800 bg-zinc-950 p-4"><CheckCircle2 className="shrink-0 text-chrome" /><span className="font-semibold">{item}</span></div>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-chrome py-16">
        <div className="container-pad flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div><h2 className="text-3xl font-black text-black">Need a construction estimate?</h2><p className="mt-2 font-semibold text-zinc-800">Share your requirement and get a practical execution plan.</p></div>
          <Link to="/contact" className="btn-dark">Contact Us</Link>
        </div>
      </section>
    </main>
  );
};

export default Services;
