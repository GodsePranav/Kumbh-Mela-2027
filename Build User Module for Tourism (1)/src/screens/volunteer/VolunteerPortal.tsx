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
  
  const countdownTimer = useRef<NodeJS.Timeout | null>(null);
  const pollingTimer = useRef<NodeJS.Timeout | null>(null);

  // Initialize realtime and polling
  useEffect(() => {
    // Start realtime service
    realtimeService.init();

    const handleSosUpdate = (data: any) => {
      // Refresh SOS list on real-time event
      fetchActiveSos();
    };

    realtimeService.subscribe('sos-broadcast', handleSosUpdate);
    realtimeService.subscribe('sos-alert', handleSosUpdate);
    realtimeService.subscribe('trigger-sos', handleSosUpdate);

    // Initial fetch
    fetchActiveSos();

    // Start polling every 3 seconds
    pollingTimer.current = setInterval(() => {
      fetchActiveSos();
    }, 3000);

    // Track location
    const unsubscribeLocation = locationService.watchLocation(
      (location: LocationData) => {
        // Location updated - could send to server
      }
    );

    return () => {
      realtimeService.unsubscribe('sos-broadcast', handleSosUpdate);
      realtimeService.unsubscribe('sos-alert', handleSosUpdate);
      realtimeService.unsubscribe('trigger-sos', handleSosUpdate);
      if (pollingTimer.current) clearInterval(pollingTimer.current);
      unsubscribeLocation();
    };
  }, [user]);

  const fetchActiveSos = async () => {
    try {
      if (sosApi && sosApi.getActiveSos) {
        const response = await sosApi.getActiveSos();
        if (response && response.data) {
          setActiveSosList(response.data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch active SOS:', err);
    }
  };

  const handleAcceptSos = async (sosInput: any) => {
    try {
      const sosId = typeof sosInput === 'string' ? sosInput : (sosInput.sosId || sosInput._id || sosInput.id);
      if (sosApi && sosApi.acceptSos) {
        const response = await sosApi.acceptSos(sosId, user.mobile || user.email, user.name);
        if (response && response.data) {
          setAssignedSos(response.data);
          if (realtimeService && realtimeService.emit) {
            realtimeService.emit('sos-accepted', response.data);
          }
          fetchActiveSos();
        }
      }
    } catch (error) {
      console.error('Error accepting SOS:', error);
    }
  };

  const handleRejectSos = (sosInput: any) => {
    const sosId = typeof sosInput === 'string' ? sosInput : (sosInput.sosId || sosInput._id || sosInput.id);
    setActiveSosList(prev => prev.filter(s => (s.sosId || s._id || s.id) !== sosId));
    if (sosApi && sosApi.rejectSos) {
      sosApi.rejectSos(sosId, user.mobile || user.email, 'Volunteer busy').catch(() => {});
    }
  };

  const handleUpdateSosStatus = async (sosId: string, status: string, remarks?: string) => {
    try {
      if (sosApi && sosApi.updateStatus) {
        const response = await sosApi.updateStatus(sosId, status, remarks);
        if (realtimeService && realtimeService.emit) {
          realtimeService.emit('sos-status-updated', { sosId, status, notes: remarks });
        }
        if (status === 'RESOLVED' || status === 'resolved') {
          setAssignedSos(null);
          alert('✅ Emergency marked as RESOLVED! Thank you for your service.');
        } else {
          setAssignedSos(response?.data || assignedSos);
        }
        fetchActiveSos();
      }
    } catch (error) {
      console.error('Error updating SOS status', error);
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
    try {
      let loc = { latitude: 0, longitude: 0 };
      if (locationService && locationService.getCurrentLocation) {
        loc = await locationService.getCurrentLocation();
      }

      const sosData = {
        userId: user.email || user.mobile,
        userName: user.name,
        userMobile: user.mobile,
        latitude: loc.latitude,
        longitude: loc.longitude,
        timestamp: new Date().toISOString(),
        type: 'volunteer_sos'
      };

      let res: any;
      if (sosApi && sosApi.createSos) {
        res = await sosApi.createSos(sosData);
      }
      
      if (realtimeService && realtimeService.emit) {
        realtimeService.emit('trigger-sos', sosData);
      }

      // Store history in local storage
      const existing = JSON.parse(localStorage.getItem('kumbh_sos_history') || '[]');
      existing.push({ ...sosData, id: res?.data?.id || Date.now() });
      localStorage.setItem('kumbh_sos_history', JSON.stringify(existing));

      setSosActivating(false);
      setShowSosModal(false);
      alert('SOS Alert Sent Successfully');
      
    } catch (err) {
      console.error('Error creating SOS:', err);
      setSosActivating(false);
      setShowSosModal(false);
      alert('Failed to send SOS. Please check your connection.');
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
               />;
      case 'duties':
        return <VolunteerDuties user={user} />;
      case 'map':
        return <VolunteerMap user={user} />;
      case 'alerts':
        return <VolunteerAlerts user={user} activeSosList={activeSosList} />;
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
