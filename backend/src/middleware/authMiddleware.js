const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "JWT_SECRET is missing. Create backend/.env from .env.example." });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, token missing" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    let user = null;
    if (decoded.id && /^[0-9a-fA-F]{24}$/.test(decoded.id)) {
      user = await User.findById(decoded.id).select("-password");
    }

    if (!user && decoded.email) {
      user = await User.findOne({ email: decoded.email }).select("-password");
    }

    if (!user && decoded.id && String(decoded.id).includes("@")) {
      user = await User.findOne({ email: decoded.id }).select("-password");
    }

    if (!user) {
      user = {
        _id: decoded.id,
        name: decoded.name || "Construction Admin",
        email: decoded.email || decoded.id,
        role: decoded.role
      };
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

module.exports = { protect };
