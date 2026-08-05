export const DEMO_GRID_DATA = {
  summary: {
    feeders_count: 2,
    transformers_count: 3,
    total_poles: 30,
    energized_poles: 22,
    dark_poles: 8,
    active_sensors: 29
  },
  feeders: [
    { feeder_id: "FDR-101", name: "Jayanagar Main Feeder 11kV", status: "ACTIVE", pincode: "560078" },
    { feeder_id: "FDR-102", name: "JP Nagar Feeder 11kV", status: "ACTIVE", pincode: "560078" }
  ],
  transformers: [
    {
      transformer_id: "DT-201",
      feeder_id: "FDR-101",
      name: "Transformer DT-201 (Jayanagar 4th Block)",
      pincode: "560078",
      capacity_kva: 250,
      location: { lat: 12.968214, lng: 77.594612 },
      status: "HEALTHY",
      is_energized: true
    },
    {
      transformer_id: "DT-202",
      feeder_id: "FDR-101",
      name: "Transformer DT-202 (Jayanagar 5th Block)",
      pincode: "560078",
      capacity_kva: 400,
      location: { lat: 12.971500, lng: 77.598000 },
      status: "HEALTHY",
      is_energized: true
    },
    {
      transformer_id: "DT-301",
      feeder_id: "FDR-102",
      name: "Transformer DT-301 (JP Nagar 2nd Phase)",
      pincode: "560078",
      capacity_kva: 250,
      location: { lat: 12.962000, lng: 77.589000 },
      status: "HEALTHY",
      is_energized: true
    }
  ],
  poles: [
    // DT-201 Chain
    { pole_id: "P-20101", transformer_id: "DT-201", parent_pole_id: null, location: { lat: 12.96866, lng: 77.59506 }, pincode: "560078", house_count: 6, is_energized: true, sensor_status: "ACTIVE" },
    { pole_id: "P-20102", transformer_id: "DT-201", parent_pole_id: "P-20101", location: { lat: 12.96911, lng: 77.59551 }, pincode: "560078", house_count: 5, is_energized: true, sensor_status: "ACTIVE" },
    // Broken span occurs here: P-20102 (Live) -> P-20103 (Dark)
    { pole_id: "P-20103", transformer_id: "DT-201", parent_pole_id: "P-20102", location: { lat: 12.96956, lng: 77.59596 }, pincode: "560078", house_count: 7, is_energized: false, sensor_status: "ACTIVE" },
    { pole_id: "P-20104", transformer_id: "DT-201", parent_pole_id: "P-20103", location: { lat: 12.97001, lng: 77.59641 }, pincode: "560078", house_count: 6, is_energized: false, sensor_status: "ACTIVE" },
    { pole_id: "P-20105", transformer_id: "DT-201", parent_pole_id: "P-20104", location: { lat: 12.97046, lng: 77.59686 }, pincode: "560078", house_count: 4, is_energized: false, sensor_status: "ACTIVE" },
    { pole_id: "P-20106", transformer_id: "DT-201", parent_pole_id: "P-20105", location: { lat: 12.97091, lng: 77.59731 }, pincode: "560078", house_count: 8, is_energized: false, sensor_status: "ACTIVE" },
    { pole_id: "P-20107", transformer_id: "DT-201", parent_pole_id: "P-20106", location: { lat: 12.97136, lng: 77.59776 }, pincode: "560078", house_count: 5, is_energized: false, sensor_status: "ACTIVE" },
    { pole_id: "P-20108", transformer_id: "DT-201", parent_pole_id: "P-20107", location: { lat: 12.97181, lng: 77.59821 }, pincode: "560078", house_count: 6, is_energized: false, sensor_status: "ACTIVE" },
    { pole_id: "P-20109", transformer_id: "DT-201", parent_pole_id: "P-20108", location: { lat: 12.97226, lng: 77.59866 }, pincode: "560078", house_count: 4, is_energized: false, sensor_status: "ACTIVE" },
    { pole_id: "P-20110", transformer_id: "DT-201", parent_pole_id: "P-20109", location: { lat: 12.97271, lng: 77.59911 }, pincode: "560078", house_count: 2, is_energized: false, sensor_status: "ACTIVE" },

    // DT-202 Chain (Fully Live)
    { pole_id: "P-20201", transformer_id: "DT-202", parent_pole_id: null, location: { lat: 12.97195, lng: 77.59845 }, pincode: "560078", house_count: 6, is_energized: true, sensor_status: "ACTIVE" },
    { pole_id: "P-20202", transformer_id: "DT-202", parent_pole_id: "P-20201", location: { lat: 12.97240, lng: 77.59890 }, pincode: "560078", house_count: 5, is_energized: true, sensor_status: "ACTIVE" },
    { pole_id: "P-20203", transformer_id: "DT-202", parent_pole_id: "P-20202", location: { lat: 12.97285, lng: 77.59935 }, pincode: "560078", house_count: 7, is_energized: true, sensor_status: "ACTIVE" },
    { pole_id: "P-20204", transformer_id: "DT-202", parent_pole_id: "P-20203", location: { lat: 12.97330, lng: 77.59980 }, pincode: "560078", house_count: 6, is_energized: true, sensor_status: "ACTIVE" },
    { pole_id: "P-20205", transformer_id: "DT-202", parent_pole_id: "P-20204", location: { lat: 12.97375, lng: 77.60025 }, pincode: "560078", house_count: 4, is_energized: true, sensor_status: "ACTIVE" },

    // DT-301 Chain (Fully Live)
    { pole_id: "P-30101", transformer_id: "DT-301", parent_pole_id: null, location: { lat: 12.96245, lng: 77.58945 }, pincode: "560078", house_count: 6, is_energized: true, sensor_status: "ACTIVE" },
    { pole_id: "P-30102", transformer_id: "DT-301", parent_pole_id: "P-30101", location: { lat: 12.96290, lng: 77.58990 }, pincode: "560078", house_count: 5, is_energized: true, sensor_status: "ACTIVE" },
    { pole_id: "P-30103", transformer_id: "DT-301", parent_pole_id: "P-30102", location: { lat: 12.96335, lng: 77.59035 }, pincode: "560078", house_count: 7, is_energized: true, sensor_status: "ACTIVE" },
    { pole_id: "P-30104", transformer_id: "DT-301", parent_pole_id: "P-30103", location: { lat: 12.96380, lng: 77.59080 }, pincode: "560078", house_count: 6, is_energized: true, sensor_status: "ACTIVE" },
    { pole_id: "P-30105", transformer_id: "DT-301", parent_pole_id: "P-30104", location: { lat: 12.96425, lng: 77.59125 }, pincode: "560078", house_count: 4, is_energized: true, sensor_status: "ACTIVE" }
  ]
};

export const DEMO_TICKETS = [
  {
    ticket_id: "TICK-1001",
    fault_type: "SPAN_FAULT",
    title: "Line Break between Pole P-20102 and Pole P-20103",
    description: "Broken wire localized between Pole P-20102 (Last Live) and Pole P-20103 (First Dark). 8 downstream poles dark.",
    status: "DETECTED",
    severity: "HIGH",
    from_pole_id: "P-20102",
    to_pole_id: "P-20103",
    transformer_id: "DT-201",
    feeder_id: "FDR-101",
    lat: 12.969335,
    lng: 77.595735,
    pincode: "560078",
    affected_poles: ["P-20103", "P-20104", "P-20105", "P-20106", "P-20107", "P-20108", "P-20109", "P-20110"],
    affected_houses: 42,
    ai_summary: "AI INCIDENT BRIEF: Line break detected between Pole P-20102 (Live) and Pole P-20103 (Dark). GPS: 12.969335, 77.595735 (PIN: 560078). Total 42 houses affected. Field crew dispatch recommended immediately.",
    createdAt: new Date().toISOString()
  }
];
