import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { agreementTemplateFields, defaultAgreementTemplate, normalizeAgreementTemplate } from "../utils/agreementTemplate";

const AgreementTemplateAdmin = () => {
  const [form, setForm] = useState(normalizeAgreementTemplate());
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get("/api/agreements/template")
      .then((res) => setForm(normalizeAgreementTemplate(res.data)))
      .catch((err) => setMessage(err.response?.data?.message || "Could not load agreement template."));
  }, []);

  const updateField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const save = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      const { data } = await api.put("/api/agreements/template", form);
      setForm(normalizeAgreementTemplate(data));
      setMessage("Agreement template saved.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Template save failed.");
    }
  };

  const reset = async () => {
    if (!window.confirm("Reset agreement template to default?")) return;
    setMessage("");
    try {
      const { data } = await api.put("/api/agreements/template", { ...defaultAgreementTemplate, reset: true });
      setForm(normalizeAgreementTemplate(data));
      setMessage("Agreement template reset.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Template reset failed.");
    }
  };

  return (
    <section className="min-w-0">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-black sm:text-2xl">Agreement Settings</h1>
          <p className="mt-2 text-sm text-zinc-600">Edit the default clauses used when creating a new agreement.</p>
        </div>
        <Link className="btn-dark" to="/secure-admin-dashboard/agreements">Agreement List</Link>
      </div>

      <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-700">
        Placeholders: <b>{"{{ownerName}}"}</b>, <b>{"{{contractorName}}"}</b>, <b>{"{{projectSite}}"}</b>, <b>{"{{projectDuration}}"}</b>, <b>{"{{agreementDate}}"}</b>, <b>{"{{projectCost}}"}</b>, <b>{"{{architectName}}"}</b>, <b>{"{{defectPeriod}}"}</b>, <b>{"{{noticeDays}}"}</b>
      </div>

      <form onSubmit={save} className="mt-4 grid gap-4">
        <div className="admin-card grid min-w-0 gap-4 lg:grid-cols-2">
          {agreementTemplateFields.map(([key, label]) => (
            <div key={key}>
              <label className="label">{label}</label>
              <textarea className="input min-h-32" value={form[key] || ""} onChange={(event) => updateField(key, event.target.value)} />
            </div>
          ))}
        </div>
        <div className="admin-card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {message && <p className="text-sm font-bold">{message}</p>}
          <div className="grid gap-3 sm:ml-auto sm:flex">
            <button type="button" className="btn-dark" onClick={reset}>Reset to Default</button>
            <button className="btn-primary">Save Template</button>
          </div>
        </div>
      </form>
    </section>
  );
};

export default AgreementTemplateAdmin;
