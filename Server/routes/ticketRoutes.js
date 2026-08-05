const express = require("express");
const router = express.Router();
const ticketController = require("../controllers/ticketController");

router.get("/", ticketController.getAllTickets);
router.patch("/:id/status", ticketController.updateTicketStatus);

module.exports = router;
