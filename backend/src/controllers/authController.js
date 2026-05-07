const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const signToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing. Create backend/.env from .env.example.");
  }
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const envAdminEmail = () => process.env.ADMIN_EMAIL?.trim().toLowerCase();
const envAdminPassword = () => process.env.ADMIN_PASSWORD?.trim();

const ensureEnvAdmin = async (email, password) => {
  const adminEmail = envAdminEmail();
  const adminPassword = envAdminPassword();
  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are missing in backend/.env.");
  }
  if (email !== adminEmail || password !== adminPassword) return null;

  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  return User.findOneAndUpdate(
    { email: adminEmail },
    { name: process.env.ADMIN_NAME || "Construction Admin", email: adminEmail, password: hashedPassword, role: "admin" },
    { new: true, upsert: true, runValidators: true }
  );
};

const login = async (req, res, next) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password?.trim();

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const envUser = await ensureEnvAdmin(email, password);
    if (envUser) {
      return res.json({
        token: signToken(envUser),
        user: { id: envUser._id, name: envUser.name, email: envUser.email, role: envUser.role }
      });
    }

    let user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      token: signToken(user),
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = { login, me };
