const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoMemoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (uri && uri.includes("<db_password>")) {
    console.warn("⚠️ Warning: Your MONGO_URI in Server/.env contains '<db_password>'. Please replace '<db_password>' with your actual MongoDB Atlas password!");
  }

  if (uri) {
    try {
      console.log("📡 Connecting to MongoDB Atlas / Remote Database...");
      await mongoose.connect(uri);
      console.log(`✅ Successfully Connected to MongoDB Atlas / Remote DB!`);
      return;
    } catch (error) {
      console.error(`❌ Atlas DB Connection Error: ${error.message}`);
      console.log("🚀 Falling back to resilient Embedded Memory Database...");
    }
  }

  // Fallback to local / in-memory if MONGO_URI is missing or fails
  try {
    mongoMemoryServer = await MongoMemoryServer.create();
    const memoryUri = mongoMemoryServer.getUri();
    await mongoose.connect(memoryUri);
    console.log(`✅ Embedded In-Memory MongoDB Active at: ${memoryUri}`);
  } catch (memErr) {
    console.error("❌ Database Connection Error:", memErr.message);
    process.exit(1);
  }
};

module.exports = connectDB;