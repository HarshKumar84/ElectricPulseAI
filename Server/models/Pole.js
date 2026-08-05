const mongoose = require("mongoose");

const poleSchema = new mongoose.Schema(
  {
    pole_id: { type: String, required: true, unique: true, index: true },
    transformer_id: { type: String, required: true, ref: "Transformer" },
    feeder_id: { type: String, required: true, ref: "Feeder" },
    parent_pole_id: { type: String, default: null, ref: "Pole" },
    downstream_pole_ids: [{ type: String }],
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    pincode: { type: String, required: true, default: "560078" },
    house_count: { type: Number, default: 6 },
    // Telemetry state
    is_energized: { type: Boolean, default: true },
    sensor_status: {
      type: String,
      enum: ["ACTIVE", "OFFLINE", "DEAD_SENSOR", "PLANNED_OUTAGE"],
      default: "ACTIVE"
    },
    last_heartbeat: { type: Date, default: Date.now },
    // Topology discovery flags
    is_topology_inferred: { type: Boolean, default: false },
    sequence_order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pole", poleSchema);
