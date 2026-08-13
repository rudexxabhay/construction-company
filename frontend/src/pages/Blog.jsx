import React, { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import BlogCard from "../components/BlogCard";
import SectionTitle from "../components/SectionTitle";
import { blogsFallback } from "../data/fallbackData";
import useHeroIntro from "../hooks/useHeroIntro";
import useSectionReveal from "../hooks/useSectionReveal";

const Blog = () => {
  const heroRef = useRef(null);
  const sectionRef = useRef(null);
  const [blogs, setBlogs] = useState(blogsFallback);

  useEffect(() => {
    api.get("/api/blogs").then((res) => setBlogs(res.data)).catch(() => setBlogs(blogsFallback));
  }, []);

  useHeroIntro(heroRef);
  useSectionReveal(sectionRef, {
    introSelector: "[data-reveal-intro]",
    itemSelector: "[data-reveal-item]",
    start: "top 84%",
    introY: 18,
    itemY: 24,
    itemStagger: 0.1
  });

  return (
    <main>
      <section className="bg-black py-16 text-white md:py-20">
        <div className="container-pad" ref={heroRef}>
          <p className="mb-4 text-sm font-black uppercase tracking-[0.22em] text-chrome" data-hero-reveal="eyebrow">Blogs</p>
          <h1 className="max-w-4xl text-4xl font-black leading-tight sm:text-5xl">
            <span className="block" data-hero-reveal="title">Construction ideas, project planning,</span>
            <span className="block" data-hero-reveal="title">and practical site insights.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-zinc-300" data-hero-reveal="subtitle">Useful articles from the Quality Construction team to help you plan, budget, and execute your next project with clarity.</p>
        </div>
      </section>

      <section className="py-8 md:py-16" ref={sectionRef}>
        <div className="container-pad">
          <div data-reveal-intro>
            <SectionTitle eyebrow="Insights" title="Latest articles" text="Practical updates and guidance for homeowners, business owners, and project planners." align="center" />
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <div key={blog._id} className="min-w-0" data-reveal-item>
                <BlogCard blog={blog} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Blog;
