import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { workflowFallback } from "../data/fallbackData";

const blank = { title: "", description: "", icon: "CheckCircle2", fontStyle: "", order: 0 };

const WorkflowAdmin = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = () => {
    setLoading(true);
    return api.get("/api/workflow")
      .then((res) => setItems(res.data))
      .catch((err) => {
        setItems(workflowFallback);
        setMessage(err.response?.data?.message || "Could not load workflow.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.name === "order" ? Number(e.target.value) : e.target.value });
  const reset = () => { setForm(blank); setEditing(null); };

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      editing ? await api.put(`/api/workflow/${editing}`, form) : await api.post("/api/workflow", form);
      setMessage(editing ? "Workflow step updated." : "Workflow step added.");
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
      icon: item.icon || "CheckCircle2",
      fontStyle: item.fontStyle || "",
      order: item.order || 0
    });
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this workflow step?")) return;
    try {
      await api.delete(`/api/workflow/${id}`);
      setMessage("Workflow step deleted.");
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Delete failed.");
    }
  };

  return (
    <section>
      <h1 className="text-2xl font-black">Workflow Management</h1>
      <div className="mt-4 grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
        <form onSubmit={submit} className="admin-card grid gap-3">
          <h2 className="text-xl font-black">{editing ? "Edit Step" : "Add Step"}</h2>
          <input className="input" name="title" placeholder="Enter workflow step title" value={form.title} onChange={update} required />
          <textarea className="input min-h-20" name="description" placeholder="Enter workflow step description" value={form.description} onChange={update} required />
          <div><input className="input" name="icon" placeholder="Paste icon name like Hammer" value={form.icon} onChange={update} required /><p className="mt-1 text-xs font-semibold text-zinc-500">Use lucide-react icon names</p></div>
          <input className="input" name="fontStyle" placeholder="Enter font style/class optional" value={form.fontStyle} onChange={update} />
          <input className="input" type="number" name="order" placeholder="order" value={form.order} onChange={update} />
          {message && <p className="text-sm font-bold">{message}</p>}
          <div className="flex flex-col gap-3 sm:flex-row"><button className="btn-primary">{editing ? "Update" : "Add"} Step</button>{editing && <button type="button" className="btn-dark" onClick={reset}>Cancel</button>}</div>
        </form>
        <div className="admin-card">
          {loading ? "Loading..." : items.length === 0 ? "No workflow steps found." : (
            <div className="grid gap-3">
              {items.map((item) => (
                <article key={item._id} className="rounded-md border border-zinc-200 p-3">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <h3 className="font-black">{item.order ? `${item.order}. ` : ""}{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-zinc-600">{item.description}</p>
                      <p className="mt-2 text-xs font-bold text-zinc-500">Icon: {item.icon} {item.fontStyle ? `| Style: ${item.fontStyle}` : ""}</p>
                    </div>
                    <div className="action-row"><button className="action-btn action-edit" onClick={() => edit(item)}>Edit</button><button className="action-btn action-delete" onClick={() => remove(item._id)}>Delete</button></div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default WorkflowAdmin;
