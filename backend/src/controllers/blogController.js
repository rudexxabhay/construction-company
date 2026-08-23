const Blog = require("../models/Blog");

const getBlogs = async (req, res, next) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    next(error);
  }
};

const getBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findOne({ $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { slug: req.params.id }] });
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json(blog);
  } catch (error) {
    next(error);
  }
};

module.exports = { getBlogs, getBlog };
