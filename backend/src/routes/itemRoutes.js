const express = require("express");
const { createItem, deleteItem, getItems, updateItem, uploadItems } = require("../controllers/itemController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.get("/", getItems);
router.post("/", createItem);
router.post("/upload", uploadItems);
router.put("/:id", updateItem);
router.delete("/:id", deleteItem);

module.exports = router;
