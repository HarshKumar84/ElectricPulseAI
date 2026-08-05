// Demo Data helper for initial grid state (All poles 100% Green & Energized initially)

const feeders = [
  { feeder_id: "FDR-101", name: "Jayanagar Main Feeder 11kV", status: "ACTIVE", pincode: "560078" },
  { feeder_id: "FDR-102", name: "JP Nagar Feeder 11kV", status: "ACTIVE", pincode: "560078" },
  { feeder_id: "FDR-103", name: "BTM Layout Feeder 11kV", status: "ACTIVE", pincode: "560076" }
];

const transformers = [
  { transformer_id: "DT-201", feeder_id: "FDR-101", name: "Transformer DT-201 (Jayanagar 4th Block)", pincode: "560078", capacity_kva: 250, location: { lat: 12.968214, lng: 77.594612 }, status: "HEALTHY", is_energized: true },
  { transformer_id: "DT-202", feeder_id: "FDR-101", name: "Transformer DT-202 (Jayanagar 5th Block)", pincode: "560078", capacity_kva: 400, location: { lat: 12.971500, lng: 77.598000 }, status: "HEALTHY", is_energized: true },
  { transformer_id: "DT-203", feeder_id: "FDR-101", name: "Transformer DT-203 (Jayanagar 7th Block)", pincode: "560078", capacity_kva: 250, location: { lat: 12.965000, lng: 77.592000 }, status: "HEALTHY", is_energized: true },
  { transformer_id: "DT-204", feeder_id: "FDR-101", name: "Transformer DT-204 (Jayanagar 9th Block)", pincode: "560078", capacity_kva: 400, location: { lat: 12.969000, lng: 77.601000 }, status: "HEALTHY", is_energized: true },
  { transformer_id: "DT-301", feeder_id: "FDR-102", name: "Transformer DT-301 (JP Nagar 2nd Phase)", pincode: "560078", capacity_kva: 250, location: { lat: 12.962000, lng: 77.589000 }, status: "HEALTHY", is_energized: true },
  { transformer_id: "DT-302", feeder_id: "FDR-102", name: "Transformer DT-302 (JP Nagar 3rd Phase)", pincode: "560078", capacity_kva: 250, location: { lat: 12.959000, lng: 77.592000 }, status: "HEALTHY", is_energized: true },
  { transformer_id: "DT-303", feeder_id: "FDR-102", name: "Transformer DT-303 (JP Nagar 6th Phase)", pincode: "560078", capacity_kva: 400, location: { lat: 12.956000, lng: 77.586000 }, status: "HEALTHY", is_energized: true },
  { transformer_id: "DT-401", feeder_id: "FDR-103", name: "Transformer DT-401 (BTM 1st Stage)", pincode: "560076", capacity_kva: 250, location: { lat: 12.975000, lng: 77.605000 }, status: "HEALTHY", is_energized: true },
  { transformer_id: "DT-402", feeder_id: "FDR-103", name: "Transformer DT-402 (BTM 2nd Stage)", pincode: "560076", capacity_kva: 400, location: { lat: 12.978000, lng: 77.608000 }, status: "HEALTHY", is_energized: true },
  { transformer_id: "DT-403", feeder_id: "FDR-103", name: "Transformer DT-403 (BTM MICO Layout)", pincode: "560076", capacity_kva: 250, location: { lat: 12.973000, lng: 77.611000 }, status: "HEALTHY", is_energized: true }
];

const poles = [];
transformers.forEach((dt) => {
  const baseLat = dt.location.lat;
  const baseLng = dt.location.lng;

  for (let i = 1; i <= 25; i++) {
    const poleId = `P-${dt.transformer_id.replace("DT-", "")}${i.toString().padStart(2, "0")}`;
    const latOffset = (i * 0.00035) + (Math.sin(i) * 0.00008);
    const lngOffset = (i * 0.00035) + (Math.cos(i) * 0.00008);
    const parentId = i === 1 ? null : `P-${dt.transformer_id.replace("DT-", "")}${(i - 1).toString().padStart(2, "0")}`;

    poles.push({
      pole_id: poleId,
      transformer_id: dt.transformer_id,
      parent_pole_id: parentId,
      location: { lat: baseLat + latOffset, lng: baseLng + lngOffset },
      pincode: dt.pincode,
      house_count: 5 + (i % 4),
      is_energized: true, // All poles 100% Green initially
      sensor_status: "ACTIVE", // Active healthy sensors
      is_topology_inferred: i % 2 !== 0
    });
  }
});

export const DEMO_GRID_DATA = {
  summary: {
    feeders_count: 3,
    transformers_count: 10,
    total_poles: 250,
    energized_poles: 250,
    dark_poles: 0,
    active_sensors: 250
  },
  feeders,
  transformers,
  poles
};

export const DEMO_TICKETS = [];
