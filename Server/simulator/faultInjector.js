const Pole = require("../models/Pole");
const Transformer = require("../models/Transformer");
const Feeder = require("../models/Feeder");
const TelemetryLog = require("../models/TelemetryLog");
const Ticket = require("../models/Ticket");
const MaintenanceSchedule = require("../models/MaintenanceSchedule");
const { localizeFaultsForTransformer } = require("../algorithms/faultLocalizer");
const { processFaultIncident } = require("../algorithms/incidentAggregator");
const { getIO } = require("../services/socketService");

async function injectSpanFault(fromPoleId, toPoleId) {
  const io = getIO();
  const targetPole = await Pole.findOne({ pole_id: toPoleId });
  if (!targetPole) throw new Error(`Target pole ${toPoleId} not found`);

  const transformer = await Transformer.findOne({ transformer_id: targetPole.transformer_id });
  const allPoles = await Pole.find({ transformer_id: targetPole.transformer_id });
  const poleMap = new Map(allPoles.map(p => [p.pole_id, p]));

  // Turn target pole and all downstream poles OFF (energized = false)
  const affectedPoleIds = [];
  const queue = [toPoleId];

  while (queue.length > 0) {
    const currId = queue.shift();
    affectedPoleIds.push(currId);

    const currPole = poleMap.get(currId);
    if (currPole) {
      currPole.is_energized = false;
      await currPole.save();

      // Add log
      await TelemetryLog.create({
        pole_id: currId,
        event: "power_lost",
        energized: false,
        time: new Date().toLocaleTimeString()
      });

      // Find children
      for (const p of allPoles) {
        if (p.parent_pole_id === currId) {
          queue.push(p.pole_id);
        }
      }
    }
  }

  // Refetch poles to run localization algorithm
  const updatedPoles = await Pole.find({ transformer_id: targetPole.transformer_id });
  const faultResult = await localizeFaultsForTransformer(transformer, updatedPoles);

  let ticket = null;
  if (faultResult) {
    ticket = await processFaultIncident(faultResult, io);
  }

  if (io) {
    io.emit("grid:updated", { transformer_id: transformer.transformer_id });
  }

  return { affectedPoleIds, ticket };
}

async function injectDeadSensor(poleId) {
  const io = getIO();
  const pole = await Pole.findOne({ pole_id: poleId });
  if (!pole) throw new Error(`Pole ${poleId} not found`);

  // Target pole sensor reports false while downstream poles remain energized
  pole.is_energized = false;
  pole.sensor_status = "DEAD_SENSOR";
  await pole.save();

  await TelemetryLog.create({
    pole_id: poleId,
    event: "power_lost",
    energized: false,
    time: new Date().toLocaleTimeString()
  });

  const transformer = await Transformer.findOne({ transformer_id: pole.transformer_id });
  const polesUnderDT = await Pole.find({ transformer_id: pole.transformer_id });

  const faultResult = await localizeFaultsForTransformer(transformer, polesUnderDT);
  let ticket = null;
  if (faultResult) {
    ticket = await processFaultIncident(faultResult, io);
  }

  if (io) {
    io.emit("grid:updated", { transformer_id: pole.transformer_id });
  }

  return { poleId, ticket };
}

async function injectSilentSensor(poleId) {
  const io = getIO();
  const pole = await Pole.findOne({ pole_id: poleId });
  if (!pole) throw new Error(`Pole ${poleId} not found`);

  // Simulate missing heartbeat (> 2 mins ago)
  pole.last_heartbeat = new Date(Date.now() - 3 * 60 * 1000);
  pole.sensor_status = "OFFLINE";
  await pole.save();

  if (io) {
    io.emit("sensors:silent", { count: 1, poles: [poleId] });
    io.emit("grid:updated", { transformer_id: pole.transformer_id });
  }

  return { poleId, status: "OFFLINE" };
}

async function injectMaintenanceOutage(transformerId, title = "Planned Government Maintenance", reason = "Substation Transformer Overhaul") {
  const io = getIO();
  const transformer = await Transformer.findOne({ transformer_id: transformerId });
  if (!transformer) throw new Error(`Transformer ${transformerId} not found`);

  // 1. Create MaintenanceSchedule record from now to +2 hours
  const startTime = new Date();
  const endTime = new Date(Date.now() + 2 * 60 * 60 * 1000);

  const count = await MaintenanceSchedule.countDocuments();
  const schedule = await MaintenanceSchedule.create({
    schedule_id: `MAINT-${100 + count + 1}`,
    target_type: "TRANSFORMER",
    target_ids: [transformerId],
    title,
    reason,
    start_time: startTime,
    end_time: endTime,
    status: "IN_PROGRESS"
  });

  // 2. Turn poles OFF and mark sensor_status as PLANNED_OUTAGE
  const poles = await Pole.find({ transformer_id: transformerId });
  for (const pole of poles) {
    pole.is_energized = false;
    pole.sensor_status = "PLANNED_OUTAGE";
    await pole.save();

    await TelemetryLog.create({
      pole_id: pole.pole_id,
      event: "power_lost",
      energized: false,
      time: new Date().toLocaleTimeString()
    });
  }

  // 3. Run localization -> Emergency ticket will be SUPPRESSED because of active MaintenanceSchedule!
  const updatedPoles = await Pole.find({ transformer_id: transformerId });
  const faultResult = await localizeFaultsForTransformer(transformer, updatedPoles);

  if (io) {
    io.emit("grid:updated", { transformer_id: transformerId });
    io.emit("maintenance:updated", schedule);
  }

  return { schedule, faultSuppressed: faultResult === null };
}

async function injectTransformerFault(transformerId) {
  const io = getIO();
  const transformer = await Transformer.findOne({ transformer_id: transformerId });
  if (!transformer) throw new Error(`Transformer ${transformerId} not found`);

  transformer.is_energized = false;
  transformer.status = "FAULTY";
  await transformer.save();

  // Turn ALL poles under transformer OFF
  const poles = await Pole.find({ transformer_id: transformerId });
  const affectedPoleIds = [];

  for (const pole of poles) {
    pole.is_energized = false;
    await pole.save();
    affectedPoleIds.push(pole.pole_id);

    await TelemetryLog.create({
      pole_id: pole.pole_id,
      event: "power_lost",
      energized: false,
      time: new Date().toLocaleTimeString()
    });
  }

  const updatedPoles = await Pole.find({ transformer_id: transformerId });
  const faultResult = await localizeFaultsForTransformer(transformer, updatedPoles);

  let ticket = null;
  if (faultResult) {
    ticket = await processFaultIncident(faultResult, io);
  }

  if (io) {
    io.emit("grid:updated", { transformer_id: transformerId });
  }

  return { affectedPoleIds, ticket };
}

async function injectFeederFault(feederId) {
  const io = getIO();
  const feeder = await Feeder.findOne({ feeder_id: feederId });
  if (!feeder) throw new Error(`Feeder ${feederId} not found`);

  feeder.status = "TRIPPED";
  await feeder.save();

  const transformers = await Transformer.find({ feeder_id: feederId });
  let totalAffectedPoles = 0;

  for (const dt of transformers) {
    dt.is_energized = false;
    dt.status = "FAULTY";
    await dt.save();

    const poles = await Pole.find({ transformer_id: dt.transformer_id });
    for (const pole of poles) {
      pole.is_energized = false;
      await pole.save();
      totalAffectedPoles++;

      await TelemetryLog.create({
        pole_id: pole.pole_id,
        event: "power_lost",
        energized: false,
        time: new Date().toLocaleTimeString()
      });
    }

    const updatedPoles = await Pole.find({ transformer_id: dt.transformer_id });
    const faultResult = await localizeFaultsForTransformer(dt, updatedPoles);
    if (faultResult) {
      await processFaultIncident(faultResult, io);
    }
  }

  if (io) {
    io.emit("grid:updated", { feeder_id: feederId });
  }

  return { feederId, totalAffectedPoles };
}

async function repairFault(ticketId) {
  const io = getIO();

  if (!ticketId) {
    // Global grid repair: restore all poles and transformers to live green state
    await Pole.updateMany(
      {},
      { is_energized: true, sensor_status: "ACTIVE", last_heartbeat: new Date() }
    );
    await Transformer.updateMany(
      {},
      { is_energized: true, status: "HEALTHY" }
    );
    await Feeder.updateMany(
      {},
      { status: "ACTIVE" }
    );
    await Ticket.updateMany(
      { status: { $in: ["DETECTED", "ACKNOWLEDGED", "CREW_ASSIGNED", "RESOLVED", "VERIFIED"] } },
      { status: "CLOSED", closed_at: new Date() }
    );

    if (io) {
      io.emit("grid:updated", {});
      io.emit("ticket:closed", {});
    }
    return { success: true, message: "All grid poles restored to LIVE state" };
  }

  const ticket = await Ticket.findOne({ ticket_id: ticketId });
  if (!ticket) throw new Error(`Ticket ${ticketId} not found`);

  ticket.status = "RESOLVED";
  ticket.resolved_at = new Date();
  await ticket.save();

  // Restore power to affected poles
  if (ticket.affected_poles && ticket.affected_poles.length > 0) {
    for (const poleId of ticket.affected_poles) {
      await Pole.updateOne(
        { pole_id: poleId },
        { is_energized: true, sensor_status: "ACTIVE", last_heartbeat: new Date() }
      );

      await TelemetryLog.create({
        pole_id: poleId,
        event: "power_restored",
        energized: true,
        time: new Date().toLocaleTimeString()
      });
    }
  }

  // Restore transformer if applicable
  if (ticket.transformer_id) {
    await Transformer.updateOne(
      { transformer_id: ticket.transformer_id },
      { is_energized: true, status: "HEALTHY" }
    );
  }

  // Auto Verification Workflow: Verify telemetry restored
  setTimeout(async () => {
    const verifiedTicket = await Ticket.findOne({ ticket_id: ticketId });
    if (verifiedTicket && verifiedTicket.status === "RESOLVED") {
      verifiedTicket.status = "VERIFIED";
      await verifiedTicket.save();

      setTimeout(async () => {
        verifiedTicket.status = "CLOSED";
        verifiedTicket.closed_at = new Date();
        await verifiedTicket.save();

        if (io) {
          io.emit("ticket:closed", verifiedTicket);
          io.emit("grid:updated", {});
        }
      }, 3000);
    }
  }, 4000);

  if (io) {
    io.emit("ticket:updated", ticket);
    io.emit("grid:updated", {});
  }

  return ticket;
}

module.exports = {
  injectSpanFault,
  injectDeadSensor,
  injectSilentSensor,
  injectMaintenanceOutage,
  injectTransformerFault,
  injectFeederFault,
  repairFault
};
