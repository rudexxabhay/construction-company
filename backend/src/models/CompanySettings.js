const mongoose = require("mongoose");

const companySettingsSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, default: "QUALITY CONSTRUCTION", trim: true },
    logoUrl: { type: String, default: "" },
    logoWidth: { type: Number, default: 92, min: 1 },
    logoHeight: { type: Number, default: 92, min: 1 },
    documentLogoUrl: { type: String, default: "" },
    documentLogoWidth: { type: Number, default: 92, min: 1 },
    documentLogoHeight: { type: Number, default: 92, min: 1 },
    address: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    website: { type: String, default: "" },
    gstNumber: { type: String, default: "" },
    gstEnabled: { type: Boolean, default: false },
    gstPercent: { type: Number, default: 18, min: 0 },
    signatureUrl: { type: String, default: "" },
    terms: { type: String, default: "" },
    bankDetails: { type: String, default: "" },
    footerNote: { type: String, default: "" },
    tagline: { type: String, default: "" },
    workingHours: { type: String, default: "" },
    footerDescription: { type: String, default: "" },
    facebook: { type: String, default: "" },
    instagram: { type: String, default: "" },
    whatsapp: { type: String, default: "" },
    heroTitle: { type: String, default: "" },
    heroSubtitle: { type: String, default: "" },
    trustedText: { type: String, default: "" },
    contactHeading: { type: String, default: "" },
    contactDescription: { type: String, default: "" },
    videos: {
      type: [
        {
          title: { type: String, default: "" },
          url: { type: String, default: "" },
          thumbnail: { type: String, default: "" }
        }
      ],
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("CompanySettings", companySettingsSchema);
