import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";
import DocumentPreviewFrame from "../components/DocumentPreviewFrame";
import { settingsFallback } from "../data/fallbackData";
import { buildAgreementHtml } from "../utils/agreementTemplate";
import { downloadPdfFile } from "../utils/pdfDownload";

const AgreementPreview = () => {
  const { id } = useParams();
  const [agreement, setAgreement] = useState(null);
  const [settings, setSettings] = useState(settingsFallback);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get("/api/settings").then((res) => setSettings({ ...settingsFallback, ...res.data })).catch(() => setSettings(settingsFallback));
    api.get(`/api/agreements/${id}`)
      .then((res) => setAgreement(res.data))
      .catch((err) => setMessage(err.response?.data?.message || "Could not load agreement."));
  }, [id]);

  const html = useMemo(() => agreement ? buildAgreementHtml(agreement, settings) : "", [agreement, settings]);

  const downloadPdf = async () => {
    try {
      await downloadPdfFile({
        path: `/api/agreements/${id}/pdf`,
        fallbackFilename: `${agreement?.agreementNo || "agreement"}.pdf`,
        token: localStorage.getItem("adminToken")
      });
    } catch (err) {
      console.error("PDF download error:", err);
      alert("PDF download failed. Please try again.");
    }
  };

  if (!agreement) return <section><h1 className="text-2xl font-black">Agreement Preview</h1><p className="mt-4 text-sm font-bold">{message || "Loading..."}</p></section>;

  return (
    <section className="min-w-0">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="break-words text-xl font-black sm:text-2xl">{agreement.agreementNo}</h1>
          <p className="mt-2 text-sm text-zinc-600">Preview and download agreement PDF.</p>
        </div>
        <div className="grid w-full gap-3 sm:flex sm:w-auto sm:flex-wrap">
          <Link className="btn-dark" to="/secure-admin-dashboard/agreements">Agreement List</Link>
          <Link className="btn-dark" to={`/secure-admin-dashboard/agreements/${id}/edit`}>Edit Agreement</Link>
          <button className="btn-primary" onClick={downloadPdf}>Download PDF</button>
        </div>
      </div>
      <div className="mt-4 min-w-0 overflow-hidden">
        <DocumentPreviewFrame html={html} title="Agreement preview" />
      </div>
    </section>
  );
};

export default AgreementPreview;
