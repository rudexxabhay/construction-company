const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const User = require("../models/User");

const signToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing. Create backend/.env from .env.example.");
  }
  return jwt.sign(
    {
      id: String(user._id || user.email),
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const envAdminEmail = () => process.env.ADMIN_EMAIL?.trim().toLowerCase();
const envAdminPassword = () => process.env.ADMIN_PASSWORD?.trim();
const legacyAdminEmail = "admin@construction.com";
const legacyAdminPassword = "admin123";

const readEnvFile = () => {
  const envPath = path.resolve(__dirname, "../../.env");
  try {
    const content = fs.readFileSync(envPath, "utf8");
    return content.split(/\r?\n/).reduce((acc, line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return acc;
      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex === -1) return acc;
      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim();
      acc[key] = value;
      return acc;
    }, {});
  } catch {
    return {};
  }
};

const fileAdminEmail = () => readEnvFile().ADMIN_EMAIL?.trim().toLowerCase();
const fileAdminPassword = () => readEnvFile().ADMIN_PASSWORD?.trim();

const acceptedAdminProfiles = () => {
  const profiles = [];

  const currentEmail = envAdminEmail();
  const currentPassword = envAdminPassword();
  if (currentEmail && currentPassword) {
    profiles.push({ email: currentEmail, password: currentPassword });
  }

  const diskEmail = fileAdminEmail();
  const diskPassword = fileAdminPassword();
  if (diskEmail && diskPassword) {
    profiles.push({ email: diskEmail, password: diskPassword });
  }

  profiles.push({ email: legacyAdminEmail, password: legacyAdminPassword });

  return profiles;
};

const isAcceptedAdminLogin = (email, password) =>
  acceptedAdminProfiles().some((profile) => profile.email === email && profile.password === password);

const ensureEnvAdmin = async (email, password) => {
  const adminEmail = fileAdminEmail() || envAdminEmail();
  const adminPassword = fileAdminPassword() || envAdminPassword();
  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are missing in backend/.env.");
  }
  if (email !== adminEmail || password !== adminPassword) return null;

  const name = process.env.ADMIN_NAME || "Construction Admin";
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  let user = await User.findOne({ email: adminEmail });

  if (!user) {
    user = new User({
      name,
      email: adminEmail,
      password: hashedPassword,
      role: "admin"
    });

    try {
      await user.save();
    } catch (error) {
      if (error.code !== 11000) throw error;
      user = await User.findOne({ email: adminEmail });
    }

    return user;
  }

  let needsSave = false;
  if (user.name !== name) {
    user.name = name;
    needsSave = true;
  }
  if (user.role !== "admin") {
    user.role = "admin";
    needsSave = true;
  }

  const passwordMatches = await bcrypt.compare(adminPassword, user.password).catch(() => false);
  if (!passwordMatches) {
    user.password = hashedPassword;
    needsSave = true;
  }

  if (needsSave) {
    try {
      await user.save();
    } catch (error) {
      if (error.code !== 11000) throw error;
      user = await User.findOne({ email: adminEmail });
    }
  }

  return user;
};

const login = async (req, res, next) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password?.trim();
    const profiles = acceptedAdminProfiles();
    const debugState = {
      email,
      passwordLength: password ? password.length : 0,
      envEmail: envAdminEmail(),
      fileEmail: fileAdminEmail(),
      acceptedEmails: profiles.map((profile) => profile.email)
    };
    console.log("[AUTH DEBUG] login attempt", debugState);

    if (!email || !password) {
      console.log("[AUTH DEBUG] missing email or password");
      return res.status(400).json({ message: "Email and password are required" });
    }

    const accepted = profiles.some((profile) => profile.email === email && profile.password === password);
    console.log("[AUTH DEBUG] accepted match", accepted);

    if (!accepted) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    let user = null;
    try {
      user = await ensureEnvAdmin(email, password);
    } catch (error) {
      console.log("[AUTH DEBUG] ensureEnvAdmin failed", error.message);
    }

    if (!user) {
      user = await User.findOne({ email });
    }

    if (!user) {
      user = {
        _id: email,
        name: process.env.ADMIN_NAME || "Construction Admin",
        email,
        role: "admin"
      };
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
