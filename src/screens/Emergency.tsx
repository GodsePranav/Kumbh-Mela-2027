import React, { useState, useEffect } from 'react';
import { HOSPITALS, POLICE_STATIONS } from '../data/mockData';
import { sosApi } from '../services/api';
import { realtimeService } from '../services/realtimeService';

interface EmergencyProps {
  onBack: () => void;
  onNavigate: (screen: string) => void;
}

type SOSState = 'idle' | 'confirming' | 'sending' | 'active';

export default function Emergency({ onBack, onNavigate }: EmergencyProps) {
  const [sosState, setSOSState] = useState<SOSState>('idle');
  const [countdown, setCountdown] = useState(5);
  const [emergencyType, setEmergencyType] = useState('sos');
  const [location] = useState('Ram Ghat Sector B, Nashik (19.9975°N, 73.7898°E)');
  const [sosData, setSosData] = useState<any | null>(null);
  const [responderInfo, setResponderInfo] = useState<any | null>(null);

  useEffect(() => {
    realtimeService.init();

    realtimeService.subscribe('sos-accepted', (data) => {
      console.log('⚡ SOS Accepted by responder:', data);
      setResponderInfo({
        name: data.responderName || 'Rahul Sharma',
        phone: data.responderPhone || '9988776655',
        badge: 'VOL-108',
        etaSeconds: data.etaSeconds || 240,
        distanceMeters: data.distanceMeters || 320,
      });
      setSosData((prev: any) => ({ ...prev, status: 'EN_ROUTE' }));
    });

    realtimeService.subscribe('sos-responder-location', (data) => {
      setResponderInfo((prev: any) => ({
        ...prev,
        etaSeconds: data.etaSeconds,
        distanceMeters: data.distanceMeters,
      }));
      setSosData((prev: any) => ({ ...prev, status: data.status }));
    });

    realtimeService.subscribe('sos-status-updated', (data) => {
      setSosData((prev: any) => ({ ...prev, status: data.status }));
    });

    return () => {
      realtimeService.unsubscribe('sos-accepted');
      realtimeService.unsubscribe('sos-responder-location');
      realtimeService.unsubscribe('sos-status-updated');
    };
  }, []);

  const [sosHistory, setSosHistory] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('kumbh_sos_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveSosToHistory = (sos: any) => {
    setSosHistory((prev) => {
      const updated = [sos, ...prev.filter((s) => s.sosId !== sos.sosId)];
      localStorage.setItem('kumbh_sos_history', JSON.stringify(updated));
      localStorage.setItem('kumbh_active_sos', JSON.stringify(sos));
      window.dispatchEvent(new CustomEvent('kumbh_sos_event', { detail: sos }));
      return updated;
    });
  };

  const triggerSosCreation = async () => {
    setSOSState('sending');
    let sosObj: any = null;
    try {
      const res = await sosApi.createSos({
        category: emergencyType || 'sos',
        locationText: 'Ram Ghat Sector B, Nashik',
        message: 'P0 Emergency SOS Triggered by Pilgrim',
      });
      if (res.success && res.data) {
        sosObj = res.data;
      }
    } catch (err) {
      console.warn('Backend SOS create fallback:', err);
    }

    if (!sosObj) {
      const serialNum = `SOS-2027-${String(Math.floor(100000 + Math.random() * 900000))}`;
      sosObj = {
        sosId: serialNum,
        userName: 'Pilgrim in Distress',
        userPhone: '9876543210',
        category: emergencyType || 'sos',
        priority: 'P0',
        locationText: 'Ram Ghat Sector B, Nashik',
        status: 'BROADCASTING',
        createdAt: new Date().toISOString(),
      };
    }

    setSosData(sosObj);
    saveSosToHistory(sosObj);
    realtimeService.emit('trigger-sos', sosObj);
    setSOSState('active');
  };

  const handleSOS = () => {
    if (sosState === 'idle') {
      setSOSState('confirming');
      setCountdown(3);
      const interval = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(interval);
            triggerSosCreation();
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    }
  };

  const cancelSOS = () => {
    setSOSState('idle');
    setCountdown(3);
  };

  if (sosState === 'sending') {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center p-6 text-center pb-24" style={{ background: '#FEFAF4' }}>
        <div className="w-20 h-20 rounded-full border-4 border-red-600 border-t-transparent animate-spin mb-4" />
        <h2 className="text-xl font-bold text-red-700" style={{ fontFamily: 'Poppins' }}>Broadcasting Emergency SOS...</h2>
        <p className="text-stone-600 text-xs mt-2 max-w-xs">
          Connecting to Kumbh Mela Control Room and alerting nearby registered volunteers in Ram Ghat Sector B.
        </p>
      </div>
    );
  }

  if (sosState === 'active') {
    const status = sosData?.status || 'BROADCASTING';
    const isAccepted = !!responderInfo || status === 'ACCEPTED' || status === 'EN_ROUTE' || status === 'NEARBY' || status === 'ARRIVED' || status === 'ASSISTING' || status === 'RESOLVED';
    const isArrived = status === 'ARRIVED' || status === 'ASSISTING' || status === 'RESOLVED';
    const isResolved = status === 'RESOLVED';

    return (
      <div className="flex flex-col min-h-screen pb-24" style={{ background: '#FEFAF4' }}>
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
            <p className="text-white text-lg font-bold font-mono" style={{ fontFamily: 'Poppins' }}>{sosData?.sosId || reportId}</p>
          </div>
        </div>

        <div className="flex-1 px-5 py-5 overflow-y-auto space-y-4">
          {/* Assigned Responder Live Card */}
          {isAccepted ? (
            <div className="bg-white rounded-2xl p-5 border-2 border-emerald-500 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                  VOLUNTEER RESPONDER ASSIGNED
                </span>
                <span className="text-xs text-emerald-600 font-bold">STATUS: {status}</span>
              </div>
              <div className="flex items-center space-x-3 pt-1">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-2xl border border-orange-200">
                  🛡️
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">{responderInfo?.name || 'Rahul Sharma'}</h3>
                  <p className="text-xs text-stone-500">Badge: <strong className="text-stone-800 font-mono">VOL-108</strong> • 📞 <a href={`tel:${responderInfo?.phone || '9988776655'}`} className="text-orange-600 underline font-bold">{responderInfo?.phone || '9988776655'}</a></p>
                </div>
              </div>

              {/* Realtime ETA Display */}
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 flex justify-between items-center text-xs">
                <div>
                  <span className="text-[10px] text-stone-400 font-bold uppercase block">ESTIMATED ETA</span>
                  <span className="text-xl font-black text-emerald-600">
                    {responderInfo?.etaSeconds ? `${Math.ceil(responderInfo.etaSeconds / 60)} MIN` : '4 MIN'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-stone-400 font-bold uppercase block">DISTANCE AWAY</span>
                  <span className="text-lg font-bold text-stone-800">
                    {responderInfo?.distanceMeters ? `${responderInfo.distanceMeters}m` : '320m'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin flex-shrink-0" />
              <div>
                <p className="text-stone-800 text-xs font-bold">Searching Nearby Eligible Volunteers...</p>
                <p className="text-stone-500 text-[11px]">Round 1 broadcast sent to volunteers in Ram Ghat Sector B</p>
              </div>
            </div>
          )}

          {/* SOS Workflow Step Machine */}
          <div className="space-y-2">
            {[
              { done: true, label: 'Location Captured', value: location },
              { done: true, label: 'P0 Emergency Created', value: `Report ID: ${sosData?.sosId || reportId}` },
              { done: isAccepted, label: 'Volunteer Assigned', value: isAccepted ? `Assigned to ${responderInfo?.name || 'Rahul Sharma'}` : 'Notifying wave 1 volunteers...' },
              { done: isAccepted, label: 'Help On The Way', value: isAccepted ? `ETA: ${Math.ceil((responderInfo?.etaSeconds || 240) / 60)} min` : 'Pending responder acceptance' },
              { done: isArrived, label: 'Volunteer Arrived at Scene', value: isArrived ? 'Responder is with you on site' : 'En route to location' },
              { done: isResolved, label: 'Emergency Resolved', value: isResolved ? 'Marked complete' : 'In progress' },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3 bg-white rounded-xl p-3 border border-stone-100 shadow-sm">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  step.done ? 'bg-emerald-500' : 'bg-orange-100'
                }`}>
                  {step.done
                    ? <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    : <div className="w-3 h-3 rounded-full border-2 border-orange-400 border-t-transparent animate-spin" />
                  }
                </div>
                <div>
                  <p className="text-stone-800 text-sm font-bold">{step.label}</p>
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

          {/* Emergency Resolved Banner for Pilgrim */}
          {isResolved ? (
            <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-4 space-y-3 shadow-lg">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">✅</span>
                <div>
                  <h3 className="font-bold text-emerald-900 text-sm" style={{ fontFamily: 'Poppins' }}>Emergency Request Resolved</h3>
                  <p className="text-xs text-emerald-700">Volunteer responder has completed assistance for this request.</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  if (sosData?.sosId) {
                    sosApi.updateStatus(sosData.sosId, 'RESOLVED').catch(() => {});
                  }
                  localStorage.removeItem('kumbh_active_sos');
                  cancelSOS();
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 rounded-xl shadow">
                Mark as Complete & Close Emergency
              </button>
            </div>
          ) : (
            <button 
              onClick={() => {
                if (sosData?.sosId) {
                  sosApi.updateStatus(sosData.sosId, 'RESOLVED').catch(() => {});
                }
                localStorage.removeItem('kumbh_active_sos');
                setSosData((prev: any) => ({ ...prev, status: 'RESOLVED' }));
                alert('✅ Emergency marked as RESOLVED! Stay safe.');
              }}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow hover:bg-emerald-500 transition">
              ✅ Mark Emergency as Resolved
            </button>
          )}

          <button onClick={() => onNavigate('map')}
            className="w-full py-3.5 rounded-2xl gradient-indigo text-white font-semibold text-sm flex items-center justify-center gap-2 shadow"
            style={{ fontFamily: 'Poppins' }}>
            🗺️ Navigate to Nearest Hospital
          </button>
          <button onClick={cancelSOS}
            className="w-full py-3 rounded-2xl border border-stone-300 text-stone-600 font-medium text-sm">
            Close Emergency Request
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

        {/* Emergency Request History */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <p className="font-semibold text-stone-800 text-sm" style={{ fontFamily: 'Poppins' }}>📜 My Emergency Request History</p>
            <span className="text-xs bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded-full">{sosHistory.length} Saved</span>
          </div>

          {sosHistory.length === 0 ? (
            <p className="text-xs text-stone-400 py-2">No previous emergency requests found.</p>
          ) : (
            <div className="space-y-2">
              {sosHistory.map((s, idx) => (
                <div key={idx} className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-stone-800 font-mono">{s.sosId}</span>
                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                      s.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {s.status || 'BROADCASTING'}
                    </span>
                  </div>
                  <p className="text-stone-600">Category: <strong className="uppercase">{s.category || 'SOS'}</strong></p>
                  <p className="text-stone-500">📍 {s.locationText || 'Ram Ghat Sector B'}</p>
                  {s.createdAt && (
                    <p className="text-[10px] text-stone-400">Created: {new Date(s.createdAt).toLocaleString()}</p>
                  )}
                </div>
              ))}
            </div>
          )}
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
