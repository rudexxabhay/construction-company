const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const User = require("../models/User");
const Blog = require("../models/Blog");
const Project = require("../models/Project");
const Service = require("../models/Service");
const Lead = require("../models/Lead");
const WebsiteSettings = require("../models/WebsiteSettings");
const WorkflowStep = require("../models/WorkflowStep");
const TrustedItem = require("../models/TrustedItem");
const { defaults: settingsDefaults } = require("../controllers/settingsController");
const { defaultWorkflow } = require("../controllers/workflowController");

const images = {
  home: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1400&q=80",
  villa: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  interior: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
  commercial: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
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

const services = [
  {
    title: "Home Construction",
    description: "End-to-end residential construction from planning, structure, masonry, electrical, plumbing, finishing, and handover.",
    icon: "HardHat",
    image: images.home,
    category: "Residential",
    features: ["RCC structure", "Masonry and plaster", "Finishing and handover"]
  },
  {
    title: "Architecture Planning",
    description: "Premium layouts, working drawings, approvals guidance, and space planning for modern homes and commercial buildings.",
    icon: "Ruler",
    image: images.planning,
    category: "Planning",
    features: ["Space planning", "Working drawings", "Approval guidance"]
  },
  {
    title: "Interior Design",
    description: "Flooring, false ceilings, modular kitchens, wardrobes, paint, lighting, and final detailing with professional supervision.",
    icon: "Paintbrush",
    image: images.interior,
    category: "Interiors",
    features: ["False ceiling", "Modular kitchen", "Lighting and finishes"]
  },
  {
    title: "Renovation & Remodeling",
    description: "Structural upgrades, repairs, extensions, facade redesigns, waterproofing, and turnkey renovation for existing properties.",
    icon: "Wrench",
    image: images.renovation,
    category: "Renovation",
    features: ["Repairs and upgrades", "Waterproofing", "Facade improvement"]
  },
  {
    title: "Commercial Construction",
    description: "Professional execution for shops, offices, warehouses, and commercial buildings with durable finishes.",
    icon: "Building2",
    image: images.commercial,
    category: "Commercial",
    features: ["Shell to finish", "MEP coordination", "Facade works"]
  },
  {
    title: "Material Management",
    description: "Planned sourcing, quality checks, vendor coordination, and controlled material usage at every site stage.",
    icon: "PackageCheck",
    image: images.planning,
    category: "Management",
    features: ["Vendor coordination", "Quality checks", "Material tracking"]
  },
  {
    title: "Labour Management",
    description: "Skilled labour planning and daily site coordination for masonry, shuttering, MEP, finishing, and repairs.",
    icon: "Users",
    image: images.workers,
    category: "Management",
    features: ["Skilled teams", "Daily coordination", "Stage-wise deployment"]
  },
  {
    title: "Project Supervision",
    description: "Regular site supervision, progress reporting, quality checks, and coordination between clients and execution teams.",
    icon: "ClipboardCheck",
    image: images.workers,
    category: "Supervision",
    features: ["Progress reports", "Quality inspection", "Client updates"]
  },
  {
    title: "Turnkey Construction",
    description: "Complete responsibility from drawings and procurement to structure, finishing, interiors, and final handover.",
    icon: "KeyRound",
    image: images.home,
    category: "Turnkey",
    features: ["Single-point delivery", "Budget planning", "Complete handover"]
  },
  {
    title: "Plumbing & Electrical Coordination",
    description: "Integrated plumbing and electrical planning with safe installation, brand coordination, and stage-wise testing.",
    icon: "PlugZap",
    image: images.renovation,
    category: "MEP",
    features: ["Electrical planning", "Plumbing routing", "Testing and checks"]
  }
];

const projects = [
  {
    title: "Skyline Family Villa",
    location: "Noida, Uttar Pradesh",
    type: "Luxury Residence",
    status: "Completed",
    budget: "₹1.8 Cr",
    duration: "11 months",
    description: "A premium family villa with RCC structure, open-plan interiors, landscaped frontage, and high-end finishing.",
    image: images.villa,
    progress: 100
  },
  {
    title: "Urban Heights Duplex",
    location: "Gurugram, Haryana",
    type: "Residential Construction",
    status: "Current",
    budget: "₹1.25 Cr",
    duration: "9 months",
    description: "A contemporary duplex project currently in finishing stage with smart electrical planning and energy-efficient materials.",
    image: images.home,
    progress: 72
  },
  {
    title: "Prime Workspace Buildout",
    location: "Delhi NCR",
    type: "Commercial",
    status: "Completed",
    budget: "₹95 Lakh",
    duration: "6 months",
    description: "Complete commercial shell-to-finish execution with MEP coordination, durable flooring, and premium facade treatment.",
    image: images.commercial,
    progress: 100
  },
  {
    title: "Green Courtyard Homes",
    location: "Faridabad, Haryana",
    type: "Residential Development",
    status: "Current",
    budget: "₹2.4 Cr",
    duration: "14 months",
    description: "A multi-home residential build focused on natural light, cross ventilation, and robust long-life construction.",
    image: images.workers,
    progress: 38
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
      Project.deleteMany(),
      Service.deleteMany(),
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
    await Service.insertMany(services);
    await Project.insertMany(projects);
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
