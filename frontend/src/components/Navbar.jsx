import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, Moon, Sun, X } from "lucide-react";
import api from "../api/axios";
import { settingsFallback } from "../data/fallbackData";

const links = [
  ["Home", "/"],
  ["About", "/about"],
  ["Services", "/services"],
  ["Projects", "/projects"],
  ["Blog", "/blog"],
  ["Contact", "/contact"]
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");
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

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const linkClass = ({ isActive }) =>
    `text-sm font-bold transition hover:text-chrome ${isActive ? "text-chrome" : "text-zinc-800"}`;

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <nav className="container-pad grid min-h-16 grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-3 py-2 lg:flex lg:min-h-20 lg:justify-between lg:gap-4 lg:py-3">
        <Link to="/" className="hidden min-w-0 items-center gap-3 lg:flex" onClick={() => setOpen(false)}>
          {logo && <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-chrome p-1.5"><img className="max-h-full max-w-full object-contain" src={`${logo}?v=${Date.now()}`} alt="logo" /></span>}
          <span className="truncate text-base font-black text-black sm:text-xl">{settings.companyName}</span>
        </Link>
        <Link to="/" className="flex h-11 w-11 items-center justify-center justify-self-start overflow-hidden rounded-md bg-chrome text-sm font-black text-black lg:hidden" onClick={() => setOpen(false)} aria-label="Home">
          {logo ? <img className="max-h-9 max-w-9 object-contain" src={`${logo}?v=${Date.now()}`} alt="logo" /> : <span>{settings.companyName?.charAt(0) || "C"}</span>}
        </Link>
        <Link to="/" className="min-w-0 justify-self-center text-center lg:hidden" onClick={() => setOpen(false)}>
          <span className="block truncate text-base font-black leading-tight text-black">{settings.companyName}</span>
        </Link>
        <div className="hidden items-center gap-5 lg:flex lg:gap-8">
          {links.map(([label, path]) => <NavLink key={path} to={path} className={linkClass}>{label}</NavLink>)}
        </div>
        <div className="hidden items-center gap-3 lg:flex">
          <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-white text-black transition hover:border-chrome" onClick={() => setDarkMode((value) => !value)} aria-label={darkMode ? "Disable dark mode" : "Enable dark mode"}>
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link to="/contact" className="rounded-lg bg-chrome px-5 py-2.5 text-sm font-black text-black shadow-md transition hover:bg-black hover:text-white">
            Get Estimate
          </Link>
        </div>
        <button className="inline-flex h-11 w-11 shrink-0 items-center justify-center justify-self-end rounded-lg border border-zinc-200 bg-white text-black lg:hidden" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>
      <div className={`fixed inset-0 z-[9998] bg-black/60 transition-opacity duration-300 lg:hidden ${open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`} onClick={() => setOpen(false)} aria-hidden="true" />
      <aside className={`fixed left-0 top-0 z-[9999] h-screen w-[75vw] max-w-[280px] border-r border-zinc-200 bg-white shadow-premium transition-transform duration-300 ease-out lg:hidden ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex min-h-16 items-center justify-between gap-3 border-b border-zinc-200 px-4">
          <Link to="/" className="flex min-w-0 items-center gap-2 text-sm font-black text-black" onClick={() => setOpen(false)}>
            {logo && <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-chrome p-1.5"><img className="max-h-full max-w-full object-contain" src={`${logo}?v=${Date.now()}`} alt="logo" /></span>}
            <span className="truncate">{settings.companyName}</span>
          </Link>
          <button className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-black" onClick={() => setOpen(false)} aria-label="Close menu"><X size={20} /></button>
        </div>
        <div className="grid gap-1 p-4">
          {links.map(([label, path]) => (
            <NavLink key={path} to={path} className="rounded-lg px-3 py-3 text-sm font-bold text-zinc-800 hover:bg-zinc-50" onClick={() => setOpen(false)}>
              {label}
            </NavLink>
          ))}
          <NavLink to="/contact" className="mt-2 rounded-lg bg-chrome px-3 py-3 text-sm font-black text-black" onClick={() => setOpen(false)}>
            Get Estimate
          </NavLink>
          <button type="button" className="mt-2 flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-3 text-sm font-bold text-zinc-800" onClick={() => setDarkMode((value) => !value)}>
            <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </aside>
    </header>
  );
};

export default Navbar;
