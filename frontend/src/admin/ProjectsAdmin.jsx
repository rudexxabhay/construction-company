import React, { useEffect, useState } from "react";
import api from "../api/axios";
import ImageUploader from "../components/ImageUploader";

const blank = { title: "", location: "", type: "", status: "Current", budget: "", duration: "", description: "", image: "", progress: 0 };

const ProjectsAdmin = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const load = () => {
    setLoading(true);
    return api.get("/api/projects")
      .then((res) => setItems(res.data))
      .catch((err) => setMessage(err.response?.data?.message || "Could not load projects."))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.name === "progress" ? Number(e.target.value) : e.target.value });
  const reset = () => { setForm(blank); setEditing(null); };
  const submit = async (e) => {
    e.preventDefault();
    try { editing ? await api.put(`/api/projects/${editing}`, form) : await api.post("/api/projects", form); setMessage(editing ? "Project updated." : "Project added."); reset(); load(); } catch (err) { setMessage(err.response?.data?.message || "Save failed."); }
  };
  const edit = (item) => { setEditing(item._id); setForm({ title: item.title, location: item.location, type: item.type, status: item.status, budget: item.budget, duration: item.duration, description: item.description, image: item.image, progress: item.progress }); };
  const remove = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    try {
      await api.delete(`/api/projects/${id}`);
      setMessage("Project deleted.");
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Delete failed.");
    }
  };

  return (
    <section><h1 className="text-2xl font-black">Project Management</h1><div className="mt-4 grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
      <form onSubmit={submit} className="admin-card grid gap-3"><h2 className="text-xl font-black">{editing ? "Edit Project" : "Add Project"}</h2>
        <input className="input" name="title" placeholder="Enter project title" value={form.title} onChange={update} required />
        <input className="input" name="location" placeholder="Enter location" value={form.location} onChange={update} required />
        <input className="input" name="type" placeholder="Enter project type" value={form.type} onChange={update} required />
        <input className="input" name="budget" placeholder="Enter budget like ₹25 Lakhs" value={form.budget} onChange={update} required />
        <input className="input" name="duration" placeholder="Enter duration like 6 months" value={form.duration} onChange={update} required />
        <ImageUploader label="Project Image" name="image" value={form.image} onChange={update} required placeholder="Paste project image URL here" />
        <select className="input" name="status" value={form.status} onChange={update}><option>Current</option><option>Completed</option></select>
        <input className="input" type="number" min="0" max="100" name="progress" placeholder="progress" value={form.progress} onChange={update} required />
        <textarea className="input min-h-20" name="description" placeholder="Enter project description" value={form.description} onChange={update} required />
        {message && <p className="text-sm font-bold">{message}</p>}
        <div className="flex flex-col gap-3 sm:flex-row"><button className="btn-primary">{editing ? "Update" : "Add"} Project</button>{editing && <button type="button" className="btn-dark" onClick={reset}>Cancel</button>}</div>
      </form>
      <div className="admin-card">{loading ? "Loading..." : items.length === 0 ? "No projects found." : <>
        <div className="grid gap-3 md:hidden">{items.map((item) => <article key={item._id} className="rounded-md border border-zinc-200 p-3"><h3 className="font-black">{item.title}</h3><p className="mt-2 text-sm text-zinc-600">{item.status} · {item.location}</p><p className="mt-1 text-sm font-semibold">{item.progress}% complete</p><div className="action-row mt-4"><button className="action-btn action-edit" onClick={() => edit(item)}>Edit</button><button className="action-btn action-delete" onClick={() => remove(item._id)}>Delete</button></div></article>)}</div>
        <div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[840px] text-left text-sm"><thead><tr className="border-b"><th className="p-3">Title</th><th>Status</th><th>Location</th><th>Progress</th><th>Actions</th></tr></thead><tbody>{items.map((item) => <tr key={item._id} className="border-b"><td className="p-3 font-bold">{item.title}</td><td>{item.status}</td><td>{item.location}</td><td>{item.progress}%</td><td><div className="action-row"><button className="action-btn action-edit" onClick={() => edit(item)}>Edit</button><button className="action-btn action-delete" onClick={() => remove(item._id)}>Delete</button></div></td></tr>)}</tbody></table></div>
      </>}</div>
    </div></section>
  );
};

export default ProjectsAdmin;
