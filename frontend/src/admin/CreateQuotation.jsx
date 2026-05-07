import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { settingsFallback } from "../data/fallbackData";

const blankForm = {
  clientName: "",
  clientPhone: "",
  clientEmail: "",
  clientAddress: "",
  projectDescription: "",
  validUntil: "",
  status: "Draft",
  discountPercent: 0,
  otherCharges: 0,
  items: []
};

const toNumber = (value) => {
  if (typeof value === "string") return Number(value.replace(/,/g, "").trim());
  return Number(value);
};
const cleanNumber = (value) => {
  const number = toNumber(value);
  return Number.isFinite(number) ? Math.max(number, 0) : 0;
};
const getGST = (value) => {
  if (value === 0 || value === "0") return 0;
  if (value === "" || value === null || value === undefined) return 18;
  const number = Number(value);
  if (Number.isNaN(number) || number < 0 || number > 100) return 18;
  return number;
};
const getDiscount = (value) => {
  if (value === 0 || value === "0") return 0;
  if (value === "" || value === null || value === undefined) return 0;
  const number = Number(value);
  if (Number.isNaN(number) || number < 0 || number > 100) return 0;
  return number;
};
const roundMoney = (value) => Math.round((value + Number.EPSILON) * 100) / 100;
const safeCalculatedMoney = (value) => {
  const rounded = roundMoney(value);
  if (!Number.isFinite(rounded) || rounded < 0 || rounded > 10000000) return 0;
  return rounded;
};
const formatMoney = (value) => new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(cleanNumber(value));
const formatPrice = (value) => `₹${formatMoney(value)}`;
const formatQuantity = (value) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(cleanNumber(value));

const CreateQuotation = () => {
  const [form, setForm] = useState(blankForm);
  const [settings, setSettings] = useState(settingsFallback);
  const [masterItems, setMasterItems] = useState([]);
  const [itemSearch, setItemSearch] = useState("");
  const [selectOpen, setSelectOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const selectRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/api/settings").then((res) => setSettings({ ...settingsFallback, ...res.data })).catch(() => setSettings(settingsFallback));
    api.get("/api/items").then((res) => setMasterItems(res.data)).catch((err) => setMessage(err.response?.data?.message || "Could not load items."));
  }, []);

  useEffect(() => {
    const close = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) setSelectOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const rows = useMemo(() => form.items.map((item) => {
    const quantity = cleanNumber(item.quantity);
    const price = cleanNumber(item.price);
    const gstPercent = getGST(item.gstPercent);
    const amount = safeCalculatedMoney(quantity * price);
    const gstAmount = safeCalculatedMoney((amount * gstPercent) / 100);
    const finalPrice = safeCalculatedMoney(amount + gstAmount);
    return { quantity, price, gstPercent, amount, gstAmount, finalPrice, total: finalPrice };
  }), [form.items]);

  const totals = useMemo(() => {
    const subtotal = roundMoney(rows.reduce((sum, row) => sum + row.amount, 0));
    const gst = safeCalculatedMoney(rows.reduce((sum, row) => sum + row.gstAmount, 0));
    const discountPercent = getDiscount(form.discountPercent);
    const discount = safeCalculatedMoney((subtotal * discountPercent) / 100);
    const otherCharges = cleanNumber(form.otherCharges);
    return { subtotal: safeCalculatedMoney(subtotal), gst, discountPercent, discount, otherCharges, total: safeCalculatedMoney(subtotal + gst + otherCharges - discount) };
  }, [form.discountPercent, form.otherCharges, rows]);

  const selectedIds = new Set(form.items.map((item) => item.itemId));
  const filteredItems = masterItems.filter((item) => item.name.toLowerCase().includes(itemSearch.toLowerCase()));

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const setQuantity = (itemId, quantity) => setForm((current) => ({
    ...current,
    items: current.items.map((item) => item.itemId === itemId ? { ...item, quantity } : item)
  }));

  const toggleItem = (masterItem) => {
    setForm((current) => {
      const exists = current.items.some((item) => item.itemId === masterItem._id);
      if (exists) return { ...current, items: current.items.filter((item) => item.itemId !== masterItem._id) };
      return {
        ...current,
        items: [
          ...current.items,
          {
            itemId: masterItem._id,
            name: masterItem.name,
            unit: masterItem.unit || "",
            quantity: 1,
            price: cleanNumber(masterItem.price),
            gstPercent: getGST(masterItem.gstPercent)
          }
        ]
      };
    });
  };

  const removeItem = (itemId) => setForm((current) => ({ ...current, items: current.items.filter((item) => item.itemId !== itemId) }));

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (form.items.length === 0) {
      setMessage("Select at least one item.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        items: form.items.map((item, index) => ({
          ...item,
          quantity: rows[index].quantity,
          price: rows[index].price,
          gstPercent: rows[index].gstPercent,
          description: item.name,
          amount: rows[index].amount,
          gstAmount: rows[index].gstAmount,
          finalPrice: rows[index].finalPrice,
          total: rows[index].total
        }))
      };
      const { data } = await api.post("/api/quotations", payload);
      navigate(`/secure-admin-dashboard/quotations/${data._id}`);
    } catch (err) {
      setMessage(err.response?.data?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <h1 className="text-2xl font-black">Create Quotation</h1>
      <form onSubmit={submit} className="mt-4 grid gap-4">
        <div className="admin-card">
          <h2 className="text-xl font-black">Company</h2>
          <div className="mt-4 grid gap-2 text-sm text-zinc-700 md:grid-cols-2">
            <p><b>{settings.companyName}</b></p>
            <p>{settings.phone}</p>
            <p>{settings.email}</p>
            {settings.gstNumber && <p>GST: {settings.gstNumber}</p>}
            <p className="break-words md:col-span-2">{settings.address}</p>
          </div>
        </div>

        <div className="admin-card grid gap-4 md:grid-cols-2">
          <h2 className="text-xl font-black md:col-span-2">Client Details</h2>
          <div><label className="label">Client Name</label><input className="input" name="clientName" placeholder="Enter client name" value={form.clientName} onChange={update} required /></div>
          <div><label className="label">Client Phone</label><input className="input" name="clientPhone" placeholder="Enter client phone" value={form.clientPhone} onChange={update} /></div>
          <div><label className="label">Client Email</label><input className="input" type="email" name="clientEmail" placeholder="Enter client email" value={form.clientEmail} onChange={update} /></div>
          <div><label className="label">Valid Until</label><input className="input" type="date" name="validUntil" value={form.validUntil} onChange={update} /></div>
          <div><label className="label">Status</label><select className="input" name="status" value={form.status} onChange={update}><option>Draft</option><option>Sent</option><option>Accepted</option><option>Rejected</option></select></div>
          <div className="md:col-span-2"><label className="label">Client Address</label><textarea className="input min-h-20" name="clientAddress" placeholder="Enter client address" value={form.clientAddress} onChange={update} /></div>
          <div className="md:col-span-2"><label className="label">Project Description</label><textarea className="input min-h-20" name="projectDescription" placeholder="Enter project description" value={form.projectDescription} onChange={update} /></div>
        </div>

        <div className="admin-card">
          <h2 className="text-xl font-black">Items</h2>
          <div className="relative mt-4" ref={selectRef}>
            <button type="button" className="input flex min-h-12 items-center justify-between text-left" onClick={() => setSelectOpen((value) => !value)}>
              <span>{form.items.length ? `${form.items.length} item${form.items.length > 1 ? "s" : ""} selected` : "Search and select items"}</span>
              <span className="text-xs font-bold text-zinc-500">{selectOpen ? "Close" : "Open"}</span>
            </button>
            {selectOpen && (
              <div className="absolute z-30 mt-2 w-full rounded-md border border-zinc-200 bg-white p-3 shadow-lg">
                <input className="input" value={itemSearch} onChange={(e) => setItemSearch(e.target.value)} placeholder="Search items" autoFocus />
                <div className="mt-3 max-h-72 overflow-y-auto">
                  {filteredItems.length === 0 ? <p className="p-3 text-sm font-bold text-zinc-500">No items found.</p> : filteredItems.map((item) => (
                    <label key={item._id} className="flex cursor-pointer items-start gap-3 rounded-md p-3 hover:bg-zinc-50">
                      <input type="checkbox" className="mt-1" checked={selectedIds.has(item._id)} onChange={() => toggleItem(item)} />
                      <span className="min-w-0 flex-1">
                        <span className="block font-bold">{item.name}</span>
                        <span className="block text-sm text-zinc-500">{formatPrice(item.price)} / {item.unit || "Unit"} · GST {formatQuantity(getGST(item.gstPercent))}%</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 grid gap-3">
            {form.items.length === 0 ? <p className="rounded-md border border-dashed border-zinc-300 p-3 text-sm font-bold text-zinc-500">Select items from the dropdown above.</p> : form.items.map((item, index) => (
              <div key={item.itemId} className="rounded-md border border-zinc-200 p-3">
                <div className="grid gap-4 lg:grid-cols-[minmax(160px,1fr)_90px_110px_110px_90px_120px_120px_auto] lg:items-center">
                  <div><span className="block text-xs font-bold uppercase text-zinc-500">Item</span><b>{item.name}</b><span className="mt-1 block text-xs text-zinc-500">{item.unit || "Unit"}</span></div>
                  <div><label className="label">Quantity</label><input className="input" type="number" min="0" step="0.01" value={item.quantity} onChange={(e) => setQuantity(item.itemId, e.target.value)} placeholder="Enter quantity" required /></div>
                  <div className="text-sm"><span className="block text-zinc-500">Price</span><b>{formatPrice(rows[index].price)}</b></div>
                  <div className="text-sm"><span className="block text-zinc-500">Amount</span><b>{formatPrice(rows[index].amount)}</b></div>
                  <div className="text-sm"><span className="block text-zinc-500">GST %</span><b>{formatQuantity(rows[index].gstPercent)}%</b></div>
                  <div className="text-sm"><span className="block text-zinc-500">GST Amount</span><b>{formatPrice(rows[index].gstAmount)}</b></div>
                  <div className="text-sm"><span className="block text-zinc-500">Final Price</span><b>{formatPrice(rows[index].finalPrice)}</b></div>
                  <button type="button" className="action-btn action-delete" onClick={() => removeItem(item.itemId)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card ml-auto w-full max-w-md">
          <h2 className="mb-3 text-xl font-black">Summary</h2>
          <div className="mb-3 grid gap-3 sm:grid-cols-2">
            <div><label className="label">Discount Percent</label><input className="input" type="number" min="0" max="100" step="0.01" name="discountPercent" value={form.discountPercent} onChange={update} placeholder="Discount %" /></div>
            <div><label className="label">Other Charges</label><input className="input" type="number" min="0" step="0.01" name="otherCharges" value={form.otherCharges} onChange={update} placeholder="Other charges" /></div>
          </div>
          <div className="flex justify-between border-b border-zinc-200 py-2"><span>Subtotal</span><b>{formatPrice(totals.subtotal)}</b></div>
          <div className="flex justify-between border-b border-zinc-200 py-2"><span>GST</span><b>{formatPrice(totals.gst)}</b></div>
          <div className="flex justify-between border-b border-zinc-200 py-2"><span>Discount ({formatQuantity(totals.discountPercent)}%)</span><b>- {formatPrice(totals.discount)}</b></div>
          <div className="flex justify-between border-b border-zinc-200 py-2"><span>Other Charges</span><b>{formatPrice(totals.otherCharges)}</b></div>
          <div className="flex justify-between py-3 text-xl font-black"><span>Grand Total</span><span>{formatPrice(totals.total)}</span></div>
          {message && <p className="mb-3 text-sm font-bold">{message}</p>}
          <button className="btn-primary w-full" disabled={saving}>{saving ? "Saving..." : "Save Quotation"}</button>
        </div>
      </form>
    </section>
  );
};

export default CreateQuotation;
