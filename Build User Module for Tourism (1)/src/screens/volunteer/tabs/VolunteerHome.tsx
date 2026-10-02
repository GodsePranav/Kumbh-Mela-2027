import React, { useState } from 'react';
import { GoogleNavigationMap, MapPosition } from '../../../maps/googleMaps';
import { 
  AlertCircle, 
  MapPin, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  Navigation,
  FileText,
  Users,
  Calendar,
  XCircle,
  Phone,
  Radio
} from 'lucide-react';

const getPriorityColor = (priority?: string) => priority === 'P0'
  ? 'bg-red-100 text-red-700'
  : priority === 'P1'
    ? 'bg-amber-100 text-amber-700'
    : 'bg-stone-100 text-stone-700';
interface VolunteerHomeProps {
  user: { name: string; email: string; mobile?: string };
  activeSosList: any[];
  assignedSos: any | null;
  onAcceptSos: (sos: any) => void;
  onRejectSos: (sos: any) => void;
  onUpdateSosStatus: (sosId: string, status: string) => void;
  onDutyChange?: (status: 'OFF_DUTY' | 'ON_DUTY' | 'BREAK') => Promise<void>;
  dutyStatus?: 'OFF_DUTY' | 'ON_DUTY' | 'RESPONDING' | 'BREAK';
  locationError?: string;
}

export const VolunteerHome: React.FC<VolunteerHomeProps> = ({
  user,
  activeSosList,
  assignedSos,
  onAcceptSos,
  onRejectSos,
  onUpdateSosStatus,
  onDutyChange,
  dutyStatus: serverDutyStatus = 'OFF_DUTY',
  locationError = ''
}) => {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [dutyStatus, setDutyStatus] = useState<'OFF_DUTY' | 'ON_DUTY' | 'RESPONDING' | 'BREAK'>(serverDutyStatus);
  React.useEffect(() => setDutyStatus(serverDutyStatus), [serverDutyStatus]);
  const isOutsideZone = false;
  const sosCoordinates = assignedSos?.location?.coordinates;
  const destination: MapPosition | null = Array.isArray(sosCoordinates) && sosCoordinates.length >= 2 ? { lat: Number(sosCoordinates[1]), lng: Number(sosCoordinates[0]) } : null;
  const responderCoordinates = assignedSos?.responderLocation?.coordinates;
  const responder: MapPosition | null = Array.isArray(responderCoordinates) && responderCoordinates.length >= 2 ? { lat: Number(responderCoordinates[1]), lng: Number(responderCoordinates[0]) } : null;

  const handleDutyToggle = async (status: 'OFF_DUTY' | 'ON_DUTY' | 'BREAK') => {
    try { await onDutyChange?.(status); setDutyStatus(status); setIsCheckedIn(status === 'ON_DUTY'); }
    catch (error) { window.alert(error instanceof Error ? error.message : 'Could not update duty status.'); }
  };
  const handleAcceptWithLock = async (sos: any) => {
    const id = sos.sosId || sos._id || sos.id;
    setProcessingId(id);
    try {
      await onAcceptSos(sos);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectWithLock = async (sos: any) => {
    const id = sos.sosId || sos._id || sos.id;
    setProcessingId(id);
    try {
      await onRejectSos(sos);
    } finally {
      setProcessingId(null);
    }
  };

  const handleStatusChangeWithLock = async (status: string) => {
    const sosId = assignedSos?.sosId || assignedSos?._id || assignedSos?.id;
    if (sosId) {
      setProcessingId(sosId);
      try {
        await onUpdateSosStatus(sosId, status);
      } finally {
        setProcessingId(null);
      }
    }
  };

  return (
    <div className="flex-1 bg-[#FEFAF4] overflow-y-auto pb-28 font-poppins">
      <div className="space-y-5">
        
        {/* 1. Pilgrim-Style Header Card (Matching User Dashboard) */}
        <div className="gradient-saffron px-5 pt-12 pb-8 text-white relative overflow-hidden shadow-lg rounded-b-3xl">
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-orange-400/10 translate-y-1/2 -translate-x-1/4" />
          
          <div className="relative flex justify-between items-start mb-4">
            <div>
              <p className="text-orange-100 text-xs font-medium">Volunteer Operational Hub 🙏</p>
              <h2 className="text-xl font-bold text-white mt-0.5" style={{ fontFamily: 'Poppins' }}>{user.name}</h2>
              <div className="flex items-center mt-1 space-x-2 text-white/90 text-xs">
                <span className="bg-white/20 text-white font-bold px-2 py-0.5 rounded-full uppercase border border-white/30">
                  VOL-108
                </span>
                <span className="flex items-center"><MapPin size={13} className="mr-1 text-orange-200"/> Ram Ghat Sector B</span>
              </div>
            </div>
            <button 
              onClick={() => setIsCheckedIn(!isCheckedIn)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow ${isCheckedIn ? 'bg-white text-orange-600' : 'bg-black/20 text-white border border-white/30'}`}
            >
              {isCheckedIn ? 'Checked In ✓' : 'Check In'}
            </button>
          </div>
          
          {/* Duty Status Selector Pills */}
          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-2 flex items-center justify-between text-xs mt-3 border border-white/20">
            <span className="text-orange-100 font-medium text-[11px] px-2">Status:</span>
            <div className="flex space-x-1 flex-1">
              {(['OFF_DUTY', 'ON_DUTY', 'BREAK'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => handleDutyToggle(status)}
                  className={`flex-1 py-1 text-[11px] font-bold rounded-xl transition-all ${
                    dutyStatus === status 
                      ? status === 'ON_DUTY'
                        ? 'bg-emerald-500 text-white shadow'
                        : 'bg-white text-orange-600 shadow' 
                      : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 space-y-5">
          {locationError && <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">{locationError} SOS alerts require a verified volunteer on duty with a recent GPS fix.</div>}

          {/* 2. Geofence Alert Banner */}
          {isOutsideZone && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start shadow-sm animate-pulse">
              <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
              <div className="ml-3">
                <h4 className="text-red-700 font-semibold text-sm">Out of Assigned Zone</h4>
                <p className="text-red-600 text-xs mt-1">Please return to Ram Ghat Sector B immediately.</p>
              </div>
            </div>
          )}

          {/* 3. Quick Stats Row (Matching User Card Styling) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm flex items-center space-x-3">
              <div className="bg-red-50 p-2.5 rounded-2xl text-red-600">
                <Radio size={20} />
              </div>
              <div>
                <p className="text-stone-400 text-[10px] font-bold uppercase">Active SOS</p>
                <p className="text-lg font-bold text-stone-800" style={{ fontFamily: 'Poppins' }}>{activeSosList.length}</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm flex items-center space-x-3">
              <div className="bg-blue-50 p-2.5 rounded-2xl text-blue-600">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-stone-400 text-[10px] font-bold uppercase">Today's Tasks</p>
                <p className="text-lg font-bold text-stone-800" style={{ fontFamily: 'Poppins' }}>3</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm flex items-center space-x-3">
              <div className="bg-emerald-50 p-2.5 rounded-2xl text-emerald-600">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-stone-400 text-[10px] font-bold uppercase">Duty Hours</p>
                <p className="text-lg font-bold text-stone-800" style={{ fontFamily: 'Poppins' }}>6.5h</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm flex items-center space-x-3">
              <div className="bg-purple-50 p-2.5 rounded-2xl text-purple-600">
                <ShieldAlert size={20} />
              </div>
              <div>
                <p className="text-stone-400 text-[10px] font-bold uppercase">Training</p>
                <p className="text-lg font-bold text-stone-800" style={{ fontFamily: 'Poppins' }}>85%</p>
              </div>
            </div>
          </div>

          {/* 4. Active Emergency Section */}
          {assignedSos && (
            <div className="bg-white rounded-2xl border-2 border-red-500 shadow-lg overflow-hidden space-y-3">
              <div className="bg-red-50 px-4 py-3 border-b border-red-100 flex justify-between items-center">
                <div className="flex items-center text-red-700 font-bold text-xs space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
                  <span>ACTIVE EMERGENCY ASSIGNED</span>
                  <span className="font-mono text-stone-700">({assignedSos.sosId})</span>
                </div>
                <span className="text-[10px] font-black text-red-700 bg-red-200 px-2 py-0.5 rounded-full">
                  {assignedSos.priority || 'P0'} PRIORITY
                </span>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-stone-900 text-base" style={{ fontFamily: 'Poppins' }}>Emergency requester</h4>
                    <p className="text-xs text-stone-500">Emergency: <strong className="uppercase text-stone-800">{assignedSos.category || 'Medical'}</strong></p>
                    {assignedSos.userPhone && <p className="text-xs text-stone-500 mt-0.5">Phone: <strong className="text-stone-800">{assignedSos.userPhone}</strong></p>}
                  </div>
                  {assignedSos.userPhone && <a href={`tel:${assignedSos.userPhone}`} className="bg-emerald-500 text-white p-2.5 rounded-2xl flex items-center justify-center shadow" aria-label="Call emergency requester"><Phone size={18} /></a>}
                </div>
                
                <div className="bg-stone-50 rounded-xl p-3 flex justify-between items-center text-xs border border-stone-200">
                  <div className="flex items-center text-stone-700">
                    <Navigation size={14} className="mr-1.5 text-[#E8702A]"/>
                    <span className="font-bold">{assignedSos.distanceMeters != null ? `${(assignedSos.distanceMeters / 1000).toFixed(1)} km away` : 'Calculating route…'}</span>
                  </div>
                  <div className="flex items-center text-stone-700">
                    <Clock size={14} className="mr-1.5 text-[#E8702A]"/>
                    <span className="font-bold">{assignedSos.etaSeconds != null ? `~${Math.max(1, Math.ceil(assignedSos.etaSeconds / 60))} mins ETA` : 'ETA updating'}</span>
                  </div>
                </div>
                <div className="text-xs text-red-600 font-semibold flex items-start">
                  <MapPin size={14} className="mr-1.5 mt-0.5 shrink-0"/>
                  <span>{destination ? `Emergency GPS: ${destination.lat.toFixed(6)}, ${destination.lng.toFixed(6)}` : 'Exact location unavailable'}</span>
                </div>

                {destination && <GoogleNavigationMap center={destination} position={responder} positionTitle="Volunteer location" markers={[{ id: 'sos-target', title: 'Emergency location', ...destination, glyph: 'SOS', color: '#dc2626' }]} stops={[{ id: 'sos-target', label: 'Emergency location', ...destination }]} className="h-64 w-full overflow-hidden rounded-xl border border-stone-200" zoom={15} />}

                {/* State Machine Transition */}
                <div className="pt-2 border-t border-stone-100">
                  <p className="text-[10px] text-stone-400 font-bold mb-2 uppercase tracking-wide">Update Emergency Response Status</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => handleStatusChangeWithLock('EN_ROUTE')} 
                      disabled={processingId !== null}
                      className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 text-blue-700 border border-blue-200 py-2.5 rounded-xl text-xs font-bold transition">
                      📍 {processingId ? 'Updating...' : 'En Route'}
                    </button>
                    <button 
                      onClick={() => handleStatusChangeWithLock('NEARBY')} 
                      disabled={processingId !== null}
                      className="bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50 text-indigo-700 border border-indigo-200 py-2.5 rounded-xl text-xs font-bold transition">
                      🎯 {processingId ? 'Updating...' : 'Nearby (50m)'}
                    </button>
                    <button 
                      onClick={() => handleStatusChangeWithLock('ARRIVED')} 
                      disabled={processingId !== null}
                      className="bg-amber-50 hover:bg-amber-100 disabled:opacity-50 text-amber-700 border border-amber-200 py-2.5 rounded-xl text-xs font-bold transition">
                      🩺 {processingId ? 'Updating...' : 'Arrived at Scene'}
                    </button>
                    <button 
                      onClick={() => handleStatusChangeWithLock('ASSISTING')} 
                      disabled={processingId !== null}
                      className="bg-purple-50 hover:bg-purple-100 disabled:opacity-50 text-purple-700 border border-purple-200 py-2.5 rounded-xl text-xs font-bold transition">
                      🏥 {processingId ? 'Updating...' : 'Assisting Pilgrim'}
                    </button>
                    <button 
                      onClick={() => handleStatusChangeWithLock('RESOLVED')} 
                      disabled={processingId !== null}
                      className="col-span-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white py-3 rounded-xl text-xs font-bold shadow-md transition">
                      {processingId ? 'Resolving Emergency...' : '✅ MARK AS RESOLVED'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5. Incoming SOS Broadcasts */}
          {!assignedSos && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-stone-900" style={{ fontFamily: 'Poppins' }}>Incoming SOS Broadcasts</h3>
                <span className="text-xs font-bold bg-[#E8702A] text-white px-2.5 py-0.5 rounded-full">{activeSosList.length} Active</span>
              </div>
              
              {activeSosList.length === 0 ? (
                <div className="bg-white border border-stone-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-sm">
                  <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-3">
                    <CheckCircle2 className="text-emerald-500" size={30} />
                  </div>
                  <h4 className="text-stone-800 font-bold text-sm" style={{ fontFamily: 'Poppins' }}>Sector Clear</h4>
                  <p className="text-stone-500 text-xs mt-1">No open SOS requests are currently near your reported location. Enable GPS and set your duty status to On Duty to receive alerts.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeSosList.map((sos, index) => {
                    const currentId = sos.sosId || sos._id || sos.id || `sos-${index}`;
                    const isProcessing = processingId === currentId;
                    return (
                      <div key={currentId} className="bg-white rounded-2xl p-4 border border-stone-200 shadow-md relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500"></div>
                        <div className="flex justify-between items-start mb-2 pl-2">
                          <div className="flex items-center space-x-2">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wide ${getPriorityColor(sos.priority)}`}>
                              {sos.priority || 'P0'}
                            </span>
                            <span className="font-mono text-stone-600 text-xs font-bold">{currentId}</span>
                          </div>
                          <span className="text-xs text-stone-400 font-medium">{sos.createdAt ? new Date(sos.createdAt).toLocaleTimeString() : 'Received now'}</span>
                        </div>
                        <div className="pl-2 space-y-1">
                          <h4 className="font-bold text-stone-900 text-sm">Nearby emergency request</h4>
                          <p className="text-xs text-stone-500">Emergency: <strong className="uppercase text-stone-800">{sos.category || 'SOS'}</strong></p>
                          <div className="flex items-center text-xs text-red-600 font-semibold mt-1">
                            <MapPin size={13} className="mr-1"/>
                                                        About {sos.approximateDistanceMeters != null ? `${(sos.approximateDistanceMeters / 1000).toFixed(1)} km away` : 'nearby'} · exact location shown after acceptance
                          </div>
                          <div className="mt-3 flex space-x-2 pt-2 border-t border-stone-100">
                            <button 
                              onClick={() => handleAcceptWithLock(sos)}
                              disabled={isProcessing}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white py-2.5 rounded-xl text-xs font-bold shadow transition flex justify-center items-center"
                            >
                              <CheckCircle2 size={15} className="mr-1"/> {isProcessing ? 'Accepting...' : 'ACCEPT EMERGENCY'}
                            </button>
                            <button 
                              onClick={() => handleRejectWithLock(sos)}
                              disabled={isProcessing}
                              className="px-4 bg-stone-100 hover:bg-stone-200 disabled:opacity-50 text-stone-600 py-2.5 rounded-xl text-xs font-bold transition flex justify-center items-center"
                            >
                              <XCircle size={15} className="mr-1"/> {isProcessing ? 'Processing...' : 'Pass'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 6. Quick Actions Row */}
          <div>
            <h3 className="text-sm font-bold text-stone-800 mb-3" style={{ fontFamily: 'Poppins' }}>Quick Operational Actions</h3>
            <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
              {[
                { icon: AlertCircle, label: 'Report Incident', color: 'text-red-500', bg: 'bg-red-50' },
                { icon: Users, label: 'Backup Request', color: 'text-blue-500', bg: 'bg-blue-50' },
                { icon: FileText, label: 'Crowd Count', color: 'text-amber-500', bg: 'bg-amber-50' },
                { icon: Calendar, label: 'Check Roster', color: 'text-emerald-500', bg: 'bg-emerald-50' },
              ].map((action, idx) => (
                <button key={idx} className="flex-shrink-0 w-24 flex flex-col items-center">
                  <div className={`w-14 h-14 ${action.bg} rounded-2xl flex items-center justify-center mb-2 shadow-sm border border-stone-100`}>
                    <action.icon className={action.color} size={24} />
                  </div>
                  <span className="text-[10px] text-center text-stone-600 font-medium leading-tight">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default VolunteerHome;
