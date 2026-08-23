const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const User = require("../models/User");
const Blog = require("../models/Blog");
const Lead = require("../models/Lead");
const WebsiteSettings = require("../models/WebsiteSettings");
const WorkflowStep = require("../models/WorkflowStep");
const TrustedItem = require("../models/TrustedItem");
const { defaults: settingsDefaults } = require("../controllers/settingsController");
const { defaultWorkflow } = require("../controllers/workflowController");

const images = {
  planning: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80",
  workers: "https://images.unsplash.com/photo-1590650153855-d9e808231d41?auto=format&fit=crop&w=1200&q=80",
  renovation: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80"
};

const users = async () => [
  {
    name: process.env.ADMIN_NAME || "Construction Admin",
    email: process.env.ADMIN_EMAIL?.trim().toLowerCase(),
    password: await bcrypt.hash(process.env.ADMIN_PASSWORD || "", 10),
    role: "admin"
  }
];

const blogs = [
  {
    title: "How to Plan a House Construction Budget",
    slug: "how-to-plan-a-house-construction-budget",
    category: "Planning",
    shortDescription: "A practical guide to budgeting land preparation, structure, materials, labor, finishing, and contingency.",
    content:
      "A reliable construction budget starts with a detailed scope. Break the project into design, permissions, site preparation, structure, MEP, plastering, flooring, doors, windows, paint, fixtures, and final handover. Keep a contingency of at least 8 to 12 percent for material variation and site conditions. The best results come from transparent BOQs, staged payments, and weekly progress reviews.",
    image: images.planning,
    author: "QUALITY CONSTRUCTION Team",
    status: "Published"
  },
  {
    title: "Current vs Completed Projects: What Clients Should Track",
    slug: "current-vs-completed-projects-what-clients-should-track",
    category: "Project Management",
    shortDescription: "Understand progress tracking, milestone checks, material audits, and quality documentation.",
    content:
      "For current projects, clients should track milestone completion, material arrivals, labor deployment, waterproofing checks, concrete quality, and daily site photographs. Completed projects should be reviewed for finish consistency, snag lists, warranties, final measurements, and maintenance guidance. A structured tracker keeps expectations clear and reduces delays.",
    image: images.workers,
    author: "QUALITY CONSTRUCTION Team",
    status: "Published"
  },
  {
    title: "Choosing Materials for a Long Lasting Home",
    slug: "choosing-materials-for-a-long-lasting-home",
    category: "Materials",
    shortDescription: "Key material choices that improve durability, safety, comfort, and lifetime value.",
    content:
      "Material selection shapes the life of a building. Prioritize tested cement and steel, correct concrete grades, quality bricks or blocks, reliable waterproofing, safe wiring, branded plumbing, and durable exterior finishes. Cheaper materials can raise maintenance costs later, so decisions should be made with lifecycle value in mind.",
    image: images.renovation,
    author: "QUALITY CONSTRUCTION Team",
    status: "Published"
  }
];

const leads = [
  {
    name: "Rahul Sharma",
    email: "rahul@example.com",
    phone: "+91 98765 43210",
    serviceType: "Home Construction",
    message: "I want a turnkey quote for a 200 sq yd residential plot.",
    status: "Open",
    remark: ""
  },
  {
    name: "Priya Mehta",
    email: "priya@example.com",
    phone: "+91 91234 56780",
    serviceType: "Renovation & Remodeling",
    message: "Need remodeling for a 3BHK apartment including kitchen and flooring.",
    status: "Closed",
    remark: "Called and shared initial estimate."
  }
];

const trustedItems = [
  {
    title: "Transparent Budgeting",
    description: "Clear estimates, milestone billing, and practical scope planning before execution starts.",
    icon: "BadgeCheck",
    imageUrl: "",
    order: 1
  },
  {
    title: "Quality Supervision",
    description: "Stage-wise inspection for structure, waterproofing, MEP, finishing, and handover quality.",
    icon: "ShieldCheck",
    imageUrl: "",
    order: 2
  },
  {
    title: "Reliable Site Updates",
    description: "Regular client updates with progress, materials, labour planning, and next milestones.",
    icon: "ClipboardCheck",
    imageUrl: "",
    order: 3
  }
];

const seed = async () => {
  try {
    await connectDB();

    await Promise.all([
      User.deleteMany(),
      Blog.deleteMany(),
      Lead.deleteMany(),
      WebsiteSettings.deleteMany(),
      WorkflowStep.deleteMany(),
      TrustedItem.deleteMany()
    ]);
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required in backend/.env before seeding.");
    }
    await User.insertMany(await users());
    await WebsiteSettings.create(settingsDefaults);
    await WorkflowStep.insertMany(defaultWorkflow);
    await TrustedItem.insertMany(trustedItems);
    await Blog.insertMany(blogs);
    await Lead.insertMany(leads);

    console.log(`Seed completed. Admin: ${process.env.ADMIN_EMAIL}`);
    process.exit(0);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

seed();
