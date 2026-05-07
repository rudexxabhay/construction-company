const express = require("express");
const { getTrustedItems, createTrustedItem, updateTrustedItem, deleteTrustedItem } = require("../controllers/trustedController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getTrustedItems);
router.post("/", protect, createTrustedItem);
router.put("/:id", protect, updateTrustedItem);
router.delete("/:id", protect, deleteTrustedItem);

module.exports = router;
