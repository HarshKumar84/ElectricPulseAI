const mongoose = require("mongoose");

const feederSchema = new mongoose.Schema(
  {
    feeder_id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    substation_name: { type: String, default: "Central Substation Alpha" },
    status: { type: String, enum: ["ACTIVE", "DEGRADED", "TRIPPED"], default: "ACTIVE" },
    pincode: { type: String, default: "560078" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feeder", feederSchema);
