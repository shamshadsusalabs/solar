import mongoose from "mongoose";

/* ========= STATUS MASTER ========= */
export const LEAD_STATUS = [
  "INTERESTED_CUSTOMERS",
  "DOCUMENTS_RECEIVED",
  "DOCUMENTS_UPLOADED_ON_PORTAL",
  "FILE_SENT_TO_BANK",
  "PAYMENT_RECEIVED",
  "SYSTEM_DELIVERED",
  "SYSTEM_INSTALLED",
  "SYSTEM_COMMISSIONED",
  "SUBSIDY_REDEEMED",
  "SUBSIDY_DISBURSED",
  "LEAD_CLOSE",
];

/* ========= BANK MASTER ========= */
export const BANK_NAMES = [
  "SBI",
  "HDFC",
  "ICICI",
  "Canara Bank",
  "Punjab National Bank",
  "Jammu & Kashmir Bank",
  "Other",
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
      index: true, // ✅ Index for fast queries
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
      index: true, // ✅ Index for fast employee code search
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
      index: true, // ✅ Index for fast contact search
    },

    /* Address */
    addressText: {
      type: String,
      required: true,
      trim: true,
    },

    /* Documents */
    documents: [documentSchema],

    /* ✅ Required System Capacity (ALPHANUMERIC - e.g., "20 kw") */
    requiredSystemCapacity: {
      type: String,
      trim: true,
      default: "",
    },

    /* ✅ System Cost Quoted (NUMERIC) */
    systemCostQuoted: {
      type: Number,
      default: 0,
    },

    /* ✅ Bank Account Name (ALPHA) */
    bankAccountName: {
      type: String,
      trim: true,
      default: "",
    },

    /* ✅ Bank Branch Name and Details (ALPHANUMERIC) */
    branchDetails: {
      type: String,
      trim: true,
      default: "",
    },

    ifscCode: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
    },

    textInstructions: {
      type: String,
      trim: true,
      default: "",
    },

    /* ✅ Compiled File URL (from Cloudinary) */
    compiledFile: {
      type: String,
      trim: true,
      default: "",
    },

    /* Status Flow */
    status: {
      type: String,

      enum: LEAD_STATUS,
      default: "INTERESTED_CUSTOMERS",
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
