const mongoose = require("mongoose");

const itemMasterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, default: "", trim: true },
    rate: { type: Number, required: true, min: 0 },
    price: { type: Number, min: 0 },
    unit: { type: String, default: "Nos", trim: true },
    gstPercent: { type: Number, default: 18, min: 0, max: 100 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ItemMaster", itemMasterSchema);
