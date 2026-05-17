const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    logoUrl: { type: String, default: "" },
    name: { type: String, default: "" },
    tagline: { type: String, default: "" },
    address: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    gstNumber: { type: String, default: "" },
    website: { type: String, default: "" }
  },
  { _id: false }
);

const ownerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, default: "" },
    phone: { type: String, default: "" }
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    siteAddress: { type: String, default: "" },
    areaSqft: { type: String, default: "" },
    duration: { type: String, default: "" },
    startDate: { type: Date },
    endDate: { type: Date },
    projectId: { type: String, default: "" }
  },
  { _id: false }
);

const paymentSchema = new mongoose.Schema(
  {
    stage: { type: String, default: "" },
    amount: { type: Number, default: 0, min: 0 },
    percentage: { type: Number, default: 0, min: 0 },
    remarks: { type: String, default: "" }
  },
  { _id: false }
);

const clausesSchema = new mongoose.Schema(
  {
    introduction: { type: String, default: "" },
    whereasClauses: { type: String, default: "" },
    scopeOfWork: { type: String, default: "" },
    qualityOfMaterials: { type: String, default: "" },
    timeSchedule: { type: String, default: "" },
    paymentTerms: { type: String, default: "" },
    supervision: { type: String, default: "" },
    defectsLiability: { type: String, default: "" },
    termination: { type: String, default: "" },
    disputeResolution: { type: String, default: "" },
    witnessSection: { type: String, default: "" },
    signatureSection: { type: String, default: "" }
  },
  { _id: false }
);

const agreementSchema = new mongoose.Schema(
  {
    agreementNo: { type: String, required: true, unique: true, trim: true },
    company: { type: companySchema, default: () => ({}) },
    owner: { type: ownerSchema, required: true },
    project: { type: projectSchema, default: () => ({}) },
    title: { type: String, default: "House Construction Agreement" },
    agreementDate: { type: Date, default: Date.now },
    description: { type: String, default: "" },
    clauses: { type: clausesSchema, default: () => ({}) },
    rules: { type: [String], default: [] },
    payments: { type: [paymentSchema], default: [] },
    enableGST: { type: Boolean, default: false },
    gstPercent: { type: Number, default: 18, min: 0, max: 100 },
    subtotal: { type: Number, default: 0, min: 0 },
    gstAmount: { type: Number, default: 0, min: 0 },
    grandTotal: { type: Number, default: 0, min: 0 },
    warrantyPeriod: { type: String, default: "" },
    termsConditions: { type: String, default: "" },
    additionalNotes: { type: String, default: "" },
    witnessName: { type: String, default: "" },
    ownerSignature: { type: String, default: "" },
    contractorSignature: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Agreement", agreementSchema);
