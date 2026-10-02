import React, { useState, useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Circle,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import { HOSPITALS, POLICE_STATIONS } from '../data/mockData';

// Fix Leaflet default icon paths broken by Vite bundler
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// --- Types ---
interface LatLng { lat: number; lng: number }
interface Destination extends LatLng { name: string }
interface SmartMapProps {
  onNavigate: (screen: string, params?: unknown) => void;
  onBack?: () => void;
  routeParams?: { destination: Destination } | null;
}

// --- 5 Tourist Places ---
const PLACES = [
  { id: 'p1', name: 'Panchavati',               lat: 19.9982, lng: 73.7910, icon: '🛕', color: '#F97316', crowd: 'Moderate' },
  { id: 'p2', name: 'Ramkund (Ram Ghat)',        lat: 19.9975, lng: 73.7898, icon: '🌊', color: '#0EA5E9', crowd: 'High'     },
  { id: 'p3', name: 'Trimbakeshwar Jyotirlinga', lat: 19.9312, lng: 73.5301, icon: '🔱', color: '#F59E0B', crowd: 'High'     },
  { id: 'p4', name: 'Tapovan',                   lat: 19.9910, lng: 73.8050, icon: '🌿', color: '#10B981', crowd: 'Low'      },
  { id: 'p5', name: 'Godavari Ghat',             lat: 19.9960, lng: 73.7882, icon: '💧', color: '#6366F1', crowd: 'Critical' },
];

// --- Custom coloured teardrop markers ---
function makeIcon(emoji: string, color: string) {
  return L.divIcon({
    className: '',
    html: `<div style="width:40px;height:40px;border-radius:50% 50% 50% 0;background:${color};border:3px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,.3);transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;"><span style="transform:rotate(45deg);font-size:18px;line-height:1">${emoji}</span></div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -44],
  });
}

const userIcon = L.divIcon({
  className: '',
  html: `<div style="position:relative;width:24px;height:24px"><div style="position:absolute;inset:0;border-radius:50%;background:rgba(59,130,246,0.35);animation:lping 1.5s infinite ease-out"></div><div style="position:absolute;inset:4px;border-radius:50%;background:#3B82F6;border:3px solid #fff;box-shadow:0 2px 8px rgba(59,130,246,.7)"></div></div><style>@keyframes lping{0%{transform:scale(1);opacity:.8}100%{transform:scale(2.8);opacity:0}}</style>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// --- Recenter helper ---
function RecenterMap({ pos }: { pos: LatLng }) {
  const map = useMap();
  useEffect(() => { map.setView([pos.lat, pos.lng], map.getZoom()); }, [pos, map]);
  return null;
}

// --- Haversine distance (km) ---
function haversine(a: LatLng, b: LatLng) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

// --- Main Component ---
export default function SmartMap({ onNavigate, onBack, routeParams }: SmartMapProps) {
  const [userPos, setUserPos]   = useState<LatLng | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [destination, setDestination] = useState<Destination | null>(routeParams?.destination ?? null);
  const [locating, setLocating] = useState(true);
  const [eta, setEta]           = useState<string | null>(null);
  const [routeDist, setRouteDist] = useState<string | null>(null);
  const watchRef = useRef<number | null>(null);

  // Sync routeParams when navigating from another screen
  useEffect(() => {
    if (routeParams?.destination) {
      setDestination(routeParams.destination);
    }
  }, [routeParams]);

  // --- Live GPS tracking ---
  useEffect(() => {
    if (!navigator.geolocation) {
      setUserPos({ lat: 19.9975, lng: 73.7972 }); // Nashik fallback
      setLocating(false);
      setGpsError('Geolocation not supported — showing demo location.');
      return;
    }
    const ok = (p: GeolocationPosition) => {
      setUserPos({ lat: p.coords.latitude, lng: p.coords.longitude });
      setLocating(false);
      setGpsError(null);
    };
    const fail = () => {
      setUserPos({ lat: 19.9975, lng: 73.7972 });
      setLocating(false);
      setGpsError('GPS unavailable — showing Nashik centre.');
    };
    navigator.geolocation.getCurrentPosition(ok, fail, { enableHighAccuracy: true });
    watchRef.current = navigator.geolocation.watchPosition(ok, fail, {
      enableHighAccuracy: true, maximumAge: 5000, timeout: 10000,
    });
    return () => { if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current); };
  }, []);

  // --- ETA & distance ---
  useEffect(() => {
    if (!userPos || !destination) { setEta(null); setRouteDist(null); return; }
    const dist = haversine(userPos, destination);
    setRouteDist(dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`);
    const mins = Math.round((dist / 25) * 60);
    setEta(mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)}h ${mins % 60}m`);
  }, [userPos, destination]);

  const centre: LatLng = userPos ?? { lat: 19.9975, lng: 73.7898 };
  const routeLine = userPos && destination
    ? ([[userPos.lat, userPos.lng], [destination.lat, destination.lng]] as [number, number][])
    : null;

  return (
    <div className="flex flex-col h-screen font-sans bg-slate-50">
      {/* Header */}
      <div className="bg-indigo-900 px-4 pt-12 pb-4 z-[1000] relative flex items-center gap-3 shadow-lg">
        <button
          onClick={() => (onBack ? onBack() : onNavigate('discovery'))}
          className="w-10 h-10 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 flex items-center justify-center text-white text-xl font-bold transition-all shrink-0 cursor-pointer border border-white/10"
          title="Back"
          aria-label="Go Back"
        >
          ←
        </button>
        <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-xl shrink-0">
          🗺️
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-white font-bold text-base truncate">
            {destination ? `Route → ${destination.name}` : 'Smart Map – Live Tracking'}
          </h1>
          <p className="text-indigo-200 text-xs flex items-center gap-1">
            {locating ? '📡 Acquiring GPS…' : gpsError ? `⚠️ ${gpsError}` : '🟢 GPS Active – Live'}
          </p>
        </div>
        {destination && (
          <button 
            onClick={() => setDestination(null)}
            className="text-white bg-white/20 hover:bg-white/30 text-xs px-3 py-1.5 rounded-full font-semibold transition-colors shrink-0"
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* ETA Banner */}
      {destination && eta && (
        <div className="z-[999] relative bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center text-xl shrink-0">
              🧭
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">NAVIGATING TO</p>
              <p className="text-sm font-bold text-slate-900 truncate">{destination.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-center">
              <p className="text-xl font-black text-orange-600 leading-none">{eta}</p>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">ETA</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-black text-indigo-600 leading-none">{routeDist}</p>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">DISTANCE</p>
            </div>
          </div>
        </div>
      )}

      {/* Leaflet Map */}
      <div className="flex-1 relative" style={{ zIndex: 0 }}>
        <MapContainer
          center={[centre.lat, centre.lng]}
          zoom={destination ? (destination.name.includes('Trimbakeshwar') ? 11 : 15) : 15}
          style={{ width: '100%', height: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {userPos && !destination && <RecenterMap pos={userPos} />}

          {/* User location */}
          {userPos && (
            <>
              <Circle center={[userPos.lat, userPos.lng]} radius={60}
                pathOptions={{ color: '#3B82F6', fillColor: '#93C5FD', fillOpacity: 0.2, weight: 1 }} />
              <Marker position={[userPos.lat, userPos.lng]} icon={userIcon}>
                <Popup>
                  <div className="font-sans">
                    <b className="text-sm text-slate-900">📍 You are here</b><br />
                    <span className="text-xs text-slate-500">
                      {userPos.lat.toFixed(5)}, {userPos.lng.toFixed(5)}
                    </span>
                  </div>
                </Popup>
              </Marker>
            </>
          )}

          {/* Dashed orange route line */}
          {routeLine && (
            <Polyline positions={routeLine}
              pathOptions={{ color: '#F97316', weight: 5, opacity: 0.9, dashArray: '14 8' }} />
          )}

          {/* 5 Place Markers */}
          {PLACES.map(place => (
            <Marker key={place.id} position={[place.lat, place.lng]} icon={makeIcon(place.icon, place.color)}>
              <Popup>
                <div style={{ minWidth: 170 }} className="font-sans">
                  <p style={{ fontWeight: 700, fontSize: 14, margin: '0 0 2px', color: '#0F172A' }}>{place.icon} {place.name}</p>
                  <p style={{ fontSize: 11, color: '#64748B', margin: '0 0 8px' }}>Crowd: <b style={{ color: '#0F172A' }}>{place.crowd}</b></p>
                  <button
                    style={{
                      width: '100%', padding: '8px 0', borderRadius: 8,
                      background: place.color, color: '#fff',
                      border: 'none', fontWeight: 700, fontSize: 12, cursor: 'pointer',
                    }}
                    onClick={() => setDestination({ lat: place.lat, lng: place.lng, name: place.name })}
                  >
                    🧭 Navigate Here
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Bottom quick-select */}
      <div className="z-[1000] relative bg-white border-t border-slate-200 px-4 pt-3 pb-6 shadow-2xl">
        <p className="text-[10px] text-slate-400 font-bold mb-2 uppercase tracking-widest">
          QUICK NAVIGATE
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {PLACES.map(place => {
            const active = destination?.name === place.name;
            return (
              <button key={place.id}
                onClick={() => setDestination({ lat: place.lat, lng: place.lng, name: place.name })}
                className="flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl border-2 transition-all cursor-pointer"
                style={{
                  borderColor: active ? place.color : '#E2E8F0',
                  background: active ? place.color + '15' : '#F8FAFC',
                  minWidth: 68,
                }}
              >
                <span className="text-xl leading-none">{place.icon}</span>
                <span style={{
                  fontSize: 10, fontWeight: 700, color: active ? place.color : '#475569',
                  textAlign: 'center', lineHeight: 1.2, maxWidth: 64,
                }}>
                  {place.name.replace('(Ram Ghat)', '').replace('Jyotirlinga', '').trim()}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
