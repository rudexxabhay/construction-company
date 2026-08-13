import React, { useRef, useState } from "react";
import api from "../api/axios";
import SectionTitle from "../components/SectionTitle";
import { settingsFallback } from "../data/fallbackData";
import useHeroIntro from "../hooks/useHeroIntro";
import useSectionReveal from "../hooks/useSectionReveal";

const initial = { name: "", email: "", phone: "", serviceType: "Home Construction", message: "" };

const Contact = () => {
  const heroRef = useRef(null);
  const sectionRef = useRef(null);
  const [settings, setSettings] = useState(settingsFallback);
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  useHeroIntro(heroRef);
  useSectionReveal(sectionRef, {
    introSelector: "[data-reveal-intro]",
    itemSelector: "[data-reveal-item]",
    start: "top 84%",
    introY: 18,
    itemY: 24,
    itemStagger: 0.1
  });

  React.useEffect(() => {
    api.get("/api/settings").then((res) => setSettings({ ...settingsFallback, ...res.data })).catch(() => setSettings(settingsFallback));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.message) return setStatus("Please fill all required fields.");
    setLoading(true);
    setStatus("");
    try {
      await api.post("/api/leads", form);
      setForm(initial);
      setStatus("Thank you. Our team will contact you soon.");
    } catch {
      setStatus("Could not submit right now. Please call us directly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <section className="bg-black py-20 text-white">
        <div className="container-pad" ref={heroRef}>
          <p className="mb-4 text-sm font-black uppercase tracking-[0.22em] text-chrome" data-hero-reveal="eyebrow">Contact</p>
          <h1 className="text-4xl font-black sm:text-5xl">
            <span data-hero-reveal="title">Contact {settings.companyName}</span>
          </h1>
          <p className="mt-4 max-w-2xl text-zinc-300" data-hero-reveal="subtitle">Tell us about your construction requirement.</p>
        </div>
      </section>
      <section className="py-20" ref={sectionRef}>
        <div className="container-pad grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div data-reveal-intro><SectionTitle eyebrow="Get Estimate" title={settings.contactHeading} text={settings.contactDescription} /><div className="grid gap-4 text-sm text-zinc-700"><b>{settings.phone}</b><b>{settings.email}</b><b>{settings.address}</b><b>{settings.workingHours}</b></div></div>
          <form onSubmit={submit} className="rounded-lg border border-zinc-200 bg-white p-6 shadow-premium" data-reveal-item>
            <div className="grid gap-5 sm:grid-cols-2">
              <div><label className="label">Name</label><input className="input" name="name" value={form.name} onChange={update} required /></div>
              <div><label className="label">Email</label><input className="input" type="email" name="email" value={form.email} onChange={update} required /></div>
              <div><label className="label">Phone</label><input className="input" name="phone" value={form.phone} onChange={update} required /></div>
              <div><label className="label">Service</label><select className="input" name="serviceType" value={form.serviceType} onChange={update} required><option>Home Construction</option><option>Architecture Planning</option><option>Interior Design</option><option>Renovation & Remodeling</option><option>Commercial Construction</option><option>Turnkey Construction</option></select></div>
              <div className="sm:col-span-2"><label className="label">Message</label><textarea className="input min-h-32" name="message" value={form.message} onChange={update} required /></div>
            </div>
            {status && <p className="mt-4 text-sm font-bold text-zinc-700">{status}</p>}
            <button className="btn-primary mt-6" disabled={loading}>{loading ? "Submitting..." : "Submit Request"}</button>
          </form>
        </div>
      </section>
    </main>
  );
};

export default Contact;
