import React, { useEffect, useState } from "react";
import api from "../api/axios";

const blank = { name: "", category: "", unit: "Nos", rate: "", gstPercent: "18" };
const cleanNumber = (value) => {
  const number = typeof value === "string" ? Number(value.replace(/,/g, "").trim()) : Number(value);
  return Number.isFinite(number) ? Math.max(number, 0) : 0;
};
const formatMoney = (value) => cleanNumber(value).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatPrice = (value) => `₹${formatMoney(value)}`;
const getGST = (value) => {
  if (value === 0 || value === "0") return 0;
  if (value === "" || value === null || value === undefined) return 18;
  const number = Number(value);
  if (Number.isNaN(number) || number < 0 || number > 100) return 18;
  return number;
};

const ItemsAdmin = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = () => {
    setLoading(true);
    return api.get("/api/items").then((res) => setItems(res.data)).catch((err) => setMessage(err.response?.data?.message || "Could not load items.")).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const reset = () => { setForm(blank); setEditing(null); };
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const payload = () => ({ ...form, rate: cleanNumber(form.rate), price: cleanNumber(form.rate), gstPercent: getGST(form.gstPercent) });

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      editing ? await api.put(`/api/items/${editing}`, payload()) : await api.post("/api/items", payload());
      setMessage(editing ? "Item updated." : "Item added.");
      reset();
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Save failed.");
    }
  };

  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      const { data } = await api.post("/api/items/upload", { text });
      setMessage(`${data.count} items uploaded.`);
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Upload failed. Use columns: name,category,unit,rate,gstPercent");
    }
    e.target.value = "";
  };

  const edit = (item) => {
    setEditing(item._id);
    setForm({ name: item.name || "", category: item.category || "", unit: item.unit || "Nos", rate: item.rate ?? item.price ?? "", gstPercent: item.gstPercent ?? 18 });
  };
  const remove = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      await api.delete(`/api/items/${id}`);
      setMessage("Item deleted.");
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Delete failed.");
    }
  };

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-black sm:text-2xl">Items</h1>
        <label className="btn-dark cursor-pointer">Upload Excel/CSV<input className="hidden" type="file" accept=".csv,.tsv,.txt,.xlsx" onChange={upload} /></label>
      </div>
      <div className="mt-4 grid min-w-0 gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
        <form onSubmit={submit} className="admin-card grid gap-3">
          <h2 className="text-xl font-black">{editing ? "Edit Item" : "Add Item"}</h2>
          <div><label className="label">Item Name</label><input className="input" name="name" value={form.name} onChange={update} placeholder="Enter item name" required /></div>
          <div><label className="label">Category</label><input className="input" name="category" value={form.category} onChange={update} placeholder="Enter item category" /></div>
          <div><label className="label">Unit</label><input className="input" name="unit" value={form.unit} onChange={update} placeholder="Enter unit, e.g. Nos, Sq Ft" /></div>
          <div><label className="label">Price</label><input className="input" type="number" min="0" step="0.01" name="rate" value={form.rate} onChange={update} placeholder="Enter item price" required /></div>
          <div><label className="label">GST Percentage</label><input className="input" type="number" min="0" max="100" step="0.01" name="gstPercent" value={form.gstPercent} onChange={update} placeholder="Enter GST percentage" /></div>
          {message && <p className="text-sm font-bold">{message}</p>}
          <div className="flex flex-col gap-3 sm:flex-row"><button className="btn-primary">{editing ? "Update" : "Add"} Item</button>{editing && <button type="button" className="btn-dark" onClick={reset}>Cancel</button>}</div>
        </form>
        <div className="grid min-w-0 gap-3">
          {loading ? <div className="admin-card">Loading...</div> : items.map((item) => (
            <article key={item._id} className="admin-card grid min-w-0 gap-3 md:grid-cols-[minmax(0,1fr)_140px_90px_90px_130px] md:items-center">
              <div className="min-w-0"><h3 className="break-words font-black">{item.name}</h3><p className="break-words text-sm text-zinc-600">{item.category || "Uncategorized"} | {item.unit || "Nos"}</p></div>
              <b className="break-words text-sm">{formatPrice(item.rate ?? item.price)}</b>
              <b className="text-sm">{formatMoney(item.gstPercent)}%</b>
              <span className="text-sm text-zinc-500">{new Date(item.createdAt).toLocaleDateString("en-IN")}</span>
              <div className="action-row md:justify-end"><button className="action-btn action-edit" onClick={() => edit(item)}>Edit</button><button className="action-btn action-delete" onClick={() => remove(item._id)}>Delete</button></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ItemsAdmin;
