import React, { useEffect, useState } from "react";
import api from "../api/axios";
import BlogCard from "../components/BlogCard";
import SectionTitle from "../components/SectionTitle";
import { blogsFallback } from "../data/fallbackData";

const Blog = () => {
  const [blogs, setBlogs] = useState(blogsFallback);
  useEffect(() => {
    api.get("/api/blogs").then((res) => setBlogs(res.data)).catch(() => setBlogs(blogsFallback));
  }, []);

  return (
    <main>
      <section className="bg-black py-20 text-white"><div className="container-pad"><h1 className="text-4xl font-black sm:text-5xl">Construction Blog</h1><p className="mt-4 max-w-2xl text-zinc-300">Practical guidance for planning, materials, budgeting, and project execution.</p></div></section>
      <section className="py-20"><div className="container-pad"><SectionTitle eyebrow="Insights" title="Latest articles" align="center" /><div className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-3 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-3">{blogs.map((blog) => <div key={blog._id} className="min-w-[85%] snap-start md:min-w-0"><BlogCard blog={blog} /></div>)}</div></div></section>
    </main>
  );
};

export default Blog;
