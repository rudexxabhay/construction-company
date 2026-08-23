const express = require("express");
const { getBlogs, getBlog } = require("../controllers/blogController");

const router = express.Router();

router.get("/", getBlogs);
router.get("/:id", getBlog);

module.exports = router;
