const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
console.log("ENV CHECK:", process.env.CLOUDINARY_CLOUD_NAME);
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const blogRoutes = require("./routes/blogRoutes");
const projectRoutes = require("./routes/projectRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const leadRoutes = require("./routes/leadRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const workflowRoutes = require("./routes/workflowRoutes");
const trustedRoutes = require("./routes/trustedRoutes");
const quotationRoutes = require("./routes/quotationRoutes");
const itemRoutes = require("./routes/itemRoutes");
const clientRoutes = require("./routes/clientRoutes");
const documentRoutes = require("./routes/documentRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const agreementRoutes = require("./routes/agreementRoutes");

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = new Set([
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  process.env.VERCEL_FRONTEND_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173"
].filter(Boolean));
const isAllowedOrigin = (origin = "") => allowedOrigins.has(origin) || /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin);

app.use(cors({
  origin(origin, callback) {
    if (!origin || isAllowedOrigin(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  exposedHeaders: ["Content-Disposition", "Content-Type"]
}));
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.json({ message: "Construction Company API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/workflow", workflowRoutes);
app.use("/api/trusted", trustedRoutes);
app.use("/api/quotations", quotationRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/agreements", agreementRoutes);
console.log("Agreement routes mounted at /api/agreements");

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((error, req, res, next) => {
  const isMulterSizeError = error.code === "LIMIT_FILE_SIZE";
  const status = error.statusCode || (error.name === "ValidationError" || isMulterSizeError ? 400 : 500);
  const message = isMulterSizeError ? "Image must be 5MB or smaller." : error.code === 11000 ? "Duplicate value already exists" : error.message || "Server error";
  res.status(status).json({ message });
});

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
