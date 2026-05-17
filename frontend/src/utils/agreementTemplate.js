const escapeHtml = (value = "") => String(value ?? "").replace(/[&<>"']/g, (char) => ({
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

export const roundMoney = (value) => Math.round((value + Number.EPSILON) * 100) / 100;
export const money = (value) => cleanNumber(value).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const percent = (value) => cleanNumber(value).toLocaleString("en-IN", { maximumFractionDigits: 2 });
export const formatDate = (value) => value ? new Date(value).toLocaleDateString("en-GB") : "";
export const toDateInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};
export const defaultAgreementTemplate = {
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
export const agreementTemplateFields = [
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
export const normalizeAgreementTemplate = (template = {}) => agreementTemplateFields.reduce((next, [key]) => {
  next[key] = String(template[key] ?? defaultAgreementTemplate[key] ?? "");
  return next;
}, {});

const ruleLines = (rules = []) => {
  const lines = rules.map((rule, index) => `${index + 1}. ${escapeHtml(rule)}<br>`).join("\n");
  return lines || "1. No agreement terms added.<br>";
};
const renderPlaceholders = (text = "", agreement, totals) => {
  const values = {
    ownerName: agreement.owner?.name || "",
    contractorName: agreement.company?.name || "",
    projectSite: agreement.project?.siteAddress || "",
    projectDuration: agreement.project?.duration || "",
    agreementDate: formatDate(agreement.agreementDate || new Date()),
    projectCost: `₹${money(totals.grandTotal || totals.subtotal || 0)}`,
    architectName: agreement.architectName || "",
    defectPeriod: agreement.warrantyPeriod || "",
    noticeDays: agreement.noticeDays || ""
  };
  return String(text || "").replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] ?? "");
};

export const calculateAgreementTotals = (form) => {
  const payments = (form.payments || []).map((row) => ({
    ...row,
    amount: roundMoney(cleanNumber(row.amount)),
    percentage: roundMoney(cleanNumber(row.percentage))
  }));
  const subtotal = roundMoney(payments.reduce((sum, row) => sum + row.amount, 0));
  const gstPercent = Math.min(cleanNumber(form.gstPercent), 100);
  const gstAmount = form.enableGST ? roundMoney((subtotal * gstPercent) / 100) : 0;
  return { payments, subtotal, gstPercent, gstAmount, grandTotal: roundMoney(subtotal + gstAmount) };
};

export const buildAgreementHtml = (agreement, settings = {}) => {
  const company = agreement.company || {};
  const owner = agreement.owner || {};
  const project = agreement.project || {};
  const totals = calculateAgreementTotals(agreement);
  const logoUrl = company.logoUrl || settings.documentLogoUrl || settings.logoUrl || "";
  const clauses = normalizeAgreementTemplate(agreement.clauses || {});
  const clauseLines = agreementTemplateFields
    .map(([key, label]) => {
      const text = renderPlaceholders(clauses[key], agreement, totals).trim();
      return text ? `<b>${escapeHtml(label)}:</b> ${escapeHtml(text)}<br>` : "";
    })
    .join("\n");
  const rules = (agreement.rules || []).length ? ruleLines(agreement.rules) : "";
  const agreementTerms = `${clauseLines}${rules}` || "1. No agreement terms added.<br>";
  const paymentRows = totals.payments.map((row) => `
<tr>

<td>${escapeHtml(row.stage)}</td>
<td>₹${money(row.amount)}</td>

</tr>`).join("");
  const gstRows = agreement.enableGST ? `
<tr>
<td>GST (${percent(totals.gstPercent)}%)</td>
<td>₹${money(totals.gstAmount)}</td>
</tr>

<tr>
<td><b>Grand Total with GST</b></td>
<td><b>₹${money(totals.grandTotal)}</b></td>
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
<h1>${escapeHtml(company.name || settings.companyName || "QUALITY CONSTRUCTION")}</h1>

<p>${escapeHtml(company.tagline || "Building Trust, Building Dreams")}</p>

<p>
${escapeHtml(company.address || settings.address || "")}
</p>

</div>

</div>

<div class="right">

<div><b>Date:</b> ${formatDate(agreement.agreementDate || new Date())}</div>

<div><b>GSTIN:</b> ${escapeHtml(company.gstNumber || settings.gstNumber || "")}</div>

<div><b>Phone:</b> ${escapeHtml(company.phone || settings.phone || "")}</div>

<div><b>Email:</b> ${escapeHtml(company.email || settings.email || "")}</div>

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
