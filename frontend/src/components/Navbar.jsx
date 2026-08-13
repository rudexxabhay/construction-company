import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ArrowRight, Menu, X } from "lucide-react";
import logoAsset from "../assets/Logo.png";

const links = [
  { label: "Home", path: "/", end: true },
  { label: "About", path: "/about" },
  { label: "Services", path: "/services" },
  { label: "Blogs", path: "/blog" },
  { label: "Contact", path: "/contact" }
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const desktopLinkClass = ({ isActive }) =>
    [
      "site-nav-link relative inline-flex items-center pb-2 text-[12.5px] font-medium transition-colors duration-200",
      isActive
        ? "is-active text-[#f5c400] after:absolute after:left-1/2 after:bottom-0 after:h-[2px] after:w-[24px] after:-translate-x-1/2 after:rounded-full after:bg-[#f5c400] after:content-['']"
        : "text-white/88 hover:text-[#f5c400]"
    ].join(" ");

  const mobileLinkClass = ({ isActive }) =>
    [
      "flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold transition-colors duration-200",
      isActive ? "bg-[#f5c400]/12 text-[#f5c400]" : "text-white/90 hover:bg-white/8 hover:text-[#f5c400]"
    ].join(" ");

  return (
    <header className={isHome ? "site-header site-header--home" : "site-header site-header--solid"}>
      <nav className="site-nav">
        <Link to="/" className="site-brand" onClick={() => setOpen(false)} aria-label="Home">
          <img className="site-brand-logo" src={logoAsset} alt="QUALITY CONSTRUCTION logo" />
          <span className="site-brand-copy" aria-hidden="true">
            <span>QUALITY</span>
            <span>CONSTRUCTION</span>
          </span>
        </Link>

        <div className="site-links">
          {links.map(({ label, path, end }) => (
            <NavLink key={path} to={path} end={end} className={desktopLinkClass}>
              {label}
            </NavLink>
          ))}
        </div>

        <div className="site-quote-desktop">
          <Link
            to="/contact"
            className="site-quote-btn"
          >
            <span>Get a Quote</span>
            <ArrowRight size={14} strokeWidth={2.6} />
          </Link>
        </div>

        <button
          type="button"
          className="site-menu-toggle h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white transition-colors duration-200 hover:text-[#f5c400]"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-haspopup="menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="site-menu-panel">
          <div className="site-menu-panel__inner">
            <div className="grid gap-2">
              {links.map(({ label, path, end }) => (
                <NavLink
                  key={path}
                  to={path}
                  end={end}
                  className={mobileLinkClass}
                  onClick={() => setOpen(false)}
                >
                  <span>{label}</span>
                  <span className="h-0.5 w-5 rounded-full bg-transparent" aria-hidden="true" />
                </NavLink>
              ))}
              <Link
                to="/contact"
                className="site-menu-cta"
                onClick={() => setOpen(false)}
              >
                <span>Get a Quote</span>
                <ArrowRight size={14} strokeWidth={2.6} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
