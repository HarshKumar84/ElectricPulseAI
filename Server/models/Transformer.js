const mongoose = require("mongoose");

const transformerSchema = new mongoose.Schema(
  {
    transformer_id: { type: String, required: true, unique: true, index: true },
    feeder_id: { type: String, required: true, ref: "Feeder" },
    name: { type: String, required: true },
    pincode: { type: String, required: true, default: "560078" },
    capacity_kva: { type: Number, default: 250 },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    status: { type: String, enum: ["HEALTHY", "FAULTY", "MAINTENANCE"], default: "HEALTHY" },
    is_energized: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transformer", transformerSchema);
