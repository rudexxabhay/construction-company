const express = require("express");
const { createAgreement, deleteAgreement, downloadAgreementPdf, getAgreement, getAgreementTemplate, getAgreements, updateAgreement, updateAgreementTemplate } = require("../controllers/agreementController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.use((req, res, next) => {
  console.log("Agreement route hit:", req.method, req.originalUrl);
  next();
});
router.get("/", getAgreements);
router.post("/", createAgreement);
router.get("/template", getAgreementTemplate);
router.put("/template", updateAgreementTemplate);
router.get("/:id/pdf", downloadAgreementPdf);
router.get("/:id", getAgreement);
router.put("/:id", updateAgreement);
router.delete("/:id", deleteAgreement);

module.exports = router;
