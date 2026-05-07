const mongoose = require("mongoose");

const websiteSettingsSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, default: "QUALITY CONSTRUCTION" },
    tagline: { type: String, default: "" },
    address: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
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

module.exports = mongoose.model("WebsiteSettings", websiteSettingsSchema);
