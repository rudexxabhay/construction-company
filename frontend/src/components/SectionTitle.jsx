import React from "react";

const SectionTitle = ({ eyebrow, title, text, align = "left", theme = "light" }) => (
  <div className={`mb-5 max-w-3xl md:mb-10 ${align === "center" ? "mx-auto text-center" : ""}`}>
    {eyebrow && <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-chrome sm:mb-3 sm:text-sm">{eyebrow}</p>}
    <h2 className={`text-2xl font-black leading-tight sm:text-4xl ${theme === "dark" ? "text-white" : "text-black"}`}>{title}</h2>
    {text && <p className={`mt-3 text-sm leading-6 sm:mt-4 sm:text-lg sm:leading-7 ${theme === "dark" ? "text-zinc-300" : "text-zinc-600"}`}>{text}</p>}
  </div>
);

export default SectionTitle;
