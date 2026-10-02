import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GoogleNavigationMap, type MapPoint, type MapPosition, type MapStop, type MapTravelMode, type RouteStatus, type RouteSummary } from '../maps/googleMaps';
import { MAP_MARKERS, PLACES as PLACE_CATALOG } from '../data/mockData';

interface Destination extends MapStop {}
interface SmartMapProps {
  onNavigate: (screen: string, params?: unknown) => void;
  onBack?: () => void;
  routeParams?: { destination: { lat: number; lng: number; name: string } } | null;
}

const INITIAL_CENTER: MapPosition = { lat: 20.0070, lng: 73.7930 };
const MAP_PLACES = MAP_MARKERS.map((marker) => {
  const catalogPlace = PLACE_CATALOG.find((place) => place.name.startsWith(marker.name));
  const typeAppearance: Record<string, { icon: string; color: string; glyph: string }> = {
    religious: { icon: '🙏', color: '#F97316', glyph: '🙏' },
    ghat: { icon: '🌊', color: '#0EA5E9', glyph: '🌊' },
    temple: { icon: '🛕', color: '#F59E0B', glyph: '🛕' },
    hospital: { icon: '🏥', color: '#DC2626', glyph: '✚' },
    police: { icon: '🚓', color: '#4F46E5', glyph: '🚓' },
    parking: { icon: '🅿️', color: '#059669', glyph: 'P' },
    cave: { icon: '🪨', color: '#475569', glyph: '🪨' },
    heritage: { icon: '🏛️', color: '#7C3AED', glyph: '🏛️' },
  };
  return {
    id: marker.id,
    name: catalogPlace?.name ?? marker.name,
    lat: marker.lat,
    lng: marker.lng,
    icon: typeAppearance[marker.type]?.icon ?? '📍',
    color: typeAppearance[marker.type]?.color ?? '#F97316',
    glyph: typeAppearance[marker.type]?.glyph ?? '📍',
    crowd: marker.crowd,
    type: marker.type,
    accuracy: marker.accuracy,
    sourceUrl: marker.sourceUrl,
    description: catalogPlace?.description ?? `${marker.name} · ${marker.type} support point`,
  };
});

function validPosition(point: MapPosition): boolean {
  return Number.isFinite(point.lat) && Number.isFinite(point.lng)
    && point.lat >= -90 && point.lat <= 90 && point.lng >= -180 && point.lng <= 180;
}

function formatDistance(meters: number): string {
  return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1)} km`;
}

function formatDuration(milliseconds: number): string {
  const minutes = Math.max(1, Math.round(milliseconds / 60_000));
  return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function formatArrival(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function SmartMap({ onNavigate, onBack, routeParams }: SmartMapProps) {
  const [userPos, setUserPos] = useState<MapPosition | null>(null);
  const [manualOrigin, setManualOrigin] = useState<MapPosition | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [stops, setStops] = useState<Destination[]>([]);
  const [routeMetrics, setRouteMetrics] = useState<RouteSummary | null>(null);
  const [routeState, setRouteState] = useState<RouteStatus>('idle');
  const [routeError, setRouteError] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);
  const [locating, setLocating] = useState(false);
  const [travelMode, setTravelMode] = useState<MapTravelMode>('DRIVING');
  const [navigationActive, setNavigationActive] = useState(false);
  const [followToken, setFollowToken] = useState(0);
  const lastGpsAtRef = useRef(0);
  const renderedGpsRef = useRef<MapPosition | null>(null);
  const destinationKey = `${routeParams?.destination?.lat ?? ''}:${routeParams?.destination?.lng ?? ''}:${routeParams?.destination?.name ?? ''}`;
  const activeDestination = stops[stops.length - 1] ?? null;
  const routeOrigin = userPos ?? manualOrigin;

  useEffect(() => {
    const incoming = routeParams?.destination;
    if (!incoming) return;
    if (!validPosition(incoming) || !incoming.name.trim()) {
      setRouteState('error');
      setRouteError('The requested destination is invalid. Choose a destination again.');
      return;
    }
    setNavigationActive(false);
    setStops([{ ...incoming, id: `destination-${Date.now()}`, label: incoming.name }]);
  // The string key prevents an object identity change from resetting an in-progress route.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destinationKey]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsError('Location services are unavailable in this browser.');
      return;
    }
    let mounted = true;
    const watchId = navigator.geolocation.watchPosition((fix) => {
      if (!mounted) return;
      const next = { lat: fix.coords.latitude, lng: fix.coords.longitude };
      if (!validPosition(next)) { setGpsError('GPS returned invalid coordinates. Waiting for a valid fix.'); return; }
      setGpsError(null);
      const now = Date.now();
      const previous = renderedGpsRef.current;
      if (!previous || Math.hypot(previous.lat - next.lat, previous.lng - next.lng) > 0.00002 || now - lastGpsAtRef.current >= 1000) {
        renderedGpsRef.current = next;
        lastGpsAtRef.current = now;
        setUserPos(next);
      }
    }, (error) => {
      if (!mounted) return;
      setGpsError(error.code === error.PERMISSION_DENIED
        ? 'Location permission is blocked. Enable it to start live navigation.'
        : error.code === error.POSITION_UNAVAILABLE
          ? 'GPS is unavailable. The map will keep the last known position.'
          : 'GPS timed out. Waiting for another location fix.');
    }, { enableHighAccuracy: true, maximumAge: 1500, timeout: 12_000 });
    return () => { mounted = false; navigator.geolocation.clearWatch(watchId); };
  }, []);

  const locateMe = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError('Location services are unavailable in this browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition((fix) => {
      const next = { lat: fix.coords.latitude, lng: fix.coords.longitude };
      if (!validPosition(next)) {
        setGpsError('GPS returned invalid coordinates. Waiting for a valid fix.');
        setLocating(false);
        return;
      }
      renderedGpsRef.current = next;
      lastGpsAtRef.current = Date.now();
      setManualOrigin(null);
      setUserPos(next);
      setGpsError(null);
      setFollowToken((token) => token + 1);
      setLocating(false);
    }, (error) => {
      setGpsError(error.code === error.PERMISSION_DENIED
        ? 'Location permission is blocked. Allow location access to follow your live position.'
        : error.code === error.POSITION_UNAVAILABLE
          ? 'Your current location is unavailable. Check device location settings.'
          : 'Location request timed out. Try again or choose a starting point on the map.');
      setLocating(false);
    }, { enableHighAccuracy: true, maximumAge: 0, timeout: 15_000 });
  }, []);

  useEffect(() => {
    const onOnline = () => { if (stops.length) setRetryNonce((value) => value + 1); };
    const onOffline = () => { setRouteState('error'); setRouteError('Internet connection lost. Live GPS continues; road routing is paused.'); };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
  }, [stops.length]);

  const chooseDestination = useCallback((point: MapPosition & { name: string }) => {
    setStops([{ ...point, id: `place-${point.lat}-${point.lng}`, label: point.name }]);
    setRouteMetrics(null);
    setRouteError(null);
    setRouteState('loading');
  }, []);

  const addStop = useCallback((point: MapPosition) => {
    if (!validPosition(point)) return;
    if (!userPos && !manualOrigin) {
      setManualOrigin(point);
      setGpsError('GPS is unavailable. Start point selected on the map; tap again to add a destination.');
      return;
    }
    setStops((current) => {
      if (current.length >= 11) {
        setRouteError('A route can include up to 10 intermediate stops.');
        setRouteState('error');
        return current;
      }
      return [...current, { ...point, id: `map-${Date.now()}-${Math.round(point.lat * 1e5)}`, label: `Waypoint ${current.length + 1}` }];
    });
    setRouteMetrics(null);
  }, [manualOrigin, userPos]);

  const moveStop = useCallback((id: string, point: MapPosition) => {
    setStops((current) => current.map((stop) => stop.id === id ? { ...stop, ...point } : stop));
  }, []);

  const onRouteChange = useCallback((status: RouteStatus, summary?: RouteSummary | null, message?: string) => {
    setRouteState(status);
    setRouteMetrics(summary ?? null);
    setRouteError(message ?? null);
  }, []);

  const clearRoute = () => {
    setNavigationActive(false);
    setStops([]);
    setManualOrigin(null);
    setRouteMetrics(null);
    setRouteError(null);
    setRouteState('idle');
  };

  const startNavigation = () => {
    setNavigationActive(true);
    if (userPos) setFollowToken((token) => token + 1);
  };

  const googleMapsDirections = activeDestination ? (() => {
    const url = new URL('https://www.google.com/maps/dir/');
    url.searchParams.set('api', '1');
    if (routeOrigin) url.searchParams.set('origin', `${routeOrigin.lat},${routeOrigin.lng}`);
    url.searchParams.set('destination', `${activeDestination.lat},${activeDestination.lng}`);
    url.searchParams.set('travelmode', travelMode === 'WALKING' ? 'walking' : travelMode === 'TWO_WHEELER' ? 'two-wheeler' : 'driving');
    return url.toString();
  })() : null;

  const mapMarkers = useMemo<MapPoint[]>(() => MAP_PLACES.map((place) => ({
    id: place.id,
    title: `${place.icon} ${place.name}`,
    description: `${place.description} · Crowd: ${place.crowd}. Tap to navigate here.`,
    lat: place.lat,
    lng: place.lng,
    color: place.color,
    glyph: place.glyph,
    accuracy: place.accuracy,
    sourceUrl: place.sourceUrl,
    onClick: () => chooseDestination({ lat: place.lat, lng: place.lng, name: place.name }),
  })), [chooseDestination]);

  const center = routeOrigin ?? activeDestination ?? INITIAL_CENTER;
  const mapStops = useMemo<MapStop[]>(() => stops, [stops]);
  const arrivedName = activeDestination?.label ?? 'destination';

  return (
    <div className="flex h-screen flex-col bg-slate-50 font-sans">
      <div className="relative z-10 flex items-center gap-3 bg-indigo-900 px-4 pb-4 pt-12 shadow-lg">
        <button onClick={() => (onBack ? onBack() : onNavigate('discovery'))}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/15 text-xl font-bold text-white transition-all hover:bg-white/25 active:scale-95"
          title="Back" aria-label="Go Back">←</button>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-xl">🗺️</div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-bold text-white">{activeDestination ? `Route → ${arrivedName}` : 'Smart Map – Live Tracking'}</h1>
          <p className="flex items-center gap-1 text-xs text-indigo-200" aria-live="polite">
            {gpsError ? `⚠️ ${gpsError}` : userPos ? '🟢 GPS Active – Live' : manualOrigin ? '📍 Manual route start selected' : '📡 Acquiring GPS…'}
          </p>
        </div>
        {stops.length > 0 && <button onClick={clearRoute} className="shrink-0 rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/30">✕ Clear</button>}
      </div>

      {stops.length > 0 && (
        <div className="relative z-[1] flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-3 shadow-md" aria-live="polite">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Navigating to {arrivedName} · {stops.length} stop{stops.length > 1 ? 's' : ''}</p>
            {routeState === 'loading' && <p className="mt-1 text-sm font-semibold text-orange-600">{routeError ?? 'Finding a road route…'}</p>}
            {routeState === 'error' && <p className="mt-1 text-xs text-red-700">{routeError ?? 'Road route unavailable.'}</p>}
            {routeState === 'idle' && !routeOrigin && <p className="mt-1 text-xs text-slate-600">{stops.length ? `${gpsError ?? 'GPS is unavailable.'} Select “Choose starting point” on the map, then tap your start location to draw the road route.` : 'Waiting for GPS, or choose a starting point on the map.'}</p>}
            {routeState === 'ready' && routeMetrics && <p className="mt-1 text-xs font-medium text-slate-600">{navigationActive ? userPos ? 'Navigation active · Live GPS tracking' : 'Navigation active · GPS unavailable; manual start' : `Arrive about ${formatArrival(routeMetrics.arrival)} · ${routeMetrics.provider ?? 'Google Routes'}`}</p>}
            {googleMapsDirections && <a href={googleMapsDirections} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs font-semibold text-blue-700 hover:underline">Open directions in Google Maps ↗</a>}
          </div>
          {routeMetrics && routeState === 'ready' && <div className="flex shrink-0 items-center gap-3">
            <div className="text-center"><p className="text-lg font-black leading-none text-orange-600">{formatDuration(routeMetrics.durationMillis)}</p><p className="mt-1 text-[9px] font-bold uppercase text-slate-500">Remaining</p></div>
            <div className="text-center"><p className="text-lg font-black leading-none text-indigo-600">{formatDistance(routeMetrics.distanceMeters)}</p><p className="mt-1 text-[9px] font-bold uppercase text-slate-500">Distance</p></div>
          </div>}
          {routeState === 'ready' && routeMetrics && (navigationActive
            ? <button type="button" onClick={clearRoute} className="shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">End</button>
            : <button type="button" onClick={startNavigation} className="shrink-0 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white shadow hover:bg-blue-700">Start</button>)}
          {routeState === 'error' && <button onClick={() => { setRouteMetrics(null); setRouteState('loading'); setRetryNonce((value) => value + 1); }} className="shrink-0 rounded-lg bg-indigo-700 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-800">Retry route</button>}
        </div>
      )}

      <div className="relative min-h-0 flex-1">
        <GoogleNavigationMap
          center={center}
          focus={!routeOrigin && activeDestination ? activeDestination : null}
          position={routeOrigin}
          positionTitle={userPos ? 'Your live location' : 'Selected route start'}
          markers={mapMarkers}
          stops={mapStops}
          onAddStop={addStop}
          onStopMove={moveStop}
          onRouteChange={onRouteChange}
          rerouteToken={retryNonce}
          followToken={followToken}
          travelMode={travelMode}
          onTravelModeChange={setTravelMode}
          onLocateMe={locateMe}
          locating={locating}
          zoom={15}
          className="h-full"
        />
      </div>

      <div className="relative z-10 border-t border-slate-200 bg-white px-4 pb-6 pt-3 shadow-2xl">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">IMPORTANT PLACES & SERVICES · TAP TO ROUTE</p>
          {stops.length > 1 && <button type="button" onClick={() => setStops((current) => current.slice(0, -1))} className="text-xs font-semibold text-red-600">Undo last stop</button>}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {MAP_PLACES.map((place) => {
            const active = activeDestination?.label === place.name;
            return <button key={place.id} onClick={() => chooseDestination({ lat: place.lat, lng: place.lng, name: place.name })}
              aria-pressed={active} className="flex min-w-[68px] shrink-0 flex-col items-center gap-1 rounded-xl border-2 px-3 py-2 transition-all"
              style={{ borderColor: active ? place.color : '#E2E8F0', background: active ? `${place.color}15` : '#F8FAFC' }}>
              <span className="text-xl leading-none">{place.icon}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: active ? place.color : '#475569', textAlign: 'center', lineHeight: 1.2, maxWidth: 72 }}>
                {place.name.replace('(Ram Ghat)', '').replace('Jyotirlinga', '').trim()}
              </span>
            </button>;
          })}
        </div>
      </div>
    </div>
  );
}
