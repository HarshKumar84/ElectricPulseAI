const mongoose = require("mongoose");

const maintenanceScheduleSchema = new mongoose.Schema(
  {
    schedule_id: { type: String, required: true, unique: true },
    target_type: { type: String, enum: ["POLE", "TRANSFORMER", "FEEDER"], required: true },
    target_ids: [{ type: String, required: true }],
    title: { type: String, required: true },
    reason: { type: String },
    start_time: { type: Date, required: true },
    end_time: { type: Date, required: true },
    status: { type: String, enum: ["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"], default: "SCHEDULED" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("MaintenanceSchedule", maintenanceScheduleSchema);
