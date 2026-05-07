const mongoose = require("mongoose");

const trustedItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    icon: { type: String, default: "ShieldCheck", trim: true },
    imageUrl: { type: String, default: "" },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("TrustedItem", trustedItemSchema);
