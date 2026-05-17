const Agreement = require("../models/Agreement");
const AgreementTemplate = require("../models/AgreementTemplate");
const { getSettingsDoc } = require("./settingsController");

const defaultAgreementTemplate = {
  introduction: "This House Construction Agreement is entered into on {{agreementDate}} between {{ownerName}} and {{contractorName}} for the construction work at {{projectSite}}.",
  whereasClauses: "WHEREAS the Owner intends to construct a house at {{projectSite}} and the Contractor has agreed to execute the work as per approved scope, drawings, and mutually accepted terms.",
  scopeOfWork: "The Contractor shall execute the agreed civil, structural, finishing, and related construction work for the project site, including all activities mutually approved in writing.",
  qualityOfMaterials: "All materials used shall be of approved quality and suitable grade. Any substitution of material shall require prior approval from the Owner or {{architectName}}.",
  timeSchedule: "The construction work shall be completed within {{projectDuration}}, subject to timely payments, approvals, site access, and conditions beyond reasonable control.",
  paymentTerms: "The total project cost/payment schedule shall be {{projectCost}}. Payment shall be released according to milestone completion and approved payment schedule.",
  supervision: "The Contractor shall maintain proper site supervision and coordinate with the Owner, architect, and site team for orderly execution of work.",
  defectsLiability: "The Contractor shall rectify structural defects or workmanship issues reported within {{defectPeriod}}, provided such defects are not caused by misuse, alteration, or external factors.",
  termination: "Either party may terminate this Agreement by giving {{noticeDays}} days written notice if the other party materially breaches agreed terms and fails to cure the breach.",
  disputeResolution: "Both parties shall first attempt to resolve disputes mutually through discussion. If unresolved, the dispute shall be handled as per applicable local jurisdiction.",
  witnessSection: "The witness confirms that this Agreement has been executed by both parties voluntarily and in their presence.",
  signatureSection: "The Owner, Contractor, and Witness acknowledge and accept the terms of this Agreement by signing below."
};

const escapeHtml = (value = "") => String(value ?? "").replace(/[&<>"']/g, (char) => ({
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
const round = (value) => Math.round((value + Number.EPSILON) * 100) / 100;
const money = (value) => new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num(value));
const percent = (value) => num(value).toLocaleString("en-IN", { maximumFractionDigits: 2 });
const date = (value) => value ? new Date(value).toLocaleDateString("en-GB") : "";
const pdfFilename = (value, fallback = "agreement") => `${String(value || fallback).replace(/[^a-z0-9._-]+/gi, "-")}.pdf`;
const dateOrUndefined = (value) => value ? value : undefined;
const safeImageUrl = (value = "") => {
  const url = String(value || "").trim();
  if (!url) return "";
  if (url.startsWith("https://") || url.startsWith("data:image/")) return url;
  return "";
};
const templateFields = Object.keys(defaultAgreementTemplate);
const normalizeTemplate = (input = {}) => templateFields.reduce((template, key) => {
  template[key] = String(input[key] ?? defaultAgreementTemplate[key] ?? "");
  return template;
}, {});
const getTemplateDoc = async () => {
  let template = await AgreementTemplate.findOne();
  if (!template) template = await AgreementTemplate.create(defaultAgreementTemplate);
  return template;
};
const placeholders = (agreement) => ({
  ownerName: agreement.owner?.name || "",
  contractorName: agreement.company?.name || "",
  projectSite: agreement.project?.siteAddress || "",
  projectDuration: agreement.project?.duration || "",
  agreementDate: date(agreement.agreementDate || new Date()),
  projectCost: `₹${money(agreement.grandTotal || agreement.subtotal || 0)}`,
  architectName: agreement.architectName || "",
  defectPeriod: agreement.warrantyPeriod || "",
  noticeDays: agreement.noticeDays || ""
});
const renderPlaceholders = (text = "", agreement) => {
  const values = placeholders(agreement);
  return String(text || "").replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] ?? "");
};

const makeAgreementNo = async () => {
  const year = new Date().getFullYear();
  const prefix = `AGR-${year}-`;
  const latest = await Agreement.findOne({ agreementNo: new RegExp(`^${prefix}`) }).sort({ agreementNo: -1 }).select("agreementNo");
  const lastNumber = latest?.agreementNo ? Number(latest.agreementNo.split("-").pop()) : 0;
  return `${prefix}${String(lastNumber + 1).padStart(3, "0")}`;
};

const calculateTotals = (body) => {
  const payments = (body.payments || []).map((row) => ({
    stage: row.stage || "",
    amount: round(num(row.amount)),
    percentage: round(num(row.percentage)),
    remarks: row.remarks || ""
  })).filter((row) => row.stage || row.amount || row.percentage || row.remarks);
  const subtotal = round(payments.reduce((sum, row) => sum + row.amount, 0));
  const enableGST = Boolean(body.enableGST);
  const gstPercent = Math.min(num(body.gstPercent || 0), 100);
  const gstAmount = enableGST ? round((subtotal * gstPercent) / 100) : 0;
  const grandTotal = round(subtotal + gstAmount);
  return { payments, subtotal, enableGST, gstPercent, gstAmount, grandTotal };
};

const normalize = async (body, existing) => {
  const totals = calculateTotals(body);
  const project = body.project || {};
  return {
    agreementNo: existing?.agreementNo || body.agreementNo || await makeAgreementNo(),
    company: body.company || {},
    owner: body.owner || {},
    project: {
      ...project,
      startDate: dateOrUndefined(project.startDate),
      endDate: dateOrUndefined(project.endDate)
    },
    title: body.title || "House Construction Agreement",
    agreementDate: dateOrUndefined(body.agreementDate) || new Date(),
    description: body.description || "",
    clauses: normalizeTemplate(body.clauses || {}),
    rules: (body.rules || []).map((rule) => String(rule || "").trim()).filter(Boolean),
    warrantyPeriod: body.warrantyPeriod || "",
    termsConditions: body.termsConditions || "",
    additionalNotes: body.additionalNotes || "",
    witnessName: body.witnessName || "",
    ownerSignature: body.ownerSignature || "",
    contractorSignature: body.contractorSignature || "",
    ...totals
  };
};

const getAgreements = async (req, res, next) => {
  try {
    res.json(await Agreement.find().sort({ createdAt: -1 }));
  } catch (error) {
    next(error);
  }
};

const getAgreementTemplate = async (req, res, next) => {
  try {
    res.json(await getTemplateDoc());
  } catch (error) {
    next(error);
  }
};

const updateAgreementTemplate = async (req, res, next) => {
  try {
    const payload = req.body?.reset ? defaultAgreementTemplate : normalizeTemplate(req.body);
    const existing = await getTemplateDoc();
    res.json(await AgreementTemplate.findByIdAndUpdate(existing._id, payload, { new: true, runValidators: true }));
  } catch (error) {
    next(error);
  }
};

const createAgreement = async (req, res, next) => {
  try {
    res.status(201).json(await Agreement.create(await normalize(req.body)));
  } catch (error) {
    next(error);
  }
};

const getAgreement = async (req, res, next) => {
  try {
    const agreement = await Agreement.findById(req.params.id);
    if (!agreement) return res.status(404).json({ message: "Agreement not found" });
    res.json(agreement);
  } catch (error) {
    next(error);
  }
};

const updateAgreement = async (req, res, next) => {
  try {
    const existing = await Agreement.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Agreement not found" });
    res.json(await Agreement.findByIdAndUpdate(req.params.id, await normalize(req.body, existing), { new: true, runValidators: true }));
  } catch (error) {
    next(error);
  }
};

const deleteAgreement = async (req, res, next) => {
  try {
    const agreement = await Agreement.findByIdAndDelete(req.params.id);
    if (!agreement) return res.status(404).json({ message: "Agreement not found" });
    res.json({ message: "Agreement deleted" });
  } catch (error) {
    next(error);
  }
};

const agreementHtml = (agreement, fallbackSettings = {}) => {
  const company = agreement.company || {};
  const owner = agreement.owner || {};
  const project = agreement.project || {};
  const logoUrl = safeImageUrl(company.logoUrl || fallbackSettings.documentLogoUrl || fallbackSettings.logoUrl);
  const clauses = normalizeTemplate(agreement.clauses || {});
  const clauseLabels = [
    ["introduction", "Agreement Introduction"],
    ["whereasClauses", "WHEREAS Clauses"],
    ["scopeOfWork", "Scope of Work"],
    ["qualityOfMaterials", "Quality of Materials"],
    ["timeSchedule", "Time Schedule"],
    ["paymentTerms", "Payment Terms"],
    ["supervision", "Supervision"],
    ["defectsLiability", "Defects Liability"],
    ["termination", "Termination"],
    ["disputeResolution", "Dispute Resolution"],
    ["witnessSection", "Witness Section"],
    ["signatureSection", "Signature Section"]
  ];
  const clauseLines = clauseLabels
    .map(([key, label]) => {
      const text = renderPlaceholders(clauses[key], agreement).trim();
      return text ? `<b>${escapeHtml(label)}:</b> ${escapeHtml(text)}<br>` : "";
    })
    .join("\n");
  const rules = (agreement.rules || []).map((rule, index) => `${index + 1}. ${escapeHtml(renderPlaceholders(rule, agreement))}<br>`).join("\n");
  const agreementTerms = `${clauseLines}${rules}` || "1. No agreement terms added.<br>";
  const paymentRows = (agreement.payments || []).map((row) => `
<tr>

<td>${escapeHtml(row.stage)}</td>
<td>₹${money(row.amount)}</td>

</tr>`).join("");
  const gstRows = agreement.enableGST ? `
<tr>
<td>GST (${percent(agreement.gstPercent)}%)</td>
<td>₹${money(agreement.gstAmount)}</td>
</tr>

<tr>
<td><b>Grand Total with GST</b></td>
<td><b>₹${money(agreement.grandTotal)}</b></td>
</tr>` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Quality Construction Agreement</title>

<style>
*{
margin:0;
padding:0;
box-sizing:border-box;
font-family:Arial,sans-serif;
}

body{
background:#f5f5f5;
padding:0;
font-size:12px;
line-height:1.45;
}

.container{
width:100%;
min-height:auto;
margin:auto;
background:white;
padding:0;
box-shadow:none;
border-radius:0;
overflow:visible;
}

.header{
display:flex;
justify-content:space-between;
border-bottom:2px solid #000;
padding-bottom:12px;
margin-bottom:18px;
gap:18px;
}

.left{
display:flex;
gap:12px;
align-items:center;
min-width:0;
}

.logo{
width:60px;
height:60px;
border:0;
display:flex;
align-items:center;
justify-content:center;
font-size:12px;
flex:0 0 60px;
}

.logo img{
max-width:100%;
max-height:100%;
object-fit:contain;
}

.company h1{
font-size:22px;
line-height:1.15;
margin-bottom:3px;
}

.company p{
font-size:11px;
color:#555;
}

.right{
text-align:right;
font-size:11px;
line-height:1.35;
flex:0 0 185px;
}

.right div{
margin-bottom:4px;
}

.title{
text-align:center;
margin-bottom:16px;
}

.title h2{
font-size:20px;
letter-spacing:1px;
}

.title p{
font-size:12px;
}

.customer{
display:grid;
grid-template-columns:1fr 1fr;
gap:12px;
margin-bottom:16px;
}

.box{
border:1px solid #ddd;
padding:10px;
border-radius:8px;
font-size:12px;
line-height:1.45;
}

.box h3{
margin-bottom:6px;
font-size:14px;
}

.section{
margin-bottom:16px;
break-inside:avoid;
page-break-inside:avoid;
}

.payment-section{
break-inside:avoid;
page-break-inside:avoid;
}

.section h3{
margin-bottom:8px;
border-left:5px solid black;
padding-left:10px;
font-size:14px;
}

.section p{
line-height:1.45;
color:#444;
font-size:12px;
}

table{
width:100%;
border-collapse:collapse;
margin-top:10px;
page-break-inside:auto;
}

tr{
page-break-inside:avoid;
page-break-after:auto;
}

thead{
display:table-header-group;
}

table th,table td{
border:1px solid #ddd;
padding:8px;
text-align:left;
font-size:12px;
}

table th{
background:black;
color:white;
}

.signature{
margin-top:45px;
display:flex;
justify-content:space-between;
gap:18px;
break-inside:avoid;
page-break-inside:avoid;
}

.sign{
width:180px;
text-align:center;
font-size:12px;
}

.line{
border-top:1px solid black;
margin-bottom:10px;
}

@page{
size:A4;
margin:18mm 16mm 18mm 16mm;
}

@media(max-width:700px){
.container{
width:100%;
min-height:auto;
padding:20px;
}
.header{
flex-direction:column;
}
.right{
text-align:left;
flex:auto;
}
.customer{
grid-template-columns:1fr;
}
.signature{
flex-direction:column;
gap:32px;
}
.sign{
width:100%;
}
}
</style>

</head>

<body>

<div class="container">

<div class="header">

<div class="left">

<div class="logo">
${logoUrl ? `<img src="${escapeHtml(logoUrl)}" alt="LOGO">` : "LOGO"}
</div>

<div class="company">
<h1>${escapeHtml(company.name || fallbackSettings.companyName || "QUALITY CONSTRUCTION")}</h1>

<p>${escapeHtml(company.tagline || "Building Trust, Building Dreams")}</p>

<p>
${escapeHtml(company.address || fallbackSettings.address || "")}
</p>

</div>

</div>

<div class="right">

<div><b>Date:</b> ${date(agreement.agreementDate || new Date())}</div>

<div><b>GSTIN:</b> ${escapeHtml(company.gstNumber || fallbackSettings.gstNumber || "")}</div>

<div><b>Phone:</b> ${escapeHtml(company.phone || fallbackSettings.phone || "")}</div>

<div><b>Email:</b> ${escapeHtml(company.email || fallbackSettings.email || "")}</div>

<div><b>Project ID:</b> ${escapeHtml(project.projectId || agreement.agreementNo || "Auto generated")}</div>

</div>

</div>

<div class="title">

<h2>${escapeHtml(agreement.title || "HOUSE CONSTRUCTION AGREEMENT")}</h2>

<p>
Agreement between Owner & Contractor
</p>

</div>

<div class="customer">

<div class="box">

<h3>Owner Details</h3>

Name: ${escapeHtml(owner.name)}<br><br>

Address: ${escapeHtml(owner.address)}<br><br>

Phone: ${escapeHtml(owner.phone)}

</div>

<div class="box">

<h3>Project Details</h3>

Site: ${escapeHtml(project.siteAddress)}<br><br>

Area: ${escapeHtml(project.areaSqft)} Sq Ft<br><br>

Duration: ${escapeHtml(project.duration)}

</div>

</div>

<div class="section">

<h3>Agreement Terms</h3>

<p>

${agreementTerms}

</p>

</div>

<div class="section payment-section">

<h3>Payment Schedule</h3>

<table>

<thead>
<tr>

<th>Stage</th>
<th>Amount</th>

</tr>
</thead>
<tbody>
${paymentRows || `
<tr>
<td>No payment rows added.</td>
<td>₹0.00</td>
</tr>`}
${gstRows}
</tbody>

</table>

</div>

<div class="signature">

<div class="sign">
<div class="line"></div>
${escapeHtml(agreement.ownerSignature || "Owner Signature")}
</div>

<div class="sign">
<div class="line"></div>
${escapeHtml(agreement.contractorSignature || "Contractor Signature")}
</div>

<div class="sign">
<div class="line"></div>
${escapeHtml(agreement.witnessName || "Witness")}
</div>

</div>

</div>

</body>
</html>`;
};

const downloadAgreementPdf = async (req, res) => {
  let browser;
  try {
    const agreement = await Agreement.findById(req.params.id);
    if (!agreement) return res.status(404).json({ message: "Agreement not found" });
    const puppeteer = require("puppeteer");
    const settings = await getSettingsDoc();
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
    });
    const page = await browser.newPage();
    await page.setContent(agreementHtml(agreement, settings), { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true, preferCSSPageSize: true, margin: { top: "0", right: "0", bottom: "0", left: "0" } });
    if (!pdfBuffer || pdfBuffer.length < 1000) return res.status(500).json({ message: "Invalid PDF generated" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${pdfFilename(agreement.agreementNo)}"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    return res.end(pdfBuffer);
  } catch (error) {
    if (!res.headersSent) res.status(500).json({ message: "PDF generation failed", error: error.message });
  } finally {
    if (browser) await browser.close().catch((error) => console.error("AGREEMENT PDF CLOSE ERROR:", error));
  }
};

module.exports = { agreementHtml, getAgreementTemplate, updateAgreementTemplate, getAgreements, createAgreement, getAgreement, updateAgreement, deleteAgreement, downloadAgreementPdf };
