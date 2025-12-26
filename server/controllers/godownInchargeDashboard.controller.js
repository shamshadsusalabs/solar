// controllers/godownInchargeDashboard.controller.js
import mongoose from "mongoose";
import Lead from "../models/lead.model.js";

export const getGodownInchargeDashboard = async (req, res) => {
    try {
        const godownInchargeId = req.user?.id || req.user?._id;

        if (!godownInchargeId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: godown incharge id not found in token",
            });
        }

        // Show ALL leads (no filtering by godownInchargeId)
        const totalLeads = await Lead.countDocuments({});

        const closedStatuses = ["LEAD_CLOSED"];
        const activeLeads = await Lead.countDocuments({
            status: { $nin: closedStatuses },
        });

        const closedLeads = await Lead.countDocuments({
            status: { $in: closedStatuses },
        });

        // Total systemCostQuoted sum (all leads)
        const amountAgg = await Lead.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: "$systemCostQuoted" },
                },
            },
        ]);
        const totalSystemCostQuoted = amountAgg[0]?.total || 0;

        // Total documents (all leads)
        const docsAgg = await Lead.aggregate([
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

        // Status-wise summary (all leads)
        const statusSummary = await Lead.aggregate([
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

        // Recent 5 leads (all leads)
        const recentLeads = await Lead.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .select(
                "customerName contactNumber addressText status systemCostQuoted createdAt"
            )
            .lean();

        return res.json({
            success: true,
            data: {
                totals: {
                    totalLeads,
                    activeLeads,
                    closedLeads,
                    totalSystemCostQuoted,
                    totalDocuments,
                },
                statusSummary,
                recentLeads,
            },
        });
    } catch (err) {
        console.error("GODOWN INCHARGE DASHBOARD ERROR:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to load godown incharge dashboard",
        });
    }
};
