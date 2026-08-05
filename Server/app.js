const express = require("express");
const cors = require("cors");

const gridRoutes = require("./routes/gridRoutes");
const telemetryRoutes = require("./routes/telemetryRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const maintenanceRoutes = require("./routes/maintenanceRoutes");
const simulatorRoutes = require("./routes/simulatorRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "ElectricPulse AI - Fault Localization API Running",
    version: "1.0.0"
  });
});

app.use("/api/v1/grid", gridRoutes);
app.use("/api/v1/telemetry", telemetryRoutes);
app.use("/api/v1/tickets", ticketRoutes);
app.use("/api/v1/maintenance", maintenanceRoutes);
app.use("/api/v1/simulator", simulatorRoutes);

module.exports = app;