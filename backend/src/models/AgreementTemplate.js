const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema(
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
  { timestamps: true }
);

module.exports = mongoose.model("AgreementTemplate", templateSchema);
