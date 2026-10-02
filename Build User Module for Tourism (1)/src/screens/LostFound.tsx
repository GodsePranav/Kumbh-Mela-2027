import React, { useState } from 'react';

interface LostFoundProps {
  onBack: () => void;
}

type ReportType = 'lost_person' | 'found_person' | 'lost_item' | 'found_item';

const MOCK_REPORTS = [
  {
    id: 'r1', type: 'lost_person', name: 'Sita Devi (60F)',
    description: 'Wearing white saree with green border. Last seen near Ramkund at 8AM.',
    location: 'Ramkund Ghat', time: '2 hours ago', status: 'active', contact: '9876543210',
    image: null,
  },
  {
    id: 'r2', type: 'found_person', name: 'Boy, ~8 years',
    description: 'Found near Kalaram Temple. Speaking Hindi. Says his name is Raju. Wearing blue shirt.',
    location: 'Kalaram Temple', time: '45 min ago', status: 'found', contact: 'Control Room',
    image: null,
  },
  {
    id: 'r3', type: 'lost_item', name: 'Brown Leather Bag',
    description: 'Contains documents, mobile charger. Lost near Godavari Ghat parking area.',
    location: 'Godavari Ghat', time: '3 hours ago', status: 'active', contact: '9012345678',
    image: null,
  },
];

export default function LostFound({ onBack }: LostFoundProps) {
  const [activeTab, setActiveTab] = useState<'reports' | 'report'>('reports');
  const [reportType, setReportType] = useState<ReportType>('lost_person');
  const [form, setForm] = useState({ name: '', description: '', location: '', contact: '' });
  const [submitted, setSubmitted] = useState(false);
  const [reports, setReports] = useState(MOCK_REPORTS);

  const handleSubmit = () => {
    if (!form.name || !form.description || !form.contact) return;
    const newReport = {
      id: 'r' + Date.now(), type: reportType,
      name: form.name, description: form.description,
      location: form.location || 'Not specified',
      time: 'Just now', status: 'active', contact: form.contact,
      image: null,
    };
    setReports(r => [newReport, ...r]);
    setSubmitted(true);
    setForm({ name: '', description: '', location: '', contact: '' });
    setTimeout(() => { setSubmitted(false); setActiveTab('reports'); }, 2500);
  };

  const typeColors: Record<string, { bg: string; text: string; label: string; icon: string }> = {
    lost_person: { bg: '#FEE2E2', text: '#DC2626', label: 'Lost Person', icon: '🔴' },
    found_person: { bg: '#DCFCE7', text: '#16A34A', label: 'Found Person', icon: '🟢' },
    lost_item: { bg: '#FEF3C7', text: '#D97706', label: 'Lost Item', icon: '🟡' },
    found_item: { bg: '#EFF6FF', text: '#1D4ED8', label: 'Found Item', icon: '🔵' },
  };

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ background: '#FEFAF4' }}>
      <div className="gradient-indigo px-5 pt-14 pb-6">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={onBack} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h1 className="text-white font-bold text-lg" style={{ fontFamily: 'Poppins' }}>Lost & Found</h1>
        </div>
        <p className="text-indigo-300 text-xs ml-11">Kumbh Mela 2027 · Nashik</p>
      </div>

      <div className="flex gap-0 mx-5 mt-5 bg-stone-100 rounded-xl p-1">
        {[['reports', '📋 Active Reports'], ['report', '+ New Report']].map(([tab, label]) => (
          <button key={tab} onClick={() => setActiveTab(tab as 'reports' | 'report')}
            className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab ? 'bg-white text-indigo-700 shadow' : 'text-stone-500'
            }`} style={{ fontFamily: 'Poppins' }}>
            {label}
          </button>
        ))}
      </div>

      <div className="px-5 mt-4 space-y-3">
        {activeTab === 'reports' && (
          <>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
              <span>ℹ️</span>
              <p className="text-amber-800 text-xs leading-relaxed">
                Reunification center: Near Godavari Control Room, Gate 3. Open 24/7. Contact: Kumbh Helpline 1800-XXX-XXXX
              </p>
            </div>
            {reports.map(report => {
              const tc = typeColors[report.type];
              return (
                <div key={report.id} className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm px-2.5 py-1 rounded-full font-semibold" style={{ background: tc.bg, color: tc.text }}>
                        {tc.icon} {tc.label}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        report.status === 'active' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                      }`}>{report.status === 'active' ? 'MISSING' : 'FOUND'}</span>
                    </div>
                    <span className="text-[10px] text-stone-400">{report.time}</span>
                  </div>
                  <h3 className="font-semibold text-stone-800 mt-2" style={{ fontFamily: 'Poppins' }}>{report.name}</h3>
                  <p className="text-stone-600 text-xs mt-1 leading-relaxed">{report.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-stone-500 text-xs">📍 {report.location}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <a href={`tel:${report.contact}`}
                      className="flex-1 py-2 rounded-xl bg-green-50 text-green-700 text-xs font-semibold text-center">
                      📞 Contact: {report.contact}
                    </a>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {activeTab === 'report' && (
          <div className="space-y-4">
            {submitted && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
                <span className="text-3xl block mb-2">✅</span>
                <p className="text-green-800 font-semibold">Report submitted successfully!</p>
                <p className="text-green-600 text-xs mt-1">Our team will follow up shortly.</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-stone-700 block mb-2">Report Type *</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(typeColors) as ReportType[]).map(type => {
                  const tc = typeColors[type];
                  return (
                    <button key={type} onClick={() => setReportType(type)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        reportType === type ? 'border-orange-500' : 'border-stone-200 bg-white'
                      }`} style={reportType === type ? { background: tc.bg } : {}}>
                      <span className="text-lg">{tc.icon}</span>
                      <p className="text-xs font-semibold mt-1" style={{ color: reportType === type ? tc.text : '#374151' }}>{tc.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-stone-700 block mb-1.5">
                {reportType.includes('person') ? 'Person\'s Name / Description *' : 'Item Name *'}
              </label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder={reportType.includes('person') ? 'Name, age, appearance...' : 'e.g., Brown leather bag'}
                className="w-full px-4 py-3 border border-stone-200 rounded-xl bg-white text-stone-800 text-sm placeholder-stone-400" />
            </div>

            <div>
              <label className="text-sm font-medium text-stone-700 block mb-1.5">Detailed Description *</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Clothing, color, distinctive features, last seen..."
                rows={3}
                className="w-full px-4 py-3 border border-stone-200 rounded-xl bg-white text-stone-800 text-sm placeholder-stone-400 resize-none" />
            </div>

            <div>
              <label className="text-sm font-medium text-stone-700 block mb-1.5">Last Known Location</label>
              <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                placeholder="e.g., Near Ramkund Ghat, Gate 3"
                className="w-full px-4 py-3 border border-stone-200 rounded-xl bg-white text-stone-800 text-sm placeholder-stone-400" />
            </div>

            <div>
              <label className="text-sm font-medium text-stone-700 block mb-1.5">Contact Number *</label>
              <input type="tel" value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))}
                placeholder="Your mobile number"
                className="w-full px-4 py-3 border border-stone-200 rounded-xl bg-white text-stone-800 text-sm placeholder-stone-400" />
            </div>

            <div className="border-2 border-dashed border-stone-200 rounded-xl p-6 flex flex-col items-center gap-2 bg-white">
              <span className="text-3xl">📷</span>
              <p className="text-stone-600 text-sm font-medium">Upload Photo (Optional)</p>
              <p className="text-stone-400 text-xs">Helps in faster identification</p>
              <button className="mt-1 px-4 py-2 rounded-lg bg-stone-100 text-stone-600 text-xs font-medium">Choose Photo</button>
            </div>

            <button onClick={handleSubmit}
              disabled={!form.name || !form.description || !form.contact}
              className="w-full py-4 rounded-2xl gradient-saffron text-white font-semibold shadow disabled:opacity-50"
              style={{ fontFamily: 'Poppins' }}>
              Submit Report
            </button>
          </div>
        )}
      </div>
      <div className="h-4" />
    </div>
  );
}
