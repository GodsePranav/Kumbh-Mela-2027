import React, { useCallback, useEffect, useRef, useState } from 'react';
import { HOSPITALS } from '../data/mockData';
import { sosApi } from '../services/api';
import { realtimeService } from '../services/realtimeService';
import { locationService, LocationData } from '../services/locationService';
import { GoogleNavigationMap, MapPosition } from '../maps/googleMaps';

interface EmergencyProps { onBack: () => void; onNavigate: (screen: string) => void }
const ACTIVE = new Set(['CREATED', 'BROADCASTING', 'ACKNOWLEDGED', 'ACCEPTED', 'RESPONDER_ASSIGNED', 'EN_ROUTE', 'NEARBY', 'ARRIVED', 'ASSISTING', 'ESCALATED']);
const point = (value: any): MapPosition | null => {
  const coordinates = value?.coordinates;
  if (!Array.isArray(coordinates) || coordinates.length < 2) return null;
  const [lng, lat] = coordinates.map(Number);
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
};

export default function Emergency({ onBack, onNavigate }: EmergencyProps) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emergencyType, setEmergencyType] = useState('medical');
  const [sosData, setSosData] = useState<any | null>(null);
  const [gpsLocation, setGpsLocation] = useState<LocationData | null>(null);
  const [responderLocation, setResponderLocation] = useState<MapPosition | null>(null);
  const activeId = useRef<string | null>(null);
  const lastUserLocationSentAt = useRef(0);

  const refreshSos = useCallback(async (sosId: string) => {
    try {
      const result = await sosApi.getSosById(sosId);
      if (result.success && result.data) {
        setSosData(result.data);
        setResponderLocation(point(result.data.responderLocation));
        if (!ACTIVE.has(result.data.status)) localStorage.removeItem('kumbh_active_sos');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not refresh SOS status.');
    }
  }, []);

  useEffect(() => {
    realtimeService.init();
    const saved = localStorage.getItem('kumbh_active_sos');
    let savedId: string | null = saved;
    if (saved?.startsWith('{')) { try { savedId = JSON.parse(saved).sosId || null; } catch { savedId = null; } }
    if (savedId) { activeId.current = savedId; void refreshSos(savedId); }
    const update = (data: any) => {
      if (!data?.sosId || data.sosId !== activeId.current) return;
      if (data.responderLocation) setResponderLocation(point(data.responderLocation));
      void refreshSos(data.sosId);
    };
    const updateStatus = (data: any) => {
      if (!data?.sosId || data.sosId !== activeId.current) return;
      setSosData((previous: any) => previous ? { ...previous, status: data.status } : previous);
      void refreshSos(data.sosId);
    };
    realtimeService.subscribe('sos-accepted', update);
    realtimeService.subscribe('sos-responder-location', update);
    realtimeService.subscribe('sos-status-updated', updateStatus);
    const timer = window.setInterval(() => { if (activeId.current) void refreshSos(activeId.current); }, 5000);
    return () => {
      window.clearInterval(timer);
      realtimeService.unsubscribe('sos-accepted', update);
      realtimeService.unsubscribe('sos-responder-location', update);
      realtimeService.unsubscribe('sos-status-updated', updateStatus);
    };
  }, [refreshSos]);

  useEffect(() => {
    if (!sosData || !ACTIVE.has(sosData.status)) return;
    return locationService.watchLocation((loc) => {
      setGpsLocation(loc);
      if (loc.accuracy > 100) { setError(`GPS accuracy is low (±${Math.round(loc.accuracy)} m).`); return; }
      setError('');
      const sosId = sosData.sosId;
      if (Date.now() - lastUserLocationSentAt.current < 15000) return;
      lastUserLocationSentAt.current = Date.now();
      void sosApi.updateUserLocation(sosId, loc.lat, loc.lng, loc.accuracy, loc.timestamp).then((result) => {
        setSosData((current: any) => current?.sosId === sosId ? { ...current, location: result.data.location, locationAccuracy: result.data.locationAccuracy, locationCapturedAt: result.data.locationCapturedAt, etaSeconds: result.data.etaSeconds ?? current.etaSeconds, distanceMeters: result.data.distanceMeters ?? current.distanceMeters } : current);
      }).catch(() => setError('Live location could not be sent. Check your internet connection.'));
    }, (locationError) => {
      setError(locationError.message);
      setGpsLocation((current) => current ? { ...current, isStale: true } : current);
    });
  }, [sosData?.sosId, sosData?.status]);
  const sendSos = async () => {
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      const location = await locationService.getCurrentLocation(100);
      const result = await sosApi.createSos({
        category: emergencyType,
        location: { type: 'Point', coordinates: [location.lng, location.lat] },
        accuracy: location.accuracy,
        timestamp: location.timestamp,
        message: 'Emergency assistance requested by the pilgrim.',
      });
      if (!result.success || !result.data?.sosId) throw new Error('The SOS request was not confirmed by the server.');
      activeId.current = result.data.sosId;
      setGpsLocation(location);
      setSosData(result.data);
      localStorage.setItem('kumbh_active_sos', result.data.sosId);
      let history: any[] = [];
      try { history = JSON.parse(localStorage.getItem('kumbh_sos_history') || '[]'); } catch { history = []; }
      const historyItem = { sosId: result.data.sosId, category: result.data.category, status: result.data.status, createdAt: result.data.createdAt };
      localStorage.setItem('kumbh_sos_history', JSON.stringify([historyItem, ...history].slice(0, 20)));
      window.dispatchEvent(new CustomEvent('kumbh_sos_event', { detail: result.data }));
      setConfirming(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'SOS could not be sent. Check GPS and network, then retry.');
    } finally { setLoading(false); }
  };

  const cancelSos = async () => {
    if (!sosData?.sosId) { setConfirming(false); return; }
    setLoading(true);
    setError('');
    try {
      await sosApi.cancelSos(sosData.sosId);
      setSosData((current: any) => ({ ...current, status: 'CANCELLED' }));
      localStorage.removeItem('kumbh_active_sos');
      activeId.current = null;
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not cancel SOS.'); }
    finally { setLoading(false); }
  };

  const target = point(sosData?.location);
  const position = gpsLocation ? { lat: gpsLocation.lat, lng: gpsLocation.lng } : target;
  const active = sosData && ACTIVE.has(sosData.status);
  const statusLabel = sosData?.status === 'BROADCASTING' ? 'Searching for nearby volunteers' : String(sosData?.status || '').replace(/_/g, ' ');
  const responderLocationIsStale = !!sosData?.responderLocationUpdatedAt && Date.now() - new Date(sosData.responderLocationUpdatedAt).getTime() > 60000;
  const modeNames: Record<string, string> = { medical: 'Medical', fire: 'Fire', missing_person: 'Missing person', crowd_crush: 'Crowd emergency', accident: 'Accident', crime: 'Safety', other: 'Other' };

  return (
    <div className="min-h-screen pb-24" style={{ background: '#FEFAF4' }}>
      <div className="gradient-emergency px-5 pt-14 pb-6 text-white">
        <div className="flex items-center gap-3">
          <button onClick={onBack} aria-label="Back" className="w-9 h-9 rounded-full bg-white/20">‹</button>
          <h1 className="font-bold text-lg" style={{ fontFamily: 'Poppins' }}>Emergency Services</h1>
        </div>
      </div>

      <div className="px-5 py-5 space-y-5">
        {active ? (
          <section className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <div className="flex justify-between items-start gap-3">
                <div><p className="text-red-700 font-black text-lg">SOS ACTIVE</p><p className="text-red-800 text-sm mt-1">{statusLabel}</p></div>
                <span className="text-xs font-mono text-red-800">{sosData.sosId}</span>
              </div>
              <p className="text-xs text-stone-600 mt-3">Emergency type: {modeNames[sosData.category] || sosData.category}</p>
              {target && <p className="text-xs text-stone-600 mt-1">GPS: {target.lat.toFixed(6)}, {target.lng.toFixed(6)} · accuracy ±{Math.round(sosData.locationAccuracy || gpsLocation?.accuracy || 0)} m</p>}
            </div>

            {target && <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
              {responderLocation && <div className="px-4 py-3 flex justify-between gap-2 text-sm"><span className="font-semibold text-stone-800">Volunteer responding</span><span className="text-emerald-700 font-bold">{Number.isFinite(sosData.etaSeconds) ? `About ${Math.max(1, Math.ceil(sosData.etaSeconds / 60))} min` : 'ETA updating'}</span></div>}
              <GoogleNavigationMap center={target} position={position} positionTitle="Your location" focus={responderLocation} markers={responderLocation ? [{ id: 'sos-responder', title: sosData.responderName || 'Assigned volunteer', ...responderLocation, glyph: 'V', color: '#0f766e' }] : []} stops={responderLocation ? [{ id: 'responder', label: 'Volunteer', ...responderLocation }] : []} className="h-72 w-full" zoom={15} />
              <div className="px-4 py-2 text-[11px] text-stone-500">{responderLocation ? `${responderLocationIsStale ? 'Last known volunteer location' : 'Volunteer location updated'} ${sosData.responderLocationUpdatedAt ? new Date(sosData.responderLocationUpdatedAt).toLocaleTimeString() : 'just now'}${responderLocationIsStale ? ' · GPS may be offline' : ''}` : 'Volunteer location will appear here after a volunteer accepts.'}</div>
            </div>}

            <div className="bg-white border border-stone-200 rounded-2xl p-4 space-y-2 text-sm">
              <p><span className="text-stone-500">Response status: </span><strong>{statusLabel}</strong></p>
              {sosData.distanceMeters != null && <p><span className="text-stone-500">Route distance: </span><strong>{(sosData.distanceMeters / 1000).toFixed(1)} km</strong></p>}
              {sosData.responderName && <p><span className="text-stone-500">Volunteer: </span><strong>{sosData.responderName}</strong></p>}
              {!sosData.etaSeconds && responderLocation && <p className="text-xs text-amber-700">Road routing is temporarily unavailable; live location remains visible.</p>}
            </div>
            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
            <button disabled={loading} onClick={cancelSos} className="w-full rounded-xl border border-red-300 bg-white py-3 text-red-700 font-semibold disabled:opacity-50">{loading ? 'Updating…' : 'Cancel SOS'}</button>
          </section>
        ) : (
          <>
            {sosData && <div className="bg-stone-100 rounded-xl p-3 text-sm flex justify-between items-center"><span>Last SOS: {sosData.sosId} · {sosData.status}</span><button className="text-orange-700 font-semibold" onClick={() => { activeId.current = null; setSosData(null); }}>Close</button></div>}
            <div className="bg-white rounded-2xl p-5 border border-stone-200 text-center">
              <p className="text-stone-700 text-sm">Send your current GPS position to nearby volunteers for emergency assistance.</p>
              <button disabled={loading} onClick={() => { setError(''); setConfirming(true); }} className="mt-5 w-28 h-28 rounded-full gradient-emergency text-white font-black text-2xl shadow-xl disabled:opacity-50">SOS</button>
              {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
            </div>
            <div className="bg-white rounded-2xl p-4 border border-stone-200">
              <h2 className="font-semibold text-stone-800 text-sm mb-3">Emergency Type</h2>
              <div className="grid grid-cols-3 gap-2">{Object.entries(modeNames).map(([key, label]) => <button key={key} onClick={() => setEmergencyType(key)} className={`p-2 rounded-xl border text-xs ${emergencyType === key ? 'border-red-500 bg-red-50 text-red-700 font-bold' : 'border-stone-200 text-stone-600'}`}>{label}</button>)}</div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-stone-200">
              <h2 className="font-semibold text-stone-800 text-sm mb-3">Emergency Numbers</h2>
              <div className="grid grid-cols-3 gap-2">{[{ name: 'Emergency', number: '112' }, { name: 'Fire', number: '101' }, { name: 'Ambulance', number: '108' }].map((item) => <a key={item.number} href={`tel:${item.number}`} className="rounded-xl bg-stone-50 p-3 text-center"><span className="block text-xs text-stone-600">{item.name}</span><strong className="text-stone-900">{item.number}</strong></a>)}</div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-stone-200">
              <h2 className="font-semibold text-stone-800 text-sm mb-3">Nearby Hospitals</h2>
              <div className="space-y-3">{HOSPITALS.map((hospital) => <div key={hospital.id} className="flex items-center gap-3"><div className="flex-1"><p className="text-sm font-semibold text-stone-800">{hospital.name}</p><p className="text-xs text-stone-500">{hospital.distance} · {hospital.type}</p></div><a href={`tel:${hospital.contact}`} className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white">Call</a><button onClick={() => onNavigate('map')} className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">Map</button></div>)}</div>
            </div>
          </>
        )}
      </div>

      {confirming && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-5" role="dialog" aria-modal="true" aria-labelledby="sos-confirm-title"><div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"><h2 id="sos-confirm-title" className="text-lg font-bold text-stone-900">Send an SOS?</h2><p className="mt-2 text-sm text-stone-600">We’ll request your current GPS location and share it with an assigned responder. Location access is required.</p>{error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}<div className="mt-5 flex gap-3"><button disabled={loading} onClick={() => setConfirming(false)} className="flex-1 rounded-xl border border-stone-300 py-3 font-semibold text-stone-700">Cancel</button><button disabled={loading} onClick={sendSos} className="flex-1 rounded-xl bg-red-600 py-3 font-bold text-white disabled:opacity-60">{loading ? 'Getting GPS…' : 'Confirm SOS'}</button></div></div></div>}
    </div>
  );
}
