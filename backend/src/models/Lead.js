const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    serviceType: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    status: { type: String, enum: ["Open", "Closed"], default: "Open" },
    remark: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lead", leadSchema);
