const express = require("express");
const { createQuotation, deleteQuotation, getQuotation, getQuotations, updateQuotation } = require("../controllers/quotationController");
const { downloadQuotationPdf } = require("../controllers/quotationPdfController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.get("/", getQuotations);
router.post("/", createQuotation);
router.get("/:id/pdf", downloadQuotationPdf);
router.get("/:id", getQuotation);
router.put("/:id", updateQuotation);
router.delete("/:id", deleteQuotation);

module.exports = router;
