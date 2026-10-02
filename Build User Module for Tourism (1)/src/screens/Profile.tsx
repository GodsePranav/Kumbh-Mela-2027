import React, { useState, useEffect } from 'react';
import { LANGUAGES } from '../data/mockData';
import { User } from '../App';

interface ProfileProps {
  user: User;
  onUpdateUser?: (updatedUser: User) => void;
  onLogout: () => void;
  onBack: () => void;
}

export default function Profile({ user, onUpdateUser, onLogout, onBack }: ProfileProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  const [form, setForm] = useState({
    name: user.name || '',
    email: user.email || '',
    mobile: user.mobile || '9876543210',
    emergencyContact: user.emergencyContact || '9123456789',
    language: user.language || 'en',
    hometown: user.hometown || 'Nashik, Maharashtra',
  });

  useEffect(() => {
    setForm({
      name: user.name || '',
      email: user.email || '',
      mobile: user.mobile || '9876543210',
      emergencyContact: user.emergencyContact || '9123456789',
      language: user.language || 'en',
      hometown: user.hometown || 'Nashik, Maharashtra',
    });
  }, [user]);

  const handleSave = () => {
    const updated: User = {
      ...user,
      name: form.name.trim() || user.name,
      email: form.email.trim() || user.email,
      mobile: form.mobile,
      emergencyContact: form.emergencyContact,
      language: form.language,
      hometown: form.hometown,
    };

    if (onUpdateUser) {
      onUpdateUser(updated);
    }
    setEditMode(false);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  const sections = [
    { id: 'personal', icon: '👤', label: 'Personal Information' },
    { id: 'saved', icon: '❤️', label: 'Saved Places', badge: '3' },
    { id: 'trips', icon: '🗺️', label: 'My Trips', badge: '2' },
    { id: 'reports', icon: '📋', label: 'My Reports' },
    { id: 'security', icon: '🔐', label: 'Account & Security' },
    { id: 'notifications', icon: '🔔', label: 'Notification Settings' },
    { id: 'language', icon: '🌐', label: 'Language Preferences' },
    { id: 'about', icon: 'ℹ️', label: 'About Kumbh Mela 2027' },
  ];

  return (
    <div className="flex flex-col min-h-screen pb-24 font-sans bg-amber-50/30">
      {/* Toast notification */}
      {savedToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[2000] bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 animate-bounce">
          <span>✓ Profile details saved & updated across app!</span>
        </div>
      )}

      {/* Header */}
      <div className="gradient-indigo px-5 pt-14 pb-8 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/3" />
        <div className="relative flex items-center gap-4">
          <div 
            className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-3xl font-black text-white shadow-xl border-2 border-white/20 shrink-0"
            style={{ fontFamily: 'Poppins' }}
          >
            {form.name[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-lg leading-tight truncate" style={{ fontFamily: 'Poppins' }}>
              {form.name || 'User Name'}
            </p>
            <p className="text-indigo-200 text-xs mt-0.5 truncate">{form.email}</p>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <span className="text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded-full font-semibold">Pilgrim</span>
              <span className="text-[10px] bg-white/15 text-white px-2 py-0.5 rounded-full">Verified ✓</span>
            </div>
          </div>
          <button 
            onClick={() => setEditMode(!editMode)} 
            className="ml-auto w-10 h-10 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 flex items-center justify-center transition-all shrink-0 border border-white/10"
            title="Edit Profile"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          {[
            { label: 'Places Visited', value: '7' },
            { label: 'Trips Planned', value: '2' },
            { label: 'Days to Kumbh', value: '328' },
          ].map(stat => (
            <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 text-center border border-white/10">
              <p className="text-white text-xl font-bold" style={{ fontFamily: 'Poppins' }}>{stat.value}</p>
              <p className="text-indigo-200 text-[10px] font-medium mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Form */}
      {editMode && (
        <div className="px-5 py-5 space-y-4 bg-white m-4 rounded-2xl border border-stone-200 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <h2 className="font-bold text-stone-800 text-base" style={{ fontFamily: 'Poppins' }}>Edit Profile Details</h2>
            <button onClick={() => setEditMode(false)} className="text-stone-400 hover:text-stone-600 text-sm font-semibold">✕ Cancel</button>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">Full Name</label>
            <input 
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Enter your name"
              className="w-full px-4 py-3 border border-stone-300 rounded-xl bg-slate-50 text-stone-900 text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all" 
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">Email Address</label>
            <input 
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-stone-300 rounded-xl bg-slate-50 text-stone-900 text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all" 
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">Mobile Number</label>
            <input 
              type="tel"
              value={form.mobile}
              onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))}
              className="w-full px-4 py-3 border border-stone-300 rounded-xl bg-slate-50 text-stone-900 text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all" 
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">Hometown</label>
            <input 
              type="text"
              value={form.hometown}
              onChange={e => setForm(f => ({ ...f, hometown: e.target.value }))}
              className="w-full px-4 py-3 border border-stone-300 rounded-xl bg-slate-50 text-stone-900 text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all" 
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">Emergency Contact</label>
            <input 
              type="tel"
              value={form.emergencyContact}
              onChange={e => setForm(f => ({ ...f, emergencyContact: e.target.value }))}
              className="w-full px-4 py-3 border border-stone-300 rounded-xl bg-slate-50 text-stone-900 text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all" 
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">Preferred Language</label>
            <select 
              value={form.language} 
              onChange={e => setForm(f => ({ ...f, language: e.target.value }))}
              className="w-full px-4 py-3 border border-stone-300 rounded-xl bg-slate-50 text-stone-900 text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all"
            >
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.nativeName}</option>)}
            </select>
          </div>

          <button 
            onClick={handleSave}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-[0.98] text-white font-bold text-sm shadow-md transition-all cursor-pointer"
            style={{ fontFamily: 'Poppins' }}
          >
            ✓ Save & Update Profile
          </button>
        </div>
      )}

      {/* Sections */}
      {!editMode && (
        <div className="px-5 mt-5 space-y-2">
          {sections.map(section => {
            const isOpen = activeSection === section.id;
            return (
              <div key={section.id} className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
                <button 
                  onClick={() => setActiveSection(isOpen ? null : section.id)}
                  className="w-full flex items-center gap-3 p-4 text-left transition-all hover:bg-slate-50"
                >
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-xl shrink-0">
                    {section.icon}
                  </div>
                  <p className="flex-1 font-semibold text-stone-800 text-sm">{section.label}</p>
                  {section.badge && (
                    <span className="text-xs bg-orange-100 text-orange-600 font-bold px-2.5 py-0.5 rounded-full">{section.badge}</span>
                  )}
                  <svg className={`w-4 h-4 text-stone-400 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>

                {/* Expanded Details for Personal Info */}
                {isOpen && section.id === 'personal' && (
                  <div className="px-4 pb-4 pt-1 bg-stone-50 border-t border-stone-100 space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-stone-200/60">
                      <span className="text-stone-500 font-medium">Full Name:</span>
                      <span className="text-stone-900 font-bold">{form.name}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-stone-200/60">
                      <span className="text-stone-500 font-medium">Email:</span>
                      <span className="text-stone-900 font-bold">{form.email}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-stone-200/60">
                      <span className="text-stone-500 font-medium">Mobile:</span>
                      <span className="text-stone-900 font-bold">{form.mobile}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-stone-200/60">
                      <span className="text-stone-500 font-medium">Hometown:</span>
                      <span className="text-stone-900 font-bold">{form.hometown}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-stone-500 font-medium">Emergency Contact:</span>
                      <span className="text-stone-900 font-bold">{form.emergencyContact}</span>
                    </div>
                  </div>
                )}

                {/* Expanded Details for Language */}
                {isOpen && section.id === 'language' && (
                  <div className="px-4 pb-4 pt-1 bg-stone-50 border-t border-stone-100 text-xs">
                    <p className="text-stone-600 mb-2">Current Language: <b className="text-stone-900">{LANGUAGES.find(l => l.code === form.language)?.nativeName || 'English'}</b></p>
                    <button 
                      onClick={() => setEditMode(true)}
                      className="text-orange-600 font-bold hover:underline"
                    >
                      Click here to edit language in Profile
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Logout */}
          <div className="pt-4 pb-4">
            <button 
              onClick={onLogout}
              className="w-full py-3.5 rounded-2xl border-2 border-red-200 text-red-600 font-bold text-sm flex items-center justify-center gap-2 transition-all active:bg-red-50 cursor-pointer"
              style={{ fontFamily: 'Poppins' }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
              Sign Out
            </button>
            <p className="text-center text-stone-400 text-xs mt-3 font-medium">
              Kumbh Mela Smart Tourism Platform v1.0<br />
              © 2027 Government of Maharashtra
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
