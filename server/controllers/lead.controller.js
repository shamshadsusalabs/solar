import fs from "fs";
import Lead from "../models/lead.model.js";
import cloudinary from "../utils/cloudinary.js";



export const createLead = async (req, res) => {


  try {


    // ✅ 1) Normalize body from React Native FormData (_parts → normal object)
    const body =
      req.body && Array.isArray(req.body._parts)
        ? Object.fromEntries(req.body._parts)
        : req.body || {};





    const {
      salesManId,
      salesManName,
      salesManCode,
      customerName,
      contactNumber,
      addressText,
      requiredSystemCapacity,
      systemCostQuoted,
      bankAccountName,
      ifscCode,
      branchDetails,
      textInstructions,
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


      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    // ✅ 3) Cloudinary upload (agar files aaye to)
    const uploadedDocs = [];

    if (req.files && req.files.length > 0) {


      for (const file of req.files) {


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

        } catch (e) {
          console.warn("⚠️ Failed to delete temp file:", file.path);
        }
      }
    } else {

    }

    // ✅ 4) DB save with new field structure
    const newLead = await Lead.create({
      salesManId,
      salesManName,
      salesManCode,
      customerName,
      contactNumber,
      addressText,
      documents: uploadedDocs,
      requiredSystemCapacity: requiredSystemCapacity || "",
      systemCostQuoted: systemCostQuoted || 0,
      bankAccountName: bankAccountName || "",
      ifscCode: ifscCode || "",
      branchDetails: branchDetails || "",
      textInstructions: textInstructions || "",
    });



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
     Query params: ?contactNumber=5852474748 (optional filter)
====================================== */
export const getAllLeads = async (req, res) => {
  try {
    const { contactNumber } = req.query;

    // 🔹 Build filter
    const filter = {};
    if (contactNumber) {
      // Partial match - agar koi bhi part match ho jaye
      filter.contactNumber = { $regex: contactNumber, $options: 'i' };
    }

    const leads = await Lead.find(filter)
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
     MANAGER - GET ALL LEADS
     Query params: ?contactNumber=5852474748 (optional filter)
====================================== */
export const getManagerAllLeads = async (req, res) => {
  try {
    const { contactNumber } = req.query;

    // 🔹 Build filter
    const filter = {};
    if (contactNumber) {
      filter.contactNumber = { $regex: contactNumber, $options: 'i' };
    }

    const leads = await Lead.find(filter)
      .populate("salesManId", "name employeeCode")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: leads,
    });
  } catch (err) {
    console.error("MANAGER FETCH LEADS ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch leads",
    });
  }
};

/* ======================================
     MANAGER - UPDATE LEAD STATUS
     (Abhi same as admin, baad me alag logic add kar sakte hain)
====================================== */
export const updateManagerLeadStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status)
      return res.status(400).json({
        success: false,
        message: "Status required",
      });

    // 🔹 Future: Manager ke liye validation/permission checks add kar sakte hain
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
      message: "Status updated by manager",
      data: updated,
    });
  } catch (err) {
    console.error("MANAGER STATUS UPDATE ERROR:", err);
    res.status(500).json({ success: false });
  }
};


/* ======================================
     CHIEF - GET ALL LEADS
     Query params: ?contactNumber=5852474748 (optional filter)
====================================== */
export const getChiefAllLeads = async (req, res) => {
  try {
    const { contactNumber } = req.query;

    // 🔹 Build filter
    const filter = {};
    if (contactNumber) {
      filter.contactNumber = { $regex: contactNumber, $options: 'i' };
    }

    const leads = await Lead.find(filter)
      .populate("salesManId", "name employeeCode")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: leads,
    });
  } catch (err) {
    console.error("CHIEF FETCH LEADS ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch leads",
    });
  }
};

/* ======================================
     CHIEF - UPDATE LEAD STATUS
     (Same as manager, baad me alag logic add kar sakte hain)
====================================== */
export const updateChiefLeadStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status)
      return res.status(400).json({
        success: false,
        message: "Status required",
      });

    // 🔹 Future: Chief ke liye validation/permission checks add kar sakte hain
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
      message: "Status updated by chief",
      data: updated,
    });
  } catch (err) {
    console.error("CHIEF STATUS UPDATE ERROR:", err);
    res.status(500).json({ success: false });
  }
};

/* ======================================
     GODOWN INCHARGE - GET ALL LEADS
     Query params: ?contactNumber=5852474748 (optional filter)
====================================== */
export const getGodownInchargeAllLeads = async (req, res) => {
  try {
    const { contactNumber } = req.query;

    // 🔹 Build filter
    const filter = {};
    if (contactNumber) {
      filter.contactNumber = { $regex: contactNumber, $options: 'i' };
    }

    const leads = await Lead.find(filter)
      .populate("salesManId", "name employeeCode")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: leads,
    });
  } catch (err) {
    console.error("GODOWN INCHARGE FETCH LEADS ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch leads",
    });
  }
};

/* ======================================
     GODOWN INCHARGE - UPDATE LEAD STATUS
     (Same as manager/chief, baad me alag logic add kar sakte hain)
====================================== */
export const updateGodownInchargeLeadStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status)
      return res.status(400).json({
        success: false,
        message: "Status required",
      });

    // 🔹 Future: Godown Incharge ke liye validation/permission checks add kar sakte hain
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
      message: "Status updated by godown incharge",
      data: updated,
    });
  } catch (err) {
    console.error("GODOWN INCHARGE STATUS UPDATE ERROR:", err);
    res.status(500).json({ success: false });
  }
};
/* ======================================
     EMPLOYEE - UPDATE LEAD STATUS
     Employee can only update their own leads
====================================== */
export const updateEmployeeLeadStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const employeeId = req.user.id; // ✅ FIXED: req.user.id is the string ID from auth middleware

    if (!status)
      return res.status(400).json({
        success: false,
        message: "Status required",
      });

    // 🔹 First check if lead exists and belongs to this employee
    const lead = await Lead.findById(req.params.id);

    if (!lead)
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });

    // 🔹 Check if this lead belongs to the employee
    if (lead.salesManId.toString() !== employeeId.toString())
      return res.status(403).json({
        success: false,
        message: "You can only update your own leads",
      });

    // 🔹 Update status
    lead.status = status;
    await lead.save();

    res.json({
      success: true,
      message: "Status updated successfully",
      data: lead,
    });
  } catch (err) {
    console.error("EMPLOYEE STATUS UPDATE ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to update status" });
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
    // ✅ Get existing lead
    const existingLead = await Lead.findById(req.params.id);
    if (!existingLead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    // ✅ Normalize body from React Native FormData
    const body =
      req.body && Array.isArray(req.body._parts)
        ? Object.fromEntries(req.body._parts)
        : req.body || {};

    // ✅ Handle new document uploads (if any)
    let updatedDocuments = [...existingLead.documents]; // Preserve existing docs

    if (req.files && req.files.length > 0) {
      // Upload new files to cloudinary
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "solar_leads",
          resource_type: "auto",
        });

        updatedDocuments.push({
          fileName: file.originalname,
          fileUrl: result.secure_url,
        });

        try {
          fs.unlinkSync(file.path);
        } catch (e) {
          console.warn("⚠️ Failed to delete temp file:", file.path);
        }
      }
    }

    // ✅ Build update object
    const updateData = {
      ...body,
      documents: updatedDocuments,
    };

    // ✅ Update lead
    const updated = await Lead.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json({
      success: true,
      message: "Lead updated successfully",
      data: updated,
    });
  } catch (err) {
    console.error("UPDATE LEAD ERROR:", err);
    res.status(500).json({
      success: false,
      message: err?.message || "Failed to update lead"
    });
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
