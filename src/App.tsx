import React, { useState, useEffect } from 'react';
import SplashLanguageAuth from './screens/SplashLanguageAuth';
import Dashboard from './screens/Dashboard';
import Discovery from './screens/Discovery';
import SmartMap from './screens/SmartMap';
import Events from './screens/Events';
import TripPlanner from './screens/TripPlanner';
import Emergency from './screens/Emergency';
import AIAssistant from './screens/AIAssistant';
import LostFound from './screens/LostFound';
import Notifications from './screens/Notifications';
import Profile from './screens/Profile';
import BottomNav from './components/BottomNav';

type Screen =
  | 'auth'
  | 'dashboard'
  | 'discovery'
  | 'map'
  | 'events'
  | 'trips'
  | 'emergency'
  | 'ai'
  | 'lostfound'
  | 'notifications'
  | 'profile'
  | 'placeDetail';

export interface User {
  name: string;
  email: string;
  language: string;
  mobile?: string;
  emergencyContact?: string;
  hometown?: string;
}

const MAIN_TABS = ['dashboard', 'discovery', 'map', 'events', 'profile'];

export default function App() {
  const [screen, setScreen] = useState<Screen>(() => {
    const savedUser = localStorage.getItem('kumbh_user');
    return savedUser ? 'dashboard' : 'auth';
  });
  const [screenStack, setScreenStack] = useState<Screen[]>([]);
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('kumbh_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [screenParams, setScreenParams] = useState<unknown>(null);

  const navigate = (to: string, params?: unknown) => {
    const s = to as Screen;
    setScreenStack(prev => [...prev, screen]);
    setScreen(s);
    setScreenParams(params || null);
  };

  const goBack = () => {
    if (screenStack.length > 0) {
      const prev = screenStack[screenStack.length - 1];
      setScreenStack(s => s.slice(0, -1));
      setScreen(prev);
    } else {
      setScreen('dashboard');
    }
  };

  const handleNavTab = (tab: string) => {
    setScreenStack([]);
    setScreen(tab as Screen);
  };

  const handleAuthComplete = (u: User) => {
    setUser(u);
    localStorage.setItem('kumbh_user', JSON.stringify(u));
    setScreen('dashboard');
    setScreenStack([]);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('kumbh_user', JSON.stringify(updatedUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('kumbh_user');
    setScreen('auth');
    setScreenStack([]);
  };

  const isMainTab = MAIN_TABS.includes(screen);
  const showBottomNav = !!user && isMainTab;

  return (
    <div className="relative max-w-lg mx-auto" style={{ minHeight: '100dvh', background: '#FEFAF4' }}>
      {screen === 'auth' && (
        <SplashLanguageAuth onAuthComplete={handleAuthComplete} />
      )}

      {user && screen === 'dashboard' && (
        <Dashboard user={user} onNavigate={navigate} />
      )}

      {user && screen === 'discovery' && (
        <Discovery onNavigate={navigate} onBack={goBack} />
      )}

      {user && screen === 'map' && (
        <SmartMap onNavigate={navigate} onBack={goBack} routeParams={screenParams as { destination: { lat: number; lng: number; name: string } } | null} />
      )}

      {user && screen === 'events' && (
        <Events onBack={goBack} onNavigate={navigate} />
      )}

      {user && screen === 'trips' && (
        <TripPlanner onBack={goBack} onNavigate={navigate} />
      )}

      {user && screen === 'emergency' && (
        <Emergency onBack={goBack} onNavigate={navigate} />
      )}

      {user && screen === 'ai' && (
        <AIAssistant onBack={goBack} />
      )}

      {user && screen === 'lostfound' && (
        <LostFound onBack={goBack} />
      )}

      {user && screen === 'notifications' && (
        <Notifications onBack={goBack} />
      )}

      {user && screen === 'profile' && (
        <Profile user={user} onUpdateUser={handleUpdateUser} onLogout={handleLogout} onBack={goBack} />
      )}

      {/* Bottom Navigation */}
      {showBottomNav && (
        <BottomNav active={screen} onNavigate={handleNavTab} />
      )}

      {/* Floating SOS Button (when authenticated and not on emergency screen) */}
      {user && screen !== 'auth' && screen !== 'emergency' && (
        <button
          onClick={() => navigate('emergency')}
          className="fixed right-5 bottom-24 z-50 w-14 h-14 rounded-full gradient-emergency shadow-2xl flex items-center justify-center sos-pulse"
          style={{ bottom: showBottomNav ? '88px' : '24px' }}
          aria-label="SOS Emergency">
          <div className="flex flex-col items-center">
            <span className="text-white font-black text-sm leading-none" style={{ fontFamily: 'Poppins' }}>SOS</span>
          </div>
        </button>
      )}
    </div>
  );
}
