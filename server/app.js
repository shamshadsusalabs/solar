// app.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import adminAuthRoutes from "./routes/adminAuth.routes.js";
import employeeAuthRoutes from "./routes/employeeAuth.routes.js";
import leadRoutes from "./routes/lead.routes.js";
import adminDashboardRoutes from "./routes/admindashboard.routes.js";
import employeeDashboardRoutes from "./routes/employeeDashboard.routes.js";
import managerRoutes from "./routes/manager.routes.js";
import chiefRoutes from "./routes/chief.routes.js";
import godownInchargeRoutes from "./routes/godownIncharge.routes.js";
import managerDashboardRoutes from "./routes/managerDashboard.routes.js";
import chiefDashboardRoutes from "./routes/chiefDashboard.routes.js";
import godownInchargeDashboardRoutes from "./routes/godownInchargeDashboard.routes.js";
import compiledFileRoutes from "./routes/compiledFile.routes.js";

const app = express();

// 🔐 Security headers
app.use(helmet());

// 🔓 CORS – mobile app se calls aayenge, so open is fine
app.use(cors());

// 🔐 Rate limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute
  max: 100,
  message: "Too many requests, please try again later.",
});

app.use(express.json({ limit: "1mb" }));
app.disable("x-powered-by");

// 📝 API Request Logger Middleware (disabled for production)
app.use((req, res, next) => {
  // const timestamp = new Date().toISOString();
  // console.log(`\n🔵 [${timestamp}] ${req.method} ${req.url}`);
  // if (["POST", "PATCH", "PUT"].includes(req.method) && req.body) {
  //   console.log("📦 Body:", JSON.stringify(req.body, null, 2));
  // }
  next();
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// Auth routes
app.use("/api/admin/auth", authLimiter, adminAuthRoutes);
app.use("/api/employee/auth", authLimiter, employeeAuthRoutes);
app.use("/api/leads", authLimiter, leadRoutes);
app.use("/api/leads", compiledFileRoutes); // Compiled file operations
app.use("/api/admin", adminDashboardRoutes);
app.use("/api/employee", employeeDashboardRoutes);
app.use("/api/manager", authLimiter, managerRoutes);
app.use("/api/manager", managerDashboardRoutes);
app.use("/api/chief", authLimiter, chiefRoutes);
app.use("/api/chief", chiefDashboardRoutes);
app.use("/api/godown-incharge", authLimiter, godownInchargeRoutes);
app.use("/api/godown-incharge", godownInchargeDashboardRoutes);
export default app;
