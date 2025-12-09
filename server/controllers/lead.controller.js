import fs from "fs";
import Lead from "../models/lead.model.js";
import cloudinary from "../utils/cloudinary.js";



export const createLead = async (req, res) => {
  console.log("========== CREATE LEAD START ==========");

  try {
    console.log("➡️ req.user:", req.user);
    console.log("➡️ raw req.body:", req.body);

    // ✅ 1) Normalize body from React Native FormData (_parts → normal object)
    const body =
      req.body && Array.isArray(req.body._parts)
        ? Object.fromEntries(req.body._parts)
        : req.body || {};

    console.log("➡️ normalized body:", body);

    console.log(
      "➡️ req.files:",
      req.files
        ? req.files.map((f) => ({
            name: f.originalname,
            size: f.size,
            path: f.path,
          }))
        : "NO FILES"
    );

    const {
      salesManId,
      salesManName,
      salesManCode,
      customerName,
      contactNumber,
      addressText,
      gpsLocation,
      rtsCapacityKw,
      roofTopCapacityKw,
      tropositeAmount,
      bankName,
      bankDetails,
    } = body;

    // ✅ 2) Required validation ab body se hoga
    if (
      !salesManId ||
      !salesManName ||
      !salesManCode ||
      !customerName ||
      !contactNumber ||
      !addressText
    ) {
      console.log("❌ REQUIRED FIELDS MISSING", {
        salesManId: !!salesManId,
        salesManName: !!salesManName,
        salesManCode: !!salesManCode,
        customerName: !!customerName,
        contactNumber: !!contactNumber,
        addressText: !!addressText,
      });

      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    // ✅ 3) Cloudinary upload (agar files aaye to)
    const uploadedDocs = [];

    if (req.files && req.files.length > 0) {
      console.log("📤 Uploading documents to cloudinary...");

      for (const file of req.files) {
        console.log("-----> Uploading:", file.originalname);

        const result = await cloudinary.uploader.upload(file.path, {
          folder: "solar_leads",
          resource_type: "auto",
        });

        uploadedDocs.push({
          fileName: file.originalname,
          fileUrl: result.secure_url,
        });

        try {
          fs.unlinkSync(file.path);
          console.log("🗑 Temp file removed:", file.path);
        } catch (e) {
          console.warn("⚠️ Failed to delete temp file:", file.path);
        }
      }
    } else {
      console.log("⚠️ No documents uploaded (req.files empty).");
    }

    // ✅ 4) DB save
    const newLead = await Lead.create({
      salesManId,
      salesManName,
      salesManCode,
      customerName,
      contactNumber,
      addressText,
      gpsLocation,
      documents: uploadedDocs,
      rtsCapacityKw,
      roofTopCapacityKw,
      tropositeAmount,
      bankName,
      bankDetails,
    });

    console.log("✅ Lead saved:", newLead._id);

    return res.status(201).json({
      success: true,
      message: "Lead created successfully",
      data: newLead,
    });
  } catch (err) {
    console.error("🔥 CREATE LEAD ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err?.message || "Failed to create lead",
    });
  }
};

/* ======================================
          GET ALL LEADS
====================================== */
/* ======================================
     GET ALL LEADS (ADMIN / FULL LIST)
     /api/leads   → sab leads, latest first
====================================== */
export const getAllLeads = async (req, res) => {
  try {
    // 🔹 koi filter nahi, sirf sab records
    const leads = await Lead.find({})
      .populate("salesManId", "name employeeCode")
      .sort({ createdAt: -1 }); // latest upar, purane neeche

    return res.json({
      success: true,
      data: leads,
    });
  } catch (err) {
    console.error("FETCH LEADS ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch leads",
    });
  }
};
export const updateLeadStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status)
      return res.status(400).json({
        success: false,
        message: "Status required",
      });

    const updated = await Lead.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });

    res.json({
      success: true,
      message: "Status updated",
      data: updated,
    });
  } catch (err) {
    console.error("STATUS UPDATE ERROR:", err);
    res.status(500).json({ success: false });
  }
};

/* ======================================
           GET BY ID
====================================== */
export const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate(
      "salesManId",
      "name employeeCode"
    );

    if (!lead)
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });

    res.json({
      success: true,
      data: lead,
    });
  } catch (err) {
    console.error("GET LEAD ERROR:", err);
    res.status(500).json({ success: false });
  }
};

/* ======================================
           UPDATE FULL LEAD
====================================== */
export const updateLead = async (req, res) => {
  try {
    const updated = await Lead.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    res.json({
      success: true,
      message: "Lead updated",
      data: updated,
    });
  } catch (err) {
    console.error("UPDATE LEAD ERROR:", err);
    res.status(500).json({ success: false });
  }
};

/* ======================================
           UPDATE STATUS ONLY
====================================== */


/* ======================================
            DELETE LEAD
====================================== */
export const deleteLead = async (req, res) => {
  try {
    const deleted = await Lead.findByIdAndDelete(req.params.id);

    if (!deleted)
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });

    res.json({
      success: true,
      message: "Lead deleted",
    });
  } catch (err) {
    console.error("DELETE LEAD ERROR:", err);
    res.status(500).json({ success: false });
  }
};
/* ======================================
     GET ALL LEADS BY SALESMAN (PAGINATION)
     /api/leads?salesManId=...&page=1&limit=10
====================================== */
export const getAllLeadsBysalesId = async (req, res) => {
  try {
    const { salesManId } = req.query;

    // ❗ salesManId required
    if (!salesManId) {
      return res.status(400).json({
        success: false,
        message: "salesManId is required",
      });
    }

    // 🔢 pagination
    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "10", 10);
    const skip = (page - 1) * limit;

    // ✅ filter SIRF salesManId par
    const filter = { salesManId };

    // 📊 total count
    const total = await Lead.countDocuments(filter);

    // 📥 latest leads first
    const leads = await Lead.find(filter)
      .populate("salesManId", "name employeeCode")
      .sort({ createdAt: -1 })     // 🔽 latest FIRST
      .skip(skip)
      .limit(limit);

    return res.json({
      success: true,
      data: leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("FETCH LEADS ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch leads",
    });
  }
};
