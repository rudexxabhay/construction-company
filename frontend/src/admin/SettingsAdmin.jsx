import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { settingsFallback } from "../data/fallbackData";

const fields = [
  ["address", "Address"],
  ["phone", "Phone"],
  ["email", "Email"],
  ["workingHours", "Working Hours"],
  ["footerDescription", "Footer Description"],
  ["contactHeading", "Contact Heading"],
  ["contactDescription", "Contact Description"]
];

const longFields = new Set(["footerDescription", "contactDescription", "address"]);
const SettingsAdmin = () => {
  const [form, setForm] = useState(settingsFallback);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get("/api/settings")
      .then((res) => setForm({ ...settingsFallback, ...res.data }))
      .catch((err) => setMessage(err.response?.data?.message || "Could not load settings."))
      .finally(() => setLoading(false));
  }, []);

  const update = (e) => {
    const { name, type, checked, value } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const { data } = await api.put("/api/settings", form);
      setForm({ ...settingsFallback, ...data });
      setMessage("Settings updated.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Save failed.");
    }
  };

  return (
    <section>
      <h1 className="text-2xl font-black">Website Settings</h1>
      <form onSubmit={submit} className="admin-card mt-4 grid gap-4">
        {loading ? <p>Loading settings...</p> : fields.map(([name, label]) => (
          <div key={name}>
            <label className="label">{label}</label>
            {longFields.has(name) ? (
              <textarea className="input min-h-20" name={name} value={form[name] || ""} onChange={update} />
            ) : (
              <input className="input" type="text" name={name} value={form[name] ?? ""} onChange={update} />
            )}
          </div>
        ))}
        {message && <p className="text-sm font-bold">{message}</p>}
        <button className="btn-primary w-full sm:w-fit">Save Settings</button>
      </form>
    </section>
  );
};

export default SettingsAdmin;
