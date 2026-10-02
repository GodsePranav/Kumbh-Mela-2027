import React, { useState } from 'react';
import { NOTIFICATIONS } from '../data/mockData';

interface NotificationsProps {
  onBack: () => void;
}

const TYPE_META: Record<string, { icon: string; bg: string; text: string }> = {
  emergency: { icon: '🚨', bg: '#FEE2E2', text: '#DC2626' },
  event:     { icon: '📅', bg: '#EFF6FF', text: '#1D4ED8' },
  route:     { icon: '🗺️', bg: '#FEF3C7', text: '#D97706' },
  announcement: { icon: '📢', bg: '#F3E8FF', text: '#7C3AED' },
  crowd:     { icon: '👥', bg: '#FFF7ED', text: '#EA580C' },
};

export default function Notifications({ onBack }: NotificationsProps) {
  const [notes, setNotes] = useState(NOTIFICATIONS);
  const unread = notes.filter(n => !n.read).length;

  const markRead = (id: string) => {
    setNotes(n => n.map(note => note.id === id ? { ...note, read: true } : note));
  };

  const markAllRead = () => {
    setNotes(n => n.map(note => ({ ...note, read: true })));
  };

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ background: '#FEFAF4' }}>
      <div className="gradient-indigo px-5 pt-14 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-white font-bold text-lg" style={{ fontFamily: 'Poppins' }}>Notifications</h1>
              {unread > 0 && <p className="text-indigo-300 text-xs">{unread} unread</p>}
            </div>
          </div>
          {unread > 0 && (
            <button onClick={markAllRead} className="text-orange-300 text-xs font-medium">Mark all read</button>
          )}
        </div>
      </div>

      <div className="px-5 mt-5 space-y-3">
        {notes.map(note => {
          const meta = TYPE_META[note.type] || TYPE_META.announcement;
          return (
            <button key={note.id} onClick={() => markRead(note.id)}
              className={`w-full text-left p-4 rounded-2xl border transition-all ${
                note.read ? 'bg-white border-stone-100' : 'bg-orange-50/50 border-orange-200'
              }`}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                  style={{ background: meta.bg }}>
                  {meta.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm font-semibold ${note.read ? 'text-stone-700' : 'text-stone-900'}`}
                      style={{ fontFamily: 'Poppins' }}>
                      {note.title}
                    </p>
                    {!note.read && <div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />}
                  </div>
                  <p className="text-stone-500 text-xs mt-1 leading-relaxed">{note.message}</p>
                  <p className="text-stone-400 text-[10px] mt-1.5">{note.time}</p>
                </div>
              </div>
            </button>
          );
        })}

        {notes.every(n => n.read) && (
          <div className="text-center py-8">
            <span className="text-4xl block mb-3">✅</span>
            <p className="text-stone-500 text-sm">All caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
}
