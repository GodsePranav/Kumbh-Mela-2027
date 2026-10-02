const crypto = require('crypto');
const SosRequest = require('../models/SosRequest.model');
const VolunteerProfile = require('../models/VolunteerProfile.model');
const { calculateRoute } = require('../utils/routing');

const OPEN_STATES = ['CREATED', 'BROADCASTING'];
const ACTIVE_STATES = ['CREATED', 'BROADCASTING', 'ACKNOWLEDGED', 'ACCEPTED', 'RESPONDER_ASSIGNED', 'EN_ROUTE', 'NEARBY', 'ARRIVED', 'ASSISTING', 'ESCALATED'];
const RADIUS_METERS = Number(process.env.SOS_SEARCH_RADIUS_METERS) || 10000;
const FRESH_MS = Number(process.env.SOS_LOCATION_FRESH_MS) || 120000;
const SOS_SEARCH_TIMEOUT_MS = Number(process.env.SOS_SEARCH_TIMEOUT_MS) || 30 * 60 * 1000;
const TRANSITIONS = {
  ACCEPTED: ['EN_ROUTE', 'CANCELLED'], EN_ROUTE: ['NEARBY', 'ARRIVED', 'CANCELLED'],
  NEARBY: ['ARRIVED', 'ASSISTING', 'CANCELLED'], ARRIVED: ['ASSISTING', 'RESOLVED'],
  ASSISTING: ['RESOLVED'],
};
const idOf = (value) => String(value?._id || value);
const validCoordinates = (lat, lng) => Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
const privateResponse = (sos) => sos.toObject ? sos.toObject() : sos;
const adminResponse = (sos) => {
  const safe = { ...sos };
  const coordinates = safe.location?.coordinates;
  if (Array.isArray(coordinates) && coordinates.length === 2) {
    safe.location = { type: 'Point', coordinates: coordinates.map((coordinate) => Math.round(Number(coordinate) * 100) / 100) };
  }
  delete safe.locationText;
  delete safe.userName;
  delete safe.userPhone;
  delete safe.responderName;
  delete safe.responderPhone;
  delete safe.responderBadge;
  delete safe.responderLocation;
  delete safe.responderLocationAccuracy;
  delete safe.responderLocationUpdatedAt;
  delete safe.routeCoordinates;
  return safe;
};
const emitTo = (req, event, data, userIds) => {
  const io = req.app.get('io');
  if (!io) return;
  [...new Set(userIds.filter(Boolean).map(idOf))].forEach((id) => io.to(`user:${id}`).emit(event, data));
};
const error = (res, status, message) => res.status(status).json({ success: false, message });
const distanceMeters = (aLat, aLng, bLat, bLng) => { const rad = (value) => value * Math.PI / 180; const dLat = rad(bLat-aLat); const dLng = rad(bLng-aLng); const a = Math.sin(dLat/2)**2 + Math.cos(rad(aLat))*Math.cos(rad(bLat))*Math.sin(dLng/2)**2; return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); };
const validCaptureTime = (value) => { if (value == null || value === '') return false; const time = new Date(value).getTime(); return Number.isFinite(time) && time <= Date.now() + 30000 && Date.now() - time <= 120000; };

exports.createSos = async (req, res) => {
  try {
    const { category = 'sos', location, accuracy, timestamp, message } = req.body || {};
    const [lng, lat] = location?.coordinates || [];
    if (!validCoordinates(lat, lng)) return error(res, 400, 'A valid current GPS location is required to send SOS.');
    if (accuracy != null && (!Number.isFinite(Number(accuracy)) || Number(accuracy) < 0 || Number(accuracy) > 500)) return error(res, 400, 'GPS accuracy is too low. Please retry with a stronger signal.');
    if (!validCaptureTime(timestamp)) return error(res, 400, 'GPS fix is stale. Please refresh your location and retry.');
    const userId = req.user._id;
    const searchExpiredBefore = new Date(Date.now() - SOS_SEARCH_TIMEOUT_MS);
    await SosRequest.updateMany({ user: userId, status: { $in: OPEN_STATES }, createdAt: { $lt: searchExpiredBefore } }, { $set: { status: 'EXPIRED', completedAt: new Date() }, $unset: { activeUser: 1 }, $push: { statusHistory: { status: 'EXPIRED', notes: 'Volunteer search window expired.' } } });
    const active = await SosRequest.findOne({ user: userId, status: { $in: ACTIVE_STATES } }).select('sosId');
    if (active) return error(res, 409, 'You already have an active SOS request.');
    const sosId = `SOS-${new Date().getUTCFullYear()}-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;
    const sos = await SosRequest.create({
      sosId, user: userId, activeUser: userId, userName: req.user.name, userPhone: req.user.mobile,
      category: ['medical', 'fire', 'missing_person', 'crowd_crush', 'accident', 'crime', 'other', 'sos'].includes(category) ? category : 'other',
      priority: 'P0', location: { type: 'Point', coordinates: [lng, lat] }, locationAccuracy: accuracy || null,
      locationCapturedAt: timestamp ? new Date(timestamp) : new Date(), status: 'BROADCASTING',
      statusHistory: [
        { status: 'CREATED', actorId: userId, actorRole: req.user.role, notes: message || 'Emergency request created.' },
        { status: 'BROADCASTING', actorId: userId, actorRole: req.user.role, notes: 'Searching for nearby eligible volunteers.' },
      ],
    });
        try {
      const eligible = await VolunteerProfile.find({
        dutyStatus: 'ON_DUTY', emergencyEligibility: true,
        lastLocationUpdate: { $gte: new Date(Date.now() - FRESH_MS) },
        location: { $near: { $geometry: { type: 'Point', coordinates: [lng, lat] }, $maxDistance: RADIUS_METERS } },
      }).select('user').populate({ path: 'user', match: { isVerified: true, isActive: true }, select: '_id' }).lean();
      const volunteerIds = eligible.filter((item) => item.user).map((item) => item.user._id);
      if (volunteerIds.length) {
        await SosRequest.updateOne({ _id: sos._id }, { $addToSet: { notifiedVolunteers: { $each: volunteerIds } } });
        emitTo(req, 'sos-broadcast', { sosId, category: sos.category, priority: sos.priority, createdAt: sos.createdAt }, volunteerIds);
      }
    } catch (notifyError) {
      console.warn('SOS notification fanout failed; polling remains available:', notifyError.message);
    }
    return res.status(201).json({ success: true, data: privateResponse(sos), message: 'SOS created. Searching for nearby volunteers.' });
  } catch (err) {
    if (err.code === 11000) return error(res, 409, 'You already have an active SOS request.');
    console.error('SOS create failed:', err.message);
    return error(res, 503, 'SOS could not be saved. Check the connection and try again.');
  }
};

exports.getActiveSos = async (req, res) => {
  try {
    const searchExpiredBefore = new Date(Date.now() - SOS_SEARCH_TIMEOUT_MS);
    await SosRequest.updateMany({ status: { $in: OPEN_STATES }, createdAt: { $lt: searchExpiredBefore } }, { $set: { status: 'EXPIRED', completedAt: new Date() }, $unset: { activeUser: 1 }, $push: { statusHistory: { status: 'EXPIRED', notes: 'Volunteer search window expired.' } } });
    if (['admin', 'supervisor', 'zone_manager'].includes(req.user.role)) {
      const incidents = await SosRequest.find({ status: { $in: ACTIVE_STATES } }).sort({ createdAt: -1 }).limit(100).lean();
      return res.json({ success: true, data: incidents.map(adminResponse) });
    }    if (!req.user.isVerified) return res.json({ success: true, data: [] });
    const profile = await VolunteerProfile.findOne({ user: req.user._id }).lean();
    if (!profile || profile.dutyStatus !== 'ON_DUTY' || !profile.lastLocationUpdate || Date.now() - new Date(profile.lastLocationUpdate).getTime() > FRESH_MS) return res.json({ success: true, data: [] });
    const [lng, lat] = profile.location?.coordinates || [];
    if (!validCoordinates(lat, lng)) return res.json({ success: true, data: [] });
    const requests = await SosRequest.find({
      status: { $in: OPEN_STATES }, createdAt: { $gte: new Date(Date.now() - SOS_SEARCH_TIMEOUT_MS) }, rejectedBy: { $not: { $elemMatch: { volunteerId: req.user._id } } },
      location: { $near: { $geometry: { type: 'Point', coordinates: [lng, lat] }, $maxDistance: RADIUS_METERS } },
    }).sort({ createdAt: -1 }).limit(30).lean();
    const ids = requests.map((s) => s._id);
    if (ids.length) await SosRequest.updateMany({ _id: { $in: ids } }, { $addToSet: { notifiedVolunteers: req.user._id } });
    const data = requests.map((s) => {
      const dx = (s.location.coordinates[0] - lng) * 111320 * Math.cos(lat * Math.PI / 180);
      const dy = (s.location.coordinates[1] - lat) * 110540;
      return { sosId: s.sosId, category: s.category, priority: s.priority, status: s.status, createdAt: s.createdAt, approximateDistanceMeters: Math.round(Math.hypot(dx, dy) / 100) * 100 };
    });
    return res.json({ success: true, data });
  } catch (err) {
    console.error('SOS listing failed:', err.message);
    return error(res, 503, 'SOS requests are temporarily unavailable.');
  }
};

exports.acceptSos = async (req, res) => {
  const volunteerId = req.user._id;
  let profile;
  try {
    if (!req.user.isVerified) return error(res, 403, 'Volunteer verification is required to accept emergencies.');
    const candidate = await SosRequest.findOne({ sosId: req.params.sosId, status: { $in: OPEN_STATES }, assignedResponder: { $exists: false }, notifiedVolunteers: volunteerId }).select('location');
    if (!candidate) return error(res, 409, 'This SOS is no longer available.');
    const profileBeforeClaim = await VolunteerProfile.findOne({ user: volunteerId, dutyStatus: 'ON_DUTY', emergencyEligibility: true, lastLocationUpdate: { $gte: new Date(Date.now() - FRESH_MS) } }).lean();
    const [lng, lat] = profileBeforeClaim?.location?.coordinates || [];
    if (!validCoordinates(lat, lng)) return error(res, 409, 'A recent GPS location is required to respond.');
    const distance = distanceMeters(lat, lng, candidate.location.coordinates[1], candidate.location.coordinates[0]);
    if (distance > RADIUS_METERS) return error(res, 403, 'This request is outside your response area.');
    profile = await VolunteerProfile.findOneAndUpdate({ user: volunteerId, dutyStatus: 'ON_DUTY', emergencyEligibility: true, lastLocationUpdate: { $gte: new Date(Date.now() - FRESH_MS) } }, { $set: { dutyStatus: 'RESPONDING' } }, { new: true });
    if (!profile) return error(res, 409, 'Your duty status changed. Refresh and try again.');
    const sos = await SosRequest.findOneAndUpdate(
      { sosId: req.params.sosId, status: { $in: OPEN_STATES }, assignedResponder: { $exists: false }, notifiedVolunteers: volunteerId },
      { $set: { status: 'ACCEPTED', assignedResponder: volunteerId, responderName: req.user.name, responderPhone: req.user.mobile, acceptedAt: new Date(), responderLocation: profile.location, responderLocationUpdatedAt: profile.lastLocationUpdate }, $push: { statusHistory: { status: 'ACCEPTED', actorId: volunteerId, actorRole: 'volunteer', notes: 'Volunteer accepted the request.' } } },
      { new: true, runValidators: true }
    );
    if (!sos) {
      await VolunteerProfile.updateOne({ _id: profile._id, dutyStatus: 'RESPONDING' }, { $set: { dutyStatus: 'ON_DUTY' } });
      return error(res, 409, 'This SOS was accepted by another volunteer.');
    }
    emitTo(req, 'sos-accepted', privateResponse(sos), [sos.user, volunteerId]);
    emitTo(req, 'sos-status-updated', { sosId: sos.sosId, status: sos.status }, [sos.user, volunteerId]);
    return res.json({ success: true, data: privateResponse(sos) });
  } catch (err) {
    if (profile) await VolunteerProfile.updateOne({ _id: profile._id, dutyStatus: 'RESPONDING' }, { $set: { dutyStatus: 'ON_DUTY' } }).catch(() => {});
    console.error('SOS accept failed:', err.message);
    return error(res, 503, 'The request could not be accepted. Please retry.');
  }
};
exports.rejectSos = async (req, res) => {
  try {
    if (!req.user.isVerified) return error(res, 403, 'Volunteer verification is required to respond to emergencies.');
    const sos = await SosRequest.findOneAndUpdate(
      { sosId: req.params.sosId, status: { $in: OPEN_STATES }, assignedResponder: { $exists: false }, notifiedVolunteers: req.user._id },
      { $addToSet: { rejectedBy: { volunteerId: req.user._id, timestamp: new Date(), reason: String(req.body?.reason || '').slice(0, 240) } } },
      { new: true }
    );
    if (!sos) return error(res, 404, 'SOS request not found or no longer available to you.');
    return res.json({ success: true, message: 'Response recorded.' });
  } catch (err) {
    return error(res, 503, 'Could not record response.');
  }
};

exports.updateResponderLocation = async (req, res) => {
  try {
    const { lat, lng, accuracy, timestamp } = req.body || {};
    if (!req.user.isVerified) return error(res, 403, 'Volunteer verification is required.');
    if (!validCoordinates(Number(lat), Number(lng))) return error(res, 400, 'Valid GPS coordinates are required.');
    if (accuracy != null && (!Number.isFinite(Number(accuracy)) || Number(accuracy) < 0 || Number(accuracy) > 500)) return error(res, 400, 'GPS accuracy is too low.');
    if (!validCaptureTime(timestamp)) return error(res, 400, 'GPS fix is stale.');
    const sos = await SosRequest.findOne({ sosId: req.params.sosId, assignedResponder: req.user._id, status: { $in: ACTIVE_STATES } });
    if (!sos) return error(res, 404, 'Active SOS assignment not found.');
    const point = { type: 'Point', coordinates: [Number(lng), Number(lat)] };
    const capturedAt = timestamp ? new Date(timestamp) : new Date();
    await Promise.all([
      VolunteerProfile.updateOne({ user: req.user._id }, { $set: { location: point, lastLocationUpdate: capturedAt, locationAccuracy: Number(accuracy) || null } }),
      SosRequest.updateOne({ _id: sos._id }, { $set: { responderLocation: point, responderLocationUpdatedAt: capturedAt, responderLocationAccuracy: Number(accuracy) || null } }),
    ]);
    const route = await calculateRoute([Number(lat), Number(lng)], [sos.location.coordinates[1], sos.location.coordinates[0]], 'vehicle');
    const update = { sosId: sos.sosId, status: sos.status, responderLocation: point, responderLocationUpdatedAt: capturedAt, routeAvailable: !!route.available };
    if (route.available) {
      update.etaSeconds = route.durationSeconds;
      update.distanceMeters = route.distanceMeters;
      update.routeCoordinates = route.routeCoordinates;
      await SosRequest.updateOne({ _id: sos._id }, { $set: { etaSeconds: route.durationSeconds, distanceMeters: route.distanceMeters, routeCoordinates: route.routeCoordinates } });
    } else {
      update.etaSeconds = sos.etaSeconds;
      update.distanceMeters = sos.distanceMeters;
    }
    emitTo(req, 'sos-responder-location', update, [sos.user, req.user._id]);
    return res.json({ success: true, data: update });
  } catch (err) {
    console.error('SOS location update failed:', err.message);
    return error(res, 503, 'Location update failed.');
  }
};

exports.updateSosStatus = async (req, res) => {
  try {
    const { status, notes } = req.body || {};
    if (!['EN_ROUTE', 'NEARBY', 'ARRIVED', 'ASSISTING', 'RESOLVED'].includes(status)) return error(res, 400, 'Unsupported SOS status.');
    const query = { sosId: req.params.sosId, assignedResponder: req.user._id, status: { $in: Object.keys(TRANSITIONS) } };
    const current = await SosRequest.findOne(query);
    if (!current) return error(res, 404, 'Assigned SOS request not found.');
    if (!TRANSITIONS[current.status]?.includes(status)) return error(res, 409, `Cannot move SOS from ${current.status} to ${status}.`);
    const update = { status, ...(status === 'RESOLVED' ? { resolvedAt: new Date(), completedAt: new Date(), resolutionNotes: String(notes || '').slice(0, 500), assignedResponder: null } : {}) };
    const sos = await SosRequest.findOneAndUpdate({ _id: current._id, status: current.status, assignedResponder: req.user._id }, { $set: update, ...(status === 'RESOLVED' ? { $unset: { activeUser: 1 } } : {}), $push: { statusHistory: { status, actorId: req.user._id, actorRole: 'volunteer', notes: String(notes || '').slice(0, 500) } } }, { new: true });
    if (!sos) return error(res, 409, 'SOS status changed. Refresh and retry.');
    if (status === 'RESOLVED') await VolunteerProfile.updateOne({ user: req.user._id, dutyStatus: 'RESPONDING' }, { $set: { dutyStatus: 'ON_DUTY' } });
    emitTo(req, 'sos-status-updated', { sosId: sos.sosId, status: sos.status, completedAt: sos.resolvedAt }, [sos.user, req.user._id]);
    return res.json({ success: true, data: privateResponse(sos) });
  } catch (err) {
    return error(res, 503, 'Could not update SOS status.');
  }
};

exports.cancelSos = async (req, res) => {
  try {
    const current = await SosRequest.findOne({ sosId: req.params.sosId, user: req.user._id, status: { $in: ACTIVE_STATES } }).select('assignedResponder');
    if (!current) return error(res, 404, 'Active SOS not found.');
    const responderId = current.assignedResponder;
    const sos = await SosRequest.findOneAndUpdate({ sosId: req.params.sosId, user: req.user._id, status: { $in: ACTIVE_STATES } }, { $set: { status: 'CANCELLED', cancelledAt: new Date(), assignedResponder: null }, $unset: { activeUser: 1 }, $push: { statusHistory: { status: 'CANCELLED', actorId: req.user._id, actorRole: 'user', notes: 'Cancelled by the user.' } } }, { new: true });
    if (!sos) return error(res, 404, 'Active SOS not found.');
    if (responderId) await VolunteerProfile.updateOne({ user: responderId, dutyStatus: 'RESPONDING' }, { $set: { dutyStatus: 'ON_DUTY' } });
    emitTo(req, 'sos-status-updated', { sosId: sos.sosId, status: sos.status }, [sos.user, responderId]);
    return res.json({ success: true, data: privateResponse(sos) });
  } catch (err) {
    return error(res, 503, 'Could not cancel SOS.');
  }
};


exports.updateVolunteerLocation = async (req, res) => {
  try {
    const { lat, lng, accuracy, timestamp } = req.body || {};
    if (!req.user.isVerified) return error(res, 403, 'Volunteer verification is required.');
    if (!validCoordinates(Number(lat), Number(lng))) return error(res, 400, 'Valid GPS coordinates are required.');
    if (accuracy != null && (!Number.isFinite(Number(accuracy)) || Number(accuracy) < 0 || Number(accuracy) > 500)) return error(res, 400, 'GPS accuracy is too low.');
    if (!validCaptureTime(timestamp)) return error(res, 400, 'GPS fix is stale.');
    const profile = await VolunteerProfile.findOneAndUpdate({ user: req.user._id }, { $set: { location: { type: 'Point', coordinates: [Number(lng), Number(lat)] }, lastLocationUpdate: timestamp ? new Date(timestamp) : new Date(), locationAccuracy: Number(accuracy) || null } }, { new: true });
    if (!profile) return error(res, 404, 'Volunteer profile not found.');
    return res.json({ success: true, data: { updatedAt: profile.lastLocationUpdate } });
  } catch (err) {
    return error(res, 503, 'Volunteer location could not be updated.');
  }
};


exports.getVolunteerDuty = async (req, res) => {
  try {
    const profile = await VolunteerProfile.findOne({ user: req.user._id }).select('dutyStatus lastLocationUpdate').lean();
    if (!profile) return error(res, 404, 'Volunteer profile not found.');
    return res.json({ success: true, data: profile });
  } catch (err) {
    return error(res, 503, 'Volunteer status is temporarily unavailable.');
  }
};exports.updateVolunteerDuty = async (req, res) => {
  try {
    const { dutyStatus } = req.body || {};
    if (!req.user.isVerified) return error(res, 403, 'Volunteer verification is required.');
    if (!['OFF_DUTY', 'ON_DUTY', 'BREAK'].includes(dutyStatus)) return error(res, 400, 'Invalid duty status.');
    const profile = await VolunteerProfile.findOne({ user: req.user._id });
    if (!profile) return error(res, 404, 'Volunteer profile not found.');
    if (profile.dutyStatus === 'RESPONDING' && dutyStatus !== 'RESPONDING') return error(res, 409, 'Complete or cancel the active response before changing duty status.');
    profile.dutyStatus = dutyStatus;
    await profile.save();
    return res.json({ success: true, data: { dutyStatus: profile.dutyStatus } });
  } catch (err) {
    return error(res, 503, 'Could not update duty status.');
  }
};

exports.updateUserLocation = async (req, res) => {
  try {
    const { lat, lng, accuracy, timestamp } = req.body || {};
    if (!validCoordinates(Number(lat), Number(lng))) return error(res, 400, 'Valid GPS coordinates are required.');
    if (accuracy != null && (!Number.isFinite(Number(accuracy)) || Number(accuracy) < 0 || Number(accuracy) > 500)) return error(res, 400, 'GPS accuracy is too low.');
    if (!validCaptureTime(timestamp)) return error(res, 400, 'GPS fix is stale.');
    const sos = await SosRequest.findOne({ sosId: req.params.sosId, user: req.user._id, status: { $in: ACTIVE_STATES } });
    if (!sos) return error(res, 404, 'Active SOS request not found.');
    const location = { type: 'Point', coordinates: [Number(lng), Number(lat)] };
    const updatedAt = timestamp ? new Date(timestamp) : new Date();
    const update = { location, locationAccuracy: Number(accuracy) || null, locationCapturedAt: updatedAt };
    const event = { sosId: sos.sosId, location, locationAccuracy: update.locationAccuracy, locationCapturedAt: updatedAt };
    if (sos.responderLocation?.coordinates?.length === 2) {
      const [responderLng, responderLat] = sos.responderLocation.coordinates;
      const route = await calculateRoute([responderLat, responderLng], [Number(lat), Number(lng)]);
      if (route.available) Object.assign(update, { etaSeconds: route.durationSeconds, distanceMeters: route.distanceMeters, routeCoordinates: route.routeCoordinates });
      event.etaSeconds = update.etaSeconds ?? sos.etaSeconds;
      event.distanceMeters = update.distanceMeters ?? sos.distanceMeters;
    }
    await SosRequest.updateOne({ _id: sos._id, user: req.user._id, status: { $in: ACTIVE_STATES } }, { $set: update });
    emitTo(req, 'sos-user-location', event, [sos.user, sos.assignedResponder]);
    if (Number.isFinite(update.etaSeconds)) emitTo(req, 'sos-responder-location', { sosId: sos.sosId, status: sos.status, responderLocation: sos.responderLocation, etaSeconds: update.etaSeconds, distanceMeters: update.distanceMeters, routeAvailable: true }, [sos.user]);
    return res.json({ success: true, data: event });
  } catch (err) {
    return error(res, 503, 'SOS location update failed.');
  }
};
exports.getSosById = async (req, res) => {
  try {
    let sos = await SosRequest.findOne({ sosId: req.params.sosId }).lean();
    if (!sos) return error(res, 404, 'SOS not found.');
    const privileged = ['admin', 'supervisor', 'zone_manager'].includes(req.user.role);
    const owner = idOf(sos.user) === idOf(req.user._id);
    const assigned = idOf(sos.assignedResponder) === idOf(req.user._id);
    if (!privileged && !owner && !assigned) return error(res, 403, 'You are not authorized to view this SOS.');
    if (!privileged && !owner && !assigned) return error(res, 403, 'Access denied.');
    if (OPEN_STATES.includes(sos.status) && Date.now() - new Date(sos.createdAt).getTime() >= SOS_SEARCH_TIMEOUT_MS) {
      sos = await SosRequest.findOneAndUpdate({ _id: sos._id, status: { $in: OPEN_STATES } }, { $set: { status: 'EXPIRED', completedAt: new Date() }, $unset: { activeUser: 1 }, $push: { statusHistory: { status: 'EXPIRED', notes: 'Volunteer search window expired.' } } }, { new: true }).lean() || sos;
      emitTo(req, 'sos-status-updated', { sosId: sos.sosId, status: sos.status }, [sos.user]);
    }

    return res.json({ success: true, data: privileged ? adminResponse(sos) : sos });
  } catch (err) {
    return error(res, 503, 'SOS details are temporarily unavailable.');
  }
};
