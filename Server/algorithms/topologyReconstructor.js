/**
 * Reconstructs missing radial tree topology for poles associated with transformers.
 * Uses Euclidean / Haversine spatial ordering from the Transformer root.
 */

function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 1000; // Meters
}

function reconstructTransformerTopology(transformer, poles) {
  if (!poles || poles.length === 0) return [];

  // Sort poles by distance from the transformer
  const polesWithDistance = poles.map((p) => ({
    pole: p,
    distFromRoot: calculateDistance(
      transformer.location.lat,
      transformer.location.lng,
      p.location.lat,
      p.location.lng
    )
  }));

  polesWithDistance.sort((a, b) => a.distFromRoot - b.distFromRoot);

  const orderedPoles = [];
  const processed = [];

  // First pole connects to Transformer (represented as parent_pole_id: null or Transformer ID)
  polesWithDistance.forEach((item, index) => {
    const currentPole = item.pole;
    
    if (index === 0) {
      currentPole.parent_pole_id = null; // Connected directly to transformer
      currentPole.sequence_order = 1;
    } else {
      // Find closest already-connected upstream pole
      let closestUpstream = processed[0];
      let minDistance = Infinity;

      for (const prev of processed) {
        const d = calculateDistance(
          prev.pole.location.lat,
          prev.pole.location.lng,
          currentPole.location.lat,
          currentPole.location.lng
        );
        if (d < minDistance) {
          minDistance = d;
          closestUpstream = prev;
        }
      }

      currentPole.parent_pole_id = closestUpstream.pole.pole_id;
      currentPole.sequence_order = index + 1;
      
      if (!closestUpstream.pole.downstream_pole_ids.includes(currentPole.pole_id)) {
        closestUpstream.pole.downstream_pole_ids.push(currentPole.pole_id);
      }
    }

    currentPole.is_topology_inferred = true;
    processed.push(item);
    orderedPoles.push(currentPole);
  });

  return orderedPoles;
}

module.exports = {
  calculateDistance,
  reconstructTransformerTopology
};
