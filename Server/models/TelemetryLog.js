const mongoose = require("mongoose");

const telemetryLogSchema = new mongoose.Schema(
  {
    pole_id: { type: String, required: true, index: true },
    event: { type: String, enum: ["power_lost", "power_restored", "heartbeat"], required: true },
    energized: { type: Boolean, required: true },
    time: { type: String },
    timestamp: { type: Date, default: Date.now, index: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("TelemetryLog", telemetryLogSchema);
