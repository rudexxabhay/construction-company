import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { trustedFallback } from "../data/fallbackData";
import ImageUploader from "../components/ImageUploader";

const blank = { title: "", description: "", icon: "ShieldCheck", imageUrl: "", order: 0 };

const TrustedAdmin = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = () => {
    setLoading(true);
    return api.get("/api/trusted")
      .then((res) => setItems(res.data))
      .catch((err) => {
        setItems(trustedFallback);
        setMessage(err.response?.data?.message || "Could not load trusted items.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.name === "order" ? Number(e.target.value) : e.target.value });
  const reset = () => { setForm(blank); setEditing(null); };

  const submit = async (e) => {
    e.preventDefault();
    try {
      editing ? await api.put(`/api/trusted/${editing}`, form) : await api.post("/api/trusted", form);
      setMessage(editing ? "Trusted item updated." : "Trusted item added.");
      reset();
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Save failed.");
    }
  };

  const edit = (item) => {
    setEditing(item._id);
    setForm({
      title: item.title || "",
      description: item.description || "",
      icon: item.icon || "ShieldCheck",
      imageUrl: item.imageUrl || "",
      order: item.order || 0
    });
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this trusted item?")) return;
    try {
      await api.delete(`/api/trusted/${id}`);
      setMessage("Trusted item deleted.");
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Delete failed.");
    }
  };

  return (
    <section>
      <h1 className="text-2xl font-black">Trusted Section</h1>
      <div className="mt-4 grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
        <form onSubmit={submit} className="admin-card grid gap-3">
          <h2 className="text-xl font-black">{editing ? "Edit Trusted Item" : "Add Trusted Item"}</h2>
          <input className="input" name="title" placeholder="Enter trusted item title" value={form.title} onChange={update} required />
          <textarea className="input min-h-20" name="description" placeholder="Enter trusted item description" value={form.description} onChange={update} required />
          <div>
            <input className="input" name="icon" placeholder="Paste icon name like ShieldCheck" value={form.icon} onChange={update} />
            <p className="mt-1 text-xs font-semibold text-zinc-500">Use lucide-react icon names</p>
          </div>
          <ImageUploader label="Trusted Section Image" name="imageUrl" value={form.imageUrl} onChange={update} placeholder="Paste image URL optional" />
          <input className="input" type="number" name="order" placeholder="Display order" value={form.order} onChange={update} />
          {message && <p className="text-sm font-bold">{message}</p>}
          <div className="flex flex-col gap-3 sm:flex-row"><button className="btn-primary">{editing ? "Update" : "Add"} Item</button>{editing && <button type="button" className="btn-dark" onClick={reset}>Cancel</button>}</div>
        </form>
        <div className="admin-card">
          {loading ? "Loading..." : items.length === 0 ? "No trusted items found." : (
            <div className="grid gap-3">
              {items.map((item) => (
                <article key={item._id} className="rounded-md border border-zinc-200 p-3">
                  <h3 className="font-black">{item.order ? `${item.order}. ` : ""}{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">{item.description}</p>
                  <p className="mt-2 text-xs font-bold text-zinc-500">Icon: {item.icon}</p>
                  <div className="action-row mt-4"><button className="action-btn action-edit" onClick={() => edit(item)}>Edit</button><button className="action-btn action-delete" onClick={() => remove(item._id)}>Delete</button></div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TrustedAdmin;
