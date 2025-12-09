// src/config/db.js
import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mahacool";

export async function connectDB() {
  try {
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined");
    }

    // Mongoose connection
    await mongoose.connect(MONGODB_URI, {
      // options (modern mongoose may not need them)
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    console.log("✅ MongoDB connected");

    // Optional event logs
    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected");
    });

    return mongoose.connection;
  } catch (err) {
    console.error("❌ Failed to connect MongoDB:", err);
    throw err;
  }
}

export default connectDB;
