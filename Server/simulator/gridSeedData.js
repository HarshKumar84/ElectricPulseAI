const Feeder = require("../models/Feeder");
const Transformer = require("../models/Transformer");
const Pole = require("../models/Pole");
const { reconstructTransformerTopology } = require("../algorithms/topologyReconstructor");

async function seedInitialGridData() {
  const existingPolesCount = await Pole.countDocuments();
  if (existingPolesCount >= 200) {
    console.log(`⚡ Large Grid Seed Data already populated (${existingPolesCount} poles).`);
    return;
  }

  // Clear smaller old seed data if present
  if (existingPolesCount > 0 && existingPolesCount < 200) {
    console.log("🔄 Upgrading grid seed dataset to 3 Feeders, 10 Transformers, 250 Poles...");
    await Feeder.deleteMany({});
    await Transformer.deleteMany({});
    await Pole.deleteMany({});
  }

  console.log("🌱 Generating realistic electrical grid topology for Bangalore (3 Feeders, 10 Transformers, 250 Poles)...");

  // 1. Create 3 Feeders
  const feedersData = [
    { feeder_id: "FDR-101", name: "Jayanagar Main Feeder 11kV", substation_name: "Substation South 66kV", pincode: "560078", status: "ACTIVE" },
    { feeder_id: "FDR-102", name: "JP Nagar Feeder 11kV", substation_name: "Substation South 66kV", pincode: "560078", status: "ACTIVE" },
    { feeder_id: "FDR-103", name: "BTM Layout Feeder 11kV", substation_name: "Substation East 66kV", pincode: "560076", status: "ACTIVE" }
  ];
  const createdFeeders = await Feeder.insertMany(feedersData);

  // 2. Create 10 Transformers
  const transformersData = [
    // Feeder 1 Transformers
    { transformer_id: "DT-201", feeder_id: "FDR-101", name: "Transformer DT-201 (Jayanagar 4th Block)", pincode: "560078", capacity_kva: 250, location: { lat: 12.968214, lng: 77.594612 }, status: "HEALTHY", is_energized: true },
    { transformer_id: "DT-202", feeder_id: "FDR-101", name: "Transformer DT-202 (Jayanagar 5th Block)", pincode: "560078", capacity_kva: 400, location: { lat: 12.971500, lng: 77.598000 }, status: "HEALTHY", is_energized: true },
    { transformer_id: "DT-203", feeder_id: "FDR-101", name: "Transformer DT-203 (Jayanagar 7th Block)", pincode: "560078", capacity_kva: 250, location: { lat: 12.965000, lng: 77.592000 }, status: "HEALTHY", is_energized: true },
    { transformer_id: "DT-204", feeder_id: "FDR-101", name: "Transformer DT-204 (Jayanagar 9th Block)", pincode: "560078", capacity_kva: 400, location: { lat: 12.969000, lng: 77.601000 }, status: "HEALTHY", is_energized: true },

    // Feeder 2 Transformers
    { transformer_id: "DT-301", feeder_id: "FDR-102", name: "Transformer DT-301 (JP Nagar 2nd Phase)", pincode: "560078", capacity_kva: 250, location: { lat: 12.962000, lng: 77.589000 }, status: "HEALTHY", is_energized: true },
    { transformer_id: "DT-302", feeder_id: "FDR-102", name: "Transformer DT-302 (JP Nagar 3rd Phase)", pincode: "560078", capacity_kva: 250, location: { lat: 12.959000, lng: 77.592000 }, status: "HEALTHY", is_energized: true },
    { transformer_id: "DT-303", feeder_id: "FDR-102", name: "Transformer DT-303 (JP Nagar 6th Phase)", pincode: "560078", capacity_kva: 400, location: { lat: 12.956000, lng: 77.586000 }, status: "HEALTHY", is_energized: true },

    // Feeder 3 Transformers
    { transformer_id: "DT-401", feeder_id: "FDR-103", name: "Transformer DT-401 (BTM 1st Stage)", pincode: "560076", capacity_kva: 250, location: { lat: 12.975000, lng: 77.605000 }, status: "HEALTHY", is_energized: true },
    { transformer_id: "DT-402", feeder_id: "FDR-103", name: "Transformer DT-402 (BTM 2nd Stage)", pincode: "560076", capacity_kva: 400, location: { lat: 12.978000, lng: 77.608000 }, status: "HEALTHY", is_energized: true },
    { transformer_id: "DT-403", feeder_id: "FDR-103", name: "Transformer DT-403 (BTM MICO Layout)", pincode: "560076", capacity_kva: 250, location: { lat: 12.973000, lng: 77.611000 }, status: "HEALTHY", is_energized: true }
  ];
  const createdTransformers = await Transformer.insertMany(transformersData);

  // 3. Create 25 Poles per Transformer = 250 Electric Poles
  let allPolesToInsert = [];

  createdTransformers.forEach((dt) => {
    const baseLat = dt.location.lat;
    const baseLng = dt.location.lng;

    // Create 25 radial street poles per transformer
    for (let i = 1; i <= 25; i++) {
      const poleId = `P-${dt.transformer_id.replace("DT-", "")}${i.toString().padStart(2, "0")}`;
      
      // Calculate spatial offsets (~40-60 meters spacing along street vectors)
      const latOffset = (i * 0.00035) + (Math.sin(i) * 0.00008);
      const lngOffset = (i * 0.00035) + (Math.cos(i) * 0.00008);

      // Explicit parent for 40%, missing for 60%
      let parentId = null;
      let missingTopology = true;

      if (i === 1) {
        parentId = null; // Direct connection to Transformer root
        missingTopology = false;
      } else if (i % 2 === 0) {
        // Explicit parent for ~40%
        parentId = `P-${dt.transformer_id.replace("DT-", "")}${(i - 1).toString().padStart(2, "0")}`;
        missingTopology = false;
      }

      allPolesToInsert.push({
        pole_id: poleId,
        transformer_id: dt.transformer_id,
        feeder_id: dt.feeder_id,
        parent_pole_id: parentId,
        downstream_pole_ids: [],
        location: {
          lat: baseLat + latOffset,
          lng: baseLng + lngOffset
        },
        pincode: dt.pincode,
        house_count: 4 + (i % 5),
        is_energized: true,
        sensor_status: "ACTIVE",
        last_heartbeat: new Date(),
        is_topology_inferred: missingTopology
      });
    }
  });

  const insertedPoles = await Pole.insertMany(allPolesToInsert);

  // Reconstruct missing topology for all 250 poles using spatial distance inferencing
  for (const dt of createdTransformers) {
    const dtPoles = insertedPoles.filter(p => p.transformer_id === dt.transformer_id);
    const reconstructed = reconstructTransformerTopology(dt, dtPoles);
    for (const p of reconstructed) {
      await Pole.updateOne(
        { pole_id: p.pole_id },
        { 
          parent_pole_id: p.parent_pole_id, 
          downstream_pole_ids: p.downstream_pole_ids,
          sequence_order: p.sequence_order
        }
      );
    }
  }

  console.log(`✅ Realistic Grid Topology Seeded: ${createdFeeders.length} Feeders, ${createdTransformers.length} Transformers, ${insertedPoles.length} Electric Poles.`);
}

module.exports = { seedInitialGridData };
