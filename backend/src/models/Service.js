const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: String, default: "Construction", trim: true },
    features: [{ type: String, trim: true }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", serviceSchema);
