const Ticket = require("../models/Ticket");
const { generateIncidentAnalysis } = require("../utils/aiSummarizer");

/**
 * Deduplicates and updates active fault tickets.
 * Ensures 1 Incident Ticket per physical fault.
 */
async function processFaultIncident(faultDetails, io = null) {
  if (!faultDetails) return null;

  // Search for active existing ticket matching this span/transformer/feeder
  let activeTicket = await Ticket.findOne({
    status: { $in: ["DETECTED", "ACKNOWLEDGED", "CREW_ASSIGNED"] },
    $or: [
      { from_pole_id: faultDetails.from_pole_id, to_pole_id: faultDetails.to_pole_id },
      { transformer_id: faultDetails.transformer_id, fault_type: faultDetails.fault_type }
    ]
  });

  if (activeTicket) {
    // Update affected poles and house count if expanded
    activeTicket.affected_poles = faultDetails.affected_poles;
    activeTicket.affected_houses = faultDetails.affected_houses;
    await activeTicket.save();

    if (io) {
      io.emit("ticket:updated", activeTicket);
    }
    return activeTicket;
  }

  // Create new ticket
  const count = await Ticket.countDocuments();
  const ticketId = `TICK-${1000 + count + 1}`;
  const aiBrief = generateIncidentAnalysis(faultDetails);

  const newTicket = new Ticket({
    ticket_id: ticketId,
    fault_type: faultDetails.fault_type,
    title: faultDetails.title,
    description: faultDetails.description,
    status: "DETECTED",
    severity: faultDetails.severity,
    from_pole_id: faultDetails.from_pole_id,
    to_pole_id: faultDetails.to_pole_id,
    transformer_id: faultDetails.transformer_id,
    feeder_id: faultDetails.feeder_id,
    lat: faultDetails.lat,
    lng: faultDetails.lng,
    pincode: faultDetails.pincode,
    affected_poles: faultDetails.affected_poles,
    affected_houses: faultDetails.affected_houses,
    ai_summary: aiBrief.formattedBrief
  });

  await newTicket.save();

  if (io) {
    io.emit("ticket:created", newTicket);
  }

  return newTicket;
}

module.exports = {
  processFaultIncident
};
