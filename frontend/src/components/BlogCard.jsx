import React from "react";
import { Link } from "react-router-dom";
import { CalendarDays, ImageIcon } from "lucide-react";

const BlogCard = ({ blog }) => (
  <article className="flex h-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-md transition duration-200 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-premium">
    <div className="flex w-full items-center justify-center bg-zinc-100">
      {blog.image ? <img className="h-auto w-full object-contain" src={blog.image} alt={blog.title} /> : <div className="flex min-h-32 w-full items-center justify-center text-zinc-400"><ImageIcon size={32} /></div>}
    </div>
    <div className="flex flex-1 flex-col p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase text-zinc-500">
        {blog.category && <span className="rounded-lg bg-yellow-100 px-2 py-1 text-black">{blog.category}</span>}
        <span className="flex items-center gap-1"><CalendarDays size={14} /> {new Date(blog.createdAt || Date.now()).toLocaleDateString()}</span>
      </div>
      <h3 className="mt-4 text-xl font-black leading-tight text-black">{blog.title}</h3>
      <p className="mt-3 flex-1 text-sm leading-6 text-zinc-600">{blog.shortDescription || blog.content}</p>
      <Link className="mt-5 inline-flex text-sm font-black text-black underline decoration-chrome decoration-2 underline-offset-4" to={`/blog/${blog.slug || blog._id}`}>
        Read article
      </Link>
    </div>
  </article>
);

export default BlogCard;
