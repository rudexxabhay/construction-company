import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";
import { blogsFallback } from "../data/fallbackData";

const BlogDetails = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);

  const fallbackBlog = useMemo(() => blogsFallback.find((item) => item._id === id || item.slug === id) || blogsFallback[0], [id]);

  useEffect(() => {
    api.get(`/api/blogs/${id}`)
      .then((res) => setBlog(res.data))
      .catch(() => setBlog(fallbackBlog));
  }, [fallbackBlog, id]);

  const article = blog || fallbackBlog;

  return (
    <main>
      <section className="bg-black py-16 text-white md:py-20">
        <div className="container-pad">
          <Link to="/blog" className="text-sm font-bold text-chrome transition hover:underline">← Back to Blogs</Link>
          <p className="mt-4 text-sm font-black uppercase tracking-[0.22em] text-chrome">{article.category || "Blog"}</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-black leading-tight sm:text-5xl">{article.title}</h1>
          {(article.author || article.createdAt) && (
            <p className="mt-4 text-zinc-300">
              {[article.author, article.createdAt ? new Date(article.createdAt).toLocaleDateString() : null].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
      </section>

      <section className="py-8 md:py-16">
        <div className="container-pad max-w-4xl">
          {article.image && <img className="h-auto w-full rounded-xl object-cover shadow-md" src={article.image} alt={article.title} />}
          <div className="mt-8 space-y-5 text-[15px] leading-8 text-zinc-700">
            <p>{article.content || article.shortDescription}</p>
            <p>
              This article is part of our ongoing blog series on construction planning, quality control, materials, and delivery practices.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default BlogDetails;
