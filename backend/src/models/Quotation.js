const mongoose = require("mongoose");

const quotationItemSchema = new mongoose.Schema(
  {
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: "ItemMaster" },
    name: { type: String, trim: true },
    description: { type: String, trim: true },
    unit: { type: String, default: "" },
    quantity: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, default: 0, min: 0 },
    gstPercent: { type: Number, required: true, default: 18, min: 0, max: 100 },
    gstAmount: { type: Number, required: true, default: 0, min: 0 },
    finalPrice: { type: Number, required: true, default: 0, min: 0 },
    total: { type: Number, required: true, default: 0, min: 0 }
  },
  { _id: false }
);

const quotationSchema = new mongoose.Schema(
  {
    quotationNo: { type: String, required: true, unique: true, trim: true },
    clientName: { type: String, required: true, trim: true },
    clientPhone: { type: String, default: "" },
    clientEmail: { type: String, default: "" },
    clientAddress: { type: String, default: "" },
    projectDescription: { type: String, default: "" },
    validUntil: { type: Date },
    items: { type: [quotationItemSchema], default: [] },
    subtotal: { type: Number, required: true, default: 0, min: 0 },
    gst: { type: Number, required: true, default: 0, min: 0 },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    discount: { type: Number, default: 0, min: 0 },
    otherCharges: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, default: 0, min: 0 },
    status: { type: String, enum: ["Draft", "Sent", "Accepted", "Rejected"], default: "Draft" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quotation", quotationSchema);
