import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import { settingsFallback } from "../data/fallbackData";
import DocumentPreviewFrame from "../components/DocumentPreviewFrame";
import { buildDocumentEditorHtml } from "../utils/documentTemplate";
import { downloadPdfFile } from "../utils/pdfDownload";

const labels = {
  estimate: { one: "Estimate", status: ["Draft", "Sent", "Approved", "Rejected"], next: "quotation", convert: "Convert to Quotation" },
  quotation: { one: "Quotation", status: ["Draft", "Sent", "Accepted", "Rejected"], next: "invoice", convert: "Convert to Invoice" },
  invoice: { one: "Invoice", status: ["Unpaid", "Partial", "Paid"] }
};
const blank = (type) => ({
  type,
  client: { clientId: "", name: "", phone: "", email: "", address: "", projectLocation: "" },
  projectTitle: "",
  projectDescription: "",
  items: [],
  discountPercent: 0,
  discount: 0,
  otherCharges: 0,
  status: type === "invoice" ? "Unpaid" : "Draft",
  validUntil: "",
  paymentStatus: "Unpaid",
  paidAmount: 0,
  notes: "",
  terms: ""
});
const n = (value) => {
  const number = typeof value === "string" ? Number(value.replace(/,/g, "").trim()) : Number(value);
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
const money = (value) => n(value).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const price = (value) => `₹${money(value)}`;
const isoDate = (value) => value ? String(value).slice(0, 10) : "";
const round = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

const calculate = (form) => {
  const rows = form.items.map((item) => {
    const quantity = n(item.quantity);
    const rate = n(item.rate);
    const gstPercent = getGST(item.gstPercent);
    const amount = round(quantity * rate);
    const gstAmount = round((amount * gstPercent) / 100);
    return { ...item, quantity, rate, gstPercent, amount, gstAmount, finalAmount: round(amount + gstAmount) };
  });
  const subtotal = round(rows.reduce((sum, item) => sum + item.amount, 0));
  const totalGST = round(rows.reduce((sum, item) => sum + item.gstAmount, 0));
  const discountPercent = getDiscount(form.discountPercent ?? form.discount);
  const discount = round((subtotal * discountPercent) / 100);
  const otherCharges = n(form.otherCharges);
  const paidAmount = n(form.paidAmount);
  const grandTotal = round(subtotal + totalGST + otherCharges - discount);
  return { items: rows, subtotal, totalGST, discountPercent, discount, otherCharges, grandTotal, paidAmount, dueAmount: round(grandTotal - paidAmount) };
};
const DocumentPreview = ({ form, settings, totals }) => {
  const html = buildDocumentEditorHtml(form, settings, totals);
  return (
    <DocumentPreviewFrame html={html} title="Document preview" />
  );
};

const DocumentEditor = () => {
  const { id, type = "estimate" } = useParams();
  const navigate = useNavigate();
  const isCreate = !id;
  const [form, setForm] = useState(blank(type));
  const [clients, setClients] = useState([]);
  const [items, setItems] = useState([]);
  const [clientSearch, setClientSearch] = useState("");
  const [itemSearch, setItemSearch] = useState("");
  const [settings, setSettings] = useState(settingsFallback);
  const [message, setMessage] = useState("");
  const totals = useMemo(() => calculate(form), [form]);
  const meta = labels[form.type] || labels.estimate;

  useEffect(() => {
    api.get("/api/clients").then((res) => setClients(res.data)).catch(() => setClients([]));
    api.get("/api/items").then((res) => setItems(res.data)).catch(() => setItems([]));
    api.get("/api/settings").then((res) => setSettings({ ...settingsFallback, ...res.data })).catch(() => setSettings(settingsFallback));
  }, []);
  useEffect(() => {
    if (isCreate) {
      setForm(blank(type));
      return;
    }
    api.get(`/api/documents/${id}`).then((res) => setForm({ ...res.data, discountPercent: res.data.discountPercent ?? 0, validUntil: isoDate(res.data.validUntil) })).catch((err) => setMessage(err.response?.data?.message || "Could not load document."));
  }, [id, isCreate, type]);

  const chooseClient = (client) => {
    setForm({ ...form, client: { clientId: client._id, name: client.name, phone: client.phone || "", email: client.email || "", address: client.address || "", projectLocation: client.projectLocation || "" } });
    setClientSearch(client.name);
  };
  const addItem = (item) => {
    if (form.items.some((row) => row.itemId === item._id)) return;
    setForm({ ...form, items: [...form.items, { itemId: item._id, name: item.name, unit: item.unit || "Nos", quantity: 1, rate: item.rate ?? item.price ?? 0, gstPercent: getGST(item.gstPercent) }] });
  };
  const updateRow = (index, key, value) => setForm({ ...form, items: form.items.map((item, i) => i === index ? { ...item, [key]: value } : item) });
  const removeRow = (index) => setForm({ ...form, items: form.items.filter((_, i) => i !== index) });
  const addBlankRow = () => setForm({ ...form, items: [...form.items, { name: "", unit: "Nos", quantity: 1, rate: 0, gstPercent: 18 }] });

  const save = async (e) => {
    e.preventDefault();
    setMessage("");
    const payload = { ...form, ...totals, paymentStatus: form.type === "invoice" ? form.paymentStatus : undefined };
    try {
      const { data } = isCreate ? await api.post("/api/documents", payload) : await api.put(`/api/documents/${id}`, payload);
      setMessage("Document saved.");
      if (isCreate) navigate(`/secure-admin-dashboard/documents/${data._id}`);
    } catch (err) {
      setMessage(err.response?.data?.message || "Save failed.");
    }
  };

  const convert = async () => {
    if (!meta.next) return;
    const { data } = await api.post(`/api/documents/${id}/convert`, { type: meta.next });
    navigate(`/secure-admin-dashboard/documents/${data._id}`);
  };

  const downloadPdf = async () => {
    try {
      await downloadPdfFile({
        path: `/api/documents/${id}/pdf`,
        fallbackFilename: `${form.documentNo || "document"}.pdf`,
        token: localStorage.getItem("adminToken")
      });
    } catch (err) {
      console.error("PDF download error:", err);
      alert("PDF download failed. Please try again.");
    }
  };

  const filteredClients = clients.filter((client) => `${client.name} ${client.phone}`.toLowerCase().includes(clientSearch.toLowerCase())).slice(0, 8);
  const filteredItems = items.filter((item) => `${item.name} ${item.category}`.toLowerCase().includes(itemSearch.toLowerCase())).slice(0, 12);

  return (
    <section className="min-w-0">
      <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0"><h1 className="break-words text-xl font-black sm:text-2xl">{isCreate ? `Create ${meta.one}` : form.documentNo}</h1><p className="mt-2 text-sm text-zinc-600">Select client and items once, then reuse through conversion.</p></div>
        <div className="grid w-full gap-3 sm:flex sm:w-auto sm:flex-wrap"><Link className="btn-dark" to={`/secure-admin-dashboard/${form.type}s`}>Back</Link>{!isCreate && <button className="btn-dark" onClick={downloadPdf}>Download PDF</button>}{!isCreate && meta.next && <button className="btn-primary" onClick={convert}>{meta.convert}</button>}</div>
      </div>

      <div className="mt-4 min-w-0 overflow-hidden">
        <DocumentPreview form={form} settings={settings} totals={totals} />
      </div>

      <form onSubmit={save} className="mt-4 grid min-w-0 gap-4">
        <div className="admin-card grid min-w-0 gap-4 lg:grid-cols-2">
          <div className="min-w-0">
            <label className="label">Search Client</label>
            <input className="input" value={clientSearch || form.client.name} onChange={(e) => setClientSearch(e.target.value)} placeholder="Type client name or phone" />
            {clientSearch && <div className="mt-2 grid gap-2">{filteredClients.map((client) => <button type="button" key={client._id} className="rounded-md border border-zinc-200 p-2 text-left text-sm" onClick={() => chooseClient(client)}><span className="break-words font-bold">{client.name}</span> <span className="break-words text-zinc-500">{client.phone}</span></button>)}</div>}
          </div>
          <div><label className="label">Selected Client</label><input className="input" value={form.client.name} onChange={(e) => setForm({ ...form, client: { ...form.client, name: e.target.value } })} placeholder="Enter selected client name" required /></div>
          <div><label className="label">Project Title</label><input className="input" value={form.projectTitle || ""} onChange={(e) => setForm({ ...form, projectTitle: e.target.value })} placeholder="Enter project title" /></div>
          <div><label className="label">Valid Until</label><input className="input" type="date" value={isoDate(form.validUntil)} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} /></div>
          <div><label className="label">Status</label><select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{meta.status.map((status) => <option key={status}>{status}</option>)}</select></div>
          {form.type === "invoice" && <div><label className="label">Payment Status</label><select className="input" value={form.paymentStatus} onChange={(e) => setForm({ ...form, paymentStatus: e.target.value, status: e.target.value })}>{labels.invoice.status.map((status) => <option key={status}>{status}</option>)}</select></div>}
        </div>

        <div className="admin-card min-w-0">
          <label className="label">Search Items</label>
          <input className="input" value={itemSearch} onChange={(e) => setItemSearch(e.target.value)} placeholder="Type item name or category" />
          <div className="mt-3 grid gap-2 sm:flex sm:flex-wrap">{filteredItems.map((item) => <button type="button" key={item._id} className="w-full rounded-md border border-zinc-200 px-3 py-2 text-left text-sm font-bold sm:w-auto" onClick={() => addItem(item)}>{item.name}</button>)}</div>
          <button type="button" className="btn-dark mt-4" onClick={addBlankRow}>Add Manual Row</button>
          <div className="mt-4 grid gap-3 md:hidden">
            {totals.items.length === 0 ? <div className="rounded-md border border-zinc-200 p-3 text-sm text-zinc-500">No items added.</div> : totals.items.map((item, index) => (
              <article key={index} className="grid gap-3 rounded-md border border-zinc-200 p-3">
                <div><label className="label">Description</label><textarea className="input min-h-20" value={item.name} onChange={(e) => updateRow(index, "name", e.target.value)} placeholder="Enter item description" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label">Unit</label><input className="input" value={item.unit} onChange={(e) => updateRow(index, "unit", e.target.value)} placeholder="Enter unit" /></div>
                  <div><label className="label">Quantity</label><input className="input" type="number" min="0" step="0.01" value={item.quantity} onChange={(e) => updateRow(index, "quantity", e.target.value)} placeholder="Enter quantity" /></div>
                  <div><label className="label">Price</label><input className="input" type="number" min="0" step="0.01" value={item.rate} onChange={(e) => updateRow(index, "rate", e.target.value)} placeholder="Enter item price" /></div>
                  <div><label className="label">GST Percentage</label><input className="input" type="number" min="0" max="100" step="0.01" value={item.gstPercent} onChange={(e) => updateRow(index, "gstPercent", e.target.value)} placeholder="Enter GST percentage" /></div>
                </div>
                <div className="grid gap-1 text-sm text-zinc-700"><span>Amount: <b>{price(item.amount)}</b></span><span>GST: <b>{price(item.gstAmount)}</b></span><span>Total: <b>{price(item.finalAmount)}</b></span></div>
                <button type="button" className="action-btn action-delete" onClick={() => removeRow(index)}>Remove</button>
              </article>
            ))}
          </div>
          <div className="mt-4 hidden overflow-x-auto md:block">
            <table className="w-full min-w-[900px] border-collapse text-sm">
              <thead><tr className="bg-zinc-100 text-left"><th className="border p-2">Description</th><th className="border p-2">Unit</th><th className="border p-2">Quantity</th><th className="border p-2">Price</th><th className="border p-2">GST %</th><th className="border p-2">Amount</th><th className="border p-2">GST</th><th className="border p-2">Total</th><th className="border p-2"></th></tr></thead>
              <tbody>{totals.items.map((item, index) => <tr key={index}>
                <td className="border p-2"><textarea className="input min-h-20" value={item.name} onChange={(e) => updateRow(index, "name", e.target.value)} placeholder="Enter item description" /></td>
                <td className="border p-2"><input className="input" value={item.unit} onChange={(e) => updateRow(index, "unit", e.target.value)} placeholder="Enter unit" /></td>
                <td className="border p-2"><input className="input" type="number" min="0" step="0.01" value={item.quantity} onChange={(e) => updateRow(index, "quantity", e.target.value)} placeholder="Enter quantity" /></td>
                <td className="border p-2"><input className="input" type="number" min="0" step="0.01" value={item.rate} onChange={(e) => updateRow(index, "rate", e.target.value)} placeholder="Enter item price" /></td>
                <td className="border p-2"><input className="input" type="number" min="0" max="100" step="0.01" value={item.gstPercent} onChange={(e) => updateRow(index, "gstPercent", e.target.value)} placeholder="Enter GST percentage" /></td>
                <td className="border p-2">{price(item.amount)}</td><td className="border p-2">{price(item.gstAmount)}</td><td className="border p-2">{price(item.finalAmount)}</td>
                <td className="border p-2"><button type="button" className="action-btn action-delete" onClick={() => removeRow(index)}>Remove</button></td>
              </tr>)}</tbody>
            </table>
          </div>
        </div>

        <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="admin-card grid min-w-0 gap-4">
            <div><label className="label">Project Description</label><textarea className="input min-h-20" value={form.projectDescription || ""} onChange={(e) => setForm({ ...form, projectDescription: e.target.value })} placeholder="Enter project description" /></div>
            <div><label className="label">Terms</label><textarea className="input min-h-20" value={form.terms || ""} onChange={(e) => setForm({ ...form, terms: e.target.value })} placeholder="Enter terms" /></div>
            <div><label className="label">Notes</label><textarea className="input min-h-20" value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Enter notes" /></div>
          </div>
          <div className="admin-card grid min-w-0 gap-3 self-start">
            <div><label className="label">Discount Percent</label><input className="input" type="number" min="0" max="100" step="0.01" value={form.discountPercent ?? form.discount ?? 0} onChange={(e) => setForm({ ...form, discountPercent: e.target.value })} placeholder="Enter discount percentage" /></div>
            <div><label className="label">Other Charges</label><input className="input" type="number" min="0" step="0.01" value={form.otherCharges || 0} onChange={(e) => setForm({ ...form, otherCharges: e.target.value })} placeholder="Enter other charges" /></div>
            {form.type === "invoice" && <div><label className="label">Paid Amount</label><input className="input" type="number" min="0" step="0.01" value={form.paidAmount || 0} onChange={(e) => setForm({ ...form, paidAmount: e.target.value })} placeholder="Enter paid amount" /></div>}
            <div className="grid gap-1 break-words border-t pt-3 text-sm"><p>Subtotal: <b>{price(totals.subtotal)}</b></p><p>GST: <b>{price(totals.totalGST)}</b></p><p>Discount ({money(totals.discountPercent)}%): <b>- {price(totals.discount)}</b></p><p>Other Charges: <b>{price(totals.otherCharges)}</b></p><p className="text-base sm:text-lg">Grand Total: <b>{price(totals.grandTotal)}</b></p>{form.type === "invoice" && <><p>Paid Amount: <b>{price(totals.paidAmount)}</b></p><p>Due Amount: <b>{price(totals.dueAmount)}</b></p><p>Payment Status: <b>{form.paymentStatus}</b></p></>}</div>
            {message && <p className="text-sm font-bold">{message}</p>}
            <button className="btn-primary">Save {meta.one}</button>
          </div>
        </div>
      </form>
    </section>
  );
};

export default DocumentEditor;
