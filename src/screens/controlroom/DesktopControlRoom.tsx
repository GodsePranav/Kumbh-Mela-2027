import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { sosApi, crowdApi, geofenceApi, incidentApi, volunteerApi } from '../../services/api';
import { realtimeService } from '../../services/realtimeService';
import { GoogleNavigationMap, type MapCircle, type MapPoint, type MapPosition, type MapStop, type MapTravelMode, type RouteStatus, type RouteSummary } from '../../maps/googleMaps';
import { MAP_MARKERS, PLACES as PLACE_CATALOG } from '../../data/mockData';

interface ControlRoomProps {
  onBackToUserPortal: () => void;
  onOpenVolunteerPortal: () => void;
}

export default function DesktopControlRoom({ onBackToUserPortal, onOpenVolunteerPortal }: ControlRoomProps) {
  const [activeNav, setActiveNav] = useState<'dashboard' | 'sos' | 'crowd' | 'volunteers' | 'incidents' | 'audit'>('dashboard');

  const [sosQueue, setSosQueue] = useState<any[]>([]);
  const [crowdZones, setCrowdZones] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [geofenceViolations, setGeofenceViolations] = useState<any[]>([]);
  const [selectedVolunteerId, setSelectedVolunteerId] = useState<string | null>(null);
  const [routeStops, setRouteStops] = useState<MapStop[]>([]);
  const [routeStatus, setRouteStatus] = useState<RouteStatus>('idle');
  const [routeSummary, setRouteSummary] = useState<RouteSummary | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [travelMode, setTravelMode] = useState<MapTravelMode>('DRIVING');

  const [socketConnected, setSocketConnected] = useState<boolean>(true);

  useEffect(() => {
    fetchAllData();

    realtimeService.init();
    setSocketConnected(realtimeService.getStatus());

    realtimeService.subscribe('sos-broadcast', (newSos) => {
      setSosQueue((prev) => [newSos, ...prev]);
    });

    realtimeService.subscribe('sos-status-updated', (data) => {
      setSosQueue((prev) => prev.map((s) => (s.sosId === data.sosId ? { ...s, status: data.status } : s)));
    });

    realtimeService.subscribe('crowd-alert-created', (data) => {
      setCrowdZones((prev) => prev.map((z) => (z.zoneId === data.zoneId ? { ...z, riskLevel: data.riskLevel, currentDensityPercentage: data.densityPercentage } : z)));
    });

    realtimeService.subscribe('geofence-violation', (violation) => {
      setGeofenceViolations((prev) => [violation, ...prev]);
    });

    realtimeService.subscribe('incident-created', (newInc) => {
      setIncidents((prev) => [newInc, ...prev]);
    });

    // Polling Fallback (every 2 seconds) for instant sync
    const pollInterval = setInterval(() => {
      fetchAllData();
    }, 2000);

    const handleCustomSosEvent = (e: any) => {
      if (e.detail) {
        setSosQueue((prev) => [e.detail, ...prev.filter((s) => s.sosId !== e.detail.sosId)]);
      }
    };

    window.addEventListener('kumbh_sos_event', handleCustomSosEvent);
    window.addEventListener('storage', fetchAllData);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('kumbh_sos_event', handleCustomSosEvent);
      window.removeEventListener('storage', fetchAllData);
      realtimeService.unsubscribe('sos-broadcast');
      realtimeService.unsubscribe('sos-status-updated');
      realtimeService.unsubscribe('crowd-alert-created');
      realtimeService.unsubscribe('geofence-violation');
      realtimeService.unsubscribe('incident-created');
    };
  }, []);

  const fetchAllData = async () => {
    try {
      const [sosRes, crowdRes, volRes, incRes, geoRes] = await Promise.all([
        sosApi.getActiveSos(),
        crowdApi.getZones(),
        volunteerApi.getVolunteers(),
        incidentApi.getIncidents(),
        geofenceApi.getViolations(),
      ]);

      if (sosRes.success) setSosQueue(sosRes.data);
      if (crowdRes.success) setCrowdZones(crowdRes.data);
      if (volRes.success) setVolunteers(volRes.data);
      if (incRes.success) setIncidents(incRes.data);
      if (geoRes.success) setGeofenceViolations(geoRes.data);
    } catch (err) {
      console.error('Failed to load control room data:', err);
    }
  };

  const handleApproveDeployment = async (zone: any) => {
    const volIds = volunteers.slice(0, 3).map((v) => v._id);
    const res = await crowdApi.approveDeployment(`ALERT_${Date.now()}`, volIds);
    if (res.success) {
      alert(`✅ Approved 3 volunteer deployment for ${zone.name}!`);
    }
  };

  const selectedVolunteer = volunteers.find((volunteer) => volunteer._id === selectedVolunteerId);
  const selectedPosition = selectedVolunteer?.location?.coordinates;
  const originLat = Array.isArray(selectedPosition) ? Number(selectedPosition[1]) : Number.NaN;
  const originLng = Array.isArray(selectedPosition) ? Number(selectedPosition[0]) : Number.NaN;
  const routeOrigin = useMemo(() => Number.isFinite(originLat) && Number.isFinite(originLng)
    ? { lat: originLat, lng: originLng }
    : null, [originLat, originLng]);

  const clearMapRoute = useCallback(() => {
    setSelectedVolunteerId(null);
    setRouteStops([]);
    setRouteSummary(null);
    setRouteStatus('idle');
    setRouteError(null);
  }, []);

  const mapCircles = useMemo<MapCircle[]>(() => crowdZones.flatMap((zone) => {
    const lat = Number(zone.center?.lat);
    const lng = Number(zone.center?.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return [];
    const risk = String(zone.riskLevel ?? '').toUpperCase();
    const color = risk === 'CRITICAL' || risk === 'EXTREME' ? '#ef4444' : risk === 'HIGH' ? '#f97316' : risk === 'CAUTION' ? '#eab308' : '#10b981';
    return [{ id: `zone-${zone.zoneId}`, lat, lng, radius: Number(zone.radiusMeters) || 400, color, title: `${zone.name ?? 'Crowd zone'} · ${risk || 'NORMAL'}` }];
  }), [crowdZones]);

  const chooseMapDestination = useCallback((point: MapPosition & { id: string; name: string }) => {
    setRouteStops((current) => [
      ...current.filter((stop) => stop.id.startsWith('control-waypoint-')),
      { id: `map-destination-${point.id}`, label: point.name, lat: point.lat, lng: point.lng },
    ]);
    setRouteSummary(null);
    setRouteStatus('loading');
    setRouteError(null);
  }, []);

  const mapMarkers = useMemo<MapPoint[]>(() => [
    ...MAP_MARKERS.map((marker) => {
      const place = PLACE_CATALOG.find((candidate) => candidate.name.startsWith(marker.name));
      const name = place?.name ?? marker.name;
      const color = marker.type === 'hospital' ? '#dc2626' : marker.type === 'police' ? '#4f46e5' : marker.type === 'parking' ? '#059669' : marker.type === 'ghat' ? '#0284c7' : marker.type === 'cave' ? '#475569' : marker.type === 'heritage' ? '#7c3aed' : marker.type === 'temple' ? '#d97706' : '#f97316';
      return {
        id: `map-${marker.id}`,
        title: name,
        description: `${place?.description ?? `${name} · ${marker.type} support point`} · Crowd: ${marker.crowd}. ${marker.accuracy === 'illustrative' ? 'Illustrative prototype pin — not an official operational location.' : marker.accuracy === 'approximate' ? 'Approximate representative point; confirm the exact entrance locally.' : 'Mapped feature point.'} Click to set as route destination.`,
        lat: marker.lat,
        lng: marker.lng,
        color,
        glyph: marker.type === 'hospital' ? '✚' : marker.type === 'police' ? '🚓' : marker.type === 'parking' ? 'P' : marker.type === 'temple' ? '🛕' : marker.type === 'ghat' ? '🌊' : marker.type === 'cave' ? '🪨' : marker.type === 'heritage' ? '🏛️' : '🙏',
        accuracy: marker.accuracy,
        sourceUrl: marker.sourceUrl,
        onClick: () => chooseMapDestination({ id: marker.id, name, lat: marker.lat, lng: marker.lng }),
      };
    }),
    ...sosQueue.flatMap((sos) => {
      const coords = sos.location?.coordinates;
      const lat = Number(coords?.[1]);
      const lng = Number(coords?.[0]);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return [];
      return [{
        id: `sos-${sos.sosId}`,
        title: `P0 SOS · ${sos.userName || 'Visitor'}`,
        description: `${sos.category ?? 'Emergency'} · ${sos.status ?? 'Active'} · Click to set this route destination.`,
        lat, lng, color: '#e11d48', glyph: '!',
        onClick: () => chooseMapDestination({ id: `sos-${sos.sosId}`, name: sos.userName || 'SOS destination', lat, lng }),
      }];
    }),
    ...volunteers.flatMap((volunteer) => {
      const coords = volunteer.location?.coordinates;
      const lat = Number(coords?.[1]);
      const lng = Number(coords?.[0]);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return [];
      return [{
        id: `volunteer-${volunteer._id}`,
        title: `Volunteer · ${volunteer.user?.name || 'Volunteer'}`,
        description: `${volunteer.badgeNumber ?? ''} · ${volunteer.dutyStatus ?? 'Status unavailable'} · Click to select as route origin.`,
        lat, lng, color: '#4f46e5', glyph: 'V',
        onClick: () => setSelectedVolunteerId(String(volunteer._id)),
      }];
    }),
  ], [sosQueue, volunteers, chooseMapDestination]);

  const addControlWaypoint = useCallback((point: MapPosition) => {
    setRouteStops((current) => {
      const viaStops = current.filter((stop) => stop.id.startsWith('control-waypoint-'));
      const destination = current.find((stop) => !stop.id.startsWith('control-waypoint-'));
      if (viaStops.length >= 10) {
        setRouteStatus('error');
        setRouteError('A route can include up to 10 intermediate stops.');
        return current;
      }
      const next = [...viaStops, { id: `control-waypoint-${Date.now()}`, label: `Waypoint ${viaStops.length + 1}`, ...point }];
      return destination ? [...next, destination] : next;
    });
    setRouteSummary(null);
  }, []);

  const moveControlStop = useCallback((id: string, point: MapPosition) => {
    setRouteStops((current) => current.map((stop) => stop.id === id ? { ...stop, ...point } : stop));
  }, []);

  const handleMapRouteChange = useCallback((status: RouteStatus, summary?: RouteSummary | null, message?: string) => {
    setRouteStatus(status);
    setRouteSummary(summary ?? null);
    setRouteError(message ?? null);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden">
      {/* ─── Control Room Top Navigation Bar ───────────────────────────────── */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between z-30 shadow-md">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
            <h1 className="font-black text-lg text-white tracking-wide uppercase" style={{ fontFamily: 'Poppins' }}>
              KumbhSmart Control Room
            </h1>
          </div>
          <span className="bg-slate-800 text-slate-400 text-xs px-2.5 py-1 rounded border border-slate-700 font-mono">
            COMMAND CENTER • NASHIK SECTOR 1-4
          </span>
        </div>

        {/* Live Metrics & Quick Switcher */}
        <div className="flex items-center space-x-6">
          <div className="hidden lg:flex items-center space-x-4 text-xs">
            <div className="bg-slate-800/80 px-3 py-1.5 rounded border border-slate-700">
              <span className="text-slate-400 block text-[10px]">ACTIVE P0 SOS</span>
              <span className="font-bold text-rose-400 text-sm">{sosQueue.filter((s) => s.status !== 'RESOLVED').length}</span>
            </div>
            <div className="bg-slate-800/80 px-3 py-1.5 rounded border border-slate-700">
              <span className="text-slate-400 block text-[10px]">VOLUNTEERS ON DUTY</span>
              <span className="font-bold text-emerald-400 text-sm">{volunteers.length}</span>
            </div>
            <div className="bg-slate-800/80 px-3 py-1.5 rounded border border-slate-700">
              <span className="text-slate-400 block text-[10px]">REALTIME WS</span>
              <span className="font-bold text-xs flex items-center space-x-1 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>CONNECTED</span>
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenVolunteerPortal}
              className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition shadow">
              🛡️ Volunteer Portal
            </button>
            <button
              onClick={onBackToUserPortal}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3.5 py-2 rounded-lg border border-slate-700 transition">
              User Portal
            </button>
          </div>
        </div>
      </header>

      {/* ─── Control Room Main Body Layout ──────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Rail */}
        <aside className="w-16 md:w-56 bg-slate-900 border-r border-slate-800 flex flex-col justify-between py-4">
          <div className="space-y-1 px-2">
            {[
              { id: 'dashboard', label: 'Operational Overview', icon: '📊' },
              { id: 'sos', label: 'P0 SOS Queue', icon: '🚨', badge: sosQueue.length },
              { id: 'crowd', label: 'Crowd Density Engine', icon: '👥' },
              { id: 'volunteers', label: 'Volunteer Roster', icon: '🛡️', badge: volunteers.length },
              { id: 'incidents', label: 'Field Incidents', icon: '⚠️', badge: incidents.length },
              { id: 'audit', label: 'Audit Trail Logs', icon: '📜' },
            ].map((nav) => (
              <button
                key={nav.id}
                onClick={() => setActiveNav(nav.id as any)}
                className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-xs font-semibold transition ${
                  activeNav === nav.id
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}>
                <div className="flex items-center space-x-3">
                  <span className="text-base">{nav.icon}</span>
                  <span className="hidden md:inline">{nav.label}</span>
                </div>
                {nav.badge !== undefined && nav.badge > 0 && (
                  <span className="hidden md:inline bg-slate-800 text-slate-200 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {nav.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="px-4 text-[11px] text-slate-500 hidden md:block">
            <p>KumbhSmart Engine v1.0</p>
            <p>Geospatial GeoJSON Enabled</p>
          </div>
        </aside>

        {/* Center Section: Interactive Live Map */}
        <div className="flex-1 flex flex-col relative bg-slate-950">
          <div className="relative h-full min-h-[400px] w-full">
            <GoogleNavigationMap
              center={{ lat: 20.0070, lng: 73.7930 }}
              position={routeOrigin}
              positionTitle={selectedVolunteer ? `${selectedVolunteer.user?.name || 'Volunteer'} · Route origin` : 'Volunteer route origin'}
              markers={mapMarkers}
              circles={mapCircles}
              stops={routeOrigin ? routeStops : []}
              onAddStop={addControlWaypoint}
              onStopMove={moveControlStop}
              onRouteChange={handleMapRouteChange}
              travelMode={travelMode}
              onTravelModeChange={setTravelMode}
              zoom={14}
            />
            <div className="absolute left-3 top-3 z-10 max-w-[80%] rounded-lg bg-white/95 px-3 py-2 text-xs font-semibold text-slate-700 shadow">
              {routeSummary && routeStatus === 'ready'
                ? `Remaining ${(routeSummary.distanceMeters / 1000).toFixed(1)} km · ETA ${routeSummary.arrival.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · ${routeSummary.provider ?? 'Google Routes'}`
                : routeError ?? (selectedVolunteer && routeStops.length ? 'Calculating route to the selected SOS…' : selectedVolunteer ? 'Click an SOS marker or map location to set the destination.' : 'Click a volunteer marker to choose a route origin.')}
            </div>
            {(selectedVolunteerId || routeStops.length > 0) && <button type="button" onClick={clearMapRoute}
              className="absolute left-3 top-14 z-10 rounded-lg bg-slate-900/90 px-3 py-2 text-xs font-bold text-white shadow hover:bg-slate-800">
              Clear route selection
            </button>}
          </div>
        </div>

        {/* Right Section: Realtime Operational Panels */}
        <aside className="w-80 lg:w-96 bg-slate-900 border-l border-slate-800 flex flex-col divide-y divide-slate-800 overflow-y-auto">
          {/* Panel 1: P0 SOS Escalation Queue */}
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                <span>🚨</span>
                <span>P0 Emergency Queue</span>
              </h3>
              <span className="text-xs bg-rose-900/60 text-rose-300 font-bold px-2 py-0.5 rounded">
                {sosQueue.length} Active
              </span>
            </div>

            {sosQueue.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">No active SOS requests</p>
            ) : (
              sosQueue.slice(0, 4).map((s) => (
                <div key={s.sosId} className="bg-slate-800/90 rounded-lg p-3 border border-slate-700 space-y-2 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="bg-rose-600 text-white font-black text-[10px] px-1.5 py-0.5 rounded">P0</span>
                      <h4 className="font-bold text-white mt-1">{s.userName}</h4>
                    </div>
                    <span className="text-[11px] text-amber-400 font-semibold">{s.status}</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">📍 {s.locationText}</p>
                  {s.responderName ? (
                    <p className="text-emerald-400 text-[10px]">Assigned: {s.responderName}</p>
                  ) : (
                    <p className="text-slate-400 text-[10px] animate-pulse">Wave 1: Broadcasting to nearby volunteers...</p>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Panel 2: Crowd Density Engine */}
          <div className="p-4 space-y-3">
            <h3 className="font-bold text-sm text-white flex items-center space-x-2">
              <span>👥</span>
              <span>Crowd Risk & Density Engine</span>
            </h3>

            {crowdZones.map((z) => (
              <div key={z.zoneId} className="bg-slate-800/90 rounded-lg p-3 border border-slate-700 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-white">{z.name}</h4>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                      z.riskLevel === 'CRITICAL' || z.riskLevel === 'EXTREME'
                        ? 'bg-rose-600 text-white animate-pulse'
                        : z.riskLevel === 'HIGH'
                        ? 'bg-orange-600 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}>
                    {z.riskLevel}
                  </span>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>Density ({z.currentCount} / {z.capacity})</span>
                    <span className="font-bold text-slate-200">{z.currentDensityPercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        z.currentDensityPercentage > 80 ? 'bg-rose-500' : z.currentDensityPercentage > 60 ? 'bg-orange-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${z.currentDensityPercentage}%` }}
                    />
                  </div>
                </div>

                {z.riskLevel === 'HIGH' || z.riskLevel === 'CRITICAL' ? (
                  <button
                    onClick={() => handleApproveDeployment(z)}
                    className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold text-[11px] py-1.5 rounded transition shadow">
                    ⚡ Approve Deployment (+3 Volunteers)
                  </button>
                ) : null}
              </div>
            ))}
          </div>

          {/* Panel 3: Geofence Violations Feed */}
          <div className="p-4 space-y-2">
            <h3 className="font-bold text-sm text-white flex items-center space-x-2">
              <span>⚠️</span>
              <span>Geofence & Violation Feed</span>
            </h3>

            {geofenceViolations.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-2">No active zone violations.</p>
            ) : (
              geofenceViolations.slice(0, 3).map((g, idx) => (
                <div key={idx} className="bg-rose-950/40 border border-rose-800/60 p-2.5 rounded text-xs space-y-1">
                  <div className="flex justify-between text-rose-300 font-bold">
                    <span>{g.volunteerName}</span>
                    <span>{g.distanceOutsideMeters}m OUT</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Assigned Zone: {g.assignedZone}</p>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
