const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, default: "", trim: true },
    email: { type: String, default: "", trim: true },
    address: { type: String, default: "", trim: true },
    projectLocation: { type: String, default: "", trim: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Client", clientSchema);
