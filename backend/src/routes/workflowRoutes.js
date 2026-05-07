const express = require("express");
const { getWorkflow, createWorkflowStep, updateWorkflowStep, deleteWorkflowStep } = require("../controllers/workflowController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getWorkflow);
router.post("/", protect, createWorkflowStep);
router.put("/:id", protect, updateWorkflowStep);
router.delete("/:id", protect, deleteWorkflowStep);

module.exports = router;
