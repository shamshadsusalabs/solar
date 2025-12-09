// controllers/adminDashboard.controller.js
import Lead from "../models/lead.model.js";
import { Employee } from "../models/employee.model.js";

export const getAdminDashboard = async (req, res) => {
  try {
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);

    // 1) Total installations (is year ke andar completed)
    // tum chaaho to statuses me change kar sakte ho
    const completedStatuses = ["SYSTEM_COMMISSIONED", "LEAD_CLOSED"];

    const totalInstallations = await Lead.countDocuments({
      status: { $in: completedStatuses },
      createdAt: { $gte: yearStart },
    });

    // 2) Active employees
    const activeEmployees = await Employee.countDocuments({
      role: "employee",
    });

    // 3) Total forms submitted (total leads)
    const totalFormsSubmitted = await Lead.countDocuments({});

    // 4) Last 7 days ke installations (graph ke liye)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 6); // aaj + previous 6 = 7 days

    const dailyRaw = await Lead.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          status: { $in: completedStatuses },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Helper: last 7 din ki list bana do, 0 se fill karke
    const dailyMap = new Map();
    dailyRaw.forEach((row) => {
      dailyMap.set(row._id, row.count);
    });

    const dailyInstalls = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);

      const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
      const count = dailyMap.get(key) || 0;

      const dayLabel = d.toLocaleDateString("en-IN", {
        weekday: "short", // Mon, Tue...
      });

      dailyInstalls.push({
        date: key,
        day: dayLabel,
        count,
      });
    }

    // 5) Top employees by forms submitted
    const topEmployeesAgg = await Lead.aggregate([
      {
        $group: {
          _id: "$salesManId",
          forms: { $sum: 1 },
        },
      },
      { $sort: { forms: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "employees", // collection name (model Employee)
          localField: "_id",
          foreignField: "_id",
          as: "employee",
        },
      },
      { $unwind: "$employee" },
      {
        $project: {
          _id: 0,
          employeeId: "$employee._id",
          employeeCode: "$employee.employeeCode",
          name: "$employee.name",
          forms: 1,
          createdAt: "$employee.createdAt",
        },
      },
    ]);

    return res.json({
      success: true,
      data: {
        cards: {
          totalInstallations,
          activeEmployees,
          totalFormsSubmitted,
        },
        dailyInstalls,
        employees: topEmployeesAgg,
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
