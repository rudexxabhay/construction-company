import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";

const labels = {
  estimate: { title: "Estimates", create: "Create Estimate", convert: "Convert to Quotation" },
  quotation: { title: "Quotations", create: "Create Quotation", convert: "Convert to Invoice" },
  invoice: { title: "Invoices", create: "Create Invoice" }
};
const formatMoney = (value) => Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const DocumentsAdmin = ({ type: fixedType }) => {
  const params = useParams();
  const type = fixedType || params.type || "estimate";
  const [documents, setDocuments] = useState([]);
  const [message, setMessage] = useState("");
  const title = labels[type] || labels.estimate;

  const load = () => api.get(`/api/documents?type=${type}`).then((res) => setDocuments(res.data)).catch((err) => setMessage(err.response?.data?.message || "Could not load documents."));
  useEffect(() => { load(); }, [type]);

  const remove = async (id) => {
    if (!window.confirm("Delete this document?")) return;
    await api.delete(`/api/documents/${id}`);
    setMessage("Document deleted.");
    load();
  };

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0"><h1 className="text-xl font-black sm:text-2xl">{title.title}</h1><p className="mt-2 text-sm text-zinc-600">Create, convert, view, and download professional PDFs.</p></div>
        <Link className="btn-primary" to={`/secure-admin-dashboard/documents/create/${type}`}>{title.create}</Link>
      </div>
      {message && <p className="mt-4 text-sm font-bold">{message}</p>}
      <div className="admin-card mt-4 grid min-w-0 gap-3">
        {documents.length === 0 ? "No documents found." : documents.map((doc) => (
          <article key={doc._id} className="grid min-w-0 gap-2 rounded-md border border-zinc-200 p-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_130px_130px_160px] lg:items-center lg:gap-4">
            <div className="break-words font-black">{doc.documentNo}</div>
            <div className="break-words text-sm text-zinc-700">{doc.client?.name}</div>
            <div className="text-sm text-zinc-600">{doc.status}</div>
            <b className="break-words text-sm">Rs. {formatMoney(doc.grandTotal)}</b>
            <div className="action-row mt-3 lg:mt-0 lg:justify-end"><Link className="action-btn action-view" to={`/secure-admin-dashboard/documents/${doc._id}`}>View</Link><button className="action-btn action-delete" onClick={() => remove(doc._id)}>Delete</button></div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default DocumentsAdmin;
