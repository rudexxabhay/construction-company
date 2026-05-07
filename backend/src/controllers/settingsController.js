const CompanySettings = require("../models/CompanySettings");
const WebsiteSettings = require("../models/WebsiteSettings");

const defaults = {
  companyName: "QUALITY CONSTRUCTION",
  logoUrl: "",
  logoWidth: 92,
  logoHeight: 92,
  documentLogoUrl: "",
  documentLogoWidth: 92,
  documentLogoHeight: 92,
  tagline: "Premium construction, renovation, and project supervision.",
  address: "Delhi NCR, India",
  phone: "+91 98765 43210",
  email: "hello@qualityconstruction.com",
  website: "https://qualityconstruction.com",
  gstNumber: "",
  gstEnabled: false,
  gstPercent: 18,
  signatureUrl: "",
  terms: "Payment terms, project timelines, and material specifications will follow the mutually approved scope of work.",
  bankDetails: "",
  footerNote: "",
  workingHours: "Mon - Sat, 9:00 AM - 7:00 PM",
  footerDescription: "Professional construction services for homes, commercial spaces, interiors, renovations, and complete turnkey delivery.",
  facebook: "",
  instagram: "",
  whatsapp: "",
  heroTitle: "A to Z house construction with disciplined execution.",
  heroSubtitle: "We build durable, modern homes and commercial spaces with transparent pricing, experienced site teams, and quality checks at every milestone.",
  trustedText: "Trusted by homeowners and business owners for clear budgets, practical schedules, quality materials, and accountable site supervision.",
  contactHeading: "Start with a professional consultation",
  contactDescription: "Share your project details and our team will review the scope, timeline, and next steps.",
  videos: []
};

const getSettingsDoc = async () => {
  let settings = await CompanySettings.findOne();
  if (!settings) {
    const oldSettings = await WebsiteSettings.findOne().lean();
    settings = await CompanySettings.create({ ...defaults, ...(oldSettings || {}) });
  }
  return settings;
};

const getSettings = async (req, res, next) => {
  try {
    const settings = await getSettingsDoc();
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const existing = await getSettingsDoc();
    const settings = await CompanySettings.findByIdAndUpdate(existing._id, req.body, { new: true, runValidators: true });
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

module.exports = { getSettings, updateSettings, defaults, getSettingsDoc };
