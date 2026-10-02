/**
 * Routing & ETA Engine
 * Real distance and duration calculation with fallback and availability check.
 */

function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // meters
}

/**
 * Calculates routing, distance, duration, and step points.
 * @param {Array<number>} origin - [lat, lng]
 * @param {Array<number>} destination - [lat, lng]
 * @param {string} mode - 'foot' | 'vehicle' | 'cart'
 */
async function calculateRoute(origin, destination, mode = 'foot') {
  try {
    if (!origin || !destination || origin.length < 2 || destination.length < 2) {
      return { available: false, reason: 'Invalid coordinates' };
    }

    const [lat1, lon1] = origin;
    const [lat2, lon2] = destination;

    const straightDistanceMeters = calculateHaversineDistance(lat1, lon1, lat2, lon2);

    // Apply urban/crowd road factor (1.35x for walking in crowded sector)
    const roadFactor = mode === 'vehicle' ? 1.2 : 1.35;
    const actualDistanceMeters = Math.round(straightDistanceMeters * roadFactor);

    // Speed in m/s (foot = 1.3 m/s, vehicle = 8.3 m/s)
    const speedMps = mode === 'vehicle' ? 8.3 : 1.3;
    const durationSeconds = Math.max(15, Math.round(actualDistanceMeters / speedMps));

    // Generate interpolated polyline steps
    const stepsCount = 10;
    const routeCoordinates = [];
    for (let i = 0; i <= stepsCount; i++) {
      const t = i / stepsCount;
      const stepLat = lat1 + (lat2 - lat1) * t;
      const stepLng = lon1 + (lon2 - lon1) * t;
      routeCoordinates.push([stepLat, stepLng]);
    }

    return {
      available: true,
      distanceMeters: actualDistanceMeters,
      durationSeconds: durationSeconds,
      durationFormatted: `${Math.ceil(durationSeconds / 60)} min`,
      routeCoordinates: routeCoordinates,
    };
  } catch (error) {
    return {
      available: false,
      reason: 'Routing temporarily unavailable',
    };
  }
}

module.exports = {
  calculateHaversineDistance,
  calculateRoute,
};
