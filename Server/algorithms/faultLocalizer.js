const MaintenanceSchedule = require("../models/MaintenanceSchedule");

/**
 * Deterministic Fault Localization Algorithm
 * Finds the live/dark boundary: Last Live Pole -> First Dead Pole
 * Handles Problem 1: Dead Sensor vs Line Break
 * Handles Problem 2: Planned Government Maintenance Suppression
 */

async function localizeFaultsForTransformer(transformer, poles) {
  if (!poles || poles.length === 0) return null;

  const now = new Date();

  // Problem 2: Check for Planned Government Maintenance Window
  // If an active schedule exists covering this transformer or its feeder/poles, emergency tickets must be SUPPRESSED!
  const activeSchedules = await MaintenanceSchedule.find({
    status: { $in: ["SCHEDULED", "IN_PROGRESS"] },
    start_time: { $lte: now },
    end_time: { $gte: now },
    $or: [
      { target_type: "TRANSFORMER", target_ids: transformer.transformer_id },
      { target_type: "FEEDER", target_ids: transformer.feeder_id }
    ]
  });

  if (activeSchedules.length > 0) {
    console.log(`ℹ️ Emergency Alert Suppressed: Transformer ${transformer.transformer_id} is under Planned Government Maintenance (${activeSchedules[0].title})`);
    return null; // Emergency ticket suppressed!
  }

  const poleMap = new Map();
  poles.forEach(p => poleMap.set(p.pole_id, p));

  const totalPoles = poles.length;
  const deadPoles = poles.filter(p => !p.is_energized);

  // Case 1: All poles are live -> No fault
  if (deadPoles.length === 0) {
    return null;
  }

  // Case 2: Dead Sensor Check (Problem 1)
  // If a pole reports dark (is_energized === false), but ANY of its downstream children are live,
  // power is physically present on the line! The sensor itself is dead/faulty.
  for (const pole of poles) {
    if (!pole.is_energized) {
      const downstreamPoles = poles.filter(p => p.parent_pole_id === pole.pole_id);
      const liveDownstream = downstreamPoles.filter(p => p.is_energized);

      if (liveDownstream.length > 0) {
        return {
          fault_type: "DEAD_SENSOR",
          title: `Dead IoT Sensor Alert on Pole ${pole.pole_id}`,
          description: `IoT Sensor on Pole ${pole.pole_id} reports dark (energized: false), but downstream poles are live. Line power is healthy; sensor requires battery/hardware replacement.`,
          transformer_id: transformer.transformer_id,
          feeder_id: transformer.feeder_id,
          from_pole_id: pole.pole_id,
          to_pole_id: pole.pole_id,
          lat: pole.location.lat,
          lng: pole.location.lng,
          pincode: pole.pincode || transformer.pincode,
          affected_poles: [pole.pole_id],
          affected_houses: 0,
          severity: "LOW"
        };
      }
    }
  }

  // Case 3: 100% of poles under transformer are dark -> Transformer Outage
  if (deadPoles.length === totalPoles) {
    const affectedHouses = poles.reduce((sum, p) => sum + (p.house_count || 6), 0);
    return {
      fault_type: "TRANSFORMER_FAULT",
      title: `Transformer Outage at ${transformer.name} (${transformer.transformer_id})`,
      description: `Complete power failure across all ${totalPoles} poles under Transformer ${transformer.transformer_id}`,
      transformer_id: transformer.transformer_id,
      feeder_id: transformer.feeder_id,
      from_pole_id: null,
      to_pole_id: poles[0].pole_id,
      lat: transformer.location.lat,
      lng: transformer.location.lng,
      pincode: transformer.pincode,
      affected_poles: poles.map(p => p.pole_id),
      affected_houses: affectedHouses,
      severity: "CRITICAL"
    };
  }

  // Case 4: Partial Outage (Span Fault / Line Break)
  // Search for the live/dark boundary: Last energised pole -> First dark child pole
  for (const pole of poles) {
    if (!pole.is_energized) {
      // Find parent pole
      const parentPole = pole.parent_pole_id ? poleMap.get(pole.parent_pole_id) : null;

      // If parent pole exists and IS ENERGIZED -> We found the exact broken span!
      if (parentPole && parentPole.is_energized) {
        // Collect all downstream dead poles affected by this break
        const affectedDownstream = collectDownstreamDeadPoles(pole, poleMap);
        const affectedHouses = affectedDownstream.reduce((sum, p) => sum + (p.house_count || 6), 0);

        return {
          fault_type: "SPAN_FAULT",
          title: `Line Break between Pole ${parentPole.pole_id} and Pole ${pole.pole_id}`,
          description: `Broken wire localized between Pole ${parentPole.pole_id} (Last Live) and Pole ${pole.pole_id} (First Dead). ${affectedDownstream.length} poles dark downstream.`,
          transformer_id: transformer.transformer_id,
          feeder_id: transformer.feeder_id,
          from_pole_id: parentPole.pole_id,
          to_pole_id: pole.pole_id,
          // Fault coordinate is mid-point of the broken span
          lat: (parentPole.location.lat + pole.location.lat) / 2,
          lng: (parentPole.location.lng + pole.location.lng) / 2,
          pincode: pole.pincode || transformer.pincode,
          affected_poles: affectedDownstream.map(p => p.pole_id),
          affected_houses: affectedHouses,
          severity: "HIGH"
        };
      }
    }
  }

  return null;
}

function collectDownstreamDeadPoles(startPole, poleMap) {
  const result = [];
  const queue = [startPole];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current.is_energized) {
      result.push(current);
      // Add downstream children
      for (const [_, p] of poleMap.entries()) {
        if (p.parent_pole_id === current.pole_id) {
          queue.push(p);
        }
      }
    }
  }

  return result;
}

module.exports = {
  localizeFaultsForTransformer
};
