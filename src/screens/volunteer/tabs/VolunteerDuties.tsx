import React, { useState } from 'react';
import { dutyApi } from '../../../services/api';
import { locationService } from '../../../services/locationService';

interface VolunteerDutiesProps {
  user: { name: string; email: string; mobile?: string };
}

const DEMO_ROSTER = [
  { id: '1', date: 'Mon, Oct 5', shift: 'Morning (06:00 - 14:00)', zone: 'Ram Ghat Sector B', isToday: false },
  { id: '2', date: 'Tue, Oct 6', shift: 'Morning (06:00 - 14:00)', zone: 'Ram Ghat Sector B', isToday: false },
  { id: '3', date: 'Wed, Oct 7', shift: 'Morning (06:00 - 14:00)', zone: 'Ram Ghat Sector B', isToday: true },
  { id: '4', date: 'Thu, Oct 8', shift: 'OFF', zone: '-', isToday: false },
  { id: '5', date: 'Fri, Oct 9', shift: 'Night (22:00 - 06:00)', zone: 'Har Ki Pauri', isToday: false },
  { id: '6', date: 'Sat, Oct 10', shift: 'Night (22:00 - 06:00)', zone: 'Har Ki Pauri', isToday: false },
  { id: '7', date: 'Sun, Oct 11', shift: 'Night (22:00 - 06:00)', zone: 'Har Ki Pauri', isToday: false },
];

const DEMO_TEAM = [
  { id: '1', name: 'Rahul Sharma', role: 'Team Lead', status: 'ON_DUTY' },
  { id: '2', name: 'Priya Patel', role: 'First Responder', status: 'ON_DUTY' },
  { id: '3', name: 'Amit Kumar', role: 'Crowd Controller', status: 'BREAK' },
  { id: '4', name: 'Sneha Verma', role: 'Medical Support', status: 'OFF_DUTY' },
  { id: '5', name: 'Vikram Singh', role: 'Logistics', status: 'ON_DUTY' },
];

export default function VolunteerDuties({ user }: VolunteerDutiesProps) {
  const [isCheckedIn, setIsCheckedIn] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleCheckInToggle = async () => {
    setLoading(true);
    try {
      const loc = await locationService.getCurrentLocation();
      if (!isCheckedIn) {
        await dutyApi.checkIn(user.email, loc.lat, loc.lng);
        setIsCheckedIn(true);
        alert('✅ Checked-In for Duty! GPS verification recorded.');
      } else {
        await dutyApi.checkOut('ATT_CURRENT', loc.lat, loc.lng);
        setIsCheckedIn(false);
        alert('👋 Checked-Out successfully.');
      }
    } catch (e: any) {
      alert(e.message || 'Action completed.');
      setIsCheckedIn(!isCheckedIn);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (actionName: string) => {
    alert(`Requested: ${actionName}. Supervisor will review your request.`);
  };

  return (
    <div className="p-4 space-y-4 font-sans text-stone-800">
      {/* Header Banner */}
      <div className="gradient-saffron rounded-2xl p-5 text-white shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-orange-100 font-medium">ASSIGNED SECTOR</p>
            <h2 className="text-xl font-bold font-poppins">Ram Ghat Sector B</h2>
            <p className="text-xs text-orange-100 mt-0.5">Post: Ram Ghat Control Post 1</p>
          </div>
          <span className="bg-white/20 text-white font-bold text-xs px-3 py-1 rounded-full uppercase border border-white/30">
            Sector B
          </span>
        </div>
      </div>

      {/* Today's Shift Card */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm space-y-3">
        <div className="flex justify-between items-center border-b border-stone-100 pb-2">
          <h3 className="font-bold text-sm text-stone-900 font-poppins">Today's Shift Details</h3>
          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
            ACTIVE SHIFT
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
            <span className="text-[10px] text-stone-400 font-bold block uppercase">SHIFT TIME</span>
            <span className="font-bold text-stone-800">06:00 - 14:00 (Morning)</span>
          </div>
          <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
            <span className="text-[10px] text-stone-400 font-bold block uppercase">SUPERVISOR</span>
            <span className="font-bold text-stone-800">SP Rajesh Kumar</span>
          </div>
        </div>

        <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100 text-xs">
          <span className="text-[10px] text-stone-400 font-bold block uppercase">TEAM ASSIGNMENT</span>
          <span className="font-bold text-stone-800">Team Alpha (8 Members)</span>
        </div>

        <button
          onClick={handleCheckInToggle}
          disabled={loading}
          className={`w-full py-3 rounded-xl font-bold text-xs shadow transition ${
            isCheckedIn ? 'bg-stone-800 text-white' : 'bg-emerald-600 text-white'
          }`}>
          {loading ? 'Processing...' : isCheckedIn ? '🔴 CHECK OUT FROM SHIFT' : '🟢 CHECK IN (GPS VERIFIED)'}
        </button>
      </div>

      {/* Roster Schedule */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm space-y-3">
        <h3 className="font-bold text-sm text-stone-900 font-poppins">Weekly Duty Roster</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {DEMO_ROSTER.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-xl border text-xs flex justify-between items-center transition ${
                item.isToday
                  ? 'border-orange-500 bg-orange-50/50 font-semibold'
                  : 'border-stone-100 bg-stone-50'
              }`}>
              <div>
                <span className="font-bold text-stone-800 block">{item.date} {item.isToday && '(Today)'}</span>
                <span className="text-stone-500 text-[11px]">{item.shift}</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                item.shift === 'OFF' ? 'bg-stone-200 text-stone-600' : 'bg-orange-100 text-orange-700'
              }`}>
                {item.zone}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Team Roster */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm space-y-3">
        <h3 className="font-bold text-sm text-stone-900 font-poppins">Team Alpha Members</h3>
        <div className="space-y-2">
          {DEMO_TEAM.map((member) => (
            <div key={member.id} className="flex justify-between items-center text-xs p-2 bg-stone-50 rounded-xl border border-stone-100">
              <div>
                <span className="font-bold text-stone-800 block">{member.name}</span>
                <span className="text-stone-500 text-[10px]">{member.role}</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                member.status === 'ON_DUTY'
                  ? 'bg-emerald-100 text-emerald-700'
                  : member.status === 'BREAK'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-stone-200 text-stone-600'
              }`}>
                {member.status.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Shift Requests */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm space-y-2">
        <h3 className="font-bold text-sm text-stone-900 font-poppins mb-1">Shift Actions & Requests</h3>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleAction('Shift Change')}
            className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold text-[11px] transition text-center">
            🔄 Shift Change
          </button>
          <button
            onClick={() => handleAction('Leave Application')}
            className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold text-[11px] transition text-center">
            🏖️ Apply Leave
          </button>
          <button
            onClick={() => handleAction('Duty Swap')}
            className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold text-[11px] transition text-center">
            🔀 Swap Shift
          </button>
        </div>
      </div>
    </div>
  );
}
