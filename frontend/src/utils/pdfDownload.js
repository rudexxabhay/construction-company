const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const filenameFromDisposition = (value, fallback) => {
  const filenameStar = value?.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  if (filenameStar) return decodeURIComponent(filenameStar).replace(/[/\\]/g, "-");

  const filename = value?.match(/filename="?([^";]+)"?/i)?.[1];
  return filename ? filename.replace(/[/\\]/g, "-") : fallback;
};

export const downloadPdfFile = async ({ path, fallbackFilename = "document.pdf", token }) => {
  const response = await fetch(`${API_URL}${path}`, {
    method: "GET",
    credentials: "include",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      Accept: "application/pdf"
    }
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(message || "PDF download failed");
  }

  const contentType = response.headers.get("Content-Type") || "";
  if (!contentType.includes("application/pdf")) {
    throw new Error("PDF download failed. Server did not return a PDF.");
  }

  const blob = await response.blob();
  if (!blob.size) throw new Error("PDF download failed. Empty file received.");

  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filenameFromDisposition(response.headers.get("Content-Disposition"), fallbackFilename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
};
