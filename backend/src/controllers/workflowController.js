const WorkflowStep = require("../models/WorkflowStep");

const defaultWorkflow = [
  {
    title: "Plan",
    description: "We understand your needs, budget, design preference, and prepare a clear construction roadmap.",
    icon: "Hammer",
    fontStyle: "",
    order: 1
  },
  {
    title: "Build",
    description: "Our expert team starts construction with quality materials, skilled labour, and regular supervision.",
    icon: "ShieldCheck",
    fontStyle: "",
    order: 2
  },
  {
    title: "Review",
    description: "We inspect every stage, check finishing quality, and keep the client updated.",
    icon: "Users",
    fontStyle: "",
    order: 3
  },
  {
    title: "Handover",
    description: "After final approval, we hand over the completed project with full support.",
    icon: "CheckCircle2",
    fontStyle: "",
    order: 4
  }
];

const ensureWorkflow = async () => {
  const count = await WorkflowStep.countDocuments();
  if (count === 0) await WorkflowStep.insertMany(defaultWorkflow);
};

const getWorkflow = async (req, res, next) => {
  try {
    await ensureWorkflow();
    const steps = await WorkflowStep.find().sort({ order: 1, createdAt: 1 });
    res.json(steps);
  } catch (error) {
    next(error);
  }
};

const createWorkflowStep = async (req, res, next) => {
  try {
    const step = await WorkflowStep.create(req.body);
    res.status(201).json(step);
  } catch (error) {
    next(error);
  }
};

const updateWorkflowStep = async (req, res, next) => {
  try {
    const step = await WorkflowStep.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!step) return res.status(404).json({ message: "Workflow step not found" });
    res.json(step);
  } catch (error) {
    next(error);
  }
};

const deleteWorkflowStep = async (req, res, next) => {
  try {
    const step = await WorkflowStep.findByIdAndDelete(req.params.id);
    if (!step) return res.status(404).json({ message: "Workflow step not found" });
    res.json({ message: "Workflow step deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getWorkflow, createWorkflowStep, updateWorkflowStep, deleteWorkflowStep, defaultWorkflow };
