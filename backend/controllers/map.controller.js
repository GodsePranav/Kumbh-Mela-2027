/**
 * Map Controller
 * Returns map markers, crowd data, and transport/parking info
 */

const { sendSuccess } = require('../utils/helpers');

// ── GET /api/v1/map/markers ───────────────────────────────────────────────────
const getMapMarkers = async (_req, res) => {
  const markers = [
    { id: 'm1', type: 'religious', name: 'Panchavati',     lat: 19.9982, lng: 73.7910, crowd: 'moderate' },
    { id: 'm2', type: 'ghat',      name: 'Ramkund',        lat: 19.9975, lng: 73.7898, crowd: 'high'     },
    { id: 'm3', type: 'temple',    name: 'Trimbakeshwar',  lat: 19.9312, lng: 73.5301, crowd: 'high'     },
    { id: 'm4', type: 'religious', name: 'Tapovan',        lat: 19.9910, lng: 73.8050, crowd: 'low'      },
    { id: 'm5', type: 'ghat',      name: 'Godavari Ghat',  lat: 19.9960, lng: 73.7882, crowd: 'critical' },
    { id: 'm6', type: 'hospital',  name: 'Civil Hospital', lat: 19.9998, lng: 73.7950, crowd: 'low'      },
    { id: 'm7', type: 'police',    name: 'Kumbh Police HQ',lat: 19.9970, lng: 73.7920, crowd: 'low'      },
    { id: 'm8', type: 'parking',   name: 'Zone A Parking', lat: 20.0010, lng: 73.7970, crowd: 'moderate' },
  ];
  return sendSuccess(_req.res || res, { markers });
};

// ── GET /api/v1/map/crowd ─────────────────────────────────────────────────────
const getCrowdData = async (_req, res) => {
  const crowd = [
    { zone: 'Ramkund Ghat',   level: 'high',     percent: 75,  lastUpdated: new Date() },
    { zone: 'Panchavati',     level: 'moderate', percent: 50,  lastUpdated: new Date() },
    { zone: 'Godavari Ghat',  level: 'critical', percent: 90,  lastUpdated: new Date() },
    { zone: 'Trimbakeshwar',  level: 'high',     percent: 80,  lastUpdated: new Date() },
    { zone: 'Tapovan',        level: 'low',      percent: 35,  lastUpdated: new Date() },
  ];
  return sendSuccess(res, { crowd });
};

// ── GET /api/v1/map/transport ─────────────────────────────────────────────────
const getTransportOptions = async (_req, res) => {
  const transport = [
    { id: 't1', type: 'Bus',     name: 'MSRTC Kumbh Special Bus',  from: 'Nashik Central Bus Stand', frequency: 'Every 15 min', fare: '₹20–50',    crowdLevel: 'moderate' },
    { id: 't2', type: 'Auto',    name: 'E-Rickshaw (Pre-Paid)',    from: 'Railway Station',           frequency: '6AM–10PM',     fare: '₹30 fixed', crowdLevel: 'low'      },
    { id: 't3', type: 'Train',   name: 'Nashik Road Railway',      from: '8 km from Ramkund',         frequency: 'Multiple daily', fare: 'Varies',  crowdLevel: 'high'     },
    { id: 't4', type: 'Shuttle', name: 'Kumbh Mela Shuttle',       from: 'Parking Zones A–F',         frequency: 'Continuous',   fare: '₹10',       crowdLevel: 'moderate' },
  ];
  return sendSuccess(res, { transport });
};

// ── GET /api/v1/map/parking ───────────────────────────────────────────────────
const getParkingZones = async (_req, res) => {
  const parking = [
    { id: 'park1', name: 'Zone A – Near Railway Station', capacity: 2000, available: 342,  distance: '2.1 km', fare: '₹50/day', shuttle: true  },
    { id: 'park2', name: 'Zone B – Nashik Road',          capacity: 3500, available: 891,  distance: '3.5 km', fare: '₹50/day', shuttle: true  },
    { id: 'park3', name: 'Zone C – Deolali Camp',         capacity: 5000, available: 2140, distance: '8 km',   fare: '₹50/day', shuttle: true  },
    { id: 'park4', name: 'Two-Wheeler – Panchavati',      capacity: 4000, available: 780,  distance: '0.5 km', fare: '₹20/day', shuttle: false },
  ];
  return sendSuccess(res, { parking });
};

module.exports = { getMapMarkers, getCrowdData, getTransportOptions, getParkingZones };
