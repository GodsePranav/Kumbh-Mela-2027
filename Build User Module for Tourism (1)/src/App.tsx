import React, { useState } from 'react';
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
import VolunteerPortal from './screens/volunteer/VolunteerPortal';
import DesktopControlRoom from './screens/controlroom/DesktopControlRoom';

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

interface NavigationEntry { screen: Screen; params: unknown }

export interface User {
  _id?: string;
  id?: string;
  token?: string;
  name: string;
  email: string;
  language: string;
  mobile?: string;
  emergencyContact?: string;
  hometown?: string;
  role?: 'user' | 'volunteer' | 'admin' | 'controlroom';
}

const MAIN_TABS = ['dashboard', 'discovery', 'map', 'events', 'profile'];

function getSavedUser(): User | null {
  try {
    const savedUser = localStorage.getItem('kumbh_user');
    if (!savedUser) return null;

    const parsed: unknown = JSON.parse(savedUser);
    if (!parsed || typeof parsed !== 'object') return null;

    const candidate = parsed as Partial<User>;
    if (typeof candidate.name !== 'string' || typeof candidate.email !== 'string' || typeof (candidate as any).token !== 'string') return null;
    return candidate as User;
  } catch {
    // Treat unreadable or malformed persisted data as a signed-out session.
    return null;
  }
}

export default function App() {
  const [portalMode, setPortalMode] = useState<'user' | 'volunteer' | 'controlroom'>(() => {
    const parsed = getSavedUser();
    if (parsed?.role === 'volunteer' || parsed?.email.includes('volunteer')) return 'volunteer';
    if (parsed?.role === 'admin' || parsed?.role === 'controlroom' || parsed?.email.includes('admin')) return 'controlroom';
    return 'user';
  });

  const [screen, setScreen] = useState<Screen>(() => {
    return getSavedUser() ? 'dashboard' : 'auth';
  });
  const [screenStack, setScreenStack] = useState<NavigationEntry[]>([]);
  const [user, setUser] = useState<User | null>(() => {
    return getSavedUser();
  });
  const [screenParams, setScreenParams] = useState<unknown>(null);

  const navigate = (to: string, params?: unknown) => {
    const s = to as Screen;
    setScreenStack(prev => [...prev, { screen, params: screenParams }]);
    setScreen(s);
    setScreenParams(params || null);
  };

  const goBack = () => {
    if (screenStack.length > 0) {
      const previous = screenStack[screenStack.length - 1];
      setScreenStack(s => s.slice(0, -1));
      setScreen(previous.screen);
      setScreenParams(previous.params);
    } else {
      setScreen('dashboard');
      setScreenParams(null);
    }
  };

  const handleNavTab = (tab: string) => {
    setScreenStack([]);
    setScreen(tab as Screen);
    setScreenParams(null);
  };

  const handleAuthComplete = (u: User) => {
    setUser(u);
    localStorage.setItem('kumbh_user', JSON.stringify(u));
    
    if (u.role === 'volunteer' || u.email?.includes('volunteer')) {
      setPortalMode('volunteer');
    } else if (u.role === 'admin' || u.role === 'controlroom' || u.email?.includes('admin')) {
      setPortalMode('controlroom');
    } else {
      setPortalMode('user');
    }

    setScreen('dashboard');
    setScreenStack([]);
    setScreenParams(null);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('kumbh_user', JSON.stringify(updatedUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('kumbh_user');
    import('./services/realtimeService').then(({ realtimeService }) => realtimeService.disconnect());
    localStorage.removeItem('kumbh_sos_history');
    localStorage.removeItem('kumbh_active_sos');
    setScreen('auth');
    setScreenStack([]);
    setScreenParams(null);
    setPortalMode('user');
  };

  // If in Volunteer Portal Mode
  if (portalMode === 'volunteer' && user) {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col items-center">
        <div className="relative w-full max-w-lg mx-auto flex-1 shadow-xl" style={{ minHeight: '100dvh', background: '#FEFAF4' }}>
          <VolunteerPortal
            user={user}
            onLogout={handleLogout}
          />
        </div>
      </div>
    );
  }

  // If in Desktop Control Room Command Center Mode
  if (portalMode === 'controlroom' && user) {
    return (
      <DesktopControlRoom
        onBackToUserPortal={() => setPortalMode('user')}
        onOpenVolunteerPortal={() => setPortalMode('volunteer')}
      />
    );
  }

  const isMainTab = MAIN_TABS.includes(screen);
  const showBottomNav = !!user && isMainTab;

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center">
      {/* Main User App Screen Frame */}
      <div className="relative w-full max-w-lg mx-auto flex-1 shadow-xl" style={{ minHeight: '100dvh', background: '#FEFAF4' }}>
        {screen === 'auth' && (
          <SplashLanguageAuth onAuthComplete={handleAuthComplete} />
        )}

        {user && screen === 'dashboard' && (
          <Dashboard user={user} onNavigate={navigate} />
        )}

        {user && screen === 'discovery' && (
          <Discovery onNavigate={navigate} onBack={goBack} />
        )}

        {user && screen === 'placeDetail' && (
          <Discovery
            onNavigate={navigate}
            onBack={goBack}
            initialPlaceId={(screenParams as { placeId?: string } | null)?.placeId}
          />
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
    </div>
  );
}
