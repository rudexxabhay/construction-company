const express = require("express");
const { createDocument, convertDocument, deleteDocument, downloadDocumentPdf, getDocument, getDocuments, updateDocument } = require("../controllers/documentController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.get("/", getDocuments);
router.post("/", createDocument);
router.get("/:id/pdf", downloadDocumentPdf);
router.post("/:id/convert", convertDocument);
router.get("/:id", getDocument);
router.put("/:id", updateDocument);
router.delete("/:id", deleteDocument);

module.exports = router;
