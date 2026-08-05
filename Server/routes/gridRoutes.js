const express = require("express");
const router = express.Router();
const gridController = require("../controllers/gridController");

router.get("/overview", gridController.getGridOverview);

module.exports = router;
