import express from "express";
import { upload } from "../middleware/upload.js";

import {
  createLead,
  getAllLeads,
  getLeadById,
  updateLead,
  updateLeadStatus,
  deleteLead,
  getAllLeadsBysalesId,
  getManagerAllLeads,
  updateManagerLeadStatus,
  getChiefAllLeads,
  updateChiefLeadStatus,
  getGodownInchargeAllLeads,
  updateGodownInchargeLeadStatus,
  updateEmployeeLeadStatus,
} from "../controllers/lead.controller.js";
import { auth, requireRole } from "../middleware/auth.middleware.js";
const router = express.Router();

/* CREATE LEAD WITH FILE UPLOAD */
router.post(
  "/addlead", auth, requireRole("employee"),
  upload.array("documents", 10),
  createLead
);

router.get("/getAllBysalesId", auth, requireRole("employee"), getAllLeadsBysalesId);
/* UPDATE LEAD STATUS - EMPLOYEE (only their own leads) */
router.patch("/employee/updatestatus/:id/status", auth, requireRole("employee"), updateEmployeeLeadStatus);

/* ========== ADMIN ROUTES ========== */
/* GET ALL LEADS - ADMIN */
router.get("/getAll", auth, requireRole("admin"), getAllLeads);
/* UPDATE LEAD STATUS - ADMIN */
router.patch("/updatestatus/:id/status", auth, requireRole("admin"), updateLeadStatus);

/* ========== MANAGER ROUTES ========== */
/* GET ALL LEADS - MANAGER */
router.get("/manager/getAll", auth, requireRole("manager"), getManagerAllLeads);
/* UPDATE LEAD STATUS - MANAGER */
router.patch("/manager/updatestatus/:id/status", auth, requireRole("manager"), updateManagerLeadStatus);

/* ========== CHIEF ROUTES ========== */
/* GET ALL LEADS - CHIEF */
router.get("/chief/getAll", auth, requireRole("chief"), getChiefAllLeads);
/* UPDATE LEAD STATUS - CHIEF */
router.patch("/chief/updatestatus/:id/status", auth, requireRole("chief"), updateChiefLeadStatus);

/* ========== GODOWN INCHARGE ROUTES ========== */
/* GET ALL LEADS - GODOWN INCHARGE */
router.get("/godown-incharge/getAll", auth, requireRole("godown_incharge"), getGodownInchargeAllLeads);
/* UPDATE LEAD STATUS - GODOWN INCHARGE */
router.patch("/godown-incharge/updatestatus/:id/status", auth, requireRole("godown_incharge"), updateGodownInchargeLeadStatus);

/* GET SINGLE LEAD */
router.get("getById/:id", auth, requireRole("employee"), getLeadById);

/* UPDATE FULL LEAD (with optional file upload) */
router.put(
  "/updatebyId/:id",
  auth,
  requireRole("employee"),
  upload.array("documents", 10),
  updateLead
);

/* UPDATE STATUS */


/* DELETE LEAD */
router.delete("/:id", auth, requireRole("employee"), deleteLead);


export default router;
