import React, { useEffect, useState } from "react";
import api from "../api/axios";
import ImageUploader from "../components/ImageUploader";

const blank = { title: "", description: "", icon: "HardHat", image: "", category: "", features: "" };

const ServicesAdmin = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const load = () => {
    setLoading(true);
    return api.get("/api/services")
      .then((res) => setItems(res.data))
      .catch((err) => setMessage(err.response?.data?.message || "Could not load services."))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const reset = () => { setForm(blank); setEditing(null); };
  const submit = async (e) => {
    e.preventDefault();
    const payload = { ...form, features: form.features.split(/[\n,]/).map((item) => item.trim()).filter(Boolean) };
    try { editing ? await api.put(`/api/services/${editing}`, payload) : await api.post("/api/services", payload); setMessage(editing ? "Service updated." : "Service added."); reset(); load(); } catch (err) { setMessage(err.response?.data?.message || "Save failed."); }
  };
  const edit = (item) => { setEditing(item._id); setForm({ title: item.title, description: item.description, icon: item.icon, image: item.image, category: item.category || "", features: (item.features || []).join("\n") }); };
  const remove = async (id) => {
    if (!window.confirm("Delete this service?")) return;
    try {
      await api.delete(`/api/services/${id}`);
      setMessage("Service deleted.");
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Delete failed.");
    }
  };

  return (
    <section><h1 className="text-2xl font-black">Service Management</h1><div className="mt-4 grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
      <form onSubmit={submit} className="admin-card grid gap-3"><h2 className="text-xl font-black">{editing ? "Edit Service" : "Add Service"}</h2>
        <input className="input" name="title" placeholder="Enter service title" value={form.title} onChange={update} required />
        <div><input className="input" name="icon" placeholder="Paste icon name like Hammer" value={form.icon} onChange={update} required /><p className="mt-1 text-xs font-semibold text-zinc-500">Use lucide-react icon names</p></div>
        <input className="input" name="category" placeholder="Enter service category" value={form.category} onChange={update} required />
        <ImageUploader label="Service Image" name="image" value={form.image} onChange={update} required placeholder="Paste service image URL here" />
        <textarea className="input min-h-20" name="description" placeholder="Enter service description" value={form.description} onChange={update} required />
        <textarea className="input min-h-20" name="features" placeholder="Add features separated by comma" value={form.features} onChange={update} />
        {message && <p className="text-sm font-bold">{message}</p>}
        <div className="flex flex-col gap-3 sm:flex-row"><button className="btn-primary">{editing ? "Update" : "Add"} Service</button>{editing && <button type="button" className="btn-dark" onClick={reset}>Cancel</button>}</div>
      </form>
      <div className="admin-card">{loading ? "Loading..." : items.length === 0 ? "No services found." : <>
        <div className="grid gap-3 md:hidden">{items.map((item) => <article key={item._id} className="rounded-md border border-zinc-200 p-3"><h3 className="font-black">{item.title}</h3><p className="mt-2 text-sm text-zinc-600">{item.category} · Icon: {item.icon}</p><div className="action-row mt-4"><button className="action-btn action-edit" onClick={() => edit(item)}>Edit</button><button className="action-btn action-delete" onClick={() => remove(item._id)}>Delete</button></div></article>)}</div>
        <div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[760px] text-left text-sm"><thead><tr className="border-b"><th className="p-3">Title</th><th>Category</th><th>Icon</th><th>Actions</th></tr></thead><tbody>{items.map((item) => <tr key={item._id} className="border-b"><td className="p-3 font-bold">{item.title}</td><td>{item.category}</td><td>{item.icon}</td><td><div className="action-row"><button className="action-btn action-edit" onClick={() => edit(item)}>Edit</button><button className="action-btn action-delete" onClick={() => remove(item._id)}>Delete</button></div></td></tr>)}</tbody></table></div>
      </>}</div>
    </div></section>
  );
};

export default ServicesAdmin;
