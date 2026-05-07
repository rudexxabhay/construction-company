import React from "react";
import { MapPin } from "lucide-react";

const ProjectCard = ({ project, onView }) => (
  <article className="flex h-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-md transition duration-200 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-premium">
    <div className="relative">
      <img className="h-56 w-full object-cover sm:h-60" src={project.image} alt={project.title} />
      <span className="absolute left-4 top-4 rounded-lg bg-chrome px-3 py-1 text-xs font-black uppercase text-black shadow-md">
        {project.status}
      </span>
    </div>
    <div className="flex flex-1 flex-col p-5 sm:p-6">
      <p className="text-sm font-bold uppercase text-zinc-500">{project.type}</p>
      <h3 className="mt-2 text-xl font-black text-black">{project.title}</h3>
      <p className="mt-3 flex items-center gap-2 text-sm text-zinc-600"><MapPin size={16} /> {project.location}</p>
      <p className="mt-4 flex-1 text-sm leading-6 text-zinc-600">{project.description}</p>
      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-md bg-zinc-50 p-3"><span className="block text-zinc-500">Budget</span><b>{project.budget}</b></div>
        <div className="rounded-md bg-zinc-50 p-3"><span className="block text-zinc-500">Duration</span><b>{project.duration}</b></div>
      </div>
      <div className="mt-5">
        <div className="mb-2 flex justify-between text-xs font-bold text-zinc-600"><span>Progress</span><span>{project.progress}%</span></div>
        <div className="h-2 rounded-full bg-zinc-100"><div className="h-2 rounded-full bg-chrome" style={{ width: `${project.progress}%` }} /></div>
      </div>
      {onView && <button className="btn-dark mt-5 w-full" onClick={() => onView(project)}>View Details</button>}
    </div>
  </article>
);

export default ProjectCard;
