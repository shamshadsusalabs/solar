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

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// Auth routes
app.use("/api/admin/auth", authLimiter, adminAuthRoutes);
app.use("/api/employee/auth", authLimiter, employeeAuthRoutes);
app.use("/api/leads", authLimiter, leadRoutes);
app.use("/api/admin", adminDashboardRoutes);
app.use("/api/employee", employeeDashboardRoutes);
export default app;
