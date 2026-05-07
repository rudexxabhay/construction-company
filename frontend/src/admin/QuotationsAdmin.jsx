import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const formatMoney = (value) => Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatDate = (value) => value ? new Date(value).toLocaleDateString("en-IN") : "-";

const statusClass = {
  Draft: "bg-zinc-100 text-zinc-700",
  Sent: "bg-yellow-100 text-yellow-800",
  Accepted: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800"
};

const QuotationsAdmin = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = () => {
    setLoading(true);
    return api.get("/api/quotations")
      .then((res) => setQuotations(res.data))
      .catch((err) => setMessage(err.response?.data?.message || "Could not load quotations."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!window.confirm("Delete this quotation?")) return;
    try {
      await api.delete(`/api/quotations/${id}`);
      setMessage("Quotation deleted.");
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Delete failed.");
    }
  };

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black">Quotations</h1>
          <p className="mt-2 text-sm text-zinc-600">Create, review, and download client quotations.</p>
        </div>
        <Link className="btn-primary w-full sm:w-fit" to="/secure-admin-dashboard/quotations/create">Create Quotation</Link>
      </div>
      {message && <p className="mt-4 text-sm font-bold">{message}</p>}
      <div className="admin-card mt-4">
        {loading ? "Loading..." : quotations.length === 0 ? "No quotations found." : (
          <>
            <div className="grid gap-3 md:hidden">
              {quotations.map((quotation) => (
                <article key={quotation._id} className="rounded-md border border-zinc-200 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-black">{quotation.quotationNo}</h3>
                      <p className="mt-1 text-sm text-zinc-600">{quotation.clientName}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass[quotation.status] || statusClass.Draft}`}>{quotation.status}</span>
                  </div>
                  <div className="mt-3 text-sm text-zinc-700">Total: Rs. {formatMoney(quotation.total)}</div>
                  <div className="action-row mt-4">
                    <Link className="action-btn action-view" to={`/secure-admin-dashboard/quotations/${quotation._id}`}>View</Link>
                    <button className="action-btn action-delete" onClick={() => remove(quotation._id)}>Delete</button>
                  </div>
                </article>
              ))}
            </div>
            <div className="hidden grid-cols-1 gap-3 md:grid">
              {quotations.map((quotation) => (
                <article key={quotation._id} className="rounded-md border border-zinc-200 p-3 lg:grid lg:grid-cols-[1fr_1fr_120px_120px_120px] lg:items-center lg:gap-4">
                  <div className="font-black">{quotation.quotationNo}</div>
                  <div className="text-sm text-zinc-700">{quotation.clientName}</div>
                  <div className="text-sm text-zinc-600">{formatDate(quotation.createdAt)}</div>
                  <div><span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass[quotation.status] || statusClass.Draft}`}>{quotation.status}</span></div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3 lg:mt-0 lg:justify-end"><b>Rs. {formatMoney(quotation.total)}</b><div className="action-row"><Link className="action-btn action-view" to={`/secure-admin-dashboard/quotations/${quotation._id}`}>View</Link><button className="action-btn action-delete" onClick={() => remove(quotation._id)}>Delete</button></div></div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default QuotationsAdmin;
