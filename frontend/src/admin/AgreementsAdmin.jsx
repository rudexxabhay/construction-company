import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Edit, Eye, FilePlus2, Settings, Trash2 } from "lucide-react";
import api from "../api/axios";
import { formatDate, money } from "../utils/agreementTemplate";

const AgreementsAdmin = () => {
  const [agreements, setAgreements] = useState([]);
  const [message, setMessage] = useState("");

  const load = () => {
    api.get("/api/agreements")
      .then((res) => setAgreements(res.data))
      .catch((err) => setMessage(err.response?.data?.message || "Could not load agreements."));
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    if (!window.confirm("Delete this agreement?")) return;
    try {
      await api.delete(`/api/agreements/${id}`);
      setMessage("Agreement deleted.");
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Delete failed.");
    }
  };

  return (
    <section className="min-w-0">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-black sm:text-2xl">Agreements</h1>
          <p className="mt-2 text-sm text-zinc-600">Create, edit, preview, and download house construction agreements.</p>
        </div>
        <div className="grid gap-3 sm:flex">
          <Link className="btn-dark w-full sm:w-fit" to="/secure-admin-dashboard/agreements/template">
            <Settings size={18} className="mr-2" />
            Agreement Settings
          </Link>
          <Link className="btn-primary w-full sm:w-fit" to="/secure-admin-dashboard/agreements/create">
            <FilePlus2 size={18} className="mr-2" />
            Create Agreement
          </Link>
        </div>
      </div>
      {message && <p className="mt-4 text-sm font-bold">{message}</p>}
      <div className="mt-5 overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-zinc-100">
            <tr>
              <th className="p-3">Agreement</th>
              <th className="p-3">Owner</th>
              <th className="p-3">Project</th>
              <th className="p-3">Date</th>
              <th className="p-3 text-right">Total</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {agreements.map((agreement) => (
              <tr key={agreement._id} className="border-t border-zinc-100">
                <td className="p-3"><b>{agreement.agreementNo}</b><p className="mt-1 text-xs text-zinc-500">{agreement.title}</p></td>
                <td className="p-3">{agreement.owner?.name}</td>
                <td className="p-3">{agreement.project?.name || agreement.project?.projectId}</td>
                <td className="p-3">{formatDate(agreement.agreementDate)}</td>
                <td className="p-3 text-right">₹{money(agreement.grandTotal)}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <Link className="action-btn" to={`/secure-admin-dashboard/agreements/${agreement._id}/preview`} title="Preview"><Eye size={16} /></Link>
                    <Link className="action-btn" to={`/secure-admin-dashboard/agreements/${agreement._id}/edit`} title="Edit"><Edit size={16} /></Link>
                    <button type="button" className="action-btn action-delete" onClick={() => remove(agreement._id)} title="Delete"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {!agreements.length && (
              <tr><td className="p-4 text-center text-zinc-500" colSpan="6">No agreements created yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default AgreementsAdmin;
