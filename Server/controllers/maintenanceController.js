const MaintenanceSchedule = require("../models/MaintenanceSchedule");

exports.getMaintenanceSchedules = async (req, res) => {
  try {
    const schedules = await MaintenanceSchedule.find().sort({ start_time: -1 });
    res.json({ success: true, count: schedules.length, schedules });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createMaintenanceSchedule = async (req, res) => {
  try {
    const { target_type, target_ids, title, reason, start_time, end_time } = req.body;

    const count = await MaintenanceSchedule.countDocuments();
    const schedule = new MaintenanceSchedule({
      schedule_id: `MAINT-${100 + count + 1}`,
      target_type,
      target_ids,
      title,
      reason,
      start_time: new Date(start_time),
      end_time: new Date(end_time),
      status: "SCHEDULED"
    });

    await schedule.save();
    res.json({ success: true, schedule });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
