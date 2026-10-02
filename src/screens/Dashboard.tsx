import React, { useState } from 'react';
import { WEATHER, HOTELS, HOSPITALS, PARKING_ZONES, NOTIFICATIONS, KUMBH_BATHING_DATES, PLACES } from '../data/mockData';

interface DashboardProps {
  user: { name: string; email: string; language: string };
  onNavigate: (screen: string, params?: unknown) => void;
}

const CROWD_AREAS = [
  { name: 'Panchavati', level: 'moderate', percent: 50 },
  { name: 'Ramkund Ghat', level: 'high', percent: 75 },
  { name: 'Trimbakeshwar', level: 'high', percent: 80 },
  { name: 'Tapovan', level: 'low', percent: 35 },
  { name: 'Godavari Ghat', level: 'critical', percent: 90 },
];

const CROWD_LABELS: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  low:      { label: 'Low',      bg: '#DCFCE7', text: '#16A34A', dot: '#16A34A' },
  moderate: { label: 'Moderate', bg: '#FEF3C7', text: '#D97706', dot: '#D97706' },
  high:     { label: 'High',     bg: '#FFF7ED', text: '#EA580C', dot: '#EA580C' },
  critical: { label: 'Critical', bg: '#FEE2E2', text: '#DC2626', dot: '#DC2626' },
};

export default function Dashboard({ user, onNavigate }: DashboardProps) {
  const [savedPlaces] = useState(['p2']);
  const unreadCount = NOTIFICATIONS.filter(n => !n.read).length;
  const nextBath = KUMBH_BATHING_DATES[1];
  const firstName = user.name.split(' ')[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ background: '#FEFAF4' }}>
      {/* Header */}
      <div className="gradient-indigo px-5 pt-14 pb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-orange-400/10 translate-y-1/2 -translate-x-1/4" />
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-indigo-300 text-sm">{greeting} 🙏</p>
            <h1 className="text-white text-xl font-bold mt-0.5" style={{ fontFamily: 'Poppins' }}>{firstName}</h1>
            <div className="flex items-center gap-1.5 mt-1.5">
              <svg className="w-3.5 h-3.5 text-orange-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <span className="text-orange-200 text-xs">Panchavati, Nashik</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate('notifications')} className="relative w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <button onClick={() => onNavigate('profile')}
              className="w-10 h-10 rounded-xl gradient-saffron flex items-center justify-center font-bold text-white text-sm shadow-lg">
              {firstName[0]?.toUpperCase()}
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar – floating over header */}
      <div className="px-5 -mt-6 relative z-10">
        <button onClick={() => onNavigate('discovery')}
          className="w-full bg-white rounded-2xl shadow-lg border border-stone-100 flex items-center gap-3 px-4 py-3.5">
          <svg className="w-5 h-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <span className="text-stone-400 text-sm">Search places, temples, ghats...</span>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">AI 🤖</span>
          </div>
        </button>
      </div>

      <div className="px-5 mt-5 space-y-5">

        {/* Weather + Next Bathing Date */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm">
            <p className="text-stone-500 text-xs font-medium mb-2">Weather – Nashik</p>
            <div className="flex items-center gap-2">
              <span className="text-3xl">{WEATHER.icon}</span>
              <div>
                <p className="text-2xl font-bold text-stone-800" style={{ fontFamily: 'Poppins' }}>{WEATHER.temp}°C</p>
                <p className="text-xs text-stone-500">{WEATHER.description}</p>
              </div>
            </div>
            <div className="mt-2 flex gap-3 text-xs text-stone-500">
              <span>💧 {WEATHER.humidity}%</span>
              <span>🌬️ {WEATHER.wind}</span>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm">
            <p className="text-stone-500 text-xs font-medium mb-2">Next Bathing Date</p>
            <div className="flex items-start gap-2">
              <span className="text-2xl">🔱</span>
              <div>
                <p className="text-xs font-bold text-orange-600" style={{ fontFamily: 'Poppins' }}>{nextBath.date}</p>
                <p className="text-xs text-stone-700 mt-0.5">{nextBath.event}</p>
              </div>
            </div>
            <div className="mt-2">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold`}
                style={{ background: CROWD_LABELS[nextBath.crowd]?.bg, color: CROWD_LABELS[nextBath.crowd]?.text }}>
                Expected: {CROWD_LABELS[nextBath.crowd]?.label} Crowd
              </span>
            </div>
          </div>
        </div>

        {/* Live Crowd Status */}
        <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-stone-800 text-sm" style={{ fontFamily: 'Poppins' }}>Live Crowd Status</p>
            <button onClick={() => onNavigate('map')} className="text-xs text-orange-600 font-medium">View Map →</button>
          </div>
          <div className="space-y-2.5">
            {CROWD_AREAS.map(area => {
              const info = CROWD_LABELS[area.level];
              return (
                <div key={area.name} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: info.dot }} />
                  <p className="text-xs text-stone-700 flex-1">{area.name}</p>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 rounded-full bg-stone-100 overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${area.percent}%`, background: info.dot }} />
                    </div>
                    <span className="text-[10px] font-semibold w-14 text-right" style={{ color: info.text }}>{info.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Access Grid */}
        <div>
          <p className="font-semibold text-stone-800 text-sm mb-3" style={{ fontFamily: 'Poppins' }}>Quick Access</p>
          <div className="grid grid-cols-4 gap-3">
            {[
              { icon: '🛕', label: 'Temples', screen: 'discovery' },
              { icon: '🌊', label: 'Ghats', screen: 'discovery' },
              { icon: '🗺️', label: 'Smart Map', screen: 'map' },
              { icon: '📅', label: 'Events', screen: 'events' },
              { icon: '🏨', label: 'Hotels', screen: 'discovery' },
              { icon: '🍽️', label: 'Food', screen: 'discovery' },
              { icon: '🅿️', label: 'Parking', screen: 'discovery' },
              { icon: '🚌', label: 'Transport', screen: 'discovery' },
            ].map(item => (
              <button key={item.label} onClick={() => onNavigate(item.screen)}
                className="flex flex-col items-center gap-1.5 p-3 bg-white rounded-xl border border-stone-100 shadow-sm category-card">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-[10px] text-stone-600 font-medium text-center leading-tight">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* SOS + AI Banner */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => onNavigate('emergency')}
            className="gradient-emergency rounded-2xl p-4 text-left shadow-md active:scale-98 transition-all">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
              <span className="text-2xl">🆘</span>
            </div>
            <p className="text-white font-bold text-sm" style={{ fontFamily: 'Poppins' }}>SOS Emergency</p>
            <p className="text-red-100 text-xs mt-0.5">Tap for immediate help</p>
          </button>
          <button onClick={() => onNavigate('ai')}
            className="gradient-indigo rounded-2xl p-4 text-left shadow-md active:scale-98 transition-all">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mb-3">
              <span className="text-2xl">🤖</span>
            </div>
            <p className="text-white font-bold text-sm" style={{ fontFamily: 'Poppins' }}>AI Assistant</p>
            <p className="text-indigo-200 text-xs mt-0.5">Ask me anything</p>
          </button>
        </div>

        {/* Nearby Places */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-stone-800 text-sm" style={{ fontFamily: 'Poppins' }}>Nearby Attractions</p>
            <button onClick={() => onNavigate('discovery')} className="text-xs text-orange-600 font-medium">See All →</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5">
            {PLACES.slice(0, 5).map(place => {
              const info = CROWD_LABELS[place.crowdLevel];
              return (
                <button key={place.id} onClick={() => onNavigate('placeDetail', { placeId: place.id })}
                  className="flex-shrink-0 w-44 bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm text-left category-card">
                  <div className="relative h-28 bg-stone-200 overflow-hidden">
                    <img src={place.images[0]} alt={place.name} className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: info.bg, color: info.text }}>{info.label}</span>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-stone-800 text-xs leading-tight" style={{ fontFamily: 'Poppins' }}>{place.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-yellow-500 text-xs">★</span>
                      <span className="text-xs text-stone-600">{place.rating}</span>
                      <span className="text-stone-300">·</span>
                      <span className="text-xs text-stone-500">{place.distance}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Upcoming Kumbh Bathing Dates */}
        <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-stone-800 text-sm" style={{ fontFamily: 'Poppins' }}>Kumbh Bathing Dates</p>
            <button onClick={() => onNavigate('events')} className="text-xs text-orange-600 font-medium">All Events →</button>
          </div>
          <div className="space-y-2">
            {KUMBH_BATHING_DATES.slice(0, 4).map(d => {
              const info = CROWD_LABELS[d.crowd];
              return (
                <div key={d.date} className="flex items-center gap-3 py-2 border-b border-stone-50 last:border-0">
                  <div className="w-10 h-10 rounded-xl gradient-saffron flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">🔱</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-stone-800 truncate">{d.event}</p>
                    <p className="text-[11px] text-stone-500">{d.date}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
                    style={{ background: info.bg, color: info.text }}>{d.importance}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Parking Availability */}
        <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-stone-800 text-sm" style={{ fontFamily: 'Poppins' }}>Parking Availability</p>
            <button onClick={() => onNavigate('map')} className="text-xs text-orange-600 font-medium">Map View →</button>
          </div>
          <div className="space-y-2">
            {PARKING_ZONES.slice(0, 3).map(zone => {
              const pct = Math.round((zone.available / zone.capacity) * 100);
              const color = pct > 40 ? '#16A34A' : pct > 15 ? '#D97706' : '#DC2626';
              return (
                <div key={zone.id} className="flex items-center gap-3">
                  <span className="text-lg">🅿️</span>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-stone-700">{zone.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex-1 h-1.5 rounded-full bg-stone-100">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                      </div>
                      <span className="text-[10px] font-semibold" style={{ color }}>{zone.available} spots</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hospitals Nearby */}
        <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-stone-800 text-sm" style={{ fontFamily: 'Poppins' }}>Nearest Hospitals</p>
            <button onClick={() => onNavigate('emergency')} className="text-xs text-orange-600 font-medium">Emergency →</button>
          </div>
          <div className="space-y-2">
            {HOSPITALS.slice(0, 3).map(h => (
              <div key={h.id} className="flex items-center gap-3 py-1.5">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                  <span className="text-sm">🏥</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-stone-800">{h.name}</p>
                  <p className="text-[10px] text-stone-500">{h.distance} · {h.type}</p>
                </div>
                <a href={`tel:${h.contact}`} className="text-[10px] bg-green-50 text-green-700 px-2 py-1 rounded-lg font-medium">Call</a>
              </div>
            ))}
          </div>
        </div>

        {/* Transport Info */}
        <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm mb-4">
          <p className="font-semibold text-stone-800 text-sm mb-3" style={{ fontFamily: 'Poppins' }}>Transport Options</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[
              { icon: '🚌', label: 'Kumbh Special Bus', info: 'Every 15 min', fare: '₹20–50' },
              { icon: '🛺', label: 'E-Rickshaw', info: '6AM–10PM', fare: '₹30 fixed' },
              { icon: '🚂', label: 'Train', info: '8km away', fare: 'Varies' },
              { icon: '🚐', label: 'Shuttle', info: 'Continuous', fare: '₹10' },
            ].map(t => (
              <div key={t.label} className="flex-shrink-0 bg-stone-50 rounded-xl p-3 w-36 border border-stone-100">
                <span className="text-2xl">{t.icon}</span>
                <p className="text-xs font-semibold text-stone-700 mt-1.5 leading-tight">{t.label}</p>
                <p className="text-[10px] text-stone-500 mt-0.5">{t.info}</p>
                <p className="text-[10px] font-bold text-orange-600 mt-0.5">{t.fare}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
