const Pole = require("../models/Pole");
const { getIO } = require("./socketService");

function startSilenceDetector(intervalMs = 30000) {
  setInterval(async () => {
    try {
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

      // Find poles whose heartbeat is older than 2 minutes and not marked OFFLINE
      const silentPoles = await Pole.find({
        sensor_status: "ACTIVE",
        last_heartbeat: { $lt: twoMinutesAgo }
      });

      if (silentPoles.length > 0) {
        for (const pole of silentPoles) {
          pole.sensor_status = "OFFLINE";
          await pole.save();
        }

        const io = getIO();
        if (io) {
          io.emit("sensors:silent", {
            count: silentPoles.length,
            poles: silentPoles.map(p => p.pole_id)
          });
        }
      }
    } catch (err) {
      console.error("Error running silence detector:", err);
    }
  }, intervalMs);
}

module.exports = { startSilenceDetector };
