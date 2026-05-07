import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";
import api from "../api/axios";
import { settingsFallback } from "../data/fallbackData";

const Footer = () => {
  const [settings, setSettings] = useState(settingsFallback);
  const [logo, setLogo] = useState(null);

  useEffect(() => {
    api.get("/api/settings")
      .then((res) => {
        setSettings({ ...settingsFallback, ...res.data });
        setLogo(res.data.logoUrl || null);
      })
      .catch(() => {
        setSettings(settingsFallback);
        setLogo(null);
      });
  }, []);

  return (
    <footer className="bg-black text-white">
      <div className="container-pad grid gap-10 py-12 md:grid-cols-2 md:py-16 lg:grid-cols-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            {logo && <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-chrome p-1.5"><img className="max-h-full max-w-full object-contain" src={`${logo}?v=${Date.now()}`} alt="logo" /></span>}
            <span className="min-w-0 break-words text-xl font-black">{settings.companyName}</span>
          </div>
          <p className="mt-5 text-sm leading-6 text-zinc-400">{settings.footerDescription}</p>
        </div>
        <div className="min-w-0">
          <h4 className="mb-4 font-black">Quick Links</h4>
          <div className="grid gap-3 text-sm text-zinc-400">
            {["About", "Services", "Projects", "Blog", "Contact"].map((item) => <Link key={item} to={`/${item.toLowerCase()}`} className="transition hover:text-chrome">{item}</Link>)}
          </div>
        </div>
        <div className="min-w-0">
          <h4 className="mb-4 font-black">Services</h4>
          <div className="grid gap-3 text-sm text-zinc-400">
            <span>Turnkey Construction</span>
            <span>Architecture Planning</span>
            <span>Interior Design</span>
            <span>Renovation</span>
          </div>
        </div>
        <div className="min-w-0">
          <h4 className="mb-4 font-black">Contact</h4>
          <div className="grid gap-3 text-sm leading-6 text-zinc-400">
            <span className="flex gap-2"><MapPin size={16} className="mt-1 shrink-0 text-chrome" />{settings.address}</span>
            <span className="flex gap-2"><Phone size={16} className="mt-1 shrink-0 text-chrome" />{settings.phone}</span>
            <span className="flex gap-2 break-all"><Mail size={16} className="mt-1 shrink-0 text-chrome" />{settings.email}</span>
            <span>{settings.workingHours}</span>
            <span>{[settings.instagram && "Instagram", settings.facebook && "Facebook", settings.whatsapp && "WhatsApp"].filter(Boolean).join(" | ")}</span>
          </div>
        </div>
      </div>
      <div className="border-t border-zinc-800 py-5">
        <div className="container-pad text-sm leading-6 text-zinc-500">Copyright © {new Date().getFullYear()} {settings.companyName}. All rights reserved.</div>
      </div>
    </footer>
  );
};

export default Footer;
