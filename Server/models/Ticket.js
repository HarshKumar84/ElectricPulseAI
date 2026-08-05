const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    ticket_id: { type: String, required: true, unique: true, index: true },
    fault_type: {
      type: String,
      enum: ["SPAN_FAULT", "TRANSFORMER_FAULT", "FEEDER_FAULT", "DEAD_SENSOR"],
      required: true
    },
    title: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["DETECTED", "ACKNOWLEDGED", "CREW_ASSIGNED", "RESOLVED", "VERIFIED", "CLOSED"],
      default: "DETECTED"
    },
    severity: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "HIGH"
    },
    // Location details
    from_pole_id: { type: String, default: null },
    to_pole_id: { type: String, default: null },
    transformer_id: { type: String, default: null },
    feeder_id: { type: String, default: null },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    pincode: { type: String, default: "560078" },
    
    // Impact metrics
    affected_poles: [{ type: String }],
    affected_houses: { type: Number, default: 0 },
    
    // Verification & AI operator summary
    ai_summary: { type: String },
    verification_attempts: { type: Number, default: 0 },
    resolved_at: { type: Date },
    closed_at: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ticket", ticketSchema);
