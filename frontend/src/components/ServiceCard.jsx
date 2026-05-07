import React from "react";
import { ArrowUpRight, CheckCircle2, HardHat } from "lucide-react";
import * as Icons from "lucide-react";

const ServiceCard = ({ service }) => {
  const Icon = Icons[service.icon] || HardHat;
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-md transition duration-200 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-premium">
      <img className="h-[110px] w-full object-cover sm:h-52" src={service.image} alt={service.title} />
      <div className="flex flex-1 flex-col p-3 sm:p-6">
        <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-black text-chrome sm:mb-5 sm:h-12 sm:w-12">
          <Icon size={18} className="sm:h-6 sm:w-6" />
        </div>
        {service.category && <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-zinc-500">{service.category}</p>}
        <div className="flex items-start justify-between gap-2 sm:gap-4">
          <h3 className="line-clamp-2 text-sm font-black leading-5 text-black sm:text-xl sm:leading-tight">{service.title}</h3>
          <ArrowUpRight className="shrink-0 text-zinc-400 transition group-hover:text-chrome" size={20} />
        </div>
        <p className="mt-2 line-clamp-3 text-xs leading-5 text-zinc-600 sm:mt-3 sm:text-sm sm:leading-6 sm:line-clamp-none">{service.description}</p>
        {service.features?.length > 0 && (
          <div className="mt-3 grid gap-2 sm:mt-5">
            {service.features.map((feature) => <span key={feature} className="flex gap-2 text-xs font-semibold text-zinc-700 sm:text-sm"><CheckCircle2 className="mt-0.5 shrink-0 text-chrome" size={14} />{feature}</span>)}
          </div>
        )}
      </div>
    </article>
  );
};

export default ServiceCard;
