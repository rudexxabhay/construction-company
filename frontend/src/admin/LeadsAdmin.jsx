import React, { useEffect, useState } from "react";
import api from "../api/axios";

const LeadsAdmin = () => {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const load = () => {
    setLoading(true);
    return api.get("/api/leads")
      .then((res) => setItems(res.data))
      .catch((err) => setMessage(err.response?.data?.message || "Could not load leads."))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);
  const remove = async (id) => {
    if (!window.confirm("Delete this lead?")) return;
    try {
      await api.delete(`/api/leads/${id}`);
      setMessage("Lead deleted.");
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Delete failed.");
    }
  };
  const updateLead = async (item, patch) => {
    try {
      await api.put(`/api/leads/${item._id}`, { status: item.status || "Open", remark: item.remark || "", ...patch });
      setMessage("Lead updated.");
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Update failed.");
    }
  };
  const visible = filter === "All" ? items : items.filter((item) => (item.status || "Open") === filter);

  return (
    <section><h1 className="text-2xl font-black">Lead Management</h1>{message && <p className="mt-4 font-bold">{message}</p>}
    <div className="mt-5 flex flex-wrap gap-3">{["All", "Open", "Closed"].map((item) => <button key={item} className={`rounded-md px-3 py-2 text-sm font-black ${filter === item ? "bg-chrome text-black" : "bg-white text-zinc-700"}`} onClick={() => setFilter(item)}>{item}</button>)}</div>
    <div className="admin-card mt-4">{loading ? "Loading..." : visible.length === 0 ? "No leads found." : <>
      <div className="grid gap-3 md:hidden">{visible.map((item) => <article key={item._id} className={`rounded-md border p-3 ${item.status === "Closed" ? "border-zinc-200 bg-zinc-100 opacity-80" : "border-zinc-200 bg-white"}`}><div className="flex items-start justify-between gap-3"><h3 className="font-black">{item.name}</h3><span className="rounded bg-chrome px-2 py-1 text-xs font-black">{item.status || "Open"}</span></div><p className="mt-2 break-words text-sm text-zinc-600">{item.email}</p><p className="mt-1 text-sm text-zinc-600">{item.phone}</p><p className="mt-3 text-sm font-semibold">{item.serviceType}</p><p className="mt-2 text-sm leading-6 text-zinc-700">{item.message}</p><p className="mt-2 text-xs text-zinc-500">{new Date(item.createdAt || Date.now()).toLocaleString()}</p><textarea className="input mt-3 min-h-20" placeholder="Add/update remark" defaultValue={item.remark || ""} onBlur={(e) => updateLead(item, { remark: e.target.value })} /><div className="action-row mt-4"><button className="action-btn action-edit" onClick={() => updateLead(item, { status: item.status === "Closed" ? "Open" : "Closed" })}>{item.status === "Closed" ? "Mark Open" : "Mark Closed"}</button><button className="action-btn action-delete" onClick={() => remove(item._id)}>Delete</button></div></article>)}</div>
      <div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[1100px] text-left text-sm"><thead><tr className="border-b"><th className="p-3">Name</th><th>Email</th><th>Phone</th><th>Service</th><th>Status</th><th>Remark</th><th>Created</th><th>Actions</th></tr></thead><tbody>{visible.map((item) => <tr key={item._id} className={`border-b align-top ${item.status === "Closed" ? "bg-zinc-100 text-zinc-500" : ""}`}><td className="p-3 font-bold">{item.name}<p className="mt-2 max-w-xs font-normal">{item.message}</p></td><td>{item.email}</td><td>{item.phone}</td><td>{item.serviceType}</td><td><select className="input min-w-28" value={item.status || "Open"} onChange={(e) => updateLead(item, { status: e.target.value })}><option>Open</option><option>Closed</option></select></td><td><textarea className="input min-h-20 min-w-56" defaultValue={item.remark || ""} onBlur={(e) => updateLead(item, { remark: e.target.value })} /></td><td>{new Date(item.createdAt || Date.now()).toLocaleDateString()}</td><td><div className="action-row"><button className="action-btn action-delete" onClick={() => remove(item._id)}>Delete</button></div></td></tr>)}</tbody></table></div>
    </>}</div></section>
  );
};

export default LeadsAdmin;
