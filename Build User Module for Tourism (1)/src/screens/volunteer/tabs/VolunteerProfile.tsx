import React, { useState } from 'react';
import { User, LogOut, Phone, Shield, Award, Star, Clock, CheckCircle2, ChevronRight, Settings, Bell, Globe, HelpCircle } from 'lucide-react';

interface VolunteerProfileProps {
  user: { name: string; email: string; mobile?: string };
  onLogout: () => void;
}

const VolunteerProfile: React.FC<VolunteerProfileProps> = ({ user, onLogout }) => {
  const [isAvailable, setIsAvailable] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('kumbh_user');
    localStorage.removeItem('kumbh_sos_history');
    onLogout();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="flex-1 overflow-y-auto pb-28 bg-[#FEFAF4] font-poppins p-4 space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-[#E8702A] to-[#D96020] rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-20">
          <Shield size={100} />
        </div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-[#E8702A] text-3xl font-bold border-4 border-white/20 mb-3 shadow-lg">
            {getInitials(user.name)}
          </div>
          <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
          <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium mb-2 border border-white/30 backdrop-blur-sm">
            Badge: VOL-108
          </div>
          <p className="text-white/90 text-sm mb-3">{user.email}</p>
          <div className="flex items-center space-x-2 text-sm bg-green-500/20 px-3 py-1.5 rounded-full border border-green-400/50">
            <CheckCircle2 size={16} className="text-green-300" />
            <span className="text-green-50 font-medium">Verified ✓</span>
          </div>
          <div className="flex items-center space-x-1 mt-3 text-yellow-300">
            <Star size={16} fill="currentColor" />
            <Star size={16} fill="currentColor" />
            <Star size={16} fill="currentColor" />
            <Star size={16} fill="currentColor" />
            <Star size={16} className="text-white/40" />
            <span className="text-white ml-2 font-medium">4.8 Rating</span>
          </div>
        </div>
      </div>

      {/* Digital ID Card */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-md">
        <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center">
          <User className="mr-2 text-[#E8702A]" size={20} />
          Digital ID Card
        </h3>
        <div className="flex flex-row space-x-4">
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-xs text-stone-500">ID Number</p>
              <p className="font-semibold text-stone-800">VOL-108</p>
            </div>
            <div>
              <p className="text-xs text-stone-500">Blood Group</p>
              <p className="font-semibold text-red-500">O+</p>
            </div>
            <div>
              <p className="text-xs text-stone-500">Emergency Contact</p>
              <p className="font-semibold text-stone-800 flex items-center">
                <Phone size={14} className="mr-1 text-stone-400" /> 9876543210
              </p>
            </div>
            <div>
              <p className="text-xs text-stone-500">Valid Until</p>
              <p className="font-semibold text-stone-800">31 Mar 2028</p>
            </div>
          </div>
          <div className="w-28 flex flex-col items-center justify-center border-l border-stone-100 pl-4">
            <div className="w-24 h-24 bg-stone-100 rounded-lg flex items-center justify-center border-2 border-stone-200 border-dashed">
              <span className="text-stone-400 font-bold text-sm text-center">QR<br/>Code</span>
            </div>
            <p className="text-[10px] text-stone-400 mt-2 text-center">Scan to verify</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col items-center justify-center text-center">
          <Clock className="text-[#E8702A] mb-2" size={24} />
          <span className="text-2xl font-bold text-stone-800">245h</span>
          <span className="text-xs text-stone-500 font-medium mt-1">Total Hours</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col items-center justify-center text-center">
          <Shield className="text-red-500 mb-2" size={24} />
          <span className="text-2xl font-bold text-stone-800">23</span>
          <span className="text-xs text-stone-500 font-medium mt-1">SOS Responded</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col items-center justify-center text-center">
          <CheckCircle2 className="text-green-500 mb-2" size={24} />
          <span className="text-2xl font-bold text-stone-800">67</span>
          <span className="text-xs text-stone-500 font-medium mt-1">Tasks Completed</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col items-center justify-center text-center">
          <Star className="text-yellow-400 mb-2" size={24} />
          <span className="text-2xl font-bold text-stone-800">4.8</span>
          <span className="text-xs text-stone-500 font-medium mt-1">Avg Rating</span>
        </div>
      </div>

      {/* Skills & Certifications */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-md">
        <h3 className="text-lg font-bold text-stone-800 mb-3 flex items-center">
          <Award className="mr-2 text-[#E8702A]" size={20} />
          Skills & Certifications
        </h3>
        <div className="flex flex-wrap gap-2">
          {['First Aid', 'CPR', 'Crowd Management', 'Hindi', 'English', 'Navigation'].map((skill, index) => (
            <span key={index} className="px-3 py-1.5 bg-orange-50 text-[#E8702A] text-xs font-medium rounded-full border border-orange-100 flex items-center">
              <CheckCircle2 size={12} className="mr-1" />
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Training Progress */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-md">
        <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center">
          <CheckCircle2 className="mr-2 text-[#E8702A]" size={20} />
          Training Progress
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-stone-700">Basic Training</span>
              <span className="text-green-500 font-bold">100%</span>
            </div>
            <div className="w-full bg-stone-100 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-stone-700">First Aid</span>
              <span className="text-[#E8702A] font-bold">90%</span>
            </div>
            <div className="w-full bg-stone-100 rounded-full h-2">
              <div className="bg-[#E8702A] h-2 rounded-full" style={{ width: '90%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-stone-700">Emergency Response</span>
              <span className="text-[#E8702A] font-bold">85%</span>
            </div>
            <div className="w-full bg-stone-100 rounded-full h-2">
              <div className="bg-[#E8702A] h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-stone-700">Crowd Management</span>
              <span className="text-blue-500 font-bold">70%</span>
            </div>
            <div className="w-full bg-stone-100 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '70%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recognition Badges */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-md">
        <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center">
          <Star className="mr-2 text-[#E8702A]" size={20} />
          Recognition Badges
        </h3>
        <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex flex-col items-center min-w-[80px]">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-2 border border-red-100">
              <span className="text-2xl">🏅</span>
            </div>
            <span className="text-[10px] font-medium text-stone-700 text-center leading-tight">First<br/>Responder</span>
          </div>
          <div className="flex flex-col items-center min-w-[80px]">
            <div className="w-14 h-14 bg-yellow-50 rounded-full flex items-center justify-center mb-2 border border-yellow-100">
              <span className="text-2xl">⭐</span>
            </div>
            <span className="text-[10px] font-medium text-stone-700 text-center leading-tight">Star<br/>Volunteer</span>
          </div>
          <div className="flex flex-col items-center min-w-[80px]">
            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mb-2 border border-green-100">
              <span className="text-2xl">🎯</span>
            </div>
            <span className="text-[10px] font-medium text-stone-700 text-center leading-tight">100%<br/>Attendance</span>
          </div>
          <div className="flex flex-col items-center min-w-[80px]">
            <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-2 border border-blue-100">
              <span className="text-2xl">💪</span>
            </div>
            <span className="text-[10px] font-medium text-stone-700 text-center leading-tight">Team<br/>Leader</span>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-md overflow-hidden">
        <div className="p-4 border-b border-stone-100 flex justify-between items-center">
          <div className="flex items-center text-stone-800">
            <Settings size={18} className="mr-3 text-stone-400" />
            <span className="font-medium">Availability</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={isAvailable}
              onChange={() => setIsAvailable(!isAvailable)}
            />
            <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
          </label>
        </div>
        <button className="w-full p-4 border-b border-stone-100 flex justify-between items-center bg-white active:bg-stone-50 transition-colors">
          <div className="flex items-center text-stone-800">
            <Bell size={18} className="mr-3 text-stone-400" />
            <span className="font-medium">Notifications</span>
          </div>
          <ChevronRight size={18} className="text-stone-400" />
        </button>
        <button className="w-full p-4 border-b border-stone-100 flex justify-between items-center bg-white active:bg-stone-50 transition-colors">
          <div className="flex items-center text-stone-800">
            <Globe size={18} className="mr-3 text-stone-400" />
            <span className="font-medium">Language</span>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-stone-500 mr-2">English</span>
            <ChevronRight size={18} className="text-stone-400" />
          </div>
        </button>
        <button className="w-full p-4 flex justify-between items-center bg-white active:bg-stone-50 transition-colors">
          <div className="flex items-center text-stone-800">
            <HelpCircle size={18} className="mr-3 text-stone-400" />
            <span className="font-medium">Help & Support</span>
          </div>
          <ChevronRight size={18} className="text-stone-400" />
        </button>
      </div>

      {/* Logout Button */}
      <button 
        onClick={handleLogout}
        className="w-full bg-red-50 border border-red-100 text-red-600 rounded-xl py-4 flex items-center justify-center font-semibold text-lg mb-8 active:bg-red-100 transition-colors"
      >
        <LogOut size={20} className="mr-2" />
        Log Out
      </button>

    </div>
  );
};

export default VolunteerProfile;
