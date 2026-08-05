const Ticket = require("../models/Ticket");
const { getIO } = require("../services/socketService");

exports.getAllTickets = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const tickets = await Ticket.find(query).sort({ createdAt: -1 });

    res.json({ success: true, count: tickets.length, tickets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const ticket = await Ticket.findOne({ ticket_id: id });
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    ticket.status = status;
    if (status === "RESOLVED") {
      ticket.resolved_at = new Date();
    } else if (status === "CLOSED") {
      ticket.closed_at = new Date();
    }

    await ticket.save();

    const io = getIO();
    if (io) {
      io.emit("ticket:updated", ticket);
    }

    res.json({ success: true, ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
