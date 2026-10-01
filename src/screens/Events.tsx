import React, { useState } from 'react';
import { EVENTS, KUMBH_BATHING_DATES } from '../data/mockData';

interface EventsProps {
  onBack: () => void;
  onNavigate: (screen: string) => void;
}

const TYPE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  bathing:    { bg: '#EFF6FF', text: '#1D4ED8', label: 'Holy Bath' },
  cultural:   { bg: '#FDF4FF', text: '#7E22CE', label: 'Cultural' },
  exhibition: { bg: '#ECFDF5', text: '#065F46', label: 'Exhibition' },
  religious:  { bg: '#FFF7ED', text: '#C2410C', label: 'Religious' },
};

export default function Events({ onBack, onNavigate }: EventsProps) {
  const [activeTab, setActiveTab] = useState<'events' | 'bathing'>('events');
  const [addedEvents, setAddedEvents] = useState<Set<string>>(new Set(['e3']));
  const [selectedEvent, setSelectedEvent] = useState<typeof EVENTS[0] | null>(null);

  const toggleEvent = (id: string) => {
    setAddedEvents(s => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  if (selectedEvent) {
    const typeInfo = TYPE_COLORS[selectedEvent.type] || TYPE_COLORS.cultural;
    return (
      <div className="flex flex-col min-h-screen pb-24" style={{ background: '#FEFAF4' }}>
        <div className="relative h-64 bg-stone-300">
          <img src={selectedEvent.image} alt={selectedEvent.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <button onClick={() => setSelectedEvent(null)}
            className="absolute top-12 left-4 w-9 h-9 rounded-full glass flex items-center justify-center">
            <svg className="w-4 h-4 text-stone-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <div className="absolute bottom-4 left-5 right-5">
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: typeInfo.bg, color: typeInfo.text }}>
              {typeInfo.label}
            </span>
            <h1 className="text-white text-xl font-bold mt-2 leading-tight" style={{ fontFamily: 'Poppins' }}>{selectedEvent.title}</h1>
          </div>
        </div>

        <div className="px-5 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-3 border border-stone-100">
              <p className="text-stone-500 text-[10px] font-medium mb-1">DATE</p>
              <p className="text-stone-800 text-sm font-semibold" style={{ fontFamily: 'Poppins' }}>📅 {selectedEvent.date}</p>
            </div>
            <div className="bg-white rounded-2xl p-3 border border-stone-100">
              <p className="text-stone-500 text-[10px] font-medium mb-1">TIME</p>
              <p className="text-stone-800 text-sm font-semibold" style={{ fontFamily: 'Poppins' }}>🕐 {selectedEvent.time}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-stone-100">
            <p className="text-stone-500 text-[10px] font-medium mb-1">LOCATION</p>
            <p className="text-stone-800 text-sm font-semibold">📍 {selectedEvent.location}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-stone-100">
            <h3 className="font-semibold text-stone-800 text-sm mb-2" style={{ fontFamily: 'Poppins' }}>About This Event</h3>
            <p className="text-stone-600 text-sm leading-relaxed">{selectedEvent.description}</p>
          </div>
          {selectedEvent.important && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-semibold text-amber-800 text-sm">Important Event</p>
                <p className="text-amber-700 text-xs mt-0.5">This is a major Kumbh Mela event. Expect very high crowds. Plan and arrive early.</p>
              </div>
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={() => onNavigate('map')}
              className="flex-1 py-3.5 rounded-xl border-2 border-orange-500 text-orange-600 font-semibold text-sm flex items-center justify-center gap-2">
              🗺️ View Location
            </button>
            <button onClick={() => { toggleEvent(selectedEvent.id); }}
              className={`flex-1 py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow ${
                addedEvents.has(selectedEvent.id) ? 'bg-green-500 text-white' : 'gradient-saffron text-white'
              }`} style={{ fontFamily: 'Poppins' }}>
              {addedEvents.has(selectedEvent.id) ? '✓ Added to Trip' : '+ Add to Trip'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ background: '#FEFAF4' }}>
      <div className="gradient-saffron px-5 pt-14 pb-6">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={onBack} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h1 className="text-white font-bold text-lg" style={{ fontFamily: 'Poppins' }}>Events & Dates</h1>
        </div>
        <p className="text-orange-100 text-xs ml-11">Kumbh Mela Nashik 2027</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 mx-5 mt-5 bg-stone-100 rounded-xl p-1">
        {[['events', '🎭 All Events'], ['bathing', '🔱 Bathing Dates']].map(([tab, label]) => (
          <button key={tab} onClick={() => setActiveTab(tab as 'events' | 'bathing')}
            className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab ? 'bg-white text-orange-600 shadow' : 'text-stone-500'
            }`} style={{ fontFamily: 'Poppins' }}>
            {label}
          </button>
        ))}
      </div>

      <div className="px-5 mt-4 space-y-3">
        {activeTab === 'events' && EVENTS.map(event => {
          const typeInfo = TYPE_COLORS[event.type] || TYPE_COLORS.cultural;
          const isAdded = addedEvents.has(event.id);
          return (
            <button key={event.id} onClick={() => setSelectedEvent(event)}
              className="w-full bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm text-left category-card">
              <div className="relative h-40 bg-stone-200">
                <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: typeInfo.bg, color: typeInfo.text }}>
                    {typeInfo.label}
                  </span>
                  {event.important && (
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-red-600 text-white">Important</span>
                  )}
                </div>
                <button onClick={e => { e.stopPropagation(); toggleEvent(event.id); }}
                  className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow transition-all ${
                    isAdded ? 'bg-green-500' : 'bg-white/90'
                  }`}>
                  <span className={`text-sm ${isAdded ? 'text-white' : 'text-stone-500'}`}>{isAdded ? '✓' : '+'}</span>
                </button>
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-white font-bold text-sm leading-tight" style={{ fontFamily: 'Poppins' }}>{event.title}</h3>
                </div>
              </div>
              <div className="p-3 flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-stone-400 text-xs">📅</span>
                  <span className="text-stone-600 text-xs">{event.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-stone-400 text-xs">🕐</span>
                  <span className="text-stone-600 text-xs">{event.time}</span>
                </div>
              </div>
            </button>
          );
        })}

        {activeTab === 'bathing' && (
          <div className="space-y-3">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <p className="text-amber-800 text-sm font-semibold" style={{ fontFamily: 'Poppins' }}>📌 Important Notice</p>
              <p className="text-amber-700 text-xs mt-1 leading-relaxed">
                Shahi Snan dates see 20-30 lakh+ pilgrims. Book accommodation months in advance. Plan alternate routes and arrive a day early.
              </p>
            </div>
            {KUMBH_BATHING_DATES.map((d, i) => {
              const crowdColors: Record<string, { bg: string; text: string }> = {
                critical: { bg: '#FEE2E2', text: '#DC2626' },
                high: { bg: '#FFF7ED', text: '#EA580C' },
                moderate: { bg: '#FEF3C7', text: '#D97706' },
              };
              const c = crowdColors[d.crowd] || crowdColors.moderate;
              return (
                <div key={d.date} className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl gradient-saffron flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg" style={{ fontFamily: 'Poppins' }}>{i + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-stone-800 text-sm" style={{ fontFamily: 'Poppins' }}>{d.event}</p>
                    <p className="text-stone-500 text-xs mt-0.5">📅 {d.date}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: c.bg, color: c.text }}>{d.importance}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: c.bg, color: c.text }}>Expected: {d.crowd}</span>
                    </div>
                  </div>
                  <button className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
                    <span className="text-sm">🔔</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="h-4" />
    </div>
  );
}
