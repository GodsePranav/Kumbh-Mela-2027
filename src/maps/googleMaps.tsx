import React, { useEffect, useRef, useState } from 'react';

export interface MapPosition { lat: number; lng: number }
export type MapTravelMode = 'DRIVING' | 'TWO_WHEELER' | 'WALKING';
export interface MapStop extends MapPosition { id: string; label: string }
export interface MapPoint extends MapPosition {
  id: string;
  title: string;
  description?: string;
  accuracy?: 'mapped' | 'approximate' | 'illustrative';
  sourceUrl?: string;
  color?: string;
  glyph?: string;
  onClick?: () => void;
}
export interface MapCircle extends MapPosition { id: string; radius: number; color: string; title?: string }
export interface RouteSummary { distanceMeters: number; durationMillis: number; arrival: Date; provider?: 'Google Routes' | 'OSRM fallback' }
export type RouteStatus = 'idle' | 'loading' | 'ready' | 'error';

type GoogleEvent = { remove: () => void };
type GoogleMapObject = {
  addListener: (event: string, callback: (...args: any[]) => void) => GoogleEvent;
  fitBounds: (bounds: any, padding?: number | object) => void;
  panTo: (point: MapPosition) => void;
  setZoom: (zoom: number) => void;
  getZoom: () => number | undefined;
  setMapTypeId: (mapTypeId: string) => void;
};
type GoogleOverlay = { setMap: (map: GoogleMapObject | null) => void };
type GoogleMarker = GoogleOverlay & {
  setPosition: (point: MapPosition) => void;
  setIcon: (icon: object) => void;
  setTitle: (title: string) => void;
  setDraggable: (draggable: boolean) => void;
  addListener: GoogleMapObject['addListener'];
};
type GoogleCircle = GoogleOverlay & {
  setOptions: (options: object) => void;
  setCenter: (point: MapPosition) => void;
  setRadius: (radius: number) => void;
  addListener: GoogleMapObject['addListener'];
};
type GooglePolyline = GoogleOverlay & { setOptions: (options: object) => void };
type GoogleApi = {
  maps: {
    Map: new (element: HTMLElement, options: object) => GoogleMapObject;
    Marker: new (options: object) => GoogleMarker;
    Circle: new (options: object) => GoogleCircle;
    InfoWindow: new (options?: object) => { open: (options: object) => void; setContent: (content: HTMLElement | string) => void; setPosition: (position: MapPosition) => void };
    Polyline: new (options: object) => GooglePolyline;
    SymbolPath: { FORWARD_CLOSED_ARROW: string; CIRCLE: string };
    importLibrary: (name: string) => Promise<any>;
    LatLngBounds: new () => { extend: (point: MapPosition) => void };
  };
};

type GoogleWindow = Window & { google?: GoogleApi; __kumbhMapsReady?: () => void };
let mapsPromise: Promise<GoogleApi> | null = null;

export function loadGoogleMaps(): Promise<GoogleApi> {
  const googleWindow = window as GoogleWindow;
  if (googleWindow.google?.maps) return Promise.resolve(googleWindow.google);
  if (mapsPromise) return mapsPromise;

  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim();
  if (!key) return Promise.reject(new Error('Google Maps demo key is missing. Add VITE_GOOGLE_MAPS_API_KEY to .env.local.'));

  mapsPromise = new Promise((resolve, reject) => {
    const callbackName = '__kumbhMapsReady';
    const script = document.createElement('script');
    const cleanup = () => {
      delete googleWindow.__kumbhMapsReady;
      script.onerror = null;
    };
    googleWindow[callbackName] = () => {
      const api = googleWindow.google;
      cleanup();
      if (api?.maps) resolve(api);
      else reject(new Error('Google Maps loaded without its map API.'));
    };
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly&loading=async&callback=${callbackName}`;
    script.onerror = () => {
      cleanup();
      mapsPromise = null;
      reject(new Error('Google Maps could not load. Check the network, API key, and enabled APIs.'));
    };
    document.head.appendChild(script);
  });
  return mapsPromise;
}

function toPosition(point: any): MapPosition {
  if (typeof point?.lat === 'function') return { lat: point.lat(), lng: point.lng() };
  return { lat: Number(point?.lat), lng: Number(point?.lng) };
}

function distanceMeters(a: MapPosition, b: MapPosition): number {
  const radians = Math.PI / 180;
  const dLat = (b.lat - a.lat) * radians;
  const dLng = (b.lng - a.lng) * radians;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * radians) * Math.cos(b.lat * radians) * Math.sin(dLng / 2) ** 2;
  return 6_371_000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function bearingDegrees(from: MapPosition, to: MapPosition): number {
  const radians = Math.PI / 180;
  const y = Math.sin((to.lng - from.lng) * radians) * Math.cos(to.lat * radians);
  const x = Math.cos(from.lat * radians) * Math.sin(to.lat * radians)
    - Math.sin(from.lat * radians) * Math.cos(to.lat * radians) * Math.cos((to.lng - from.lng) * radians);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

function routeDistanceFrom(route: any, location: MapPosition): number {
  const path: MapPosition[] = (route?.path ?? []).map(toPosition);
  if (path.length < 2) return Number(route?.distanceMeters) || 0;
  let nearestIndex = 0;
  let nearest = Number.POSITIVE_INFINITY;
  for (let index = 0; index < path.length; index += 1) {
    const distance = distanceMeters(location, path[index]);
    if (distance < nearest) { nearest = distance; nearestIndex = index; }
  }
  let remaining = nearest;
  for (let index = nearestIndex; index < path.length - 1; index += 1) remaining += distanceMeters(path[index], path[index + 1]);
  return remaining;
}

function routeDeviation(route: any, location: MapPosition): number {
  const path: MapPosition[] = (route?.path ?? []).map(toPosition);
  if (!path.length) return Number.POSITIVE_INFINITY;
  const step = Math.max(1, Math.floor(path.length / 500));
  let minimum = Number.POSITIVE_INFINITY;
  for (let index = 0; index < path.length; index += step) minimum = Math.min(minimum, distanceMeters(location, path[index]));
  return minimum;
}

function clearOverlays(overlays: GoogleOverlay[]) {
  overlays.forEach((overlay) => overlay.setMap(null));
  overlays.length = 0;
}

function validMapPosition(point: MapPosition): boolean {
  return Number.isFinite(point.lat) && Number.isFinite(point.lng)
    && point.lat >= -90 && point.lat <= 90 && point.lng >= -180 && point.lng <= 180;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeoutId: number | undefined;
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      timeoutId = window.setTimeout(() => reject(new Error('Google route request timed out.')), timeoutMs);
    }),
  ]).finally(() => { if (timeoutId !== undefined) window.clearTimeout(timeoutId); });
}

async function getOsrmRoute(points: MapPosition[], signal: AbortSignal) {
  const coordinates = points.map(({ lat, lng }) => `${lng},${lat}`).join(';');
  const query = new URLSearchParams({ overview: 'full', geometries: 'geojson', steps: 'false' });
  const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordinates}?${query}`, { signal });
  if (!response.ok) throw new Error(`Road routing service returned ${response.status}.`);
  const data = await response.json();
  const route = data.routes?.[0];
  const path = route?.geometry?.coordinates?.map(([lng, lat]: [number, number]) => ({ lat: Number(lat), lng: Number(lng) }));
  if (data.code !== 'Ok' || !Array.isArray(path) || path.length < 2
    || !Number.isFinite(Number(route.distance)) || !Number.isFinite(Number(route.duration))) {
    throw new Error(data.message || 'No drivable road route was found.');
  }
  return {
    path,
    distanceMeters: Number(route.distance),
    durationMillis: Number(route.duration) * 1000,
    provider: 'OSRM fallback' as const,
  };
}

export interface GoogleNavigationMapProps {
  center: MapPosition;
  focus?: MapPosition | null;
  position?: MapPosition | null;
  positionTitle?: string;
  markers?: MapPoint[];
  circles?: MapCircle[];
  stops?: MapStop[];
  onAddStop?: (position: MapPosition) => void;
  onStopMove?: (id: string, position: MapPosition) => void;
  onRouteChange?: (status: RouteStatus, summary?: RouteSummary | null, message?: string) => void;
  onReady?: () => void;
  rerouteToken?: number;
  followToken?: number;
  travelMode?: MapTravelMode;
  onTravelModeChange?: (mode: MapTravelMode) => void;
  onLocateMe?: () => void;
  locating?: boolean;
  className?: string;
  zoom?: number;
}

export function GoogleNavigationMap({
  center,
  focus = null,
  position = null,
  positionTitle = 'Current location',
  markers = [],
  circles = [],
  stops = [],
  onAddStop,
  onStopMove,
  onRouteChange,
  onReady,
  rerouteToken = 0,
  followToken = 0,
  travelMode = 'DRIVING',
  onTravelModeChange,
  onLocateMe,
  locating = false,
  className = '',
  zoom = 15,
}: GoogleNavigationMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<GoogleMapObject | null>(null);
  const apiRef = useRef<GoogleApi | null>(null);
  const gpsMarkerRef = useRef<GoogleMarker | null>(null);
  const gpsCircleRef = useRef<GoogleOverlay | null>(null);
  const locationRef = useRef<MapPosition | null>(null);
  const animationRef = useRef<number | null>(null);
  const markerObjectsRef = useRef(new Map<string, { marker: GoogleMarker; listener: GoogleEvent }>());
  const circleObjectsRef = useRef(new Map<string, { circle: GoogleCircle; listener: GoogleEvent | null }>());
  const infoWindowRef = useRef<{ open: (options: object) => void; setContent: (content: HTMLElement | string) => void; setPosition: (position: MapPosition) => void } | null>(null);
  const markersDataRef = useRef(markers);
  const circlesDataRef = useRef(circles);
  const stopMarkersRef = useRef<GoogleMarker[]>([]);
  const routeRef = useRef<any>(null);
  const routeOverlaysRef = useRef<GooglePolyline[]>([]);
  const routeRequestIdRef = useRef(0);
  const pendingRouteKeyRef = useRef<string | null>(null);
  const routeAbortRef = useRef<AbortController | null>(null);
  const lastRouteStartRef = useRef<MapPosition | null>(null);
  const lastRouteAtRef = useRef(0);
  const lastStopKeyRef = useRef('');
  const followRef = useRef(true);
  const callbacksRef = useRef({ onAddStop, onStopMove, onRouteChange, onReady });
  const travelModeRef = useRef(travelMode);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('roadmap');
  const [layersOpen, setLayersOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [networkRevision, setNetworkRevision] = useState(0);
  const [pointSelectionArmed, setPointSelectionArmed] = useState(false);
  const pointSelectionArmedRef = useRef(false);

  callbacksRef.current = { onAddStop, onStopMove, onRouteChange, onReady };
  travelModeRef.current = travelMode;
  markersDataRef.current = markers;
  circlesDataRef.current = circles;

  useEffect(() => {
    let cancelled = false;
    let dragListener: GoogleEvent | null = null;
    let clickListener: GoogleEvent | null = null;
    void loadGoogleMaps().then((api) => {
      if (cancelled || !hostRef.current) return;
      apiRef.current = api;
      const map = new api.maps.Map(hostRef.current, {
        center,
        zoom,
        mapId: 'DEMO_MAP_ID',
        mapTypeId: 'roadmap',
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: false,
        cameraControl: false,
        gestureHandling: 'greedy',
      });
      mapRef.current = map;
      setMapReady(true);
      dragListener = map.addListener('dragstart', () => { followRef.current = false; });
      clickListener = map.addListener('click', (event: any) => {
        if (!pointSelectionArmedRef.current) return;
        const point = event?.latLng ? toPosition(event.latLng) : null;
        pointSelectionArmedRef.current = false;
        setPointSelectionArmed(false);
        if (point) callbacksRef.current.onAddStop?.(point);
      });
      callbacksRef.current.onReady?.();
    }).catch((error: unknown) => {
      if (!cancelled) setLoadError(error instanceof Error ? error.message : 'Google Maps could not be loaded.');
    });
    return () => {
      cancelled = true;
      routeRequestIdRef.current += 1;
      routeAbortRef.current?.abort();
      routeAbortRef.current = null;
      pendingRouteKeyRef.current = null;
      dragListener?.remove();
      clickListener?.remove();
      if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
      gpsMarkerRef.current?.setMap(null);
      gpsCircleRef.current?.setMap(null);
      clearOverlays(routeOverlaysRef.current);
      markerObjectsRef.current.forEach(({ marker, listener }) => { listener.remove(); marker.setMap(null); });
      markerObjectsRef.current.clear();
      circleObjectsRef.current.forEach(({ circle, listener }) => { listener?.remove(); circle.setMap(null); });
      circleObjectsRef.current.clear();
      stopMarkersRef.current.forEach((marker) => marker.setMap(null));
      stopMarkersRef.current = [];
      mapRef.current = null;
      apiRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapReady || !focus || !validMapPosition(focus)) return;
    mapRef.current?.panTo(focus);
  }, [focus?.lat, focus?.lng, mapReady]);

  useEffect(() => {
    if (!mapReady || followToken === 0 || !position) return;
    followRef.current = true;
    mapRef.current?.panTo(position);
    mapRef.current?.setZoom(16);
  }, [followToken, mapReady]);

  useEffect(() => {
    const updateFullscreen = () => setIsFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener('fullscreenchange', updateFullscreen);
    return () => document.removeEventListener('fullscreenchange', updateFullscreen);
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      routeRef.current = null;
      lastStopKeyRef.current = '';
      setNetworkRevision((revision) => revision + 1);
    };
    const handleOffline = () => callbacksRef.current.onRouteChange?.('error', null, 'Internet connection lost. Route requests are paused.');
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const api = apiRef.current;
    if (!map || !api || !mapReady) return;
    const info = infoWindowRef.current ?? new api.maps.InfoWindow();
    infoWindowRef.current = info;
    const markerIds = new Set(markers.map((point) => point.id));
    markerObjectsRef.current.forEach(({ marker, listener }, id) => {
      if (markerIds.has(id)) return;
      listener.remove();
      marker.setMap(null);
      markerObjectsRef.current.delete(id);
    });
    markers.forEach((point) => {
      const icon = point.color ? { path: api.maps.SymbolPath.CIRCLE, fillColor: point.color, fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2, scale: 13 } : undefined;
      const existing = markerObjectsRef.current.get(point.id);
      if (existing) {
        existing.marker.setPosition({ lat: point.lat, lng: point.lng });
        existing.marker.setTitle(point.title);
        if (icon) existing.marker.setIcon(icon);
        return;
      }
      const marker = new api.maps.Marker({ map, position: { lat: point.lat, lng: point.lng }, title: point.title, label: point.glyph ? { text: point.glyph, color: '#fff', fontWeight: '700', fontSize: '12px' } : undefined, icon });
      const listener = marker.addListener('click', () => {
        const current = markersDataRef.current.find((item) => item.id === point.id);
        if (!current) return;
        current.onClick?.();
        const content = document.createElement('div');
        const title = document.createElement('strong');
        title.textContent = current.title;
        content.appendChild(title);
        if (current.description) {
          const description = document.createElement('div');
          description.textContent = current.description;
          content.appendChild(description);
        }
        if (current.accuracy) {
          const accuracy = document.createElement('div');
          accuracy.style.marginTop = '6px';
          accuracy.style.fontWeight = '600';
          accuracy.textContent = current.accuracy === 'illustrative'
            ? 'Illustrative prototype pin — not an official operational location.'
            : current.accuracy === 'approximate'
              ? 'Approximate representative point; confirm the exact entrance locally.'
            : 'OpenStreetMap-mapped feature point; check the access point locally.';
          content.appendChild(accuracy);
        }
        if (current.sourceUrl) {
          const source = document.createElement('a');
          source.href = current.sourceUrl;
          source.target = '_blank';
          source.rel = 'noopener noreferrer';
          source.textContent = 'Location source';
          source.style.display = 'inline-block';
          source.style.marginTop = '5px';
          content.appendChild(source);
        }
        const directionsUrl = new URL('https://www.google.com/maps/dir/');
        directionsUrl.searchParams.set('api', '1');
        directionsUrl.searchParams.set('destination', `${current.lat},${current.lng}`);
        const liveOrigin = locationRef.current;
        if (liveOrigin) directionsUrl.searchParams.set('origin', `${liveOrigin.lat},${liveOrigin.lng}`);
        directionsUrl.searchParams.set('travelmode', travelModeRef.current === 'WALKING' ? 'walking' : travelModeRef.current === 'TWO_WHEELER' ? 'two-wheeler' : 'driving');
        const directions = document.createElement('a');
        directions.href = directionsUrl.toString();
        directions.target = '_blank';
        directions.rel = 'noopener noreferrer';
        directions.textContent = 'Navigate in Google Maps';
        directions.style.display = 'inline-block';
        directions.style.marginTop = '6px';
        directions.style.fontWeight = '600';
        content.appendChild(directions);
        info.setContent(content);
        info.open({ map, anchor: marker });
      });
      markerObjectsRef.current.set(point.id, { marker, listener });
    });

    const circleIds = new Set(circles.map((circle) => circle.id));
    circleObjectsRef.current.forEach(({ circle, listener }, id) => {
      if (circleIds.has(id)) return;
      listener?.remove();
      circle.setMap(null);
      circleObjectsRef.current.delete(id);
    });
    circles.forEach((item) => {
      const existing = circleObjectsRef.current.get(item.id);
      if (existing) {
        existing.circle.setCenter({ lat: item.lat, lng: item.lng });
        existing.circle.setRadius(item.radius);
        existing.circle.setOptions({ strokeColor: item.color, fillColor: item.color, clickable: Boolean(item.title) });
        return;
      }
      const circle = new api.maps.Circle({ map, center: { lat: item.lat, lng: item.lng }, radius: item.radius, strokeColor: item.color, strokeOpacity: 0.85, strokeWeight: 2, fillColor: item.color, fillOpacity: 0.2, clickable: Boolean(item.title) });
      const listener = item.title ? circle.addListener('click', () => {
        const current = circlesDataRef.current.find((candidate) => candidate.id === item.id);
        if (!current?.title) return;
        const content = document.createElement('strong');
        content.textContent = current.title;
        info.setContent(content);
        info.setPosition({ lat: current.lat, lng: current.lng });
        info.open({ map });
      }) : null;
      circleObjectsRef.current.set(item.id, { circle, listener });
    });
  }, [markers, circles, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    const api = apiRef.current;
    if (!map || !api || !mapReady || !position || !Number.isFinite(position.lat) || !Number.isFinite(position.lng)) return;
    if (!gpsMarkerRef.current) {
      gpsMarkerRef.current = new api.maps.Marker({
        map,
        position,
        title: positionTitle,
        zIndex: 1000,
        icon: { path: api.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 7, fillColor: '#2563eb', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2, rotation: 0 },
      });
      gpsCircleRef.current = new api.maps.Circle({ map, center: position, radius: 60, strokeColor: '#2563eb', strokeOpacity: 0.7, strokeWeight: 1, fillColor: '#60a5fa', fillOpacity: 0.16, clickable: false });
    }
    const previous = locationRef.current ?? position;
    if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
    const distance = distanceMeters(previous, position);
    const heading = distance > 1 ? bearingDegrees(previous, position) : null;
    if (heading !== null) gpsMarkerRef.current.setIcon({ path: api.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 7, fillColor: '#2563eb', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2, rotation: heading });
    const startedAt = performance.now();
    const duration = Math.min(900, Math.max(250, distance * 8));
    const animate = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const next = { lat: previous.lat + (position.lat - previous.lat) * progress, lng: previous.lng + (position.lng - previous.lng) * progress };
      gpsMarkerRef.current?.setPosition(next);
      gpsCircleRef.current && (gpsCircleRef.current as any).setCenter(next);
      if (progress < 1) animationRef.current = requestAnimationFrame(animate);
      else animationRef.current = null;
    };
    animationRef.current = requestAnimationFrame(animate);
    if (followRef.current) map.panTo(position);
    locationRef.current = position;
  }, [position, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    const api = apiRef.current;
    if (!map || !api || !mapReady) return;
    stopMarkersRef.current.forEach((marker) => marker.setMap(null));
    stopMarkersRef.current = stops.map((stop, index) => {
      const marker = new api.maps.Marker({
        map,
        position: { lat: stop.lat, lng: stop.lng },
        title: stop.label,
        label: { text: String(index + 1), color: '#fff', fontWeight: 'bold' },
        draggable: Boolean(callbacksRef.current.onStopMove),
        icon: { path: api.maps.SymbolPath.CIRCLE, fillColor: index === stops.length - 1 ? '#dc2626' : '#f97316', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2, scale: 8 },
      });
      const listener = marker.addListener('dragend', (event: any) => {
        if (event?.latLng) callbacksRef.current.onStopMove?.(stop.id, toPosition(event.latLng));
      });
      (marker as any).__listener = listener;
      return marker;
    });
    return () => {
      stopMarkersRef.current.forEach((marker: any) => { marker.__listener?.remove(); marker.setMap(null); });
      stopMarkersRef.current = [];
    };
  }, [stops, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    const api = apiRef.current;
    if (!map || !api || !mapReady) return;
    if (stops.some((stop) => !validMapPosition(stop))) {
      routeAbortRef.current?.abort();
      routeRequestIdRef.current += 1;
      pendingRouteKeyRef.current = null;
      clearOverlays(routeOverlaysRef.current);
      routeRef.current = null;
      callbacksRef.current.onRouteChange?.('error', null, 'A route waypoint has invalid coordinates.');
      return;
    }
    const stopKey = `${networkRevision}:${rerouteToken}:${travelMode}|${stops.map((stop) => `${stop.id}:${stop.lat.toFixed(5)}:${stop.lng.toFixed(5)}`).join('|')}`;
    const activeRoute = routeRef.current;
    if (!stops.length) {
      routeAbortRef.current?.abort();
      routeRequestIdRef.current += 1;
      pendingRouteKeyRef.current = null;
      clearOverlays(routeOverlaysRef.current);
      routeRef.current = null;
      lastRouteStartRef.current = null;
      callbacksRef.current.onRouteChange?.('idle', null);
      return;
    }
    if (!position) {
      callbacksRef.current.onRouteChange?.('idle', null, 'Waiting for a valid GPS fix to calculate a road route.');
      return;
    }
    if (!navigator.onLine) {
      routeAbortRef.current?.abort();
      routeRequestIdRef.current += 1;
      pendingRouteKeyRef.current = null;
      callbacksRef.current.onRouteChange?.('error', null, 'Internet connection is unavailable.');
      return;
    }
    const movedOffRoute = !activeRoute || routeDeviation(activeRoute, position) > 45;
    const startChangedEnough = !lastRouteStartRef.current || distanceMeters(lastRouteStartRef.current, position) > 25;
    const routeWasManuallyChanged = lastStopKeyRef.current !== stopKey;
    if (activeRoute && !(routeWasManuallyChanged || (movedOffRoute && startChangedEnough && Date.now() - lastRouteAtRef.current > 15_000))) {
      const total = Number(activeRoute.distanceMeters) || 0;
      const duration = Number(activeRoute.durationMillis) || 0;
      const remaining = routeDistanceFrom(activeRoute, position);
      const fraction = total > 0 ? Math.max(0, Math.min(1, remaining / total)) : 1;
      callbacksRef.current.onRouteChange?.('ready', { distanceMeters: remaining, durationMillis: duration * fraction, arrival: new Date(Date.now() + duration * fraction), provider: activeRoute.provider ?? 'Google Routes' });
      return;
    }
    if (!activeRoute && lastStopKeyRef.current === stopKey && Date.now() - lastRouteAtRef.current < 15_000) return;
    if (pendingRouteKeyRef.current === stopKey) return;
    routeAbortRef.current?.abort();
    const requestId = ++routeRequestIdRef.current;
    const routeAbort = new AbortController();
    routeAbortRef.current = routeAbort;
    pendingRouteKeyRef.current = stopKey;
    lastStopKeyRef.current = stopKey;
    clearOverlays(routeOverlaysRef.current);
    callbacksRef.current.onRouteChange?.('loading', null, activeRoute ? 'Off route. Recalculating…' : 'Finding a road route…');
    lastRouteAtRef.current = Date.now();
    lastRouteStartRef.current = position;

    const requestedPoints = [position, ...stops.map(({ lat, lng }) => ({ lat, lng }))];
    void (async () => {
      let route: any;
      try {
        route = await withTimeout((async () => {
          const routesLibrary = await api.maps.importLibrary('routes');
          const request = {
            origin: position,
            destination: { lat: stops[stops.length - 1].lat, lng: stops[stops.length - 1].lng },
            intermediates: stops.slice(0, -1).map((stop) => ({ location: { lat: stop.lat, lng: stop.lng } })),
            travelMode,
            ...(travelMode === 'DRIVING' ? { routingPreference: 'TRAFFIC_UNAWARE' } : {}),
            fields: ['path', 'distanceMeters', 'durationMillis', 'viewport', 'legs'],
          };
          const result = await routesLibrary.Route.computeRoutes(request);
          const googleRoute = result.routes?.[0];
          if (!googleRoute?.path?.length || !Number.isFinite(Number(googleRoute.distanceMeters)) || !Number.isFinite(Number(googleRoute.durationMillis))) {
            throw new Error('Google returned no usable road route.');
          }
          return googleRoute;
        })(), 8_000);
      } catch (error) {
        if (requestId !== routeRequestIdRef.current || routeAbort.signal.aborted) return;
        if (travelMode !== 'DRIVING') {
          routeRef.current = null;
          const detail = error instanceof Error ? error.message : 'Google Routes did not return a route.';
          callbacksRef.current.onRouteChange?.('error', null, `Google ${travelMode === 'WALKING' ? 'walking' : 'motorbike'} routing is unavailable: ${detail}`);
          return;
        }
        const osrmTimeoutId = window.setTimeout(() => routeAbort.abort(), 10_000);
        try {
          route = await getOsrmRoute(requestedPoints, routeAbort.signal);
        } catch (osrmError) {
          if (requestId === routeRequestIdRef.current && !routeAbort.signal.aborted) {
            routeRef.current = null;
            const detail = osrmError instanceof Error ? osrmError.message : 'OSRM did not return a route.';
            callbacksRef.current.onRouteChange?.('error', null, `Google routing failed and road-route fallback is unavailable: ${detail}`);
          }
          return;
        } finally {
          window.clearTimeout(osrmTimeoutId);
        }
      }
      if (requestId !== routeRequestIdRef.current || routeAbort.signal.aborted || mapRef.current !== map) return;

      routeRef.current = route;
      const routePath = route.path;
      const routeOutline = new api.maps.Polyline({ path: routePath, strokeColor: '#fff', strokeOpacity: 0.98, strokeWeight: 11, zIndex: 9 });
      const routeLine = new api.maps.Polyline({ path: routePath, strokeColor: '#1a73e8', strokeOpacity: 1, strokeWeight: 6, zIndex: 10 });
      [routeOutline, routeLine].forEach((polyline) => {
        polyline.setMap(map);
        routeOverlaysRef.current.push(polyline);
      });
      if (route.viewport) map.fitBounds(route.viewport, 48);
      else {
        const bounds = new api.maps.LatLngBounds();
        route.path.forEach((point: any) => bounds.extend(toPosition(point)));
        map.fitBounds(bounds, 48);
      }
      const total = Number(route.distanceMeters);
      const duration = Number(route.durationMillis);
      const remaining = routeDistanceFrom(route, position);
      const fraction = total > 0 ? Math.max(0, Math.min(1, remaining / total)) : 1;
      callbacksRef.current.onRouteChange?.('ready', {
        distanceMeters: remaining,
        durationMillis: duration * fraction,
        arrival: new Date(Date.now() + duration * fraction),
        provider: route.provider ?? 'Google Routes',
      });
    })().catch((error: unknown) => {
      if (requestId === routeRequestIdRef.current && !routeAbort.signal.aborted) {
        routeRef.current = null;
        callbacksRef.current.onRouteChange?.('error', null, error instanceof Error ? error.message : 'Route service is unavailable.');
      }
    }).finally(() => {
      if (requestId === routeRequestIdRef.current) {
        pendingRouteKeyRef.current = null;
        routeAbortRef.current = null;
      }
    });
  }, [position, stops, mapReady, rerouteToken, networkRevision, travelMode]);

  const centerOnUser = () => {
    if (!position || !mapRef.current) return;
    followRef.current = true;
    mapRef.current.panTo(position);
    mapRef.current.setZoom(16);
  };
  const selectMapType = (next: 'roadmap' | 'satellite' | 'hybrid' | 'terrain') => {
    mapRef.current?.setMapTypeId(next);
    setMapType(next);
    setLayersOpen(false);
  };
  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void containerRef.current?.requestFullscreen();
  };
  const togglePointSelection = () => {
    const next = !pointSelectionArmedRef.current;
    pointSelectionArmedRef.current = next;
    setPointSelectionArmed(next);
  };

  return (
    <div ref={containerRef} className={`relative h-full min-h-[360px] w-full bg-slate-100 ${className}`}>
      <div ref={hostRef} className="absolute inset-0" />
      {stops.length > 0 && position && <div className="absolute left-1/2 top-3 z-10 flex -translate-x-1/2 items-center gap-1 rounded-xl border border-slate-200 bg-white/95 p-1 shadow-md" role="group" aria-label="Travel mode">
        {([
          ['DRIVING', '🚗', 'Car'],
          ['TWO_WHEELER', '🏍️', 'Bike'],
          ['WALKING', '🚶', 'Walk'],
        ] as const).map(([mode, icon, label]) => (
          <button key={mode} type="button" aria-pressed={travelMode === mode} aria-label={`Travel by ${label.toLowerCase()}`}
            onClick={() => onTravelModeChange?.(mode)}
            className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${travelMode === mode ? 'bg-indigo-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>
            <span aria-hidden="true">{icon}</span> <span>{label}</span>
          </button>
        ))}
      </div>}
      <div className="absolute right-4 top-3 z-20">
        <button type="button" aria-expanded={layersOpen} aria-haspopup="menu" onClick={() => setLayersOpen((open) => !open)}
          className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-md hover:bg-slate-50">
          <span aria-hidden="true">▧</span><span>Layers</span><span className="text-[10px]">{layersOpen ? '▲' : '▼'}</span>
        </button>
        {layersOpen && <div role="menu" aria-label="Map type" className="absolute right-0 mt-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
          {([
            ['roadmap', 'Map', '🗺️'],
            ['satellite', 'Satellite', '🛰️'],
            ['hybrid', 'Hybrid', '🌐'],
            ['terrain', 'Terrain', '⛰️'],
          ] as const).map(([type, label, icon]) => <button key={type} type="button" role="menuitemradio" aria-checked={mapType === type}
            onClick={() => selectMapType(type)} className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${mapType === type ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`}>
            <span><span className="mr-2" aria-hidden="true">{icon}</span>{label}</span>{mapType === type && <span aria-hidden="true">✓</span>}
          </button>)}
        </div>}
      </div>
      {stops.length > 0 && position && (travelMode === 'WALKING' || travelMode === 'TWO_WHEELER') && <div role="note" className="absolute left-1/2 top-[3.65rem] z-10 w-max max-w-[min(92vw,26rem)] -translate-x-1/2 rounded-lg bg-amber-50/95 px-2.5 py-1.5 text-center text-[10px] font-medium text-amber-900 shadow-sm">
        {travelMode === 'WALKING' ? 'Walking routes may omit some sidewalks or paths.' : 'Motorbike routes are in beta and may not reflect every road restriction.'} Follow local signs and conditions.
      </div>}
      {onAddStop && <button type="button" onClick={togglePointSelection} aria-pressed={pointSelectionArmed}
        className={`absolute left-4 top-28 z-10 rounded-lg border px-3 py-2 text-xs font-semibold shadow ${pointSelectionArmed ? 'border-indigo-700 bg-indigo-700 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}>
        {pointSelectionArmed ? 'Tap map to select · Cancel' : !position && stops.length ? 'Choose starting point' : !position ? 'Set route point' : stops.length ? 'Add waypoint' : 'Choose destination'}
      </button>}
      <button type="button" onClick={toggleFullscreen} aria-label={isFullscreen ? 'Exit full screen map' : 'View full screen map'} title={isFullscreen ? 'Exit full screen' : 'Full screen'}
        className="absolute right-4 top-[3.5rem] z-20 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg font-semibold text-slate-700 shadow-md hover:bg-slate-50">{isFullscreen ? '⤢' : '⛶'}</button>
      {(onLocateMe || position) && <button type="button" onClick={() => { if (position) centerOnUser(); onLocateMe?.(); }} disabled={locating} aria-label="Find my live location" title={locating ? 'Finding your location…' : 'Find my live location'}
        className="absolute right-4 top-[6.5rem] z-10 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl font-semibold text-blue-700 shadow-md hover:bg-blue-50 disabled:cursor-wait disabled:opacity-60">{locating ? '◌' : '◎'}</button>}
      <div className="absolute bottom-8 right-4 z-10 flex flex-col overflow-hidden rounded-xl border border-slate-300 bg-white shadow-lg" role="group" aria-label="Map zoom controls">
        <button type="button" aria-label="Zoom in" title="Zoom in" onClick={() => { const map = mapRef.current; const zoom = map?.getZoom(); if (map && zoom !== undefined) map.setZoom(Math.min(21, zoom + 1)); }}
          className="flex h-11 w-11 items-center justify-center border-b border-slate-200 text-2xl font-normal leading-none text-slate-700 hover:bg-slate-50 active:bg-slate-100">+</button>
        <button type="button" aria-label="Zoom out" title="Zoom out" onClick={() => { const map = mapRef.current; const zoom = map?.getZoom(); if (map && zoom !== undefined) map.setZoom(Math.max(2, zoom - 1)); }}
          className="flex h-11 w-11 items-center justify-center text-2xl font-normal leading-none text-slate-700 hover:bg-slate-50 active:bg-slate-100">−</button>
      </div>
      {loadError && <div role="alert" className="absolute inset-x-3 top-3 z-20 rounded-lg bg-red-50 p-3 text-sm text-red-800 shadow">{loadError}</div>}
    </div>
  );
}
