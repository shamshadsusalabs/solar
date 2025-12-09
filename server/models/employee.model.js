import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const employeeSchema = new mongoose.Schema(
  {
    employeeCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    phoneNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    // ✅ Aadhaar Number
    aadhaarNumber: {
      type: String,
      trim: true,
      minlength: 12,
      maxlength: 12,
      default: null,        // 👈 ab yaha unique nahi
    },


    // ✅ Aadhaar document URL
    aadhaarUrl: {
      type: String,
      trim: true,
      default: null,
    },

     isFilled: {
      type: Boolean,
      default: false,
      index: true,
    },

    // ✅ Role: always "employee"
    role: {
      type: String,
      enum: ["employee"],
      default: "employee",
      required: true,
    },

    refreshToken: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

/* ✅ Hash password before save */
employeeSchema.pre("save", async function () {
  // yaha arrow function MAT use karna, normal function hi rahega
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

// ✅ Password verify method
employeeSchema.methods.isPasswordCorrect = async function (password) {
  return bcrypt.compare(password, this.password);
};

export const Employee = mongoose.model("Employee", employeeSchema);
