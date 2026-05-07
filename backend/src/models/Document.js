const mongoose = require("mongoose");

const documentItemSchema = new mongoose.Schema(
  {
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: "ItemMaster" },
    name: { type: String, required: true, trim: true },
    unit: { type: String, default: "Nos", trim: true },
    quantity: { type: Number, default: 1, min: 0 },
    rate: { type: Number, default: 0, min: 0 },
    gstPercent: { type: Number, default: 18, min: 0, max: 100 },
    amount: { type: Number, default: 0 },
    gstAmount: { type: Number, default: 0 },
    finalAmount: { type: Number, default: 0 }
  },
  { _id: false }
);

const clientSnapshotSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    name: { type: String, required: true, trim: true },
    phone: { type: String, default: "", trim: true },
    email: { type: String, default: "", trim: true },
    address: { type: String, default: "", trim: true },
    projectLocation: { type: String, default: "", trim: true }
  },
  { _id: false }
);

const documentSchema = new mongoose.Schema(
  {
    documentNo: { type: String, required: true, unique: true, trim: true },
    type: { type: String, enum: ["estimate", "quotation", "invoice"], required: true },
    client: { type: clientSnapshotSchema, required: true },
    projectTitle: { type: String, default: "", trim: true },
    projectDescription: { type: String, default: "" },
    items: { type: [documentItemSchema], default: [] },
    subtotal: { type: Number, default: 0 },
    totalGST: { type: Number, default: 0 },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    discount: { type: Number, default: 0 },
    otherCharges: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    status: { type: String, default: "Draft" },
    validUntil: { type: Date },
    paymentStatus: { type: String, default: "Unpaid" },
    paidAmount: { type: Number, default: 0 },
    dueAmount: { type: Number, default: 0 },
    notes: { type: String, default: "" },
    terms: { type: String, default: "" },
    sourceDocument: { type: mongoose.Schema.Types.ObjectId, ref: "Document" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", documentSchema);
