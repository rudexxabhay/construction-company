import React, { useEffect, useState } from "react";
import { Clock3, Mail, MapPin, Phone } from "lucide-react";
import api from "../api/axios";
import SectionTitle from "../components/SectionTitle";
import { settingsFallback } from "../data/fallbackData";

const initial = { name: "", email: "", phone: "", serviceType: "Home Construction", message: "" };

const Contact = () => {
  const [settings, setSettings] = useState(settingsFallback);
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const contactDetails = [
    {
      icon: Phone,
      value: settings.phone,
      href: `tel:${(settings.phone || "").replace(/\s+/g, "")}`
    },
    {
      icon: Mail,
      value: settings.email,
      href: `mailto:${settings.email}`
    },
    {
      icon: MapPin,
      value: settings.address
    },
    {
      icon: Clock3,
      value: settings.workingHours || settingsFallback.workingHours
    }
  ];

  useEffect(() => {
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
    <main className="bg-white">
      <section className="pb-20 pt-12 md:pt-16">
        <div className="container-pad grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionTitle eyebrow="CONTACT US" title={settings.contactHeading} text={settings.contactDescription} />
            <div className="mt-5 grid gap-3">
              {contactDetails.map(({ icon: Icon, value, href }) => {
                const content = (
                  <>
                    <span
                      className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[rgba(245,196,0,0.12)] text-chrome"
                      aria-hidden="true"
                    >
                      <Icon size={18} strokeWidth={2.2} />
                    </span>
                    <span className="min-w-0 break-words text-[15px] font-semibold leading-[1.5] text-[#252525]">
                      {value}
                    </span>
                  </>
                );

                return href ? (
                  <a key={value} href={href} className="flex items-start gap-2.5">
                    {content}
                  </a>
                ) : (
                  <div key={value} className="flex items-start gap-2.5">
                    {content}
                  </div>
                );
              })}
            </div>
          </div>
          <form onSubmit={submit} className="rounded-lg border border-zinc-200 bg-white p-6 shadow-premium">
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
