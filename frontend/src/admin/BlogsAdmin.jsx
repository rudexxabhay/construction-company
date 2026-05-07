import React, { useEffect, useState } from "react";
import api from "../api/axios";
import ImageUploader from "../components/ImageUploader";

const defaultBlogImage = "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80";
const blank = { title: "", description: "", image: "" };

const BlogsAdmin = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const load = () => {
    setLoading(true);
    return api.get("/api/blogs")
      .then((res) => setItems(res.data))
      .catch((err) => setMessage(err.response?.data?.message || "Could not load blogs."))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const reset = () => { setForm(blank); setEditing(null); };
  const payload = () => ({
    title: form.title,
    shortDescription: form.description,
    content: form.description,
    category: "Construction",
    image: form.image || defaultBlogImage,
    author: "QUALITY CONSTRUCTION Team",
    status: "Published"
  });
  const submit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      editing ? await api.put(`/api/blogs/${editing}`, payload()) : await api.post("/api/blogs", payload());
      setMessage(editing ? "Blog updated." : "Blog added.");
      reset();
      load();
    } catch (err) { setMessage(err.response?.data?.message || "Save failed."); }
  };
  const edit = (item) => { setEditing(item._id); setForm({ title: item.title, description: item.content || item.shortDescription || "", image: item.image }); };
  const remove = async (id) => {
    if (!window.confirm("Delete this blog?")) return;
    try {
      await api.delete(`/api/blogs/${id}`);
      setMessage("Blog deleted.");
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Delete failed.");
    }
  };

  return (
    <section><h1 className="text-2xl font-black">Blog Management</h1><div className="mt-4 grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
      <form onSubmit={submit} className="admin-card grid gap-3"><h2 className="text-xl font-black">{editing ? "Edit Blog" : "Add Blog"}</h2>
        <input className="input" name="title" placeholder="Enter blog title" value={form.title} onChange={update} required />
        <textarea className="input min-h-20" name="description" placeholder="Write blog description" value={form.description} onChange={update} required />
        <ImageUploader label="Blog Image" name="image" value={form.image || ""} onChange={update} placeholder="Paste blog image URL optional" />
        {message && <p className="text-sm font-bold">{message}</p>}
        <div className="flex flex-col gap-3 sm:flex-row"><button className="btn-primary">{editing ? "Update" : "Add"} Blog</button>{editing && <button type="button" className="btn-dark" onClick={reset}>Cancel</button>}</div>
      </form>
      <div className="admin-card">{loading ? "Loading..." : items.length === 0 ? "No blogs found." : <>
        <div className="grid gap-3 md:hidden">{items.map((item) => <article key={item._id} className="rounded-md border border-zinc-200 p-3"><h3 className="font-black">{item.title}</h3><p className="mt-2 line-clamp-2 text-sm text-zinc-600">{item.shortDescription || item.content}</p><div className="action-row mt-4"><button className="action-btn action-edit" onClick={() => edit(item)}>Edit</button><button className="action-btn action-delete" onClick={() => remove(item._id)}>Delete</button></div></article>)}</div>
        <div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[680px] text-left text-sm"><thead><tr className="border-b"><th className="p-3">Title</th><th>Description</th><th>Actions</th></tr></thead><tbody>{items.map((item) => <tr key={item._id} className="border-b"><td className="p-3 font-bold">{item.title}</td><td className="max-w-md truncate text-zinc-600">{item.shortDescription || item.content}</td><td><div className="action-row"><button className="action-btn action-edit" onClick={() => edit(item)}>Edit</button><button className="action-btn action-delete" onClick={() => remove(item._id)}>Delete</button></div></td></tr>)}</tbody></table></div>
      </>}</div>
    </div></section>
  );
};

export default BlogsAdmin;
