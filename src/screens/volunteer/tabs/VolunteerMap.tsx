import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ChevronUp,
  Cross,
  Droplet,
  Layers,
  MapPin,
  Navigation,
  RefreshCw,
  Shield,
  Users,
} from 'lucide-react';
import {
  GoogleNavigationMap,
  type MapCircle,
  type MapPoint,
  type MapPosition,
  type MapStop,
  type MapTravelMode,
  type RouteStatus,
  type RouteSummary,
} from '../../../maps/googleMaps';
import { MAP_MARKERS, PLACES as PLACE_CATALOG } from '../../../data/mockData';

interface VolunteerMapProps { user: { name: string; email: string; mobile?: string } }
type MapLayer = 'facilities' | 'crowd' | 'zones';

const INITIAL_CENTER: MapPosition = { lat: 20.0070, lng: 73.7930 };
const FACILITIES = [
  { id: 'medical', name: 'Sample medical aid point', type: 'Medical', glyph: '✚', color: '#dc2626', lat: 19.9981, lng: 73.7920 },
  { id: 'water', name: 'Sample drinking water point', type: 'Water', glyph: '💧', color: '#0284c7', lat: 19.9962, lng: 73.7881 },
  { id: 'control', name: 'Sample volunteer control post', type: 'Control', glyph: '🛡', color: '#ea580c', lat: 19.9990, lng: 73.7960 },
];

function formatDistance(meters: number): string {
  return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1)} km`;
}

function VolunteerMap({ user }: VolunteerMapProps) {
  const [activeLayer, setActiveLayer] = useState<MapLayer>('facilities');
  const [infoExpanded, setInfoExpanded] = useState(true);
  const [position, setPosition] = useState<MapPosition | null>(null);
  const [locating, setLocating] = useState(false);
  const [manualStart, setManualStart] = useState<MapPosition | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState(() => new Date());
  const [mapInstance, setMapInstance] = useState(0);
  const [stops, setStops] = useState<MapStop[]>([]);
  const [routeStatus, setRouteStatus] = useState<RouteStatus>('idle');
  const [routeSummary, setRouteSummary] = useState<RouteSummary | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [travelMode, setTravelMode] = useState<MapTravelMode>('DRIVING');
  const acceptedPositionRef = useRef<MapPosition | null>(null);
  const routeOrigin = position ?? manualStart;

  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsError('Location services are not available. The map is centered on Ram Ghat.');
      return;
    }
    const watchId = navigator.geolocation.watchPosition((fix) => {
      const next = { lat: fix.coords.latitude, lng: fix.coords.longitude };
      if (!Number.isFinite(next.lat) || !Number.isFinite(next.lng) || Math.abs(next.lat) > 90 || Math.abs(next.lng) > 180) {
        setGpsError('GPS returned an invalid location. Waiting for a valid fix.');
        return;
      }
      const previous = acceptedPositionRef.current;
      if (!previous || Math.abs(previous.lat - next.lat) > 0.000015 || Math.abs(previous.lng - next.lng) > 0.000015) {
        acceptedPositionRef.current = next;
        setPosition(next);
        setLastUpdated(new Date());
      }
      setGpsError(null);
    }, (error) => {
      setGpsError(error.code === error.PERMISSION_DENIED
        ? 'Location permission is off. Enable it to show your live position.'
        : error.code === error.POSITION_UNAVAILABLE
          ? 'GPS is unavailable. The map remains centered on Ram Ghat.'
          : 'GPS timed out. Waiting for another location fix.');
    }, { enableHighAccuracy: true, maximumAge: 2_000, timeout: 12_000 });
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const locateMe = () => {
    if (!navigator.geolocation) {
      setGpsError('Location services are not available in this browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition((fix) => {
      const next = { lat: fix.coords.latitude, lng: fix.coords.longitude };
      if (!Number.isFinite(next.lat) || !Number.isFinite(next.lng) || Math.abs(next.lat) > 90 || Math.abs(next.lng) > 180) {
        setGpsError('GPS returned an invalid location. Waiting for a valid fix.');
        setLocating(false);
        return;
      }
      acceptedPositionRef.current = next;
      setPosition(next);
      setManualStart(null);
      setLastUpdated(new Date());
      setGpsError(null);
      setLocating(false);
    }, (error) => {
      setGpsError(error.code === error.PERMISSION_DENIED
        ? 'Location permission is off. Allow location access to find your position.'
        : error.code === error.POSITION_UNAVAILABLE
          ? 'Your current location is unavailable. Check device location settings.'
          : 'Location request timed out. Try again or set a route start on the map.');
      setLocating(false);
    }, { enableHighAccuracy: true, maximumAge: 0, timeout: 15_000 });
  };

  const chooseDestination = (point: MapPosition & { id: string; name: string }) => {
    setStops([{ id: `volunteer-destination-${point.id}`, label: point.name, lat: point.lat, lng: point.lng }]);
    setRouteSummary(null);
    setRouteStatus('loading');
    setRouteError(null);
  };

  const markers = useMemo<MapPoint[]>(() => [
    ...MAP_MARKERS.map((marker) => {
      const place = PLACE_CATALOG.find((candidate) => candidate.name.startsWith(marker.name));
      const color = marker.type === 'hospital' ? '#dc2626' : marker.type === 'police' ? '#4f46e5' : marker.type === 'parking' ? '#059669' : marker.type === 'ghat' ? '#0284c7' : marker.type === 'cave' ? '#475569' : marker.type === 'heritage' ? '#7c3aed' : marker.type === 'temple' ? '#d97706' : '#f97316';
      const glyph = marker.type === 'hospital' ? '✚' : marker.type === 'police' ? '🚓' : marker.type === 'parking' ? 'P' : marker.type === 'ghat' ? '🌊' : marker.type === 'cave' ? '🪨' : marker.type === 'heritage' ? '🏛️' : marker.type === 'temple' ? '🛕' : '🙏';
      return {
        id: `landmark-${marker.id}`,
        title: place?.name ?? marker.name,
        description: `${place?.description ?? `${marker.name} · ${marker.type} support point`} · Crowd: ${marker.crowd}. ${marker.accuracy === 'illustrative' ? 'Illustrative prototype pin — not an official operational location.' : marker.accuracy === 'approximate' ? 'Approximate representative point; confirm the exact entrance locally.' : 'Mapped feature point.'} Tap to route here.`,
        lat: marker.lat,
        lng: marker.lng,
        color,
        glyph,
        accuracy: marker.accuracy,
        sourceUrl: marker.sourceUrl,
        onClick: () => chooseDestination({ id: marker.id, name: place?.name ?? marker.name, lat: marker.lat, lng: marker.lng }),
      };
    }),
    ...(activeLayer === 'facilities' ? FACILITIES.map((facility) => ({
      id: facility.id,
      title: facility.name,
      description: `${facility.type} · Illustrative prototype point; confirm official location before dispatch. Tap to route here.`,
      lat: facility.lat,
      lng: facility.lng,
      color: facility.color,
      glyph: facility.glyph,
      accuracy: 'illustrative' as const,
      onClick: () => chooseDestination({ id: facility.id, name: facility.name, lat: facility.lat, lng: facility.lng }),
    })) : []),
  ], [activeLayer, setStops]);

  const circles = useMemo<MapCircle[]>(() => {
    if (activeLayer === 'crowd') return [
      { id: 'ram-ghat-density', lat: 20.0072639, lng: 73.7924901, radius: 280, color: '#f97316', title: 'Ram Ghat crowd level · Demo data · 67% capacity' },
      { id: 'entrance-density', lat: 19.9993, lng: 73.7930, radius: 130, color: '#dc2626', title: 'High density area · Use caution near the ghat entrance' },
    ];
    if (activeLayer === 'zones') return [{ id: 'ram-ghat-zone', lat: 20.0072639, lng: 73.7924901, radius: 520, color: '#ea580c', title: 'Ram Ghat Sector B · Illustrative prototype zone' }];
    return [];
  }, [activeLayer]);

  const handleMapClick = (point: MapPosition) => {
    if (!position && !manualStart) {
      setManualStart(point);
      setRouteError('GPS unavailable. Start point selected; tap map again to add a destination.');
      return;
    }
    if (stops.length >= 11) {
      setRouteStatus('error');
      setRouteError('A route can include up to 10 intermediate stops.');
      return;
    }
    setStops((current) => [...current, {
      id: `volunteer-stop-${Date.now()}`,
      label: `Stop ${current.length + 1}`,
      lat: point.lat,
      lng: point.lng,
    }]);
    setRouteSummary(null);
  };

  const handleStopMove = (id: string, point: MapPosition) => {
    setStops((current) => current.map((stop) => stop.id === id ? { ...stop, ...point } : stop));
  };

  const handleRouteChange = (status: RouteStatus, summary?: RouteSummary | null, message?: string) => {
    setRouteStatus(status);
    setRouteSummary(summary ?? null);
    setRouteError(message ?? null);
  };

  const cycleLayer = () => setActiveLayer((layer) => (
    layer === 'facilities' ? 'crowd' : layer === 'crowd' ? 'zones' : 'facilities'
  ));

  const handleRefresh = () => {
    setLastUpdated(new Date());
    setMapInstance((value) => value + 1);
  };

  const clearRoute = () => {
    setStops([]);
    setManualStart(null);
    setRouteSummary(null);
    setRouteStatus('idle');
    setRouteError(null);
  };

  const statusText = routeStatus === 'ready' && routeSummary
    ? `Route ${formatDistance(routeSummary.distanceMeters)} · ETA ${routeSummary.arrival.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · ${routeSummary.provider ?? 'Google Routes'}`
    : routeStatus === 'loading'
      ? routeError ?? 'Calculating road route…'
      : routeStatus === 'error'
        ? routeError ?? 'Road route unavailable.'
        : manualStart && !position
          ? stops.length ? 'GPS unavailable · Routing from the selected manual start' : 'GPS unavailable · Manual route start selected; tap the map to add a destination'
          : gpsError ?? `Updated: ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · Tap map to add a route stop`;

  return (
    <div className="relative flex min-h-[440px] flex-col overflow-hidden bg-[#FEFAF4] font-['Poppins']" style={{ height: 'calc(100vh - 72px)' }}>
      <div className="z-10 flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3 shadow-sm">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-stone-800">Operational Map</h2>
          <p className="truncate text-xs text-stone-500" aria-live="polite">{statusText}</p>
        </div>
        <button type="button" onClick={handleRefresh} aria-label="Refresh map" title="Refresh map"
          className="rounded-full bg-stone-100 p-2 text-stone-600 transition-colors hover:bg-stone-200">
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>

      <div className="relative min-h-0 flex-1 bg-stone-200">
        <GoogleNavigationMap
          key={mapInstance}
          center={routeOrigin ?? INITIAL_CENTER}
          position={routeOrigin}
          positionTitle={position ? `${user.name} · Live location` : 'Selected route start'}
          markers={markers}
          circles={circles}
          stops={stops}
          onAddStop={handleMapClick}
          onStopMove={handleStopMove}
          onRouteChange={handleRouteChange}
          travelMode={travelMode}
          onTravelModeChange={setTravelMode}
          onLocateMe={locateMe}
          locating={locating}
          zoom={15}
          className="h-full"
        />

        <button type="button" onClick={cycleLayer} aria-label={`Map overlay: ${activeLayer}. Change overlay.`}
          className="absolute left-4 top-4 z-10 rounded-xl border border-stone-200 bg-white p-2 text-stone-600 shadow-md hover:bg-stone-50">
          <Layers className="h-5 w-5" />
        </button>
        {stops.length > 0 && <div className="absolute left-3 top-3 z-10 flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow">
          <Navigation className="h-4 w-4 text-orange-600" /> {stops.length} route stop{stops.length > 1 ? 's' : ''}
          <button type="button" onClick={clearRoute} className="ml-1 text-red-600">Clear</button>
        </div>}
        {!position && !manualStart && stops.length > 0 && <div className="absolute left-3 top-3 z-10 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow">
          Destination selected · tap the map to choose a route start
        </div>}
        {!stops.length && manualStart && !position && <div className="absolute left-3 top-3 z-10 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow">
          Start point selected · tap the map to add a destination <button type="button" onClick={clearRoute} className="ml-2 text-red-600">Clear</button>
        </div>}
      </div>

      <div className={`absolute bottom-3 left-4 right-4 z-20 transform rounded-2xl border border-stone-200 bg-white shadow-lg transition-transform duration-300 ease-in-out ${infoExpanded ? 'translate-y-0' : 'translate-y-[83%]'}`}>
        <button type="button" aria-expanded={infoExpanded} onClick={() => setInfoExpanded((expanded) => !expanded)}
          className="flex w-full flex-col items-center pt-2">
          <span className="mb-2 h-1.5 w-12 rounded-full bg-stone-300" />
          <span className="flex w-full items-center justify-between border-b border-stone-100 px-4 pb-2">
            <span className="flex items-center gap-2"><MapPin className="h-5 w-5 text-orange-500" /><span className="font-semibold text-stone-800">Ram Ghat Sector B</span></span>
            <ChevronUp className={`h-5 w-5 text-stone-400 transition-transform duration-300 ${infoExpanded ? 'rotate-180' : ''}`} />
          </span>
        </button>

        <div className="p-4 pt-2">
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-stone-100 bg-stone-50 p-3"><p className="mb-1 text-xs text-stone-500">Capacity</p><p className="text-lg font-bold text-stone-800">15,000</p></div>
            <div className="rounded-xl border border-stone-100 bg-stone-50 p-3"><p className="mb-1 text-xs text-stone-500">Density</p><div className="flex items-end gap-1"><p className="text-lg font-bold text-stone-800">67%</p><span className="pb-1 text-xs font-medium text-orange-500">Rising</span></div></div>
          </div>
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-yellow-100 bg-yellow-50 p-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600" /><div><p className="text-sm font-semibold text-yellow-800">Moderate Risk</p><p className="text-xs text-yellow-600">Crowd flow steady</p></div>
          </div>
          <div className="border-t border-stone-100 pt-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-500">Legend · {activeLayer}</p>
            <div className="flex flex-wrap gap-3 text-xs text-stone-600">
              {activeLayer !== 'zones' && <><span className="flex items-center gap-1.5"><Cross className="h-3.5 w-3.5 text-red-500" />Medical</span><span className="flex items-center gap-1.5"><Droplet className="h-3.5 w-3.5 text-blue-400" />Water</span><span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-orange-500" />Control</span></>}
              {activeLayer === 'crowd' && <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-yellow-500" />Crowd</span>}
              {activeLayer === 'zones' && <span>Ram Ghat operating boundary</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VolunteerMap;
