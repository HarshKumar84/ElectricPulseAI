let ioInstance = null;

function initSocket(io) {
  ioInstance = io;

  io.on("connection", (socket) => {
    console.log(`🔌 Client connected to Socket.IO: ${socket.id}`);

    socket.on("disconnect", () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

function getIO() {
  if (!ioInstance) {
    console.warn("Socket.IO instance not yet initialized!");
  }
  return ioInstance;
}

module.exports = {
  initSocket,
  getIO
};
