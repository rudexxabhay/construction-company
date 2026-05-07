import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";
import { settingsFallback } from "../data/fallbackData";
import DocumentPreviewFrame from "../components/DocumentPreviewFrame";
import { buildQuotationHtml } from "../utils/documentTemplate";
import { downloadPdfFile } from "../utils/pdfDownload";

const ViewQuotation = () => {
  const { id } = useParams();
  const [quotation, setQuotation] = useState(null);
  const [settings, setSettings] = useState(settingsFallback);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get("/api/settings").then((res) => setSettings({ ...settingsFallback, ...res.data })).catch(() => setSettings(settingsFallback));
    api.get(`/api/quotations/${id}`)
      .then((res) => setQuotation(res.data))
      .catch((err) => setMessage(err.response?.data?.message || "Could not load quotation."));
  }, [id]);

  const updateStatus = async (status) => {
    if (!quotation) return;
    try {
      const { data } = await api.put(`/api/quotations/${quotation._id}`, { ...quotation, status });
      setQuotation(data);
      setMessage("Status updated.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Status update failed.");
    }
  };

  const downloadPdf = async () => {
    setMessage("");
    try {
      await downloadPdfFile({
        path: `/api/quotations/${id}/pdf`,
        fallbackFilename: `${quotation?.quotationNo || "quotation"}.pdf`,
        token: localStorage.getItem("adminToken")
      });
    } catch (err) {
      console.error("PDF download error:", err);
      const message = "PDF download failed. Please try again.";
      alert(message);
      setMessage(message);
    }
  };

  if (!quotation) {
    return <section><h1 className="text-2xl font-black">Quotation</h1><p className="mt-4 text-sm font-bold">{message || "Loading..."}</p></section>;
  }
  const html = buildQuotationHtml(quotation, settings);

  return (
    <section>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-black">{quotation.quotationNo}</h1>
          <p className="mt-2 text-sm text-zinc-600">Preview and download quotation PDF.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link className="btn-dark" to="/secure-admin-dashboard/quotations">Back</Link>
          <button className="btn-primary" onClick={downloadPdf}>Download PDF</button>
        </div>
      </div>
      {message && <p className="mt-4 text-sm font-bold">{message}</p>}
      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_280px]">
        <DocumentPreviewFrame html={html} title="Quotation preview" />
        <aside className="admin-card h-fit">
          <label className="label">Status</label>
          <select className="input" value={quotation.status} onChange={(e) => updateStatus(e.target.value)}><option>Draft</option><option>Sent</option><option>Accepted</option><option>Rejected</option></select>
          <div className="mt-5 text-sm text-zinc-600">
            <p><b>Company:</b> {settings.companyName}</p>
            <p className="mt-2 break-words"><b>Footer:</b> {[settings.address, settings.phone, settings.website].filter(Boolean).join(" | ")}</p>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default ViewQuotation;
