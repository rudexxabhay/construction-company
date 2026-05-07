const mongoose = require("mongoose");

const workflowStepSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    icon: { type: String, required: true, default: "CheckCircle2" },
    fontStyle: { type: String, default: "" },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("WorkflowStep", workflowStepSchema);
