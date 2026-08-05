/**
 * AI Operator Incident Brief & Dispatch Utility
 * Generates structured summaries, probable causes, crew safety advice, and dispatch notes.
 */

function generateIncidentAnalysis(fault) {
  const { fault_type, from_pole_id, to_pole_id, transformer_id, feeder_id, lat, lng, pincode, affected_houses, affected_poles } = fault;

  let summary = "";
  let probableCauses = [];
  let safetyInstructions = [];
  let dispatchChecklist = [];

  if (fault_type === "SPAN_FAULT") {
    summary = `CRITICAL SPAN BREAK: Physical conductor break pinpointed between Pole ${from_pole_id || "Transformer Root"} (Last Energized) and Pole ${to_pole_id} (First Dark). A total of ${affected_poles?.length || 0} downstream poles are dark, disrupting power to ${affected_houses} consumer homes in PIN ${pincode}.`;
    
    probableCauses = [
      "Physical conductor snapped due to storm or thermal stress",
      "Tree branch collision across overhead span",
      "Insulator pin failure or pole cross-arm breakage"
    ];

    safetyInstructions = [
      "Verify span de-energization using ground detector probe before climbing",
      "Isolate section at Pole " + (from_pole_id || "transformer root") + " gang-operated switch",
      "Wear Class 2 high-voltage insulated rubber gloves (17,000V rated)"
    ];

    dispatchChecklist = [
      "ACSR Conductor wire reel (50 meters)",
      "Hydraulic crimping tool & line sleeves",
      "Tensioning come-along clamp & bucket truck"
    ];
  } else if (fault_type === "TRANSFORMER_FAULT") {
    summary = `TRANSFORMER OUTAGE: Complete outage recorded at Distribution Transformer ${transformer_id}. All downstream poles are dark, impacting ${affected_houses} consumer homes.`;

    probableCauses = [
      "Transformer primary HV fuse blown due to overload",
      "Internal oil temperature overheating or short-circuit trip",
      "Lightning surge arrester breakdown"
    ];

    safetyInstructions = [
      "Check transformer oil level gauge and tank temperature before touching",
      "Disconnect Drop-Out (DO) fuse barrel using 11kV insulated hot stick",
      "Ensure earth grounding lead is securely bolted"
    ];

    dispatchChecklist = [
      "11kV DO Fuse wire elements (10A/15A)",
      "Insulation resistance tester (Megger)",
      "Transformer oil dielectric test kit"
    ];
  } else if (fault_type === "FEEDER_FAULT") {
    summary = `SUBSTATION FEEDER TRIP: 11kV Feeder Line ${feeder_id} tripped at Substation. All associated transformers and poles are offline.`;

    probableCauses = [
      "Substation feeder breaker tripped on earth fault overcurrent",
      "Major feeder trunk line conductor grounding",
      "Substation feeder breaker relay mal-trip"
    ];

    safetyInstructions = [
      "Obtain formal Line Clearance permit from Substation Engineer before patrol",
      "Patrol feeder backbone trunk prior to re-closer reset"
    ];

    dispatchChecklist = [
      "Substation line clearance permit documentation",
      "Feeder section isolator operating rod"
    ];
  } else if (fault_type === "DEAD_SENSOR") {
    summary = `IOT SENSOR MAINTENANCE REQUIRED: Sensor on Pole ${to_pole_id} reports power loss, but downstream poles report energized status. Grid power is healthy; sensor battery/hardware requires servicing.`;

    probableCauses = [
      "IoT sensor onboard battery depletion",
      "Current transformer (CT) clamp sensor disconnect",
      "Sensor firmware heartbeat freeze"
    ];

    safetyInstructions = [
      "Standard low-voltage ladder safety procedure",
      "No power line isolation required"
    ];

    dispatchChecklist = [
      "Replacement IoT Pole Sensor module",
      "Current sensor clamp tool & lithium backup battery"
    ];
  }

  return {
    summary,
    probableCauses,
    safetyInstructions,
    dispatchChecklist,
    formattedBrief: `${summary}\n\nProbable Cause: ${probableCauses[0]}\nSafety Note: ${safetyInstructions[0]}`
  };
}

module.exports = { generateIncidentAnalysis };
