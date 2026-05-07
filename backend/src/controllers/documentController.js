const Document = require("../models/Document");
const Client = require("../models/Client");
const { getSettingsDoc } = require("./settingsController");

const prefixes = { estimate: "EST", quotation: "QUO", invoice: "INV" };
const titles = { estimate: "ESTIMATE", quotation: "QUOTATION", invoice: "INVOICE" };
const labels = { estimate: { one: "Estimate" }, quotation: { one: "Quotation" }, invoice: { one: "Invoice" } };

const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;"
}[char]));
const num = (value) => {
  const number = typeof value === "string" ? Number(value.replace(/,/g, "").trim()) : Number(value);
  return Number.isFinite(number) ? Math.max(number, 0) : 0;
};
const getGST = (value) => {
  if (value === 0 || value === "0") return 0;
  if (value === "" || value === null || value === undefined) return 18;
  const number = Number(value);
  if (Number.isNaN(number) || number < 0 || number > 100) return 18;
  return number;
};
const getDiscount = (value) => {
  if (value === 0 || value === "0") return 0;
  if (value === "" || value === null || value === undefined) return 0;
  const number = Number(value);
  if (Number.isNaN(number) || number < 0 || number > 100) return 0;
  return number;
};
const round = (value) => Math.round((value + Number.EPSILON) * 100) / 100;
const money = (value) => new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num(value));
const percent = (value) => num(value).toLocaleString("en-IN", { maximumFractionDigits: 2 });
const date = (value) => value ? new Date(value).toLocaleDateString("en-GB") : "";
const titleLabel = (type) => labels[type]?.one || "Document";
const titleNoLabel = (type) => `${titleLabel(type)}#`;
const safeImageUrl = (value = "") => {
  const url = String(value || "").trim();
  if (!url) return "";
  if (url.startsWith("https://") || url.startsWith("data:image/")) return url;
  return "";
};
const logoSize = (value, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Math.min(number, 180) : fallback;
};
const splitDescription = (value = "") => {
  const lines = String(value || "").split(/\r?\n/);
  const title = lines.shift() || "";
  return { title, description: lines.join("\n") };
};
const preserveBreaks = (value = "") => escapeHtml(value).replace(/\r?\n/g, "<br />");
const pdfFilename = (value, fallback = "document") => `${String(value || fallback).replace(/[^a-z0-9._-]+/gi, "-")}.pdf`;

const makeDocumentNo = async (type) => {
  const year = new Date().getFullYear();
  const prefix = `${prefixes[type]}-${year}-`;
  const latest = await Document.findOne({ documentNo: new RegExp(`^${prefix}`) }).sort({ documentNo: -1 }).select("documentNo");
  const lastNumber = latest?.documentNo ? Number(latest.documentNo.split("-").pop()) : 0;
  return `${prefix}${String(lastNumber + 1).padStart(3, "0")}`;
};

const snapshotClient = async (input = {}) => {
  const id = input.clientId || input._id;
  const dbClient = id ? await Client.findById(id) : null;
  const source = dbClient || input;
  return {
    clientId: source._id || source.clientId || undefined,
    name: source.name || "Client",
    phone: source.phone || "",
    email: source.email || "",
    address: source.address || "",
    projectLocation: source.projectLocation || ""
  };
};

const calculate = (body) => {
  const items = (body.items || []).map((item) => {
    const quantity = num(item.quantity);
    const rate = num(item.rate ?? item.price);
    const gstPercent = getGST(item.gstPercent);
    const amount = round(quantity * rate);
    const gstAmount = round((amount * gstPercent) / 100);
    return {
      itemId: item.itemId || undefined,
      name: item.name,
      unit: item.unit || "Nos",
      quantity,
      rate,
      gstPercent,
      amount,
      gstAmount,
      finalAmount: round(amount + gstAmount)
    };
  }).filter((item) => item.name);
  const subtotal = round(items.reduce((sum, item) => sum + item.amount, 0));
  const totalGST = round(items.reduce((sum, item) => sum + item.gstAmount, 0));
  const discountPercent = getDiscount(body.discountPercent ?? body.discount);
  const discount = round((subtotal * discountPercent) / 100);
  const otherCharges = num(body.otherCharges);
  const grandTotal = round(subtotal + totalGST + otherCharges - discount);
  const paidAmount = num(body.paidAmount);
  return { items, subtotal, totalGST, discountPercent, discount, otherCharges, grandTotal, paidAmount, dueAmount: round(grandTotal - paidAmount) };
};

const normalize = async (body, existing) => {
  const type = body.type || existing?.type || "estimate";
  const totals = calculate(body);
  return {
    ...body,
    type,
    documentNo: existing?.documentNo || body.documentNo || await makeDocumentNo(type),
    client: await snapshotClient(body.client || {}),
    terms: body.terms || "",
    ...totals
  };
};

const getDocuments = async (req, res, next) => {
  try {
    const filter = req.query.type ? { type: req.query.type } : {};
    res.json(await Document.find(filter).sort({ createdAt: -1 }));
  } catch (error) {
    next(error);
  }
};

const createDocument = async (req, res, next) => {
  try {
    res.status(201).json(await Document.create(await normalize(req.body)));
  } catch (error) {
    next(error);
  }
};

const getDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ message: "Document not found" });
    res.json(document);
  } catch (error) {
    next(error);
  }
};

const updateDocument = async (req, res, next) => {
  try {
    const existing = await Document.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Document not found" });
    const document = await Document.findByIdAndUpdate(req.params.id, await normalize(req.body, existing), { new: true, runValidators: true });
    res.json(document);
  } catch (error) {
    next(error);
  }
};

const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findByIdAndDelete(req.params.id);
    if (!document) return res.status(404).json({ message: "Document not found" });
    res.json({ message: "Document deleted" });
  } catch (error) {
    next(error);
  }
};

const convertDocument = async (req, res, next) => {
  try {
    const source = await Document.findById(req.params.id).lean();
    if (!source) return res.status(404).json({ message: "Document not found" });
    const nextType = req.body.type || (source.type === "estimate" ? "quotation" : "invoice");
    if (!["quotation", "invoice"].includes(nextType)) return res.status(400).json({ message: "Invalid conversion type" });
    const payload = { ...source, _id: undefined, type: nextType, documentNo: await makeDocumentNo(nextType), sourceDocument: source._id };
    if (nextType === "invoice") payload.status = payload.paymentStatus || "Unpaid";
    const document = await Document.create(payload);
    res.status(201).json(document);
  } catch (error) {
    next(error);
  }
};

const pdfHtml = (doc, settings) => {
  const logoUrl = safeImageUrl(settings.documentLogoUrl);
  const logoWidth = logoSize(settings.documentLogoWidth, 92);
  const documentTitle = titleLabel(doc.type);
  const discountPercent = getDiscount(doc.discountPercent);
  const rows = doc.items.map((item, index) => {
    const { title, description } = splitDescription(item.name);
    return `
        <tr>
          <td>${index + 1}</td>
          <td>
            <div class="desc-title">${escapeHtml(title)}</div>
            <div class="desc">${preserveBreaks(description)}</div>
          </td>
          <td>${num(item.quantity).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
          <td>₹${money(item.rate)}</td>
          <td>₹${money(item.amount)}</td>
        </tr>`;
  }).join("");
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(documentTitle)}</title>

  <style>
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      background: #e5e5e5;
      font-family: Arial, Helvetica, sans-serif;
      color: #071426;
    }

    .page {
      width: 794px;
      min-height: 1123px;
      background: #fff;
      margin: 0 auto;
      padding: 54px 42px 36px;
      font-size: 14px;
    }

    .header {
      display: grid;
      grid-template-columns: 150px 1fr 150px;
      align-items: center;
      border-bottom: 1px solid #777;
      padding-bottom: 28px;
    }

    .logo {
      width: 92px;
      height: 92px;
      object-fit: contain;
      display: block;
      margin-left: 30px;
    }

    .company {
      text-align: center;
      line-height: 1.15;
    }

    .company h1 {
      margin: 0;
      font-size: 18px;
      font-weight: 800;
    }

    .company p {
      margin: 1px 0;
      font-size: 13px;
    }

    .company .gst {
      font-weight: 700;
      font-size: 13px;
    }

    .title {
      text-align: right;
      font-size: 20px;
      font-weight: 800;
    }

    .top-info {
      display: grid;
      grid-template-columns: 1fr 190px;
      gap: 20px;
      margin-top: 18px;
      font-size: 13px;
    }

    .client strong,
    .doc-info strong {
      font-weight: 800;
    }

    .doc-info {
      text-align: right;
      line-height: 1.45;
    }

    .letter {
      margin-top: 26px;
      font-size: 13px;
      line-height: 1.45;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 18px;
      font-size: 12px;
    }

    thead th {
      background: #eef2f6;
      border-top: 1px solid #777;
      border-bottom: 1px solid #777;
      padding: 6px 8px;
      text-align: left;
      font-weight: 800;
    }

    thead th:nth-child(1) {
      width: 35px;
      text-align: center;
    }

    thead th:nth-child(3),
    thead th:nth-child(4),
    thead th:nth-child(5) {
      text-align: right;
      width: 110px;
    }

    tbody td {
      padding: 9px 8px;
      vertical-align: top;
    }

    tbody td:nth-child(1) {
      text-align: center;
    }

    tbody td:nth-child(3),
    tbody td:nth-child(4),
    tbody td:nth-child(5) {
      text-align: right;
      white-space: nowrap;
    }

    .desc-title {
      font-weight: 800;
      margin-bottom: 2px;
    }

    .desc {
      font-size: 11px;
      line-height: 1.17;
      max-width: 360px;
    }

    .total-row td {
      padding-top: 0;
    }

    .summary {
      margin-left: auto;
      width: 365px;
      display: grid;
      grid-template-columns: 1fr 150px;
      border-top: 3px solid #7f8790;
      border-bottom: 1px solid #7f8790;
      font-size: 13px;
    }

    .summary div {
      padding: 7px 12px;
      border-bottom: 1px solid #d8dde3;
    }

    .summary div:nth-child(even) {
      text-align: right;
    }

    .summary .grand {
      background: #eef2f6;
      font-weight: 800;
      border-bottom: 0;
      padding-top: 10px;
      padding-bottom: 10px;
    }

    .footer-text {
      margin-top: 26px;
      font-size: 13px;
    }
  </style>
</head>

<body>
  <div class="page">

    <div class="header">
      <div>
        ${logoUrl ? `<img class="logo" src="${escapeHtml(logoUrl)}" alt="Logo" style="width: ${logoWidth}px; height: auto;" />` : ""}
      </div>

      <div class="company">
        <h1>${escapeHtml(settings.companyName)}</h1>
        <p>${escapeHtml(settings.address)}</p>
        <p>☎ ${escapeHtml(settings.phone)} ✉ ${escapeHtml(settings.email)}</p>
        ${settings.gstNumber ? `<p class="gst">GSTIN ${escapeHtml(settings.gstNumber)}</p>` : ""}
      </div>

      <div class="title">${escapeHtml(documentTitle)}</div>
    </div>

    <div class="top-info">
      <div class="client">
        <strong>To,</strong><br />
        ${escapeHtml(doc.client.name)}<br />
        ${escapeHtml(doc.client.address)}<br />
        ☎ ${escapeHtml(doc.client.phone)}
      </div>

      <div class="doc-info">
        <strong>${escapeHtml(titleNoLabel(doc.type))}</strong>&nbsp;&nbsp;&nbsp;&nbsp; ${escapeHtml(doc.documentNo)}<br />
        <strong>Date:</strong>&nbsp;&nbsp;&nbsp;&nbsp; ${date(doc.createdAt)}
      </div>
    </div>

    <div class="letter">
      Dear Sir/Mam,<br /><br />
      Thank you for your valuable inquiry. We are pleased to quote as below:
    </div>

    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>DESCRIPTION</th>
          <th>QTY</th>
          <th>PRICE</th>
          <th>TOTAL</th>
        </tr>
      </thead>

      <tbody>${rows}
      </tbody>
    </table>

    <div class="summary">
      <div>Subtotal</div>
      <div>₹${money(doc.subtotal)}</div>
      <div>GST</div>
      <div>₹${money(doc.totalGST)}</div>
      <div>Discount (${percent(discountPercent)}%)</div>
      <div>- ₹${money(doc.discount)}</div>
      <div>Other Charges</div>
      <div>₹${money(doc.otherCharges)}</div>
      <div class="grand">Grand Total</div>
      <div class="grand">₹${money(doc.grandTotal)}</div>
      ${doc.type === "invoice" ? `
      <div>Paid Amount</div>
      <div>₹${money(doc.paidAmount)}</div>
      <div>Due Amount</div>
      <div>₹${money(doc.dueAmount)}</div>
      <div>Payment Status</div>
      <div>${escapeHtml(doc.paymentStatus || doc.status || "Unpaid")}</div>` : ""}
    </div>

    <div class="footer-text">
      We hope you find our offer to be in line with your requirement.
    </div>

  </div>
</body>
</html>`;
};

const downloadDocumentPdf = async (req, res) => {
  let browser;
  try {
    console.log("🔥 PDF API HIT:", req.params.id);
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });
    const puppeteer = require("puppeteer");
    const settings = await getSettingsDoc();
    console.log("📄 Generating HTML...");
    const html = pdfHtml(doc, settings);
    console.log("HTML preview (first 300 chars):", html.substring(0, 300));
    if (html.includes("file://")) {
      console.log("⚠️ Found file:// inside HTML");
    }
    console.log("Generating PDF...");
    console.log("Executable Path:", puppeteer.executablePath());
    console.log("🚀 Launching Puppeteer...");
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage"
      ]
    });
    console.log("✅ Browser launched");
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    console.log("✅ HTML loaded into page");
    console.log("📦 Creating PDF...");
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: "0",
        right: "0",
        bottom: "0",
        left: "0"
      }
    });
    console.log("📄 PDF buffer size:", pdfBuffer.length);
    console.log("PDF header before send:", pdfBuffer.slice(0, 4).toString());
    if (!pdfBuffer || pdfBuffer.length < 1000) {
      console.error("❌ PDF too small / invalid");
      return res.status(500).json({ message: "Invalid PDF generated" });
    }
    res.status(200);
    const filename = pdfFilename(doc.documentNo);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    console.log("📤 Sending PDF response");
    return res.end(pdfBuffer);
  } catch (err) {
    console.error("PDF ERROR:", err);
    if (!res.headersSent) res.status(500).json({ success: false, message: "PDF generation failed", error: err.message });
  } finally {
    if (browser) await browser.close().catch((error) => console.error("DOCUMENT PDF CLOSE ERROR:", error));
  }
};

module.exports = { getDocuments, createDocument, getDocument, updateDocument, deleteDocument, convertDocument, downloadDocumentPdf };
