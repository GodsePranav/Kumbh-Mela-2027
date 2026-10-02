import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Users, 
  CheckCircle, 
  Info, 
  MapPin, 
  Clock, 
  ChevronRight,
  ShieldAlert,
  CloudLightning,
  Megaphone
} from 'lucide-react';

interface VolunteerAlertsProps {
  user: { name: string; email: string; mobile?: string };
  activeSosList: any[];
}

type FilterType = 'All' | 'SOS' | 'Crowd' | 'Tasks' | 'Announcements';

interface AlertItem {
  id: string;
  type: 'sos' | 'crowd' | 'task' | 'announcement' | 'geofence';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  time: string;
  location?: string;
  icon: React.ReactNode;
  actionText?: string;
  rawSos?: any;
}

export const VolunteerAlerts: React.FC<VolunteerAlertsProps> = ({ user, activeSosList = [] }) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);

  // Convert activeSosList to alerts safely
  const sosAlerts: AlertItem[] = (activeSosList || []).map((sos, idx) => {
    let locationStr = sos.locationText || 'Ram Ghat Sector B';
    if (sos.location && Array.isArray(sos.location.coordinates)) {
      locationStr = `${sos.locationText || 'Ghat Zone'} (${sos.location.coordinates[1]?.toFixed(4) || '19.9975'}°N, ${sos.location.coordinates[0]?.toFixed(4) || '73.7898'}°E)`;
    }

    const timeStr = sos.createdAt || sos.timestamp
      ? new Date(sos.createdAt || sos.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : 'Just now';

    return {
      id: sos.sosId || `sos-${idx}`,
      type: 'sos',
      priority: 'high',
      title: `🚨 P0 SOS: ${sos.category ? sos.category.toUpperCase() : 'EMERGENCY'}`,
      description: `Pilgrim: ${sos.userName || 'Pilgrim in Distress'} (${sos.userPhone || '9876543210'}) - Status: ${sos.status || 'BROADCASTING'}`,
      time: timeStr,
      location: locationStr,
      icon: <AlertTriangle className="text-red-500" size={24} />,
      actionText: 'Respond to Emergency',
      rawSos: sos,
    };
  });

  // Demo alerts
  const demoAlerts: AlertItem[] = [
    {
      id: 'crowd-1',
      type: 'crowd',
      priority: 'high',
      title: 'Overcrowding Warning',
      description: 'Main Bridge capacity exceeding safe limits. Divert incoming traffic.',
      time: '2 min ago',
      location: 'Main Bridge Sector 1',
      icon: <Users className="text-red-500" size={24} />,
      actionText: 'Acknowledge Alert',
    },
    {
      id: 'crowd-2',
      type: 'crowd',
      priority: 'medium',
      title: 'High Density Alert',
      description: 'Crowd density increasing rapidly at Ram Ghat Sector A.',
      time: '15 min ago',
      location: 'Ram Ghat Sector A',
      icon: <Users className="text-amber-500" size={24} />,
      actionText: 'Deploy Crowd Control',
    },
    {
      id: 'task-1',
      type: 'task',
      priority: 'medium',
      title: 'New Task Assigned',
      description: 'Guide elderly pilgrim group to the main medical tent.',
      time: '30 min ago',
      location: 'Gate 4 Entrance',
      icon: <CheckCircle className="text-blue-500" size={24} />,
      actionText: 'Accept Task Assignment',
    },
    {
      id: 'task-2',
      type: 'task',
      priority: 'high',
      title: 'Task Deadline Approaching',
      description: 'Water distribution task at Sector 2 needs completion.',
      time: '1 hour ago',
      location: 'Sector 2 Supply Depot',
      icon: <Clock className="text-amber-500" size={24} />,
      actionText: 'View Task Details',
    },
    {
      id: 'announcement-1',
      type: 'announcement',
      priority: 'low',
      title: 'VIP Movement Advisory',
      description: 'Route 3 will be restricted for official convoy movement between 14:00 and 16:00.',
      time: '2 hours ago',
      location: 'Route 3 Main Corridor',
      icon: <Megaphone className="text-indigo-500" size={24} />,
      actionText: 'Read Advisory',
    },
    {
      id: 'announcement-2',
      type: 'announcement',
      priority: 'low',
      title: 'Weather & Safety Alert',
      description: 'Heavy rainfall and winds expected after 18:00. Secure loose structures and medical tents.',
      time: '3 hours ago',
      location: 'Entire Kumbh Area',
      icon: <CloudLightning className="text-gray-500" size={24} />,
      actionText: 'Acknowledge',
    },
    {
      id: 'geofence-1',
      type: 'geofence',
      priority: 'high',
      title: 'Zone Boundary Breach',
      description: 'Volunteer GPS indicates position outside designated sector boundary by 120 meters.',
      time: '12:34 PM',
      location: 'Sector B Perimeter',
      icon: <ShieldAlert className="text-red-500" size={24} />,
      actionText: 'Re-align Zone GPS',
    }
  ];

  const allAlerts = [...sosAlerts, ...demoAlerts];

  const filteredAlerts = allAlerts.filter(alert => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'SOS' && alert.type === 'sos') return true;
    if (activeFilter === 'Crowd' && alert.type === 'crowd') return true;
    if (activeFilter === 'Tasks' && alert.type === 'task') return true;
    if (activeFilter === 'Announcements' && (alert.type === 'announcement' || alert.type === 'geofence')) return true;
    return false;
  });

  const getBorderColor = (type: string, priority: string) => {
    if (priority === 'high' || type === 'sos') return 'border-l-red-500';
    if (priority === 'medium') return 'border-l-amber-500';
    if (type === 'task') return 'border-l-blue-500';
    if (type === 'announcement') return 'border-l-indigo-500';
    return 'border-l-gray-500';
  };

  const getBgColor = (type: string, priority: string) => {
    if (priority === 'high' || type === 'sos') return 'bg-red-50';
    if (priority === 'medium') return 'bg-amber-50';
    if (type === 'task') return 'bg-blue-50';
    if (type === 'announcement') return 'bg-indigo-50';
    return 'bg-gray-50';
  };

  const handleAction = (alert: AlertItem) => {
    setSelectedAlert(alert);
  };

  return (
    <div className="flex flex-col h-full bg-[#FEFAF4] font-poppins pb-28">
      {/* Alert Stats Bar */}
      <div className="bg-white p-4 shadow-sm z-10 sticky top-0 border-b border-stone-200">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Operational Alert Center</h2>
            <p className="text-xs text-stone-500">Live operational notifications & SOS broadcasts</p>
          </div>
          <span className="bg-[#E8702A] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
            {allAlerts.length} Active
          </span>
        </div>
        
        {/* Filter Pills */}
        <div className="flex overflow-x-auto hide-scrollbar space-x-2 pb-1">
          {(['All', 'SOS', 'Crowd', 'Tasks', 'Announcements'] as FilterType[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeFilter === filter 
                  ? 'bg-[#E8702A] text-white shadow-sm' 
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {filter}
              {filter === 'SOS' && sosAlerts.length > 0 && (
                <span className="ml-1.5 bg-red-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {sosAlerts.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Alert List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alertItem) => (
            <div 
              key={alertItem.id} 
              className={`bg-white rounded-2xl shadow-md border border-stone-200 border-l-4 ${getBorderColor(alertItem.type, alertItem.priority)} overflow-hidden transition-all hover:shadow-lg`}
            >
              <div className="p-4">
                <div className="flex items-start">
                  <div className={`p-2.5 rounded-2xl ${getBgColor(alertItem.type, alertItem.priority)} mr-3.5 shrink-0 border border-stone-100`}>
                    {alertItem.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-sm font-bold text-gray-900 truncate pr-2">
                        {alertItem.title}
                      </h3>
                      <span className="text-[11px] text-stone-500 whitespace-nowrap flex items-center font-medium">
                        <Clock size={12} className="mr-1 text-stone-400" />
                        {alertItem.time}
                      </span>
                    </div>
                    
                    <p className="text-xs text-stone-600 mb-2 leading-relaxed">
                      {alertItem.description}
                    </p>
                    
                    {alertItem.location && (
                      <div className="flex items-center text-[11px] text-stone-500 mb-2.5 font-medium">
                        <MapPin size={12} className="mr-1 text-red-500" />
                        <span className="truncate">{alertItem.location}</span>
                      </div>
                    )}
                    
                    {alertItem.actionText && (
                      <button 
                        onClick={() => handleAction(alertItem)}
                        className="flex items-center text-xs font-bold text-[#E8702A] hover:text-[#d36222] transition-colors mt-1 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-200 w-fit">
                        <span>{alertItem.actionText}</span>
                        <ChevronRight size={14} className="ml-1" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-stone-400">
            <Info size={40} className="mb-2 opacity-40 text-stone-500" />
            <p className="text-xs font-semibold">No active alerts found for this filter category.</p>
          </div>
        )}
      </div>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm space-y-4 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-xl">📢</span>
                <h3 className="font-bold text-sm text-stone-900">{selectedAlert.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedAlert(null)}
                className="text-stone-400 hover:text-stone-700 font-bold text-base px-2">
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-stone-700 font-medium">{selectedAlert.description}</p>
              {selectedAlert.location && (
                <p className="text-red-600 font-semibold">📍 Location: {selectedAlert.location}</p>
              )}
              <p className="text-stone-400">⏰ Received: {selectedAlert.time}</p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  alert(`Action recorded for: ${selectedAlert.title}`);
                  setSelectedAlert(null);
                }}
                className="w-full bg-[#E8702A] hover:bg-orange-600 text-white font-bold text-xs py-3 rounded-xl shadow transition">
                Confirm & Acknowledge Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VolunteerAlerts;
