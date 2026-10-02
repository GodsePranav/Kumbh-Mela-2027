import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Home, ClipboardList, MapPin, Bell, User as UserIcon, X, AlertTriangle } from 'lucide-react';
import VolunteerHome from './tabs/VolunteerHome';
import VolunteerDuties from './tabs/VolunteerDuties';
import VolunteerMap from './tabs/VolunteerMap';
import VolunteerAlerts from './tabs/VolunteerAlerts';
import VolunteerProfile from './tabs/VolunteerProfile';

import { sosApi, taskApi, dutyApi, incidentApi, volunteerApi, geofenceApi } from '../../services/api';
import { realtimeService } from '../../services/realtimeService';
import { locationService, LocationData } from '../../services/locationService';

interface VolunteerPortalProps {
  user: { name: string; email: string; mobile?: string; role?: string };
  onLogout: () => void;
}

const VolunteerPortal: React.FC<VolunteerPortalProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'duties' | 'map' | 'alerts' | 'profile'>('home');
  const [showSosModal, setShowSosModal] = useState(false);
  const [sosCountdown, setSosCountdown] = useState(3);
  const [sosActivating, setSosActivating] = useState(false);
  
  const [activeSosList, setActiveSosList] = useState<any[]>([]);
  const [assignedSos, setAssignedSos] = useState<any | null>(null);
  const [dutyStatus, setDutyStatus] = useState<'OFF_DUTY' | 'ON_DUTY' | 'RESPONDING' | 'BREAK'>('OFF_DUTY');
  const [locationError, setLocationError] = useState('');
  
  const countdownTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollingTimer = useRef<number | null>(null);
  const assignedSosRef = useRef<any | null>(null);
  const lastLocationSentAt = useRef(0);

  const fetchActiveSos = useCallback(async () => {
    try {
      const response = await sosApi.getActiveSos();
      setActiveSosList(response.data || []);
    } catch (error) {
      console.error('Failed to fetch nearby SOS requests:', error);
    }
  }, []);

  useEffect(() => {
    realtimeService.init();
    const refresh = () => { void fetchActiveSos(); };
    const onSosUpdate = (data: any) => {
      if (data?.sosId && data.sosId === assignedSosRef.current?.sosId) {
        void sosApi.getSosById(data.sosId).then((result) => setAssignedSos(result.data)).catch(() => {});
      }
      refresh();
    };
    realtimeService.subscribe('sos-broadcast', refresh);
    realtimeService.subscribe('sos-status-updated', onSosUpdate);
    realtimeService.subscribe('sos-responder-location', onSosUpdate);
    void fetchActiveSos();
    void sosApi.getVolunteerDuty().then((result) => setDutyStatus(result.data.dutyStatus)).catch(() => {});
    pollingTimer.current = window.setInterval(refresh, 5000);

    const savedAssignment = localStorage.getItem('kumbh_assigned_sos');
    if (savedAssignment) void sosApi.getSosById(savedAssignment).then((result) => setAssignedSos(result.data)).catch(() => localStorage.removeItem('kumbh_assigned_sos'));
    const unsubscribeLocation = locationService.watchLocation((location: LocationData) => {
      const now = Date.now();
      if (location.accuracy > 100) { setLocationError(`GPS accuracy is low (±${Math.round(location.accuracy)} m).`); return; }
      setLocationError('');
      if (now - lastLocationSentAt.current < 15000) return;
      lastLocationSentAt.current = now;
      void sosApi.updateVolunteerLocation(location.lat, location.lng, location.accuracy, location.timestamp).catch(() => {});
      const assignment = assignedSosRef.current;
      if (assignment?.sosId && ['ACCEPTED', 'EN_ROUTE', 'NEARBY', 'ARRIVED', 'ASSISTING'].includes(assignment.status)) {
        void sosApi.updateLocation(assignment.sosId, location.lat, location.lng, location.accuracy, location.timestamp).catch(() => {});
        setAssignedSos((current: any) => current?.sosId === assignment.sosId ? { ...current, responderLocation: { type: 'Point', coordinates: [location.lng, location.lat] }, responderLocationUpdatedAt: new Date(location.timestamp) } : current);
      }
    }, (error) => setLocationError(error.message));
    return () => {
      realtimeService.unsubscribe('sos-broadcast', refresh);
      realtimeService.unsubscribe('sos-status-updated', onSosUpdate);
      realtimeService.unsubscribe('sos-responder-location', onSosUpdate);
      if (pollingTimer.current) window.clearInterval(pollingTimer.current);
      unsubscribeLocation();
    };
  }, [fetchActiveSos]);

  useEffect(() => { assignedSosRef.current = assignedSos; }, [assignedSos]);

  const handleAcceptSos = async (sosInput: any) => {
    const sosId = typeof sosInput === 'string' ? sosInput : sosInput.sosId;
    try {
      const response = await sosApi.acceptSos(sosId);
      if (response.data) {
        localStorage.setItem('kumbh_assigned_sos', sosId);
        setAssignedSos(response.data);
        await fetchActiveSos();
      }
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Could not accept this SOS.');
    }
  };

  const handleRejectSos = async (sosInput: any) => {
    const sosId = typeof sosInput === 'string' ? sosInput : sosInput.sosId;
    try {
      await sosApi.rejectSos(sosId, 'Volunteer unavailable');
      setActiveSosList((previous) => previous.filter((sos) => sos.sosId !== sosId));
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Could not pass this SOS.');
    }
  };

  const handleUpdateSosStatus = async (sosId: string, status: string, remarks?: string) => {
    try {
      const response = await sosApi.updateStatus(sosId, status, remarks);
      if (status === 'RESOLVED') {
        setAssignedSos(null);
        assignedSosRef.current = null;
        localStorage.removeItem('kumbh_assigned_sos');
        window.alert('Emergency response completed. Thank you for helping.');
      } else {
        setAssignedSos(response.data || assignedSosRef.current);
      }
      await fetchActiveSos();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Could not update SOS status.');
    }
  };
  // SOS activation flow
  const startSosActivation = () => {
    setSosActivating(true);
    setSosCountdown(3);
    
    countdownTimer.current = setInterval(() => {
      setSosCountdown((prev) => {
        if (prev <= 1) {
          if (countdownTimer.current) clearInterval(countdownTimer.current);
          triggerSosApi();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelSosActivation = () => {
    if (countdownTimer.current) clearInterval(countdownTimer.current);
    setSosActivating(false);
    setShowSosModal(false);
    setSosCountdown(3);
  };

  const triggerSosApi = async () => {
    setSosActivating(true);
    try {
      const location = await locationService.getCurrentLocation(100);
      const result = await sosApi.createSos({ category: 'sos', location: { type: 'Point', coordinates: [location.lng, location.lat] }, accuracy: location.accuracy, timestamp: location.timestamp, message: 'Volunteer requested emergency assistance.' });
      const existing = JSON.parse(localStorage.getItem('kumbh_sos_history') || '[]');
      localStorage.setItem('kumbh_sos_history', JSON.stringify([result.data, ...existing].slice(0, 20)));
      setSosActivating(false);
      setShowSosModal(false);
      window.alert('SOS request sent.');
    } catch (error) {
      setSosActivating(false);
      setShowSosModal(false);
      window.alert(error instanceof Error ? error.message : 'SOS could not be sent.');
    }
  };
  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return <VolunteerHome 
                 user={user} 
                 activeSosList={activeSosList}
                 onAcceptSos={handleAcceptSos}
                 onRejectSos={handleRejectSos}
                 assignedSos={assignedSos}
                 onUpdateSosStatus={handleUpdateSosStatus}
                 dutyStatus={dutyStatus} locationError={locationError} onDutyChange={async (status) => { const result = await sosApi.updateVolunteerDuty(status); setDutyStatus(result.data.dutyStatus); }}
               />;
      case 'duties':
        return <VolunteerDuties user={user} />;
      case 'map':
        return <VolunteerMap user={user} />;
      case 'alerts':
        return <VolunteerAlerts user={user} activeSosList={activeSosList} onAcceptSos={handleAcceptSos} onRejectSos={handleRejectSos} />;
      case 'profile':
        return <VolunteerProfile user={user} onLogout={onLogout} />;
      default:
        return <VolunteerHome 
                 user={user} 
                 activeSosList={activeSosList}
                 onAcceptSos={handleAcceptSos}
                 onRejectSos={handleRejectSos}
                 assignedSos={assignedSos}
                 onUpdateSosStatus={handleUpdateSosStatus}
                 dutyStatus={dutyStatus} locationError={locationError} onDutyChange={async (status) => { const result = await sosApi.updateVolunteerDuty(status); setDutyStatus(result.data.dutyStatus); }}
               />;
    }
  };

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'duties', label: 'Duties', icon: ClipboardList },
    { id: 'map', label: 'Map', icon: MapPin },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'profile', label: 'Profile', icon: UserIcon }
  ] as const;

  return (
    <div className="relative w-full max-w-lg mx-auto flex flex-col min-h-screen" style={{ backgroundColor: '#FEFAF4', fontFamily: 'Poppins, sans-serif' }}>
      
      {/* Content Area */}
      <div className="flex-1 overflow-y-auto pb-24">
        {renderTabContent()}
      </div>

      {/* Floating SOS Button */}
      <button
        onClick={() => setShowSosModal(true)}
        className="fixed z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center sos-pulse"
        style={{ bottom: '88px', right: 'calc(50% - 240px + 20px)', background: 'linear-gradient(to right, #ef4444, #dc2626)' }}
        aria-label="SOS Emergency">
        <span className="text-white font-black text-sm leading-none" style={{ fontFamily: 'Poppins' }}>SOS</span>
      </button>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-stone-200/60 safe-bottom bg-white/80 backdrop-blur-md">
        <div className="flex items-stretch max-w-lg mx-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-all"
              >
                <TabIcon 
                  size={24} 
                  color={isActive ? '#E8702A' : '#78716C'} 
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className="text-[10px] font-medium" style={{ color: isActive ? '#E8702A' : '#78716C', fontFamily: 'Poppins, sans-serif' }}>
                  {tab.label}
                </span>
                {isActive && <div className="nav-active-dot w-1 h-1 rounded-full mt-0.5" style={{ backgroundColor: '#E8702A' }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* SOS Modal */}
      {showSosModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm flex flex-col items-center shadow-xl border border-stone-200">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertTriangle className="text-red-600" size={32} />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">Emergency SOS</h3>
            <p className="text-center text-gray-500 mb-6 text-sm">
              This will immediately notify the control room and nearby volunteers of your emergency.
            </p>

            {!sosActivating ? (
              <div className="flex w-full gap-3">
                <button 
                  onClick={() => setShowSosModal(false)}
                  className="flex-1 py-3 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={startSosActivation}
                  className="flex-1 py-3 rounded-xl font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-600/30"
                >
                  Trigger SOS
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center w-full">
                <div className="text-6xl font-black text-red-600 mb-6">
                  {sosCountdown}
                </div>
                <button 
                  onClick={cancelSosActivation}
                  className="w-full py-3 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Cancel Activation
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VolunteerPortal;
