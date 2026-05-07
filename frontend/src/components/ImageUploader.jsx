import React, { useRef, useState } from "react";
import { ImageUp } from "lucide-react";
import api from "../api/axios";

const ImageUploader = ({ label = "Image", name, value, onChange, required = false, placeholder = "Paste image URL optional", cacheBust = false }) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const setValue = (nextValue) => {
    onChange({ target: { name, value: nextValue } });
  };

  const upload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be 5MB or smaller.");
      event.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploading(true);
      const { data } = await api.post("/api/upload/image", formData);
      setValue(data.url);
    } catch (err) {
      setError(err.response?.data?.message || "Image upload failed.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div>
      <label className="label">{label}</label>
      <div className="grid gap-3">
        {value && (
          <img className="h-36 w-full rounded-md border border-zinc-200 object-contain" src={cacheBust ? `${value}?v=${Date.now()}` : value} alt={`${label} preview`} />
        )}
        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="button" className="btn-dark" onClick={() => inputRef.current?.click()} disabled={uploading}>
            <ImageUp size={18} className="mr-2 shrink-0" />
            {uploading ? "Uploading..." : "Upload Image"}
          </button>
          {value && (
            <button type="button" className="btn-primary" onClick={() => setValue("")} disabled={uploading}>
              Remove
            </button>
          )}
        </div>
        <input ref={inputRef} className="hidden" type="file" accept="image/*" onChange={upload} />
        <input className="input" name={name} value={value || ""} onChange={(event) => setValue(event.target.value)} required={required} placeholder={placeholder} />
        {error && <p className="text-sm font-bold text-red-700">{error}</p>}
      </div>
    </div>
  );
};

export default ImageUploader;
