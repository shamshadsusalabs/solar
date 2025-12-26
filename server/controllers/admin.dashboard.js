// controllers/adminDashboard.controller.js
import Lead from "../models/lead.model.js";
import { Employee } from "../models/employee.model.js";
import Manager from "../models/manager.model.js";
import Chief from "../models/chief.model.js";
import GodownIncharge from "../models/godownIncharge.model.js";

export const getAdminDashboard = async (req, res) => {
  try {
    // 1) Count all user types
    const totalEmployees = await Employee.countDocuments();
    const totalManagers = await Manager.countDocuments();
    const totalChiefs = await Chief.countDocuments();
    const totalGodownIncharges = await GodownIncharge.countDocuments();

    // 2) Lead statistics
    const totalLeads = await Lead.countDocuments();

    // Active leads (not closed/paid)
    const activeLeads = await Lead.countDocuments({
      status: {
        $nin: ["LEAD_CLOSE", "PAYMENT_RECEIVED"]
      }
    });

    // Completed leads (payment received)
    const completedLeads = await Lead.countDocuments({
      status: "PAYMENT_RECEIVED"
    });

    // 3) Lead status breakdown
    const statusBreakdown = await Lead.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          status: "$_id",
          count: 1
        }
      },
      { $sort: { count: -1 } }
    ]);

    // 4) Recent leads (last 10)
    const recentLeads = await Lead.find()
      .select("customerName salesManName status createdAt")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // 5) Top employees by lead count
    const topEmployees = await Lead.aggregate([
      {
        $group: {
          _id: "$salesManId",
          leadCount: { $sum: 1 }
        }
      },
      { $sort: { leadCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "employees",
          localField: "_id",
          foreignField: "_id",
          as: "employee"
        }
      },
      { $unwind: "$employee" },
      {
        $project: {
          _id: 0,
          employeeId: "$employee._id",
          employeeCode: "$employee.employeeCode",
          name: "$employee.name",
          leadCount: 1
        }
      }
    ]);

    return res.json({
      success: true,
      data: {
        cards: {
          totalEmployees,
          totalManagers,
          totalChiefs,
          totalGodownIncharges,
          totalLeads,
          activeLeads,
          completedLeads,
        },
        statusBreakdown,
        recentLeads,
        topEmployees,
      },
    });
  } catch (err) {
    console.error("ADMIN DASHBOARD ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard",
    });
  }
};
