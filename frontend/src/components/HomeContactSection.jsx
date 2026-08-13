import React, { useEffect, useState } from "react";
import { CheckCircle2, Mail, MapPin, Phone } from "lucide-react";
import api from "../api/axios";
import SectionTitle from "./SectionTitle";
import { settingsFallback } from "../data/fallbackData";
import useSectionReveal from "../hooks/useSectionReveal";

const initial = { name: "", email: "", phone: "", serviceType: "Home Construction", message: "" };

const HomeContactSection = () => {
  const sectionRef = React.useRef(null);
  const [settings, setSettings] = useState(settingsFallback);
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useSectionReveal(sectionRef, {
    introSelector: "[data-reveal-intro]",
    itemSelector: "[data-reveal-item]",
    start: "top 82%",
    introY: 20,
    itemY: 24,
    itemStagger: 0.12
  });

  useEffect(() => {
    api.get("/api/settings").then((res) => setSettings({ ...settingsFallback, ...res.data })).catch(() => setSettings(settingsFallback));
  }, []);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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

  const details = [
    { icon: Phone, value: settings.phone },
    { icon: Mail, value: settings.email },
    { icon: MapPin, value: settings.address }
  ];

  return (
    <section className="home-contact-section" ref={sectionRef}>
      <div className="home-contact-section__container">
        <div className="home-contact-section__header" data-reveal-intro>
          <SectionTitle
            eyebrow="Contact Us"
            title="Start Your Project With Confidence"
            text={settings.contactHeading || settings.contactDescription}
            align="center"
          />
        </div>

        <div className="home-contact-section__grid">
          <div className="home-contact-section__info" data-reveal-item>
            <div className="home-contact-section__panel">
              <h3 className="home-contact-section__panelTitle">Let’s discuss your construction requirement</h3>
              <p className="home-contact-section__panelText">
                Share your project details and our team will review the scope, timeline, and next steps.
              </p>

              <div className="home-contact-section__details">
                {details.map(({ icon: Icon, value }) => (
                  <div key={value} className="home-contact-section__detail">
                    <span className="home-contact-section__detailIcon" aria-hidden="true">
                      <Icon size={16} />
                    </span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>

              <div className="home-contact-section__note">
                <CheckCircle2 size={16} />
                <span>Quick response from our team during working hours.</span>
              </div>
            </div>
          </div>

          <form onSubmit={submit} className="home-contact-section__form" data-reveal-item>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="label">Name</label>
                <input className="input" name="name" value={form.name} onChange={update} required />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input" type="email" name="email" value={form.email} onChange={update} required />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input" name="phone" value={form.phone} onChange={update} required />
              </div>
              <div>
                <label className="label">Service</label>
                <select className="input" name="serviceType" value={form.serviceType} onChange={update} required>
                  <option>Home Construction</option>
                  <option>Architecture Planning</option>
                  <option>Interior Design</option>
                  <option>Renovation & Remodeling</option>
                  <option>Commercial Construction</option>
                  <option>Turnkey Construction</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="label">Message</label>
                <textarea className="input home-contact-section__textarea" name="message" value={form.message} onChange={update} required />
              </div>
            </div>

            {status && <p className="home-contact-section__status">{status}</p>}
            <button className="btn-primary mt-6" disabled={loading}>{loading ? "Submitting..." : "Submit Request"}</button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default HomeContactSection;
