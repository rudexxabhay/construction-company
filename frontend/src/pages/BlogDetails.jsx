import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ImageIcon } from "lucide-react";
import api from "../api/axios";
import { blogsFallback } from "../data/fallbackData";

const BlogDetails = () => {
  const { id } = useParams();
  const fallback = blogsFallback.find((blog) => blog.slug === id || blog._id === id) || blogsFallback[0];
  const [blog, setBlog] = useState(fallback);

  useEffect(() => {
    api.get(`/api/blogs/${id}`).then((res) => setBlog(res.data)).catch(() => setBlog(fallback));
  }, [id]);

  return (
    <main>
      <section className="bg-black py-16 text-white"><div className="container-pad"><Link to="/blog" className="text-sm font-bold text-chrome">Back to blog</Link><h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight sm:text-5xl">{blog.title}</h1>{(blog.category || blog.author) && <p className="mt-4 text-zinc-300">{[blog.category, blog.author].filter(Boolean).join(" · ")}</p>}</div></section>
      <article className="container-pad py-16">
        <div className="flex w-full items-center justify-center rounded-lg bg-zinc-100 shadow-premium">
          {blog.image ? <img className="h-auto w-full object-contain" src={blog.image} alt={blog.title} /> : <div className="flex min-h-48 w-full items-center justify-center text-zinc-400"><ImageIcon size={40} /></div>}
        </div>
        <p className="mt-10 max-w-4xl text-lg leading-8 text-zinc-700">{blog.content}</p>
      </article>
    </main>
  );
};

export default BlogDetails;
