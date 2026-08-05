const Pole = require("../models/Pole");
const Transformer = require("../models/Transformer");
const TelemetryLog = require("../models/TelemetryLog");
const { localizeFaultsForTransformer } = require("../algorithms/faultLocalizer");
const { processFaultIncident } = require("../algorithms/incidentAggregator");
const { getIO } = require("../services/socketService");

exports.receiveTelemetry = async (req, res) => {
  try {
    const { pole_id, event, energized, time } = req.body;

    if (!pole_id || energized === undefined) {
      return res.status(400).json({ success: false, message: "pole_id and energized flag are required" });
    }

    const pole = await Pole.findOne({ pole_id });
    if (!pole) {
      return res.status(404).json({ success: false, message: `Pole ${pole_id} not registered` });
    }

    // Update pole state & heartbeat
    pole.is_energized = Boolean(energized);
    pole.sensor_status = "ACTIVE";
    pole.last_heartbeat = new Date();
    await pole.save();

    // Log event
    await TelemetryLog.create({
      pole_id,
      event: event || (energized ? "power_restored" : "power_lost"),
      energized: Boolean(energized),
      time: time || new Date().toLocaleTimeString()
    });

    // Run fault localization
    const transformer = await Transformer.findOne({ transformer_id: pole.transformer_id });
    const polesUnderDT = await Pole.find({ transformer_id: pole.transformer_id });

    const fault = await localizeFaultsForTransformer(transformer, polesUnderDT);
    let ticket = null;
    if (fault) {
      const io = getIO();
      ticket = await processFaultIncident(fault, io);
    }

    const io = getIO();
    if (io) {
      io.emit("telemetry:received", { pole_id, energized, timestamp: new Date() });
      io.emit("grid:updated", { transformer_id: pole.transformer_id });
    }

    res.json({
      success: true,
      message: "Telemetry processed",
      pole_id,
      energized,
      ticket_created: !!ticket
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
