import React, { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, LayoutDashboard, LogOut, Moon, Sun, UserCircle } from "lucide-react";
import api from "../api/axios";
import { settingsFallback } from "../data/fallbackData";

const AdminLayout = () => {
  const [settings, setSettings] = useState(settingsFallback);
  const [logo, setLogo] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("adminUser") || "{}");
  const isDashboard = location.pathname === "/secure-admin-dashboard";

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

  useEffect(() => {
    const closeProfile = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", closeProfile);
    return () => document.removeEventListener("mousedown", closeProfile);
  }, []);

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    setProfileOpen(false);
    navigate("/admin/login");
  };

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/secure-admin-dashboard");
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-zinc-50">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white">
        <div className="mx-auto flex min-h-14 max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:flex-nowrap sm:px-6 lg:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            {!isDashboard && (
              <button type="button" className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-lg bg-black px-3 py-2 text-[13px] font-bold text-white transition hover:bg-zinc-800 sm:gap-2" onClick={goBack}>
                <ChevronLeft size={18} />
                Back
              </button>
            )}
            {isDashboard && (
              <Link to="/secure-admin-dashboard" className="flex min-w-0 items-center gap-3">
                {logo && <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-chrome p-1.5"><img className="max-h-full max-w-full object-contain" src={`${logo}?v=${Date.now()}`} alt="logo" /></span>}
                <span className="hidden min-w-0 truncate text-sm font-black text-black sm:block sm:text-base">{settings.companyName || "QUALITY CONSTRUCTION"} Admin</span>
              </Link>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link to="/secure-admin-dashboard" className="hidden min-h-9 items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-[13px] font-bold text-zinc-700 transition hover:border-chrome hover:text-black sm:inline-flex">
              <LayoutDashboard size={17} />
              Dashboard
            </Link>
            <button type="button" className="inline-flex min-h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-700 transition hover:border-chrome hover:text-black" onClick={() => setDarkMode((value) => !value)} aria-label={darkMode ? "Disable dark mode" : "Enable dark mode"}>
              {darkMode ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <div className="relative" ref={profileRef}>
              <button type="button" className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[13px] font-bold text-zinc-700 transition hover:border-chrome hover:text-black" onClick={() => setProfileOpen((value) => !value)} aria-expanded={profileOpen} aria-haspopup="menu">
                <UserCircle size={20} className="shrink-0 text-zinc-500" />
                <span className="max-w-[150px] truncate">{user.name || "Admin"}</span>
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-zinc-200 bg-white p-3 shadow-premium" role="menu">
                  <div className="border-b border-zinc-100 pb-3">
                    <p className="break-words text-sm font-black text-black">{user.name || "Admin"}</p>
                    {user.email && <p className="mt-1 break-all text-xs font-semibold text-zinc-500">{user.email}</p>}
                  </div>
                  <button onClick={logout} className="mt-3 flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-black px-3 py-2 text-sm font-bold text-white transition hover:bg-zinc-800" role="menuitem">
                    <LogOut size={17} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="admin-shell min-w-0"><Outlet /></main>
    </div>
  );
};

export default AdminLayout;
