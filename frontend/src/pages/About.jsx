import React, { useEffect, useState } from "react";
import api from "../api/axios";
import SectionTitle from "../components/SectionTitle";
import { settingsFallback } from "../data/fallbackData";

const About = () => {
  const [settings, setSettings] = useState(settingsFallback);

  useEffect(() => {
    api.get("/api/settings").then((res) => setSettings({ ...settingsFallback, ...res.data })).catch(() => setSettings(settingsFallback));
  }, []);

  return (
    <main>
      <section className="bg-black py-20 text-white">
        <div className="container-pad">
          <p className="mb-4 text-sm font-black uppercase tracking-[0.22em] text-chrome">About {settings.companyName}</p>
          <h1 className="max-w-4xl text-4xl font-black leading-tight sm:text-5xl">A professional construction partner for homes, commercial spaces, and renovations.</h1>
        </div>
      </section>
      <section className="py-20">
        <div className="container-pad grid gap-10 lg:grid-cols-2 lg:items-center">
          <img className="h-full min-h-[420px] rounded-lg object-cover shadow-premium" src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80" alt="Construction team" />
          <div>
            <SectionTitle eyebrow="Who We Are" title="Built on engineering discipline and transparent execution" text={`${settings.companyName} manages complete construction journeys, from concept planning to final handover. Our process keeps clients informed while our site teams handle quality, materials, safety, and daily coordination.`} />
            <div className="grid gap-4 sm:grid-cols-2">
              {["Turnkey construction", "Quality supervision", "Budget clarity", "Timeline control"].map((item) => <div key={item} className="rounded-lg border border-zinc-200 p-5 font-bold">{item}</div>)}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;
