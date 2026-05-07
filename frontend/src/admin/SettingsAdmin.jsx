import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { settingsFallback } from "../data/fallbackData";
import ImageUploader from "../components/ImageUploader";
import VideoCard from "../components/VideoCard";
import { normalizeVideo } from "../utils/video";

const fields = [
  ["companyName", "Company Name"],
  ["logoUrl", "Website Logo"],
  ["logoWidth", "Logo Width"],
  ["logoHeight", "Logo Height"],
  ["documentLogoUrl", "Documents Logo"],
  ["documentLogoWidth", "Documents Logo Width"],
  ["documentLogoHeight", "Documents Logo Height"],
  ["tagline", "Tagline"],
  ["address", "Address"],
  ["phone", "Phone"],
  ["email", "Email"],
  ["website", "Website"],
  ["gstNumber", "GST Number"],
  ["gstPercent", "GST Percent"],
  ["signatureUrl", "Signature"],
  ["terms", "Terms & Conditions"],
  ["bankDetails", "Bank Details"],
  ["footerNote", "Footer Note"],
  ["workingHours", "Working Hours"],
  ["footerDescription", "Footer Description"],
  ["facebook", "Facebook URL"],
  ["instagram", "Instagram URL"],
  ["whatsapp", "WhatsApp URL"],
  ["heroTitle", "Hero Title"],
  ["heroSubtitle", "Hero Subtitle"],
  ["trustedText", "Trusted Section Text"],
  ["contactHeading", "Contact Heading"],
  ["contactDescription", "Contact Description"]
];

const longFields = new Set(["footerDescription", "heroSubtitle", "trustedText", "contactDescription", "address", "terms", "bankDetails", "footerNote"]);
const placeholders = {
  logoUrl: "Paste logo URL",
  documentLogoUrl: "Paste documents logo URL",
  signatureUrl: "Paste signature image URL"
};
const imageFields = {
  logoUrl: "Upload Website Logo",
  documentLogoUrl: "Upload Documents Logo",
  signatureUrl: "Upload Signature"
};
const blankVideo = { title: "", url: "", thumbnail: "" };

const SettingsAdmin = () => {
  const [form, setForm] = useState(settingsFallback);
  const [videoForm, setVideoForm] = useState(blankVideo);
  const [editingVideo, setEditingVideo] = useState(null);
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

  const updateVideo = (e) => setVideoForm({ ...videoForm, [e.target.name]: e.target.value });
  const resetVideo = () => {
    setVideoForm(blankVideo);
    setEditingVideo(null);
  };
  const saveVideos = async (videos, successMessage) => {
    const nextForm = { ...form, videos };
    const { data } = await api.put("/api/settings", nextForm);
    setForm({ ...settingsFallback, ...data });
    setMessage(successMessage);
  };
  const submitVideo = async (e) => {
    e.preventDefault();
    setMessage("");
    const video = normalizeVideo(videoForm);
    if (!video.url) return setMessage("Video URL is required.");
    const currentVideos = Array.isArray(form.videos) ? form.videos : [];
    const videos = editingVideo === null
      ? [...currentVideos, video]
      : currentVideos.map((item, index) => index === editingVideo ? video : item);
    try {
      await saveVideos(videos, editingVideo === null ? "Video added." : "Video updated.");
      resetVideo();
    } catch (err) {
      setMessage(err.response?.data?.message || "Video save failed.");
    }
  };
  const editVideo = (video, index) => {
    setEditingVideo(index);
    setVideoForm({ title: video.title || "", url: video.url || "", thumbnail: video.thumbnail || "" });
  };
  const removeVideo = async (index) => {
    if (!window.confirm("Delete this video?")) return;
    setMessage("");
    const videos = (form.videos || []).filter((_, itemIndex) => itemIndex !== index);
    try {
      await saveVideos(videos, "Video deleted.");
      resetVideo();
    } catch (err) {
      setMessage(err.response?.data?.message || "Video delete failed.");
    }
  };

  return (
    <section>
      <h1 className="text-2xl font-black">Website Settings</h1>
      <form onSubmit={submit} className="admin-card mt-4 grid gap-4">
        <label className="flex items-center gap-3 rounded-md border border-zinc-200 p-3 text-sm font-bold">
          <input type="checkbox" name="gstEnabled" checked={Boolean(form.gstEnabled)} onChange={update} />
          GST Enabled
        </label>
        {loading ? <p>Loading settings...</p> : fields.map(([name, label]) => (
          <div key={name}>
            <label className="label">{label}</label>
            {imageFields[name] ? (
              <ImageUploader label={imageFields[name]} name={name} value={form[name] || ""} onChange={update} placeholder={placeholders[name] || "Paste image URL optional"} cacheBust={["logoUrl", "documentLogoUrl"].includes(name)} />
            ) : longFields.has(name) ? (
              <textarea className="input min-h-20" name={name} value={form[name] || ""} onChange={update} placeholder={placeholders[name] || ""} />
            ) : (
              <input className="input" type={["gstPercent", "logoWidth", "logoHeight", "documentLogoWidth", "documentLogoHeight"].includes(name) ? "number" : "text"} name={name} value={form[name] ?? ""} onChange={update} required={name === "companyName"} placeholder={placeholders[name] || ""} />
            )}
          </div>
        ))}
        {message && <p className="text-sm font-bold">{message}</p>}
        <button className="btn-primary w-full sm:w-fit">Save Settings</button>
      </form>

      <div className="admin-card mt-4 grid gap-4">
        <div>
          <h2 className="text-xl font-black">Video Section</h2>
          <p className="mt-1 text-sm text-zinc-600">Manage video links shown on the home page.</p>
        </div>
        <form onSubmit={submitVideo} className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end">
          <div>
            <label className="label">Title</label>
            <input className="input" name="title" value={videoForm.title} onChange={updateVideo} placeholder="Optional video title" />
          </div>
          <div>
            <label className="label">Video URL</label>
            <input className="input" name="url" value={videoForm.url} onChange={updateVideo} placeholder="YouTube, Reel, or video URL" required />
          </div>
          <div>
            <label className="label">Thumbnail URL</label>
            <input className="input" name="thumbnail" value={videoForm.thumbnail} onChange={updateVideo} placeholder="Optional thumbnail URL" />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
            <button className="btn-primary">{editingVideo === null ? "Add" : "Update"}</button>
            {editingVideo !== null && <button type="button" className="btn-dark" onClick={resetVideo}>Cancel</button>}
          </div>
        </form>
        {(form.videos || []).length ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {(form.videos || []).map((video, index) => (
              <div key={`${video.url}-${index}`} className="min-w-0">
                <VideoCard video={video} onPlay={() => window.open(video.url, "_blank", "noopener,noreferrer")} />
                <div className="action-row mt-2">
                  <button type="button" className="action-btn action-edit" onClick={() => editVideo(video, index)}>Edit</button>
                  <button type="button" className="action-btn action-delete" onClick={() => removeVideo(index)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm font-semibold text-zinc-500">No videos added.</p>
        )}
      </div>
    </section>
  );
};

export default SettingsAdmin;
