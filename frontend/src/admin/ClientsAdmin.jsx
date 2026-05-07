import React, { useEffect, useState } from "react";
import api from "../api/axios";

const blank = { name: "", phone: "", email: "", address: "", projectLocation: "" };

const ClientsAdmin = () => {
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");

  const load = () => api.get("/api/clients").then((res) => setClients(res.data)).catch((err) => setMessage(err.response?.data?.message || "Could not load clients."));
  useEffect(() => { load(); }, []);

  const reset = () => { setForm(blank); setEditing(null); };
  const submit = async (e) => {
    e.preventDefault();
    try {
      editing ? await api.put(`/api/clients/${editing}`, form) : await api.post("/api/clients", form);
      setMessage(editing ? "Client updated." : "Client added.");
      reset();
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Save failed.");
    }
  };
  const remove = async (id) => {
    if (!window.confirm("Delete this client?")) return;
    await api.delete(`/api/clients/${id}`);
    setMessage("Client deleted.");
    load();
  };

  return (
    <section>
      <h1 className="text-xl font-black sm:text-2xl">Clients</h1>
      <div className="mt-4 grid min-w-0 gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
        <form onSubmit={submit} className="admin-card grid gap-3">
          <h2 className="text-xl font-black">{editing ? "Edit Client" : "Add Client"}</h2>
          {Object.entries({ name: "Name", phone: "Phone", email: "Email", address: "Address", projectLocation: "Project Location" }).map(([name, label]) => (
            <div key={name}><label className="label">{label}</label>{name === "address" ? <textarea className="input min-h-20" name={name} value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} /> : <input className="input" name={name} value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} required={name === "name"} />}</div>
          ))}
          {message && <p className="text-sm font-bold">{message}</p>}
          <div className="flex flex-col gap-3 sm:flex-row"><button className="btn-primary">{editing ? "Update" : "Add"} Client</button>{editing && <button type="button" className="btn-dark" onClick={reset}>Cancel</button>}</div>
        </form>
        <div className="grid min-w-0 gap-3">
          {clients.length === 0 ? <div className="admin-card">No clients found.</div> : clients.map((client) => (
            <article key={client._id} className="admin-card grid min-w-0 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,180px)_130px] md:items-center">
              <div className="min-w-0"><h3 className="break-words font-black">{client.name}</h3><p className="break-words text-sm text-zinc-600">{client.phone} {client.email}</p><p className="break-words text-sm text-zinc-500">{client.projectLocation}</p></div>
              <p className="break-words text-sm text-zinc-600">{client.address}</p>
              <div className="action-row md:justify-end"><button className="action-btn action-edit" onClick={() => { setEditing(client._id); setForm({ ...blank, ...client }); }}>Edit</button><button className="action-btn action-delete" onClick={() => remove(client._id)}>Delete</button></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClientsAdmin;
