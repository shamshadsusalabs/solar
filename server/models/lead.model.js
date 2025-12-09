import mongoose from "mongoose";

/* ========= STATUS MASTER ========= */
export const LEAD_STATUS = [
  "UNDER_DISCUSSION",
  "DOCUMENT_RECEIVED",
  "DOCUMENT_UPLOAD_OVER_PORTAL",
  "FILE_SEND_TO_BANK",
  "FUNDS_DISBURSED_BY_BANK",
  "MERGED_DOCUMENT_UPLOAD",
  "MATERIAL_DELIVERED",
  "SYSTEM_INSTALLED",
  "SYSTEM_COMMISSIONED",
  "SUBSIDY_REDEEMED",
  "LEAD_CLOSED",
  "REFERRAL_RECEIVED",
];

/* ========= DOCUMENT SUB-SCHEMA ========= */
const documentSchema = new mongoose.Schema(
  {
    fileUrl: { type: String, required: true },
    fileName: { type: String },
  },
  { _id: false }
);

/* ========= MAIN SCHEMA ========= */
const leadSchema = new mongoose.Schema(
  {
    /* ✅ SALESMAN ID (Reference to Employee) */
    salesManId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    /* Sale Man Display Info */
    salesManName: {
      type: String,
      required: true,
      trim: true,
    },

    salesManCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    /* Customer */
    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    contactNumber: {
      type: String,
      required: true,
      trim: true,
    },

    /* Address */
    addressText: {
      type: String,
      required: true,
      trim: true,
    },

    gpsLocation: {
      type: String,
      default: "",
    },

    /* Documents */
    documents: [documentSchema],

    /* Capacities */
    rtsCapacityKw: {
      type: Number,
      default: 0,
    },

    roofTopCapacityKw: {
      type: Number,
      default: 0,
    },

    /* Amount */
    tropositeAmount: {
      type: Number,
      default: 0,
    },

    /* ✅ BANK (Clean) */
    bankName: {
      type: String,
      trim: true,
      default: "",
    },

    bankDetails: {
      type: String,
      trim: true,
      default: "",
    },

    /* Status Flow */
    status: {
      type: String,
      enum: LEAD_STATUS,
      default: "UNDER_DISCUSSION",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* ========= EXPORT ========= */
const Lead = mongoose.model("Lead", leadSchema);
export default Lead;
