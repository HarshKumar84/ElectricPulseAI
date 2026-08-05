const Feeder = require("../models/Feeder");
const Transformer = require("../models/Transformer");
const Pole = require("../models/Pole");

exports.getGridOverview = async (req, res) => {
  try {
    const feeders = await Feeder.find();
    const transformers = await Transformer.find();
    const poles = await Pole.find();

    const totalPoles = poles.length;
    const energizedPoles = poles.filter(p => p.is_energized).length;
    const darkPoles = totalPoles - energizedPoles;
    const activeSensors = poles.filter(p => p.sensor_status === "ACTIVE").length;

    res.json({
      success: true,
      summary: {
        feeders_count: feeders.length,
        transformers_count: transformers.length,
        total_poles: totalPoles,
        energized_poles: energizedPoles,
        dark_poles: darkPoles,
        active_sensors: activeSensors
      },
      feeders,
      transformers,
      poles
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
