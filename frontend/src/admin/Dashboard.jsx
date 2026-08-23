import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Inbox, SlidersHorizontal } from "lucide-react";
import api from "../api/axios";

const modules = [
  { title: "Website Settings", description: "Manage website, company, logo, and PDF settings.", path: "/secure-admin-dashboard/settings", icon: SlidersHorizontal },
  { title: "Leads", description: "Review incoming contact and estimate requests.", path: "/secure-admin-dashboard/leads", icon: Inbox }
];

const Dashboard = () => {
  const [stats, setStats] = useState({ leads: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/api/leads")
      .then((res) => setStats({ leads: res.data.length }))
      .catch((err) => setError(err.response?.data?.message || "Could not load dashboard data."))
      .finally(() => setLoading(false));
  }, []);

  const statCards = [[Inbox, "Leads", stats.leads]];

  return (
    <section className="min-w-0">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-black">Dashboard</h1>
        <p className="max-w-3xl text-sm leading-6 text-zinc-600">Choose an admin module below. All tools are available as responsive cards so the content area stays full width.</p>
      </div>
      {error && <p className="mt-4 font-bold text-red-700">{error}</p>}
      {loading ? <p className="mt-4">Loading dashboard...</p> : <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{statCards.map(([Icon, label, value]) => <div key={label} className="admin-card"><Icon className="text-chrome" size={22} /><b className="mt-3 block text-3xl">{value}</b><p className="mt-1 text-sm font-semibold text-zinc-500">{label}</p></div>)}</div>}

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {modules.map(({ title, description, path, icon: Icon }) => (
          <Link key={path} to={path} className="group min-w-0 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-chrome hover:shadow-md">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-black text-chrome transition group-hover:bg-chrome group-hover:text-black">
                <Icon size={20} />
              </span>
              <span className="min-w-0">
                <span className="block break-words text-base font-black text-black">{title}</span>
                <span className="mt-1.5 block text-sm leading-5 text-zinc-600">{description}</span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default Dashboard;
