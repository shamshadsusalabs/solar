// controllers/employeeDashboard.controller.js
import mongoose from "mongoose";
import Lead from "../models/lead.model.js";

export const getEmployeeDashboard = async (req, res) => {
  try {
    // 🔐 auth middleware se aayega
    const employeeId = req.user?.id || req.user?._id;

    if (!employeeId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: employee id not found in token",
      });
    }

    const salesManObjectId = new mongoose.Types.ObjectId(employeeId);

    // 1) Total leads by this employee
    const totalLeads = await Lead.countDocuments({
      salesManId: salesManObjectId,
    });

    // 2) Active vs Closed (tum chaho to statuses change kar sakte ho)
    const closedStatuses = ["LEAD_CLOSED"];
    const activeLeads = await Lead.countDocuments({
      salesManId: salesManObjectId,
      status: { $nin: closedStatuses },
    });

    const closedLeads = await Lead.countDocuments({
      salesManId: salesManObjectId,
      status: { $in: closedStatuses },
    });

    // 3) Total tropositeAmount sum
    const amountAgg = await Lead.aggregate([
      { $match: { salesManId: salesManObjectId } },
      {
        $group: {
          _id: null,
          total: { $sum: "$tropositeAmount" },
        },
      },
    ]);
    const totalTropositeAmount = amountAgg[0]?.total || 0;

    // 4) Total documents uploaded by this employee (all leads)
    const docsAgg = await Lead.aggregate([
      { $match: { salesManId: salesManObjectId } },
      {
        $project: {
          docsCount: { $size: "$documents" },
        },
      },
      {
        $group: {
          _id: null,
          totalDocs: { $sum: "$docsCount" },
        },
      },
    ]);
    const totalDocuments = docsAgg[0]?.totalDocs || 0;

    // 5) Status-wise summary (kitne leads kis status me)
    const statusSummary = await Lead.aggregate([
      { $match: { salesManId: salesManObjectId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: "$_id",
          count: 1,
        },
      },
      { $sort: { status: 1 } },
    ]);

    // 6) Recent 5 leads
    const recentLeads = await Lead.find({
      salesManId: salesManObjectId,
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select(
        "customerName contactNumber addressText status tropositeAmount createdAt"
      )
      .lean();

    return res.json({
      success: true,
      data: {
        totals: {
          totalLeads,
          activeLeads,
          closedLeads,
          totalTropositeAmount,
          totalDocuments,
        },
        statusSummary,
        recentLeads,
      },
    });
  } catch (err) {
    console.error("EMPLOYEE DASHBOARD ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to load employee dashboard",
    });
  }
};
