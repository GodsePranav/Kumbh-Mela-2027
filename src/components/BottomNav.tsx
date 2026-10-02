import React from 'react';

interface BottomNavProps {
  active: string;
  onNavigate: (screen: string) => void;
}

const tabs = [
  { id: 'dashboard', icon: HomeIcon, label: 'Home' },
  { id: 'discovery', icon: SearchIcon, label: 'Explore' },
  { id: 'map', icon: MapIcon, label: 'Map' },
  { id: 'events', icon: CalendarIcon, label: 'Events' },
  { id: 'profile', icon: UserIcon, label: 'Profile' },
];

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill={active ? '#E8702A' : 'none'} stroke={active ? '#E8702A' : '#78716C'} strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12L11.204 3.045a1.125 1.125 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  );
}

function SearchIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke={active ? '#E8702A' : '#78716C'} strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

function MapIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill={active ? '#E8702A' : 'none'} stroke={active ? '#E8702A' : '#78716C'} strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
    </svg>
  );
}

function CalendarIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke={active ? '#E8702A' : '#78716C'} strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}

function UserIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill={active ? '#E8702A' : 'none'} stroke={active ? '#E8702A' : '#78716C'} strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

export default function BottomNav({ active, onNavigate }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-stone-200/60 safe-bottom">
      <div className="flex items-stretch max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-all"
            >
              <Icon active={isActive} />
              <span
                className="text-[10px] font-medium transition-colors"
                style={{ color: isActive ? '#E8702A' : '#78716C', fontFamily: 'Poppins, sans-serif' }}
              >
                {tab.label}
              </span>
              {isActive && <div className="nav-active-dot" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
