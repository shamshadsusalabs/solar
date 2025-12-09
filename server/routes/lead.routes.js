import express from "express";
import { upload } from "../middleware/upload.js";

import {
  createLead,
  getAllLeads,
  getLeadById,
  updateLead,
  updateLeadStatus,
  deleteLead,getAllLeadsBysalesId
} from "../controllers/lead.controller.js";
import { auth, requireRole } from "../middleware/auth.middleware.js";
const router = express.Router();

/* CREATE LEAD WITH FILE UPLOAD */
router.post(
  "/addlead", auth, requireRole("employee"),
  upload.array("documents", 10),
  createLead
);

router.get("/getAllBysalesId",auth, requireRole("employee"), getAllLeadsBysalesId);
/* GET ALL LEADS */
router.get("/getAll",auth, requireRole("admin"), getAllLeads);
router.patch("/updatestatus/:id/status",auth, requireRole("admin"), updateLeadStatus);
/* GET SINGLE LEAD */
router.get("getById/:id", getLeadById);

/* UPDATE FULL LEAD */
router.put("/updatebyId/:id", updateLead);

/* UPDATE STATUS */


/* DELETE LEAD */
router.delete("/:id", deleteLead);


export default router;
