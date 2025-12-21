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
  "/addlead", 
  upload.array("documents", 10),
  createLead
);

router.get("/getAllBysalesId",getAllLeadsBysalesId);
/* GET ALL LEADS */
router.get("/getAll",getAllLeads);
router.patch("/updatestatus/:id/status", updateLeadStatus);
/* GET SINGLE LEAD */
router.get("getById/:id", getLeadById);

/* UPDATE FULL LEAD */
router.put("/updatebyId/:id", updateLead);

/* UPDATE STATUS */


/* DELETE LEAD */
router.delete("/:id", deleteLead);


export default router;
