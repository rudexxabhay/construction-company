import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import ProjectCard from "../components/ProjectCard";
import SectionTitle from "../components/SectionTitle";
import { projectsFallback, settingsFallback } from "../data/fallbackData";

const Projects = () => {
  const [projects, setProjects] = useState(projectsFallback);
  const [settings, setSettings] = useState(settingsFallback);
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  useEffect(() => {
    api.get("/api/settings").then((res) => setSettings({ ...settingsFallback, ...res.data })).catch(() => setSettings(settingsFallback));
    api.get("/api/projects").then((res) => setProjects(res.data)).catch(() => setProjects(projectsFallback));
  }, []);
  const visible = useMemo(() => filter === "All" ? projects : projects.filter((p) => p.status === filter), [filter, projects]);

  return (
    <main>
      <section className="bg-black py-20 text-white"><div className="container-pad"><p className="mb-4 text-sm font-black uppercase tracking-[0.22em] text-chrome">{settings.companyName} Portfolio</p><h1 className="text-4xl font-black sm:text-5xl">Projects</h1><p className="mt-4 max-w-2xl text-zinc-300">Explore current and completed construction work with budget, duration, progress, and status visibility.</p></div></section>
      <section className="py-20">
        <div className="container-pad">
          <SectionTitle eyebrow="Portfolio" title="Current and completed projects" align="center" />
          <div className="mb-8 flex justify-center gap-3">
            {["All", "Current", "Completed"].map((item) => <button key={item} onClick={() => setFilter(item)} className={`rounded-md px-4 py-2 text-sm font-black ${filter === item ? "bg-chrome text-black" : "bg-zinc-100 text-zinc-700"}`}>{item}</button>)}
          </div>
          <div className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-3 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-3">{visible.map((project) => <div key={project._id} className="min-w-[85%] snap-start md:min-w-0"><ProjectCard project={project} onView={setSelected} /></div>)}</div>
        </div>
      </section>
      {selected && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
          <article className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white shadow-premium">
            <img className="h-72 w-full object-cover" src={selected.image} alt={selected.title} />
            <div className="p-6">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <p className="text-sm font-black uppercase text-zinc-500">{selected.type}</p>
                  <h2 className="mt-2 text-3xl font-black">{selected.title}</h2>
                  <p className="mt-2 text-sm font-semibold text-zinc-600">{selected.location}</p>
                </div>
                <span className="w-fit rounded-md bg-chrome px-3 py-1 text-xs font-black uppercase text-black">{selected.status}</span>
              </div>
              <p className="mt-5 leading-7 text-zinc-700">{selected.description}</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-md bg-zinc-50 p-4"><span className="block text-sm text-zinc-500">Budget</span><b>{selected.budget}</b></div>
                <div className="rounded-md bg-zinc-50 p-4"><span className="block text-sm text-zinc-500">Duration</span><b>{selected.duration}</b></div>
                <div className="rounded-md bg-zinc-50 p-4"><span className="block text-sm text-zinc-500">Progress</span><b>{selected.progress}%</b></div>
              </div>
              <button className="btn-dark mt-6 w-full sm:w-fit" onClick={() => setSelected(null)}>Close</button>
            </div>
          </article>
        </div>
      )}
    </main>
  );
};

export default Projects;
