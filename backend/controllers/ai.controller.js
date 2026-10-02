/**
 * AI Assistant Controller
 * Handles chat queries and returns relevant responses
 */

const { sendSuccess, sendError } = require('../utils/helpers');

// Pre-built response map (mirrors frontend mockData; extend with real AI in production)
const AI_RESPONSES = {
  'where should i go today':
    'Based on current crowd data:\n\n1. **Kalaram Temple** (Moderate crowd – 55%) – Morning darshan before 8 AM\n2. **Panchavati Forest** (Low crowd) – Peaceful walk\n3. **Saptashrungi Temple** (Low – 30%) – Great if you have a vehicle\n\n⚠️ Avoid Ramkund Ghat right now (75% High). Visit after 6 PM.',
  'which route is less crowded':
    '✅ Less Crowded:\n• Gangapur Road → Panchavati (via College Road) – 12 min\n• Railway Station → Ramkund (via Ashok Stambh) – 18 min\n\n⚠️ Avoid: Dwarka Circle → MG Road | NH-3 towards Trimbakeshwar (procession until 2 PM)',
  'nearest hospital':
    '🏥 **Kumbh Medical Camp Zone A** – 0.2 km | 1800-XXX-XXXX (toll-free)\n🏥 **Nashik Civil Hospital** – 2.1 km | 0253-2577555\n\nTap SOS on the home screen for immediate assistance.',
  "today's bathing events":
    '🔱 **Nag Panchami Snan** – Aug 9 | 4 AM–2 PM | All Ghats | 20 lakh+ pilgrims\n\nUpcoming:\n• Raksha Bandhan Snan – Aug 16\n• Amavasya Snan – Aug 30\n• Shahi Snan (Niranjani Akhara) – Sep 7',
  'create a 1-day itinerary':
    '🌅 5:00 AM – Morning dip at Ramkund\n🛕 7:00 AM – Kalaram Temple darshan\n☕ 8:30 AM – Breakfast (Misal Pav)\n🌳 9:30 AM – Panchavati & Sita Cave\n🚌 11:00 AM – Shuttle to Trimbakeshwar\n🍽️ 2:00 PM – Lunch at Krishna Dining\n🛍️ 3:30 PM – Shopping at Saraf Bazaar\n🎵 6:00 PM – Evening Aarti, Godavari Ghat\n🌙 7:00 PM – Sangeet Kumbh (free)',
  'where to park my car':
    '🅿️ **Zone A** (Railway Station) – 342 spots free | ₹50/day + Shuttle\n🅿️ **Zone B** (Nashik Road) – 891 spots free | ₹50/day + Shuttle\n🅿️ **Zone C** (Deolali) – 2140 spots free | ₹50/day + Shuttle',
  'best time to visit trimbakeshwar':
    '🕌 Open: 5:30 AM – 9:30 PM\n⏰ Best time: **Early morning (6–8 AM)** for smaller queues\n⚠️ Avoid: Shahi Snan dates (Sept 7 & 13) – extreme crowds\n🚌 Take shuttle from Zone B or pre-book a cab. Allow 2–3 hours for round trip.',
  'lost & found center location':
    '📍 **Lost & Found Centers:**\n1. Ramkund Ghat – Main Control Post\n2. Panchavati Police Outpost\n3. Railway Station – Kumbh Help Desk\n\nCall: 0253-2311000 (Kumbh Police HQ)\nAlternatively, use the Lost & Found feature in this app.',
};

// ── POST /api/v1/ai/chat ──────────────────────────────────────────────────────
const chat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return sendError(res, 'Message is required.', 400);

    const key = message.toLowerCase().trim();

    // Find best matching pre-built response
    let reply = null;
    for (const [pattern, response] of Object.entries(AI_RESPONSES)) {
      if (key.includes(pattern) || pattern.includes(key)) {
        reply = response;
        break;
      }
    }

    if (!reply) {
      reply =
        `I'm your KumbhSmart AI assistant! I can help with:\n` +
        `• Best places to visit today\n` +
        `• Route recommendations\n` +
        `• Nearest hospital or police\n` +
        `• Today's bathing events\n` +
        `• Creating itineraries\n` +
        `• Parking & Lost & Found\n\n` +
        `Please ask me any of these questions!`;
    }

    return sendSuccess(res, { reply, query: message });
  } catch (err) {
    return sendError(res, 'AI assistant unavailable.', 500);
  }
};

// ── GET /api/v1/ai/suggestions ────────────────────────────────────────────────
const getSuggestions = async (_req, res) => {
  const suggestions = [
    'Where should I go today?',
    'Which route is less crowded?',
    'Nearest hospital to me?',
    "Today's bathing events?",
    'Create a 1-day itinerary',
    'Where to park my car?',
    'Best time to visit Trimbakeshwar?',
    'Lost & Found center location?',
  ];
  return sendSuccess(res, { suggestions });
};

module.exports = { chat, getSuggestions };
