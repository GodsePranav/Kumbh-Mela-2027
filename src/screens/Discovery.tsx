import React, { useState, useMemo } from 'react';
import { MAP_MARKERS, PLACES, CATEGORIES } from '../data/mockData';

interface DiscoveryProps {
  onNavigate: (screen: string, params?: unknown) => void;
  onBack: () => void;
  initialPlaceId?: string;
}

const CROWD_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  low:      { label: 'Low',      bg: '#DCFCE7', text: '#16A34A' },
  moderate: { label: 'Moderate', bg: '#FEF3C7', text: '#D97706' },
  high:     { label: 'High',     bg: '#FFF7ED', text: '#EA580C' },
  critical: { label: 'Critical', bg: '#FEE2E2', text: '#DC2626' },
};

export default function Discovery({ onNavigate, onBack, initialPlaceId }: DiscoveryProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [savedPlaces, setSavedPlaces] = useState<Set<string>>(new Set(['p2']));
  const [selectedPlace, setSelectedPlace] = useState<typeof PLACES[0] | null>(() =>
    PLACES.find((place) => place.id === initialPlaceId) ?? null,
  );

  const filtered = useMemo(() => {
    return PLACES.filter(p => {
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        p.tags.some(t => t.includes(search.toLowerCase()));
      const matchCat = !activeCategory || p.category === activeCategory.toLowerCase() ||
        p.subcategory?.toLowerCase().includes(activeCategory.toLowerCase());
      return matchSearch && matchCat;
    });
  }, [search, activeCategory]);

  const toggleSave = (id: string) => {
    setSavedPlaces(s => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  if (selectedPlace) {
    return <PlaceDetail place={selectedPlace} saved={savedPlaces.has(selectedPlace.id)}
      onToggleSave={() => toggleSave(selectedPlace.id)}
      onBack={() => initialPlaceId ? onBack() : setSelectedPlace(null)}
      onNavigate={onNavigate} />;
  }

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ background: '#FEFAF4' }}>
      {/* Header */}
      <div className="gradient-saffron px-5 pt-14 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h1 className="text-white font-bold text-lg" style={{ fontFamily: 'Poppins' }}>Explore Nashik</h1>
        </div>
        <div className="relative">
          <svg className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search temples, ghats, food, hotels..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-stone-800 text-sm placeholder-stone-400 shadow-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-3 text-stone-400">✕</button>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="px-5 py-4">
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5">
          <button
            onClick={() => setActiveCategory(null)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              !activeCategory ? 'bg-orange-500 text-white shadow' : 'bg-white text-stone-600 border border-stone-200'
            }`}>
            All ({PLACES.length})
          </button>
          {CATEGORIES.slice(0, 10).map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(activeCategory === cat.name ? null : cat.name)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeCategory === cat.name ? 'bg-orange-500 text-white shadow' : 'bg-white text-stone-600 border border-stone-200'
              }`}>
              <span>{cat.icon}</span>
              {cat.name}
              <span className="text-[10px] opacity-70">({cat.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Results header */}
      <div className="px-5 flex items-center justify-between mb-3">
        <p className="text-stone-500 text-xs">{filtered.length} places found</p>
        <div className="flex gap-1">
          {['list', 'grid'].map(m => (
            <button key={m} onClick={() => setViewMode(m as 'list' | 'grid')}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${viewMode === m ? 'bg-orange-500 text-white' : 'bg-white text-stone-400 border border-stone-200'}`}>
              {m === 'list' ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Place List */}
      <div className={`px-5 ${viewMode === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-3'}`}>
        {filtered.length === 0 && (
          <div className="col-span-2 text-center py-16">
            <span className="text-5xl block mb-3">🔍</span>
            <p className="text-stone-500 text-sm">No places found for "{search}"</p>
            <button onClick={() => { setSearch(''); setActiveCategory(null); }}
              className="mt-3 text-orange-600 text-sm font-medium">Clear filters</button>
          </div>
        )}
        {filtered.map(place => {
          const info = CROWD_LABELS[place.crowdLevel];
          const isSaved = savedPlaces.has(place.id);
          if (viewMode === 'grid') {
            return (
              <button key={place.id} onClick={() => setSelectedPlace(place)}
                className="bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm text-left category-card">
                <div className="relative h-28 bg-stone-200">
                  <img src={place.images[0]} alt={place.name} className="w-full h-full object-cover" />
                  <button onClick={e => { e.stopPropagation(); toggleSave(place.id); }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow">
                    <span className={`text-sm ${isSaved ? 'text-red-500' : 'text-stone-400'}`}>{isSaved ? '❤️' : '🤍'}</span>
                  </button>
                </div>
                <div className="p-2.5">
                  <p className="font-semibold text-stone-800 text-xs leading-tight" style={{ fontFamily: 'Poppins' }}>{place.name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-yellow-500 text-[10px]">★</span>
                    <span className="text-[10px] text-stone-600">{place.rating}</span>
                  </div>
                  <span className="mt-1.5 inline-block text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
                    style={{ background: info.bg, color: info.text }}>{info.label}</span>
                </div>
              </button>
            );
          }
          return (
            <button key={place.id} onClick={() => setSelectedPlace(place)}
              className="bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm text-left flex category-card">
              <div className="relative w-28 h-28 flex-shrink-0 bg-stone-200">
                <img src={place.images[0]} alt={place.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 p-3">
                <div className="flex items-start justify-between">
                  <p className="font-semibold text-stone-800 text-sm leading-tight flex-1 pr-2" style={{ fontFamily: 'Poppins' }}>{place.name}</p>
                  <button onClick={e => { e.stopPropagation(); toggleSave(place.id); }}>
                    <span className={`text-lg ${isSaved ? 'text-red-500' : 'text-stone-300'}`}>{isSaved ? '❤️' : '🤍'}</span>
                  </button>
                </div>
                <p className="text-[10px] text-stone-500 mt-0.5">{place.subcategory}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex items-center gap-0.5">
                    <span className="text-yellow-500 text-xs">★</span>
                    <span className="text-xs text-stone-600 font-medium">{place.rating}</span>
                  </div>
                  <span className="text-stone-300">·</span>
                  <span className="text-xs text-stone-500">{place.distance}</span>
                  <span className="text-stone-300">·</span>
                  <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                    style={{ background: info.bg, color: info.text }}>{info.label}</span>
                </div>
                <p className="text-[10px] text-stone-400 mt-1 line-clamp-2 leading-relaxed">{place.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      <section className="px-5 pt-6" aria-labelledby="explore-map-locations">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 id="explore-map-locations" className="text-sm font-bold text-stone-800">Important locations & services</h2>
            <p className="mt-0.5 text-[11px] text-stone-500">Sacred sites, ghats, heritage places, and visitor support</p>
          </div>
          <button type="button" onClick={() => onNavigate('map')} className="text-xs font-semibold text-orange-600">Open map →</button>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {MAP_MARKERS.map((marker) => {
            const icon = marker.type === 'hospital' ? '🏥' : marker.type === 'police' ? '🚓' : marker.type === 'parking' ? '🅿️' : marker.type === 'ghat' ? '🌊' : marker.type === 'cave' ? '🪨' : marker.type === 'heritage' ? '🏛️' : marker.type === 'temple' ? '🛕' : '🙏';
            return (
              <button key={marker.id} type="button"
                onClick={() => onNavigate('map', { destination: { lat: marker.lat, lng: marker.lng, name: marker.name } })}
                className="flex items-center justify-between rounded-xl border border-stone-200 bg-white px-3 py-3 text-left shadow-sm transition hover:border-orange-300">
                <span className="flex items-center gap-3">
                  <span className="text-xl" aria-hidden="true">{icon}</span>
                <span><span className="block text-sm font-semibold text-stone-800">{marker.name}</span><span className="text-xs capitalize text-stone-500">{marker.type} · {marker.crowd} area · {marker.accuracy === 'illustrative' ? 'illustrative pin' : marker.accuracy === 'approximate' ? 'approximate location' : 'mapped feature'}</span></span>
                </span>
                <span className="text-xs font-semibold text-orange-600">Route →</span>
              </button>
            );
          })}
        </div>
      </section>
      <div className="h-4" />
    </div>
  );
}

function PlaceDetail({ place, saved, onToggleSave, onBack, onNavigate }: {
  place: typeof PLACES[0]; saved: boolean; onToggleSave: () => void;
  onBack: () => void; onNavigate: (s: string, p?: unknown) => void;
}) {
  const [activeImg, setActiveImg] = useState(0);
  const info = CROWD_LABELS[place.crowdLevel];

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ background: '#FEFAF4' }}>
      {/* Image */}
      <div className="relative h-72 bg-stone-300">
        <img src={place.images[activeImg]} alt={place.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <button onClick={onBack}
          className="absolute top-12 left-4 w-9 h-9 rounded-full glass flex items-center justify-center shadow">
          <svg className="w-4 h-4 text-stone-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <button onClick={onToggleSave}
          className="absolute top-12 right-4 w-9 h-9 rounded-full glass flex items-center justify-center shadow">
          <span className={`text-lg ${saved ? 'text-red-500' : 'text-stone-500'}`}>{saved ? '❤️' : '🤍'}</span>
        </button>
        {place.images.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {place.images.map((_, i) => (
              <button key={i} onClick={() => setActiveImg(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === activeImg ? 'bg-white w-5' : 'bg-white/50'}`} />
            ))}
          </div>
        )}
      </div>

      <div className="px-5 -mt-6 relative z-10">
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-stone-100">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h1 className="text-xl font-bold text-stone-900" style={{ fontFamily: 'Poppins' }}>{place.name}</h1>
              <p className="text-stone-500 text-xs mt-0.5">{place.subcategory}</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0"
              style={{ background: info.bg, color: info.text }}>{info.label} Crowd</span>
          </div>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1">
              <span className="text-yellow-500">★</span>
              <span className="font-semibold text-stone-700 text-sm">{place.rating}</span>
              <span className="text-stone-400 text-xs">({place.reviews.toLocaleString()})</span>
            </div>
            <span className="text-stone-300">·</span>
            <span className="text-stone-600 text-sm">📍 {place.distance}</span>
            <span className="text-stone-300">·</span>
            <span className="text-stone-600 text-sm">🕐 {place.openHours}</span>
          </div>
        </div>
      </div>

      <div className="px-5 mt-4 space-y-4">
        <div className="bg-white rounded-2xl p-4 border border-stone-100">
          <h3 className="font-semibold text-stone-800 text-sm mb-2" style={{ fontFamily: 'Poppins' }}>About</h3>
          <p className="text-stone-600 text-sm leading-relaxed">{place.description}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-stone-100">
          <h3 className="font-semibold text-stone-800 text-sm mb-3" style={{ fontFamily: 'Poppins' }}>Live Crowd</h3>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-3 rounded-full bg-stone-100 overflow-hidden">
              <div className="h-full rounded-full transition-all"
                style={{ width: `${place.crowdPercent}%`, background: info.text }} />
            </div>
            <span className="font-bold text-sm" style={{ color: info.text }}>{place.crowdPercent}%</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-stone-100">
          <h3 className="font-semibold text-stone-800 text-sm mb-3" style={{ fontFamily: 'Poppins' }}>Facilities</h3>
          <div className="flex flex-wrap gap-2">
            {place.facilities.map(f => (
              <span key={f} className="text-xs bg-stone-50 border border-stone-200 px-2.5 py-1 rounded-full text-stone-600">✓ {f}</span>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => onNavigate('map', { destination: { lat: place.lat, lng: place.lng, name: place.name } })}
            className="flex-1 py-3.5 rounded-xl border-2 border-orange-500 text-orange-600 font-semibold text-sm flex items-center justify-center gap-2"
            style={{ fontFamily: 'Poppins' }}>
            <span>🗺️</span> Get Route
          </button>
          <button onClick={() => onNavigate('trips')}
            className="flex-1 py-3.5 rounded-xl gradient-saffron text-white font-semibold text-sm flex items-center justify-center gap-2 shadow"
            style={{ fontFamily: 'Poppins' }}>
            <span>📋</span> Add to Trip
          </button>
        </div>
      </div>
      <div className="h-4" />
    </div>
  );
}
