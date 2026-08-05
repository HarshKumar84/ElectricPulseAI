const express = require("express");
const router = express.Router();
const simulatorController = require("../controllers/simulatorController");

router.post("/trigger", simulatorController.triggerFault);

module.exports = router;
