import React, { useState, useRef, useEffect } from 'react';
import { AI_SUGGESTIONS, AI_RESPONSES } from '../data/mockData';

interface AIAssistantProps {
  onBack: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  time: string;
}

const getResponse = (query: string): string => {
  const q = query.toLowerCase().trim();
  for (const [key, response] of Object.entries(AI_RESPONSES)) {
    if (q.includes(key.split(' ')[0]) || key.includes(q.split(' ')[0])) {
      return response;
    }
  }
  if (q.includes('park') || q.includes('parking')) return AI_RESPONSES['create a 1-day itinerary'].includes('parking') ? 'For parking, Zone A near Railway Station has 342 spots available (fare ₹50/day). Shuttle service available. Zone B has 891 spots. I recommend Zone A for best access to Ramkund Ghat.' : 'Parking Zone A near Railway Station (342 spots, ₹50/day). Zone B has 891 spots. Zone C (8 km away) has 2,140 spots. Free shuttle to ghats from all zones.';
  if (q.includes('hotel') || q.includes('stay') || q.includes('accommodation')) return 'Top recommendations near Ramkund Ghat:\n\n🏨 **Hotel Panchavati Elite** (4★) – ₹2,800/night, 0.5km from ghats\n🏨 **Kumbh Pilgrim Bhavan** (Budget) – ₹650/night, 0.3km from ghats\n🛕 **Dharamshala Ram Sewa Mandal** – ₹200/night (donation-based), 0.1km from Kalaram Temple\n\n⚠️ Book at least 3 months in advance for Shahi Snan dates!';
  if (q.includes('food') || q.includes('eat') || q.includes('restaurant')) return 'Top food options near Panchavati:\n\n🍽️ **Panchavati Dining Hall** – Thali ₹80, Vegetarian only, recommended!\n🥘 **Misal Pav Stalls** – Nashik\'s famous breakfast, ₹30-50\n🍛 **Annapurna Bhojanalaya** – Home-style Maharashtrian food, ₹60/thali\n\nTip: All food near the ghats is strictly vegetarian during Kumbh period.';
  if (q.includes('trimbak') || q.includes('jyotirlinga')) return 'Trimbakeshwar Jyotirlinga is 28km from Nashik. Best time to visit: 5:30-7:30 AM for morning darshan. Take MSRTC bus from CBS Nashik (every 30 min, ₹40). Avoid Mondays and Shahi Snan dates (extreme crowd). Current crowd level: High (80%).';
  return `I found information about "${query}" in my database. Currently, the most visited areas near you are Kalaram Temple (Moderate crowd) and Panchavati (Moderate crowd). For more specific information, you can browse the Explore section or check the Smart Map. Namaste! 🙏`;
};

export default function AIAssistant({ onBack }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'ai',
      text: 'Namaste! 🙏 I\'m your Kumbh Mela AI Tourism Assistant. I can help you with:\n\n• Finding places & routes\n• Live crowd information\n• Event timings\n• Hotel & food recommendations\n• Emergency assistance\n• Creating day itineraries\n\nHow can I assist you today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text, time: now };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setIsTyping(true);
    const delay = 800 + Math.random() * 1200;
    setTimeout(() => {
      setIsTyping(false);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: getResponse(text),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(m => [...m, aiMsg]);
    }, delay);
  };

  const renderText = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="font-bold text-stone-800">{line.replace(/\*\*/g, '')}</p>;
      }
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <p key={i} className={line === '' ? 'mb-1' : ''}>
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j}>{part.replace(/\*\*/g, '')}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: '#FEFAF4' }}>
      {/* Header */}
      <div className="gradient-indigo px-5 pt-12 pb-4 flex items-center gap-3 z-10">
        <button onClick={onBack} className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full gradient-saffron flex items-center justify-center text-xl shadow-lg">🤖</div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-indigo-900" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm" style={{ fontFamily: 'Poppins' }}>Kumbh AI Assistant</p>
            <p className="text-indigo-300 text-xs">Powered by local data · Multilingual</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-green-300 text-xs">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
            {msg.role === 'ai' && (
              <div className="w-8 h-8 rounded-full gradient-saffron flex items-center justify-center text-sm flex-shrink-0 mt-1">🤖</div>
            )}
            <div className={`max-w-[82%] ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'} px-4 py-3`}>
              <div className="text-sm leading-relaxed space-y-0.5">
                {renderText(msg.text)}
              </div>
              <p className={`text-[10px] mt-1.5 ${msg.role === 'user' ? 'text-orange-100 text-right' : 'text-stone-400'}`}>
                {msg.time}
              </p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full gradient-saffron flex items-center justify-center text-sm">🤖</div>
            <div className="chat-bubble-ai px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-stone-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-stone-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-stone-300 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions */}
      {messages.length < 3 && (
        <div className="px-4 py-2">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {AI_SUGGESTIONS.map(s => (
              <button key={s} onClick={() => sendMessage(s)}
                className="flex-shrink-0 text-xs bg-white border border-stone-200 rounded-full px-3 py-2 text-stone-600 hover:border-orange-500 hover:text-orange-600 transition-colors">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 glass border-t border-stone-200/60 safe-bottom">
        <div className="flex items-end gap-3">
          <div className="flex-1 bg-white rounded-2xl border border-stone-200 px-4 py-2.5 flex items-end gap-2">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
              placeholder="Ask anything about Kumbh Mela..."
              className="flex-1 text-sm text-stone-800 placeholder-stone-400 resize-none bg-transparent max-h-24 min-h-[20px]"
              rows={1}
            />
            <button className="text-stone-400 text-xs">🎤</button>
          </div>
          <button onClick={() => sendMessage(input)} disabled={!input.trim() || isTyping}
            className="w-11 h-11 rounded-2xl gradient-saffron flex items-center justify-center shadow disabled:opacity-50 flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
        <p className="text-[10px] text-stone-400 text-center mt-1.5">Responses based on real Kumbh Mela 2027 data</p>
      </div>
    </div>
  );
}
