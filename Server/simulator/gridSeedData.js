const Feeder = require("../models/Feeder");
const Transformer = require("../models/Transformer");
const Pole = require("../models/Pole");
const { reconstructTransformerTopology } = require("../algorithms/topologyReconstructor");

async function seedInitialGridData() {
  const existingFeeders = await Feeder.countDocuments();
  if (existingFeeders > 0) {
    console.log("⚡ Grid seed data already populated.");
    return;
  }

  console.log("🌱 Seeding initial electrical grid topology for Bangalore (PIN 560078)...");

  // 1. Create Feeders
  const feeder1 = await Feeder.create({
    feeder_id: "FDR-101",
    name: "Jayanagar Main Feeder 11kV",
    substation_name: "Substation South 66kV",
    pincode: "560078",
    status: "ACTIVE"
  });

  const feeder2 = await Feeder.create({
    feeder_id: "FDR-102",
    name: "JP Nagar Feeder 11kV",
    substation_name: "Substation South 66kV",
    pincode: "560078",
    status: "ACTIVE"
  });

  // 2. Create Transformers
  const transformersData = [
    {
      transformer_id: "DT-201",
      feeder_id: feeder1.feeder_id,
      name: "Transformer DT-201 (Jayanagar 4th Block)",
      pincode: "560078",
      capacity_kva: 250,
      location: { lat: 12.968214, lng: 77.594612 },
      status: "HEALTHY",
      is_energized: true
    },
    {
      transformer_id: "DT-202",
      feeder_id: feeder1.feeder_id,
      name: "Transformer DT-202 (Jayanagar 5th Block)",
      pincode: "560078",
      capacity_kva: 400,
      location: { lat: 12.971500, lng: 77.598000 },
      status: "HEALTHY",
      is_energized: true
    },
    {
      transformer_id: "DT-301",
      feeder_id: feeder2.feeder_id,
      name: "Transformer DT-301 (JP Nagar 2nd Phase)",
      pincode: "560078",
      capacity_kva: 250,
      location: { lat: 12.962000, lng: 77.589000 },
      status: "HEALTHY",
      is_energized: true
    }
  ];

  const createdTransformers = await Transformer.insertMany(transformersData);

  // 3. Create Poles under Transformers (incorporating 60% missing explicit parent connections)
  let allPolesToInsert = [];

  createdTransformers.forEach((dt) => {
    const baseLat = dt.location.lat;
    const baseLng = dt.location.lng;

    // Create a radial chain of 10 poles per transformer
    for (let i = 1; i <= 10; i++) {
      const poleId = `P-${dt.transformer_id.replace("DT-", "")}${i.toString().padStart(2, "0")}`;
      
      // Calculate spatial offsets (~50 meters spacing)
      const latOffset = (i * 0.00045) + (Math.random() * 0.00005);
      const lngOffset = (i * 0.00045) + (Math.random() * 0.00005);

      // Explicit parent for 40%, missing for 60%
      let parentId = null;
      let missingTopology = true;

      if (i === 1) {
        parentId = null; // Direct connection to DT
        missingTopology = false;
      } else if (i % 2 === 0) {
        // Explicitly set parent for some
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
        house_count: 5 + (i % 4),
        is_energized: true,
        sensor_status: "ACTIVE",
        last_heartbeat: new Date(),
        is_topology_inferred: missingTopology
      });
    }
  });

  const insertedPoles = await Pole.insertMany(allPolesToInsert);

  // Reconstruct missing topology using distance inferencing algorithm
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

  console.log(`✅ Electrical grid initialized: ${createdTransformers.length} Transformers, ${insertedPoles.length} Poles.`);
}

module.exports = { seedInitialGridData };
