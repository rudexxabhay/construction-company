import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";
import api from "../api/axios";
import { settingsFallback } from "../data/fallbackData";
import logoAsset from "../assets/Logo.png";

const Footer = () => {
  const [settings, setSettings] = useState(settingsFallback);

  useEffect(() => {
    api.get("/api/settings")
      .then((res) => {
        setSettings({ ...settingsFallback, ...res.data });
      })
      .catch(() => {
        setSettings(settingsFallback);
      });
  }, []);

  return (
    <footer className="bg-black text-white">
      <div className="container-pad grid gap-10 py-12 md:grid-cols-2 md:py-16 lg:grid-cols-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <img className="site-brand-logo h-11 w-auto shrink-0" src={logoAsset} alt="QUALITY CONSTRUCTION logo" />
            <span className="site-brand-copy min-w-0" aria-hidden="true">
              <span>QUALITY</span>
              <span>CONSTRUCTION</span>
            </span>
          </div>
          <p className="mt-5 text-sm leading-6 text-zinc-400">{settings.footerDescription}</p>
        </div>
        <div className="min-w-0">
          <h4 className="mb-4 font-black">Quick Links</h4>
          <div className="grid gap-3 text-sm text-zinc-400">
            <Link to="/about" className="transition hover:text-chrome">About</Link>
            <Link to="/services" className="transition hover:text-chrome">Services</Link>
            <Link to="/blog" className="transition hover:text-chrome">Blogs</Link>
            <Link to="/contact" className="transition hover:text-chrome">Contact</Link>
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
