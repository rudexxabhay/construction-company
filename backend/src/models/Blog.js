const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: { type: String, required: true, trim: true },
    shortDescription: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    image: { type: String, required: true },
    author: { type: String, default: "Admin" },
    status: { type: String, enum: ["Draft", "Published"], default: "Published" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", blogSchema);
