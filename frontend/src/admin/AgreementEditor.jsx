import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import api from "../api/axios";
import DocumentPreviewFrame from "../components/DocumentPreviewFrame";
import ImageUploader from "../components/ImageUploader";
import { settingsFallback } from "../data/fallbackData";
import { agreementTemplateFields, buildAgreementHtml, calculateAgreementTotals, money, normalizeAgreementTemplate, toDateInputValue } from "../utils/agreementTemplate";

const blankAgreement = (settings = settingsFallback) => ({
  company: {
    logoUrl: settings.documentLogoUrl || settings.logoUrl || "",
    name: settings.companyName || "",
    tagline: settings.tagline || "",
    address: settings.address || "",
    phone: settings.phone || "",
    email: settings.email || "",
    gstNumber: settings.gstNumber || ""
  },
  owner: { name: "", address: "", phone: "" },
  project: { siteAddress: "", areaSqft: "", duration: "", projectId: "" },
  title: "HOUSE CONSTRUCTION AGREEMENT",
  agreementDate: toDateInputValue(new Date()),
  clauses: normalizeAgreementTemplate(),
  rules: [
    "Construction shall be completed according to approved drawings and plans.",
    "Quality materials shall be used during construction work.",
    "Payment shall be made according to milestone completion.",
    "Any extra work requires written approval.",
    "Contractor shall fix structural defects during warranty period.",
    "Both parties agree to resolve disputes mutually."
  ],
  payments: [
    { stage: "Foundation", amount: "" },
    { stage: "Structure", amount: "" },
    { stage: "Finishing", amount: "" },
    { stage: "Final Handover", amount: "" }
  ],
  enableGST: false,
  gstPercent: settings.gstPercent || 18,
  witnessName: "",
  ownerSignature: "Owner Signature",
  contractorSignature: "Contractor Signature",
  additionalNotes: ""
});

const textField = (label, value, onChange, props = {}) => (
  <div>
    <label className="label">{label}</label>
    <input className="input" value={value || ""} onChange={(e) => onChange(e.target.value)} {...props} />
  </div>
);

const AgreementEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isCreate = !id;
  const [settings, setSettings] = useState(settingsFallback);
  const [form, setForm] = useState(blankAgreement());
  const [message, setMessage] = useState("");
  const totals = useMemo(() => calculateAgreementTotals(form), [form]);
  const html = useMemo(() => buildAgreementHtml({ ...form, ...totals }, settings), [form, settings, totals]);

  useEffect(() => {
    Promise.all([api.get("/api/settings"), api.get("/api/agreements/template")])
      .then(([settingsRes, templateRes]) => {
        const nextSettings = { ...settingsFallback, ...settingsRes.data };
        setSettings(nextSettings);
        if (isCreate) setForm({ ...blankAgreement(nextSettings), clauses: normalizeAgreementTemplate(templateRes.data) });
      })
      .catch(() => {
        setSettings(settingsFallback);
        if (isCreate) setForm(blankAgreement(settingsFallback));
      });
  }, [isCreate]);

  useEffect(() => {
    if (isCreate) return;
    api.get(`/api/agreements/${id}`)
      .then((res) => setForm({
        ...res.data,
        clauses: normalizeAgreementTemplate(res.data.clauses),
        agreementDate: toDateInputValue(res.data.agreementDate),
        project: {
          ...res.data.project,
          startDate: toDateInputValue(res.data.project?.startDate),
          endDate: toDateInputValue(res.data.project?.endDate)
        }
      }))
      .catch((err) => setMessage(err.response?.data?.message || "Could not load agreement."));
  }, [id, isCreate]);

  const setGroup = (group, key, value) => setForm((current) => ({ ...current, [group]: { ...current[group], [key]: value } }));
  const setRule = (index, value) => setForm((current) => ({ ...current, rules: current.rules.map((rule, i) => i === index ? value : rule) }));
  const setClause = (key, value) => setForm((current) => ({ ...current, clauses: { ...current.clauses, [key]: value } }));
  const addRule = () => setForm((current) => ({ ...current, rules: [...current.rules, ""] }));
  const removeRule = (index) => setForm((current) => ({ ...current, rules: current.rules.filter((_, i) => i !== index) }));
  const setPayment = (index, key, value) => setForm((current) => ({ ...current, payments: current.payments.map((row, i) => i === index ? { ...row, [key]: value } : row) }));
  const addPayment = () => setForm((current) => ({ ...current, payments: [...current.payments, { stage: "", amount: "" }] }));
  const removePayment = (index) => setForm((current) => ({ ...current, payments: current.payments.filter((_, i) => i !== index) }));

  const save = async (event) => {
    event.preventDefault();
    setMessage("");
    const payload = { ...form, ...totals };
    const url = isCreate ? "/api/agreements" : `/api/agreements/${id}`;
    console.log("Saving agreement payload:", payload);
    console.log("Agreement API URL:", `${api.defaults.baseURL || ""}${url}`);
    try {
      const { data } = isCreate ? await api.post(url, payload) : await api.put(url, payload);
      setMessage("Agreement saved.");
      if (isCreate) navigate(`/secure-admin-dashboard/agreements/${data._id}/edit`);
    } catch (err) {
      setMessage(err.response?.data?.message || "Save failed.");
    }
  };

  return (
    <section className="min-w-0">
      <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h1 className="break-words text-xl font-black sm:text-2xl">{isCreate ? "Create Agreement" : form.agreementNo}</h1>
          <p className="mt-2 text-sm text-zinc-600">Control the full agreement content, payment structure, GST, and signatures.</p>
        </div>
        <div className="grid w-full gap-3 sm:flex sm:w-auto sm:flex-wrap">
          <Link className="btn-dark" to="/secure-admin-dashboard/agreements">Agreement List</Link>
          {!isCreate && <Link className="btn-primary" to={`/secure-admin-dashboard/agreements/${id}/preview`}>Preview Agreement</Link>}
        </div>
      </div>

      <div className="mt-4 min-w-0 overflow-hidden">
        <DocumentPreviewFrame html={html} title="Agreement preview" />
      </div>

      <form onSubmit={save} className="mt-4 grid min-w-0 gap-4">
        <div className="admin-card grid min-w-0 gap-4 lg:grid-cols-2">
          <div className="lg:col-span-2"><ImageUploader label="Company Logo" name="logoUrl" value={form.company.logoUrl || ""} onChange={(e) => setGroup("company", "logoUrl", e.target.value)} /></div>
          {textField("Company Name", form.company.name, (value) => setGroup("company", "name", value), { required: true })}
          {textField("Tagline", form.company.tagline, (value) => setGroup("company", "tagline", value))}
          {textField("Address", form.company.address, (value) => setGroup("company", "address", value))}
          {textField("Phone", form.company.phone, (value) => setGroup("company", "phone", value))}
          {textField("Email", form.company.email, (value) => setGroup("company", "email", value))}
          {textField("GSTIN", form.company.gstNumber, (value) => setGroup("company", "gstNumber", value))}
        </div>

        <div className="admin-card grid min-w-0 gap-4 lg:grid-cols-3">
          {textField("Owner Name", form.owner.name, (value) => setGroup("owner", "name", value), { required: true })}
          {textField("Owner Address", form.owner.address, (value) => setGroup("owner", "address", value))}
          {textField("Owner Phone", form.owner.phone, (value) => setGroup("owner", "phone", value))}
        </div>

        <div className="admin-card grid min-w-0 gap-4 lg:grid-cols-3">
          {textField("Project ID", form.project.projectId, (value) => setGroup("project", "projectId", value))}
          {textField("Site Address", form.project.siteAddress, (value) => setGroup("project", "siteAddress", value))}
          {textField("Area (sqft)", form.project.areaSqft, (value) => setGroup("project", "areaSqft", value))}
          {textField("Project Duration", form.project.duration, (value) => setGroup("project", "duration", value))}
        </div>

        <div className="admin-card grid min-w-0 gap-4 lg:grid-cols-2">
          {textField("Agreement Title", form.title, (value) => setForm({ ...form, title: value }))}
          {textField("Agreement Date", toDateInputValue(form.agreementDate), (value) => setForm({ ...form, agreementDate: value }), { type: "date" })}
        </div>

        <div className="admin-card min-w-0">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-black">Agreement Template Clauses</h2>
            <Link className="btn-dark" to="/secure-admin-dashboard/agreements/template">Agreement Settings</Link>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {agreementTemplateFields.map(([key, label]) => (
              <div key={key}>
                <label className="label">{label}</label>
                <textarea className="input min-h-28" value={form.clauses?.[key] || ""} onChange={(event) => setClause(key, event.target.value)} />
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card min-w-0">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-black">Agreement Rules</h2>
            <button type="button" className="btn-dark" onClick={addRule}><Plus size={17} className="mr-2" />Add Rule</button>
          </div>
          <div className="mt-4 grid gap-3">
            {form.rules.map((rule, index) => (
              <div key={index} className="grid gap-2 sm:grid-cols-[120px_minmax(0,1fr)_44px] sm:items-start">
                <label className="label pt-3">Rule {index + 1}</label>
                <textarea className="input min-h-16" value={rule} onChange={(e) => setRule(index, e.target.value)} />
                <button type="button" className="action-btn action-delete min-h-11" onClick={() => removeRule(index)} title="Remove rule"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card min-w-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base font-black">Payment Structure</h2>
            <button type="button" className="btn-dark" onClick={addPayment}><Plus size={17} className="mr-2" />Add Payment Row</button>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[620px] border-collapse text-sm">
              <thead><tr className="bg-zinc-100 text-left"><th className="border p-2">Stage</th><th className="border p-2">Amount</th><th className="border p-2"></th></tr></thead>
              <tbody>{form.payments.map((row, index) => (
                <tr key={index}>
                  <td className="border p-2"><input className="input" value={row.stage || ""} onChange={(e) => setPayment(index, "stage", e.target.value)} /></td>
                  <td className="border p-2"><input className="input" type="number" min="0" step="0.01" value={row.amount ?? ""} onChange={(e) => setPayment(index, "amount", e.target.value)} /></td>
                  <td className="border p-2"><button type="button" className="action-btn action-delete" onClick={() => removePayment(index)}><Trash2 size={16} /></button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <div className="mt-4 grid gap-3 rounded-lg border border-zinc-200 p-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <label className="flex items-center gap-2 font-bold"><input type="checkbox" checked={form.enableGST} onChange={(e) => setForm({ ...form, enableGST: e.target.checked })} />Enable GST</label>
            {form.enableGST && <div><label className="label">GST %</label><input className="input" type="number" min="0" max="100" step="0.01" value={form.gstPercent || 0} onChange={(e) => setForm({ ...form, gstPercent: e.target.value })} /></div>}
            <p>Subtotal: <b>₹{money(totals.subtotal)}</b></p>
            {form.enableGST && <p>GST Amount: <b>₹{money(totals.gstAmount)}</b></p>}
            <p className="text-base">Grand Total: <b>₹{money(totals.grandTotal)}</b></p>
          </div>
        </div>

        <div className="admin-card grid min-w-0 gap-4 lg:grid-cols-2">
          {textField("Owner Signature", form.ownerSignature, (value) => setForm({ ...form, ownerSignature: value }))}
          {textField("Contractor Signature", form.contractorSignature, (value) => setForm({ ...form, contractorSignature: value }))}
          {textField("Witness Signature Text", form.witnessName, (value) => setForm({ ...form, witnessName: value }))}
          <div>
            <label className="label">Notes</label>
            <textarea className="input min-h-24" value={form.additionalNotes || ""} onChange={(event) => setForm({ ...form, additionalNotes: event.target.value })} />
          </div>
        </div>

        <div className="admin-card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {message && <p className="text-sm font-bold">{message}</p>}
          <button className="btn-primary w-full sm:ml-auto sm:w-fit">Save Agreement</button>
        </div>
      </form>
    </section>
  );
};

export default AgreementEditor;
