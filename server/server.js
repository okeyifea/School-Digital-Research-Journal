/* eslint-env node */
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import db from "./db.js";

import researchRoutes from "./API/research.js";
import authRoutes from "./API/Pass.js";
import restRoutes from "./API/restPass.js";
import dashboardRoutes from "./API/Dashboard.js";
import reviewRoutes from "./API/Review.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsPath = path.resolve(__dirname, "..", "uploads");
app.use("/uploads", express.static(uploadsPath));
app.use("/api/research", researchRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/auth", restRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", reviewRoutes);

// Connect to MongoDB and seed data
const initializeDatabase = async () => {
  await db.connectDB();
  await db.seedCategories();
  await db.seedUsers();
};

initializeDatabase();

// Hash function (SHA-256 for demo; use bcrypt in production)
const hashPassword = (password) => {
  return crypto.createHash("sha256").update(password).digest("hex");
};

// Login route
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ success: false, message: "Username and password required" });

  try {
    const user = await db.User.findOne({ username });
    if (!user) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const passwordHash = hashPassword(password);
    if (user.password_hash !== passwordHash)
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "1d" }
    );

    return res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        registrationNumber: user.registrationNumber,
        position: user.position,
        college: user.college,
        department: user.department
      },
      token
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

const handleSignup = async (req, res) => {
  

  const {
    username,
    password,
    role,
    fullName,
    email,
    phone,
    registrationNumber,
    position,
    college,
    department,
  } = req.body;

  const normalizedRole = String(role || "").toLowerCase();
  const allowedRoles = new Set(["student", "staff", "officer"]);

  // Basic required fields
  if (!username || !password || !normalizedRole || !fullName || !email || !college || !department) {
    return res.status(400).json({
      success: false,
      message: "Username, password, role, full name, email, college and department are required",
    });
  }

  if (!allowedRoles.has(normalizedRole)) {
    return res.status(400).json({
      success: false,
      message: "Invalid role. Must be student, staff, or officer",
    });
  }

  // Role-based validation
  if (normalizedRole === "student" && !registrationNumber) {
    return res.status(400).json({
      success: false,
      message: "Registration number is required for students",
    });
  }

  if (normalizedRole === "officer" && !position) {
    return res.status(400).json({
      success: false,
      message: "Position is required for officers",
    });
  }

  try {
    // Check if username or email already exists
    const existingUser = await db.User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Username or email already exists",
      });
    }

    // Create user
    const newUser = new db.User({
      username,
      password_hash: hashPassword(password),
      role: normalizedRole,
      fullName,
      email,
      phone: phone || null,
      registrationNumber: registrationNumber || null,
      position: position || null,
      college,
      department,
    });

    await newUser.save();


    return res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Signup error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// SIGNUP routes (both legacy and API-prefixed)
app.post("/signup", handleSignup);
app.post("/api/auth/signup", handleSignup);

// Get all users (for testing)
app.get("/users", async (req, res) => {
  try {
    const users = await db.User.find({}, 'id username role fullName email college department');
    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Root endpoint
app.get("/", (req, res) => {
  res.send("Backend server running 🚀");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
