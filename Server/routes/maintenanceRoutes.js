const express = require("express");
const router = express.Router();
const maintenanceController = require("../controllers/maintenanceController");

router.get("/", maintenanceController.getMaintenanceSchedules);
router.post("/", maintenanceController.createMaintenanceSchedule);

module.exports = router;
