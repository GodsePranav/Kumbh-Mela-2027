const DEFAULT_ROUTING_URL = 'https://router.project-osrm.org/route/v1/driving';
const ROUTING_TIMEOUT_MS = Number(process.env.ROUTING_TIMEOUT_MS) || 8000;

async function calculateRoute(origin, destination) {
  try {
    if (!Array.isArray(origin) || !Array.isArray(destination) || origin.length < 2 || destination.length < 2) return { available: false, reason: 'Invalid coordinates' };
    const [lat1, lng1] = origin.map(Number);
    const [lat2, lng2] = destination.map(Number);
    if (![lat1, lng1, lat2, lng2].every(Number.isFinite) || Math.abs(lat1) > 90 || Math.abs(lat2) > 90 || Math.abs(lng1) > 180 || Math.abs(lng2) > 180) return { available: false, reason: 'Invalid coordinates' };
    const baseUrl = process.env.ROUTING_SERVICE_URL || DEFAULT_ROUTING_URL;
    const url = `${baseUrl}/${lng1},${lat1};${lng2},${lat2}?overview=full&geometries=geojson&steps=false`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ROUTING_TIMEOUT_MS);
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) return { available: false, reason: `Routing service returned ${response.status}` };
      const body = await response.json();
      const route = body.routes?.[0];
      const coords = route?.geometry?.coordinates;
      if (body.code !== 'Ok' || !Array.isArray(coords) || coords.length < 2 || !Number.isFinite(route.duration) || !Number.isFinite(route.distance)) return { available: false, reason: body.message || 'No route available' };
      return { available: true, distanceMeters: Math.round(route.distance), durationSeconds: Math.round(route.duration), durationFormatted: `${Math.ceil(route.duration / 60)} min`, routeCoordinates: coords.map(([lng, lat]) => [lat, lng]) };
    } finally {
      clearTimeout(timer);
    }
  } catch (err) {
    return { available: false, reason: err.name === 'AbortError' ? 'Routing timed out' : 'Routing temporarily unavailable' };
  }
}

module.exports = { calculateRoute };
