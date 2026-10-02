import React, { useState } from 'react';
import { HOSPITALS, POLICE_STATIONS } from '../data/mockData';

interface EmergencyProps {
  onBack: () => void;
  onNavigate: (screen: string) => void;
}

type SOSState = 'idle' | 'confirming' | 'sending' | 'active';

export default function Emergency({ onBack, onNavigate }: EmergencyProps) {
  const [sosState, setSOSState] = useState<SOSState>('idle');
  const [countdown, setCountdown] = useState(5);
  const [emergencyType, setEmergencyType] = useState('');
  const [location] = useState('Panchavati, Nashik (19.9975°N, 73.7898°E)');
  const [reportId] = useState('EMG-' + Math.random().toString(36).substr(2, 8).toUpperCase());

  const handleSOS = () => {
    if (sosState === 'idle') {
      setSOSState('confirming');
      setCountdown(5);
      const interval = setInterval(() => {
        setCountdown(c => {
          if (c <= 1) {
            clearInterval(interval);
            setSOSState('sending');
            setTimeout(() => setSOSState('active'), 2000);
          }
          return c - 1;
        });
      }, 1000);
    }
  };

  const cancelSOS = () => {
    setSOSState('idle');
    setCountdown(5);
  };

  if (sosState === 'active') {
    return (
      <div className="fixed inset-0 flex flex-col" style={{ background: '#FEF2F2' }}>
        <div className="gradient-emergency px-5 pt-14 pb-8">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={cancelSOS} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
            <h1 className="text-white font-bold text-lg" style={{ fontFamily: 'Poppins' }}>SOS ACTIVE</h1>
            <div className="ml-auto flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white text-xs font-medium">LIVE</span>
            </div>
          </div>
          <div className="bg-white/15 rounded-2xl p-4">
            <p className="text-red-100 text-xs font-medium">Emergency Report ID</p>
            <p className="text-white text-lg font-bold" style={{ fontFamily: 'Poppins' }}>{reportId}</p>
          </div>
        </div>
        <div className="flex-1 px-5 py-5 overflow-y-auto space-y-4">
          {/* Status */}
          <div className="space-y-2">
            {[
              { done: true, label: 'Location captured', value: location },
              { done: true, label: 'Emergency report created', value: 'Sent to backend server' },
              { done: true, label: 'Admin notified', value: 'Kumbh Mela Control Room' },
              { done: true, label: 'Nearest volunteer alerted', value: 'Volunteer #NVL-2847 dispatched' },
              { done: false, label: 'Help on the way...', value: 'ETA: 8-12 minutes' },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3 bg-white rounded-xl p-3 border border-stone-100">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  step.done ? 'bg-green-500' : 'bg-orange-100'
                }`}>
                  {step.done
                    ? <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    : <div className="w-3 h-3 rounded-full border-2 border-orange-400 border-t-transparent animate-spin" />
                  }
                </div>
                <div>
                  <p className="text-stone-800 text-sm font-medium">{step.label}</p>
                  <p className="text-stone-500 text-xs">{step.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Nearby Help */}
          <div className="bg-white rounded-2xl p-4 border border-stone-100">
            <p className="font-semibold text-stone-800 text-sm mb-3" style={{ fontFamily: 'Poppins' }}>Nearest Help</p>
            <div className="space-y-2">
              {HOSPITALS.slice(0, 2).map(h => (
                <div key={h.id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                    <span>🏥</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-stone-800">{h.name}</p>
                    <p className="text-xs text-stone-500">{h.distance} · Emergency Open 24/7</p>
                  </div>
                  <a href={`tel:${h.contact}`}
                    className="bg-green-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg">
                    Call
                  </a>
                </div>
              ))}
              {POLICE_STATIONS.slice(0, 1).map(p => (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                    <span>👮</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-stone-800">{p.name}</p>
                    <p className="text-xs text-stone-500">{p.distance}</p>
                  </div>
                  <a href="tel:100" className="bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg">Call 100</a>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => onNavigate('map')}
            className="w-full py-3.5 rounded-2xl gradient-indigo text-white font-semibold text-sm flex items-center justify-center gap-2 shadow"
            style={{ fontFamily: 'Poppins' }}>
            🗺️ Navigate to Nearest Hospital
          </button>
          <button onClick={cancelSOS}
            className="w-full py-3 rounded-2xl border border-stone-300 text-stone-600 font-medium text-sm">
            Cancel Emergency Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ background: '#FEFAF4' }}>
      {/* Header */}
      <div className="gradient-emergency px-5 pt-14 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h1 className="text-white font-bold text-lg" style={{ fontFamily: 'Poppins' }}>Emergency Services</h1>
        </div>
      </div>

      <div className="px-5 py-6 space-y-5">
        {/* SOS Button */}
        {sosState === 'idle' && (
          <div className="flex flex-col items-center py-6">
            <p className="text-stone-600 text-sm text-center mb-6 max-w-xs">
              Press and hold the SOS button for emergency assistance. Your location will be shared with rescue teams.
            </p>
            <div className="relative flex items-center justify-center">
              <div className="absolute w-40 h-40 rounded-full bg-red-100" />
              <div className="absolute w-32 h-32 rounded-full bg-red-200" />
              <button onClick={handleSOS}
                className="relative w-28 h-28 rounded-full gradient-emergency text-white font-black text-2xl shadow-2xl sos-pulse transition-transform active:scale-95"
                style={{ fontFamily: 'Poppins' }}>
                SOS
              </button>
            </div>
            <p className="text-stone-400 text-xs text-center mt-6">Tap once to activate • Help arrives in 8–12 min</p>
          </div>
        )}

        {sosState === 'confirming' && (
          <div className="flex flex-col items-center py-6">
            <div className="w-32 h-32 rounded-full gradient-emergency flex items-center justify-center shadow-2xl">
              <span className="text-white text-5xl font-black" style={{ fontFamily: 'Poppins' }}>{countdown}</span>
            </div>
            <p className="text-stone-800 font-bold text-lg mt-5" style={{ fontFamily: 'Poppins' }}>Sending SOS in {countdown}s</p>
            <p className="text-stone-500 text-sm mt-1">Cancel if this was accidental</p>
            <button onClick={cancelSOS}
              className="mt-5 px-8 py-3 rounded-2xl border-2 border-red-500 text-red-600 font-semibold">
              Cancel
            </button>
          </div>
        )}

        {sosState === 'sending' && (
          <div className="flex flex-col items-center py-8">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-4 border-red-500 border-t-transparent animate-spin" />
            </div>
            <p className="text-stone-800 font-bold text-lg mt-4">Sending Emergency Alert...</p>
          </div>
        )}

        {/* Emergency Types */}
        <div>
          <p className="font-semibold text-stone-800 text-sm mb-3" style={{ fontFamily: 'Poppins' }}>Emergency Type</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: '🏥', label: 'Medical' },
              { icon: '🔥', label: 'Fire' },
              { icon: '👶', label: 'Child Lost' },
              { icon: '🦽', label: 'Mobility Help' },
              { icon: '👊', label: 'Security' },
              { icon: '🌊', label: 'Drowning' },
            ].map(type => (
              <button key={type.label}
                onClick={() => setEmergencyType(type.label)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                  emergencyType === type.label ? 'border-red-500 bg-red-50' : 'border-stone-200 bg-white'
                }`}>
                <span className="text-2xl">{type.icon}</span>
                <span className="text-xs text-stone-600 font-medium">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Dial */}
        <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm">
          <p className="font-semibold text-stone-800 text-sm mb-3" style={{ fontFamily: 'Poppins' }}>Quick Dial</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: '🚨', label: 'Police', number: '100', color: 'bg-blue-500' },
              { icon: '🚒', label: 'Fire Brigade', number: '101', color: 'bg-red-500' },
              { icon: '🚑', label: 'Ambulance', number: '108', color: 'bg-green-500' },
              { icon: '🆘', label: 'Kumbh Control', number: '1800-XXX', color: 'bg-orange-500' },
            ].map(item => (
              <a key={item.label} href={`tel:${item.number}`}
                className={`${item.color} rounded-xl p-3 flex items-center gap-2.5`}>
                <span className="text-xl">{item.icon}</span>
                <div>
                  <p className="text-white text-xs font-bold">{item.label}</p>
                  <p className="text-white/80 text-xs">{item.number}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Nearby Hospitals */}
        <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm">
          <p className="font-semibold text-stone-800 text-sm mb-3" style={{ fontFamily: 'Poppins' }}>Nearest Hospitals</p>
          <div className="space-y-3">
            {HOSPITALS.map(h => (
              <div key={h.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                  <span className="text-lg">🏥</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-stone-800">{h.name}</p>
                  <p className="text-xs text-stone-500">{h.distance} · {h.type}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <a href={`tel:${h.contact}`}
                    className="bg-green-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">Call</a>
                  <button onClick={() => onNavigate('map')}
                    className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2.5 py-1 rounded-lg">Route</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lost & Found */}
        <button onClick={() => onNavigate('lostfound')}
          className="w-full bg-white rounded-2xl p-4 border border-stone-100 shadow-sm flex items-center gap-4 text-left category-card">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center">
            <span className="text-2xl">🔍</span>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-stone-800 text-sm" style={{ fontFamily: 'Poppins' }}>Lost & Found</p>
            <p className="text-stone-500 text-xs mt-0.5">Report missing person or found item</p>
          </div>
          <svg className="w-5 h-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
