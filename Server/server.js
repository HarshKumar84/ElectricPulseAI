require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const connectDB = require("./configuration/database");
const { initSocket } = require("./services/socketService");
const { seedInitialGridData } = require("./simulator/gridSeedData");
const { startSilenceDetector } = require("./services/silenceDetectorService");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE"]
  }
});

initSocket(io);

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();
  await seedInitialGridData();
  startSilenceDetector(30000); // Check silent sensors every 30s

  server.listen(PORT, () => {
    console.log(`🚀 ElectricPulse AI Server running on port ${PORT}`);
    console.log(`📡 Socket.IO server active`);
  });
}

startServer();