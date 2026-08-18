import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, Clock3, Tag } from "lucide-react";
import blog1Image from "../assets/blog1.jpeg";
import blog2Image from "../assets/blog2.jpeg";

const articles = [
  {
    slug: "residential-construction-tips-for-homeowners",
    category: "Residential",
    title: "Residential Construction Tips for Homeowners",
    excerpt:
      "A practical look at planning, materials, and supervision choices that help homeowners stay on budget and keep the build on track.",
    date: "Aug 12, 2026",
    readTime: "6 min read",
    image: blog1Image
  },
  {
    slug: "commercial-project-planning-guide",
    category: "Commercial",
    title: "Commercial Project Planning Guide",
    excerpt:
      "Clear milestones, site coordination, and disciplined execution make commercial projects more predictable and easier to deliver well.",
    date: "Aug 09, 2026",
    readTime: "5 min read",
    image: blog2Image
  }
];

const BlogCard = ({ article }) => (
  <article className="blog-mini__card">
    <Link className="blog-mini__imageLink" to={`/blog/${article.slug}`} aria-label={article.title}>
      <img className="blog-mini__image" src={article.image} alt={article.title} loading="lazy" decoding="async" />
    </Link>

    <div className="blog-mini__body">
      <div className="blog-mini__meta">
        <span className="blog-mini__category">
          <Tag size={12} aria-hidden="true" />
          {article.category}
        </span>
        <span className="blog-mini__metaItem">
          <CalendarDays size={12} aria-hidden="true" />
          {article.date}
        </span>
        <span className="blog-mini__metaItem">
          <Clock3 size={12} aria-hidden="true" />
          {article.readTime}
        </span>
      </div>

      <h2 className="blog-mini__title">
        <Link className="blog-mini__titleLink" to={`/blog/${article.slug}`}>
          {article.title}
        </Link>
      </h2>

      <p className="blog-mini__excerpt">{article.excerpt}</p>

      <Link className="blog-mini__readMore" to={`/blog/${article.slug}`}>
        Read More
        <ArrowRight size={15} aria-hidden="true" />
      </Link>
    </div>
  </article>
);

const Blog = () => {
  return (
    <main className="blog-mini">
      <div className="blog-mini__shell">
        <header className="blog-mini__intro">
          <p className="blog-mini__eyebrow">OUR BLOG</p>
          <h1 className="blog-mini__titleMain">
            Construction Insights,
            <span>Ideas & Project Stories</span>
          </h1>
          <p className="blog-mini__subtitle">
            Expert advice, practical planning notes, and project stories from the Quality Construction team.
          </p>
        </header>

        <section className="blog-mini__section" aria-label="Blog articles">
          <div className="blog-mini__sectionHeader">
            <h2 className="blog-mini__sectionTitle">Latest Articles</h2>
          </div>

          <div className="blog-mini__grid">
            {articles.map((article) => (
              <BlogCard key={article.slug} article={article} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};

export default Blog;
