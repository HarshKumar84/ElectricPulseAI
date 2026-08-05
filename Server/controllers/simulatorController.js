const { injectSpanFault, injectDeadSensor, injectSilentSensor, injectMaintenanceOutage, injectTransformerFault, injectFeederFault, repairFault } = require("../simulator/faultInjector");

exports.triggerFault = async (req, res) => {
  try {
    const { type, from_pole_id, to_pole_id, transformer_id, feeder_id, ticket_id, pole_id, title, reason } = req.body;

    if (type === "SPAN_FAULT") {
      const result = await injectSpanFault(from_pole_id, to_pole_id);
      return res.json({ success: true, message: "Span fault injected", result });
    }

    if (type === "DEAD_SENSOR") {
      const result = await injectDeadSensor(pole_id || to_pole_id);
      return res.json({ success: true, message: "Dead sensor alert injected", result });
    }

    if (type === "SILENT_SENSOR") {
      const result = await injectSilentSensor(pole_id || to_pole_id);
      return res.json({ success: true, message: "Silent sensor timeout injected", result });
    }

    if (type === "PLANNED_MAINTENANCE") {
      const result = await injectMaintenanceOutage(transformer_id, title, reason);
      return res.json({ success: true, message: "Planned government maintenance injected. Emergency alerts suppressed.", result });
    }

    if (type === "TRANSFORMER_FAULT") {
      const result = await injectTransformerFault(transformer_id);
      return res.json({ success: true, message: "Transformer fault injected", result });
    }

    if (type === "FEEDER_FAULT") {
      const result = await injectFeederFault(feeder_id);
      return res.json({ success: true, message: "Feeder fault injected", result });
    }

    if (type === "REPAIR") {
      const result = await repairFault(ticket_id);
      return res.json({ success: true, message: "Repair triggered and auto-verification initiated", result });
    }

    res.status(400).json({ success: false, message: "Invalid simulation fault type" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
