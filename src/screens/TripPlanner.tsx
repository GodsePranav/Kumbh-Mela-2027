import React, { useState } from 'react';
import { PLACES } from '../data/mockData';

interface TripPlannerProps {
  onBack: () => void;
  onNavigate: (screen: string) => void;
}

interface Trip {
  id: string;
  name: string;
  date: string;
  places: string[];
  totalTime: string;
  totalDist: string;
}

const SAVED_TRIPS: Trip[] = [
  {
    id: 'trip1', name: 'Kumbh Spiritual Circuit',
    date: 'Aug 9, 2027', places: ['p1', 'p2', 'p4'],
    totalTime: '5–6 hrs', totalDist: '4.2 km',
  },
  {
    id: 'trip2', name: 'Trimbakeshwar Day Trip',
    date: 'Aug 12, 2027', places: ['p3'],
    totalTime: '4 hrs', totalDist: '56 km',
  },
];

export default function TripPlanner({ onBack, onNavigate }: TripPlannerProps) {
  const [activeTab, setActiveTab] = useState<'my' | 'create'>('my');
  const [trips, setTrips] = useState<Trip[]>(SAVED_TRIPS);
  const [newTrip, setNewTrip] = useState({ name: '', date: '', selectedPlaces: new Set<string>() });
  const [step, setStep] = useState(1);
  const [savedMsg, setSavedMsg] = useState(false);

  const togglePlace = (id: string) => {
    setNewTrip(t => {
      const s = new Set(t.selectedPlaces);
      if (s.has(id)) s.delete(id); else s.add(id);
      return { ...t, selectedPlaces: s };
    });
  };

  const saveTrip = () => {
    if (!newTrip.name || !newTrip.date || newTrip.selectedPlaces.size === 0) return;
    const trip: Trip = {
      id: 'trip' + Date.now(),
      name: newTrip.name,
      date: newTrip.date,
      places: [...newTrip.selectedPlaces],
      totalTime: `${newTrip.selectedPlaces.size * 1.5} hrs`,
      totalDist: `${(newTrip.selectedPlaces.size * 1.8).toFixed(1)} km`,
    };
    setTrips(t => [trip, ...t]);
    setNewTrip({ name: '', date: '', selectedPlaces: new Set() });
    setStep(1);
    setActiveTab('my');
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ background: '#FEFAF4' }}>
      <div className="gradient-indigo px-5 pt-14 pb-6">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={onBack} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h1 className="text-white font-bold text-lg" style={{ fontFamily: 'Poppins' }}>Trip Planner</h1>
        </div>
        <p className="text-indigo-300 text-xs ml-11">Plan your perfect Kumbh journey</p>
      </div>

      {savedMsg && (
        <div className="mx-5 mt-3 bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
          <span className="text-green-600">✓</span>
          <p className="text-green-700 text-sm font-medium">Trip saved successfully!</p>
        </div>
      )}

      <div className="flex gap-0 mx-5 mt-5 bg-stone-100 rounded-xl p-1">
        {[['my', '📋 My Trips'], ['create', '➕ Create Trip']].map(([tab, label]) => (
          <button key={tab} onClick={() => setActiveTab(tab as 'my' | 'create')}
            className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab ? 'bg-white text-indigo-700 shadow' : 'text-stone-500'
            }`} style={{ fontFamily: 'Poppins' }}>
            {label}
          </button>
        ))}
      </div>

      <div className="px-5 mt-4 space-y-3">
        {activeTab === 'my' && (
          <>
            {trips.length === 0 && (
              <div className="text-center py-12">
                <span className="text-5xl block mb-3">🗺️</span>
                <p className="text-stone-500 text-sm">No trips yet. Create your first trip!</p>
                <button onClick={() => setActiveTab('create')} className="mt-3 text-orange-600 text-sm font-semibold">+ Create Trip</button>
              </div>
            )}
            {trips.map(trip => {
              const tripPlaces = PLACES.filter(p => trip.places.includes(p.id));
              return (
                <div key={trip.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                  <div className="gradient-indigo p-4">
                    <p className="text-white font-bold text-sm" style={{ fontFamily: 'Poppins' }}>{trip.name}</p>
                    <p className="text-indigo-300 text-xs mt-0.5">📅 {trip.date}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-indigo-200 text-xs">⏱</span>
                        <span className="text-white text-xs">{trip.totalTime}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-indigo-200 text-xs">📍</span>
                        <span className="text-white text-xs">{trip.totalDist}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-indigo-200 text-xs">🛕</span>
                        <span className="text-white text-xs">{trip.places.length} stops</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="space-y-2">
                      {tripPlaces.map((place, i) => (
                        <div key={place.id} className="flex items-center gap-3">
                          <div className="flex flex-col items-center">
                            <div className="w-6 h-6 rounded-full gradient-saffron flex items-center justify-center text-white text-xs font-bold">{i + 1}</div>
                            {i < tripPlaces.length - 1 && <div className="w-0.5 h-4 bg-orange-200 mt-1" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-stone-800">{place.name}</p>
                            <p className="text-xs text-stone-500">{place.openHours} · {place.distance}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button onClick={() => onNavigate('map')}
                        className="flex-1 py-2.5 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-semibold">🗺️ View Route</button>
                      <button onClick={() => setTrips(t => t.filter(tr => tr.id !== trip.id))}
                        className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500 text-sm">🗑️</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {activeTab === 'create' && (
          <div className="space-y-4">
            {/* Step Indicator */}
            <div className="flex items-center gap-1">
              {[1, 2, 3].map(s => (
                <React.Fragment key={s}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    s <= step ? 'gradient-saffron text-white' : 'bg-stone-100 text-stone-400'
                  }`} style={{ fontFamily: 'Poppins' }}>{s}</div>
                  {s < 3 && <div className={`flex-1 h-0.5 ${s < step ? 'bg-orange-500' : 'bg-stone-200'}`} />}
                </React.Fragment>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-stone-500">
              <span>Name & Date</span><span>Add Places</span><span>Review</span>
            </div>

            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-stone-700 block mb-1.5">Trip Name *</label>
                  <input value={newTrip.name} onChange={e => setNewTrip(t => ({ ...t, name: e.target.value }))}
                    placeholder="e.g., My Kumbh Pilgrimage"
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl bg-white text-stone-800 text-sm placeholder-stone-400 focus:border-orange-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-700 block mb-1.5">Trip Date *</label>
                  <input type="date" value={newTrip.date} onChange={e => setNewTrip(t => ({ ...t, date: e.target.value }))}
                    min="2027-07-01" max="2027-09-30"
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl bg-white text-stone-800 text-sm focus:border-orange-500" />
                </div>
                <button onClick={() => newTrip.name && newTrip.date && setStep(2)}
                  disabled={!newTrip.name || !newTrip.date}
                  className="w-full py-3.5 rounded-2xl gradient-saffron text-white font-semibold shadow disabled:opacity-50"
                  style={{ fontFamily: 'Poppins' }}>
                  Next: Add Places →
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <p className="text-stone-600 text-sm">Select attractions to visit ({newTrip.selectedPlaces.size} selected)</p>
                {PLACES.map(place => {
                  const selected = newTrip.selectedPlaces.has(place.id);
                  return (
                    <button key={place.id} onClick={() => togglePlace(place.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                        selected ? 'border-orange-500 bg-orange-50' : 'border-stone-100 bg-white'
                      }`}>
                      <div className="w-14 h-14 rounded-xl bg-stone-200 overflow-hidden flex-shrink-0">
                        <img src={place.images[0]} alt={place.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-stone-800 text-sm" style={{ fontFamily: 'Poppins' }}>{place.name}</p>
                        <p className="text-stone-500 text-xs">{place.distance} · {place.openHours}</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        selected ? 'bg-orange-500 border-orange-500' : 'border-stone-300'
                      }`}>
                        {selected && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}
                      </div>
                    </button>
                  );
                })}
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="px-5 py-3 rounded-xl border border-stone-200 text-stone-600 text-sm">← Back</button>
                  <button onClick={() => newTrip.selectedPlaces.size > 0 && setStep(3)}
                    disabled={newTrip.selectedPlaces.size === 0}
                    className="flex-1 py-3 rounded-2xl gradient-saffron text-white font-semibold shadow disabled:opacity-50"
                    style={{ fontFamily: 'Poppins' }}>
                    Next: Review →
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-4 border border-stone-100">
                  <p className="font-bold text-stone-800 text-lg" style={{ fontFamily: 'Poppins' }}>{newTrip.name}</p>
                  <p className="text-stone-500 text-sm mt-0.5">📅 {newTrip.date}</p>
                  <div className="flex gap-4 mt-3 text-sm text-stone-600">
                    <span>🛕 {newTrip.selectedPlaces.size} stops</span>
                    <span>⏱ ~{(newTrip.selectedPlaces.size * 1.5).toFixed(0)} hrs</span>
                    <span>📍 ~{(newTrip.selectedPlaces.size * 1.8).toFixed(1)} km</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {PLACES.filter(p => newTrip.selectedPlaces.has(p.id)).map((place, i) => (
                    <div key={place.id} className="bg-white rounded-xl p-3 border border-stone-100 flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full gradient-saffron flex items-center justify-center text-white text-xs font-bold">{i + 1}</div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-stone-800">{place.name}</p>
                        <p className="text-xs text-stone-500">{place.openHours}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="px-5 py-3 rounded-xl border border-stone-200 text-stone-600 text-sm">← Back</button>
                  <button onClick={saveTrip}
                    className="flex-1 py-3.5 rounded-2xl gradient-saffron text-white font-semibold shadow"
                    style={{ fontFamily: 'Poppins' }}>
                    💾 Save Trip
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="h-4" />
    </div>
  );
}
