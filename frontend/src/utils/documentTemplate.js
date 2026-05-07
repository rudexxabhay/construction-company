const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;"
}[char]));

const cleanNumber = (value) => {
  const number = typeof value === "string" ? Number(value.replace(/,/g, "").trim()) : Number(value);
  return Number.isFinite(number) ? Math.max(number, 0) : 0;
};

const money = (value) => cleanNumber(value).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const quantity = (value) => cleanNumber(value).toLocaleString("en-IN", { maximumFractionDigits: 2 });
const percent = (value) => cleanNumber(value).toLocaleString("en-IN", { maximumFractionDigits: 2 });
const formatDate = (value) => value ? new Date(value).toLocaleDateString("en-GB") : "";
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

const titleLabels = { estimate: "Estimate", quotation: "Quotation", invoice: "Invoice" };

export const buildDocumentHtml = ({ settings, title = "Quotation", documentNo = "", date, clientName = "", clientAddress = "", clientPhone = "", items = [], subtotal = 0, totalGST = 0, discountPercent = 0, discount = 0, otherCharges = 0, grandTotal = 0, paidAmount = 0, dueAmount = 0, paymentStatus = "", isInvoice = false }) => {
  const logoWidth = logoSize(settings.documentLogoWidth, 92);
  const logoUrl = settings.documentLogoUrl || "";
  const rows = items.map((item, index) => {
    const { title: itemTitle, description } = splitDescription(item.name || item.description || "");
    return `
        <tr>
          <td>${index + 1}</td>
          <td>
            <div class="desc-title">${escapeHtml(itemTitle)}</div>
            <div class="desc">${preserveBreaks(description)}</div>
          </td>
          <td>${quantity(item.quantity)}</td>
          <td>₹${money(item.rate ?? item.price)}</td>
          <td>₹${money(item.amount ?? item.total)}</td>
        </tr>`;
  }).join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(title)}</title>

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

      <div class="title">${escapeHtml(title)}</div>
    </div>

    <div class="top-info">
      <div class="client">
        <strong>To,</strong><br />
        ${escapeHtml(clientName)}<br />
        ${escapeHtml(clientAddress)}<br />
        ☎ ${escapeHtml(clientPhone)}
      </div>

      <div class="doc-info">
        <strong>${escapeHtml(title)}#</strong>&nbsp;&nbsp;&nbsp;&nbsp; ${escapeHtml(documentNo)}<br />
        <strong>Date:</strong>&nbsp;&nbsp;&nbsp;&nbsp; ${formatDate(date)}
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
      <div>₹${money(subtotal)}</div>
      <div>GST</div>
      <div>₹${money(totalGST)}</div>
      <div>Discount (${percent(discountPercent)}%)</div>
      <div>- ₹${money(discount)}</div>
      <div>Other Charges</div>
      <div>₹${money(otherCharges)}</div>
      <div class="grand">Grand Total</div>
      <div class="grand">₹${money(grandTotal)}</div>
      ${isInvoice ? `
      <div>Paid Amount</div>
      <div>₹${money(paidAmount)}</div>
      <div>Due Amount</div>
      <div>₹${money(dueAmount)}</div>
      <div>Payment Status</div>
      <div>${escapeHtml(paymentStatus || "Unpaid")}</div>` : ""}
    </div>

    <div class="footer-text">
      We hope you find our offer to be in line with your requirement.
    </div>

  </div>
</body>
</html>`;
};

export const buildDocumentEditorHtml = (form, settings, totals) => buildDocumentHtml({
  settings,
  title: titleLabels[form.type] || "Document",
  documentNo: form.documentNo || "Auto generated",
  date: form.createdAt || new Date(),
  clientName: form.client?.name || "",
  clientAddress: form.client?.address || "",
  clientPhone: form.client?.phone || "",
  items: totals.items,
  subtotal: totals.subtotal,
  totalGST: totals.totalGST,
  discountPercent: totals.discountPercent,
  discount: totals.discount,
  otherCharges: totals.otherCharges,
  grandTotal: totals.grandTotal,
  paidAmount: totals.paidAmount,
  dueAmount: totals.dueAmount,
  paymentStatus: form.paymentStatus,
  isInvoice: form.type === "invoice"
});

export const buildQuotationHtml = (quotation, settings) => buildDocumentHtml({
  settings,
  title: "Quotation",
  documentNo: quotation.quotationNo || "",
  date: quotation.createdAt,
  clientName: quotation.clientName || "",
  clientAddress: quotation.clientAddress || "",
  clientPhone: quotation.clientPhone || "",
  items: quotation.items || [],
  subtotal: quotation.subtotal,
  totalGST: quotation.gst,
  discountPercent: quotation.discountPercent,
  discount: quotation.discount,
  otherCharges: quotation.otherCharges,
  grandTotal: quotation.total
});
