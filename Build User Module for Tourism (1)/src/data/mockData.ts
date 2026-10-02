export const LANGUAGES = [
  { code: 'hi', name: 'हिंदी', nativeName: 'Hindi', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी', nativeName: 'Marathi', flag: '🇮🇳' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🌐' },
  { code: 'gu', name: 'ગુજરાતી', nativeName: 'Gujarati', flag: '🇮🇳' },
  { code: 'bn', name: 'বাংলা', nativeName: 'Bengali', flag: '🇮🇳' },
  { code: 'ta', name: 'தமிழ்', nativeName: 'Tamil', flag: '🇮🇳' },
];

export const KUMBH_BATHING_DATES = [
  { date: 'July 28, 2027', event: 'Guru Purnima Snan', importance: 'Major', crowd: 'critical' },
  { date: 'August 9, 2027', event: 'Nag Panchami Snan', importance: 'Major', crowd: 'critical' },
  { date: 'August 16, 2027', event: 'Raksha Bandhan Snan', importance: 'Major', crowd: 'high' },
  { date: 'August 30, 2027', event: 'Amavasya Snan', importance: 'Royal Bath', crowd: 'critical' },
  { date: 'September 7, 2027', event: 'Shahi Snan – Niranjani Akhara', importance: 'Shahi', crowd: 'critical' },
  { date: 'September 13, 2027', event: 'Shahi Snan – Juna Akhara', importance: 'Shahi', crowd: 'critical' },
  { date: 'September 18, 2027', event: 'Anant Chaturdashi Snan', importance: 'Final Bath', crowd: 'high' },
];

export const PLACES = [
  {
    id: 'p1',
    name: 'Panchavati',
    category: 'religious',
    subcategory: 'Sacred Area',
    description: 'The sacred five-banyan-tree complex where Lord Ram, Sita, and Lakshmana stayed during their exile. Includes the famous Sita Gufa, Lakshmana Temple, and spiritual groves.',
    images: [
      'https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=800&h=600&fit=crop&auto=format',
    ],
    rating: 4.8,
    reviews: 18900,
    distance: '1.5 km',
    openHours: '6:00 AM – 8:00 PM',
    crowdLevel: 'moderate',
    crowdPercent: 50,
    lat: 19.9982,
    lng: 73.7910,
    facilities: ['Guide Services', 'Puja Items', 'Rest Area', 'Clean Toilets'],
    tags: ['panchavati', 'ramayana', 'sacred', 'sita-gufa'],
    isSaved: true,
  },
  {
    id: 'p2',
    name: 'Ramkund (Ram Ghat)',
    category: 'ghats',
    subcategory: 'Sacred Ghat',
    description: 'The holiest bathing ghat on the Godavari River in Nashik. Ram Kund is believed to be the spot where Lord Ram bathed during his exile. The waters are considered to have moksha-bestowing properties.',
    images: [
      'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&auto=format',
    ],
    rating: 4.8,
    reviews: 14237,
    distance: '0.8 km',
    openHours: '4:00 AM – 10:00 PM',
    crowdLevel: 'high',
    crowdPercent: 75,
    lat: 19.9975,
    lng: 73.7898,
    facilities: ['Changing Rooms', 'Lockers', 'Puja Items', 'Security', 'First Aid'],
    tags: ['ramkund', 'sacred', 'bathing', 'kumbh'],
    isSaved: false,
  },
  {
    id: 'p3',
    name: 'Trimbakeshwar Jyotirlinga',
    category: 'temples',
    subcategory: 'Jyotirlinga',
    description: 'One of the twelve sacred Jyotirlingas of Lord Shiva in India. Located 28km from Nashik near the source of the Godavari River at Brahmagiri Hill. A premier holy pilgrimage destination.',
    images: [
      'https://images.unsplash.com/photo-1590077428593-a55bb07c4665?w=800&h=600&fit=crop&auto=format',
    ],
    rating: 4.9,
    reviews: 31042,
    distance: '28 km',
    openHours: '5:30 AM – 9:30 PM',
    crowdLevel: 'high',
    crowdPercent: 80,
    lat: 19.9312,
    lng: 73.5301,
    facilities: ['VIP Darshan', 'Prasad', 'Accommodation', 'Parking', 'Drinking Water'],
    tags: ['trimbakeshwar', 'jyotirlinga', 'shiva', 'sacred'],
    isSaved: false,
  },
  {
    id: 'p4',
    name: 'Tapovan',
    category: 'religious',
    subcategory: 'Penance Grove',
    description: 'A serene spiritual spot located at the confluence of the Kapila and Godavari rivers where Lakshmana cut off Surpanakha\'s nose. Known for tranquil meditation spots and ancient hermitages.',
    images: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop&auto=format',
    ],
    rating: 4.7,
    reviews: 12450,
    distance: '2.5 km',
    openHours: '6:00 AM – 7:30 PM',
    crowdLevel: 'low',
    crowdPercent: 35,
    lat: 19.9910,
    lng: 73.8050,
    facilities: ['Meditation Spot', 'Rest Area', 'Puja Stalls', 'Parking'],
    tags: ['tapovan', 'meditation', 'ramayana', 'confluence'],
    isSaved: false,
  },
  {
    id: 'p5',
    name: 'Godavari Ghat',
    category: 'ghats',
    subcategory: 'Bathing Ghat',
    description: 'The grand holy riverfront stretch along the sacred Godavari River in Nashik. Famous for evening Ganga-Godavari Aarti, sacred ritual dips, and vibrant spiritual atmosphere.',
    images: [
      'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&h=600&fit=crop&auto=format',
    ],
    rating: 4.7,
    reviews: 41200,
    distance: '0.5 km',
    openHours: '24 Hours',
    crowdLevel: 'critical',
    crowdPercent: 90,
    lat: 19.9960,
    lng: 73.7882,
    facilities: ['Security Forces', 'Medical Camps', 'Lost & Found', 'Drinking Water', 'Sanitation'],
    tags: ['godavari', 'ghat', 'bathing', 'kumbh', 'aarti'],
    isSaved: false,
  },
];

export const EVENTS = [
  {
    id: 'e1',
    title: 'Guru Purnima Shahi Snan',
    type: 'bathing',
    date: 'July 28, 2027',
    time: '4:00 AM – 12:00 PM',
    location: 'Ramkund & Godavari Ghats',
    description: 'The first major royal bathing ceremony of Kumbh Mela 2027. All akharas participate in a ceremonial procession followed by the holy dip. Estimated 15 lakh+ pilgrims expected.',
    image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&h=500&fit=crop&auto=format',
    important: true,
    added: false,
  },
  {
    id: 'e2',
    title: 'Ramleela – Panchavati Stage Performance',
    type: 'cultural',
    date: 'August 3–8, 2027',
    time: '7:00 PM – 10:00 PM',
    location: 'Panchavati Open Amphitheatre',
    description: 'A spectacular five-day Ramleela theatrical performance depicting the journey of Lord Ram. Featuring 500+ artists, traditional costumes, and elaborate stage design.',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=500&fit=crop&auto=format',
    important: false,
    added: false,
  },
  {
    id: 'e3',
    title: 'Nag Panchami Snan',
    type: 'bathing',
    date: 'August 9, 2027',
    time: '4:00 AM – 2:00 PM',
    location: 'All Ghats – Godavari River',
    description: 'Major bathing date coinciding with Nag Panchami festival. Special puja for serpent deities alongside the holy dip. Expected crowd: 20 lakh+.',
    image: 'https://images.unsplash.com/photo-1576073719676-aa95576db207?w=800&h=500&fit=crop&auto=format',
    important: true,
    added: true,
  },
  {
    id: 'e4',
    title: 'Classical Music Festival – Sangeet Kumbh',
    type: 'cultural',
    date: 'August 12–15, 2027',
    time: '6:00 PM – 11:00 PM',
    location: 'Godavari Riverbank Stage',
    description: 'A four-day classical music festival featuring performances by leading Hindustani classical musicians. Includes sitar, tabla, flute, and vocal performances under the open sky.',
    image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&h=500&fit=crop&auto=format',
    important: false,
    added: false,
  },
  {
    id: 'e5',
    title: 'Shahi Snan – Niranjani Akhara',
    type: 'bathing',
    date: 'September 7, 2027',
    time: '3:00 AM – 12:00 PM',
    location: 'Ramkund Ghat (Main)',
    description: 'The most significant Shahi Snan of Kumbh Mela 2027. The Niranjani Akhara procession leads thousands of saints to the holy Godavari. Avoid this date unless attending the specific ritual.',
    image: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=800&h=500&fit=crop&auto=format',
    important: true,
    added: false,
  },
  {
    id: 'e6',
    title: 'Tribal Art & Craft Exhibition',
    type: 'exhibition',
    date: 'August 20–31, 2027',
    time: '10:00 AM – 8:00 PM',
    location: 'Kumbh Mela Exhibition Ground',
    description: 'An exhibition showcasing tribal art forms from Maharashtra and neighboring states. Warli paintings, Gond art, bamboo craft, and traditional textiles on display and for sale.',
    image: 'https://images.unsplash.com/photo-1541753866388-0b3c701627d3?w=800&h=500&fit=crop&auto=format',
    important: false,
    added: false,
  },
];

export const TRANSPORT_OPTIONS = [
  { id: 't1', type: 'Bus', name: 'MSRTC Kumbh Special Bus', from: 'Nashik Central Bus Stand', frequency: 'Every 15 min', fare: '₹20–50', crowdLevel: 'moderate' },
  { id: 't2', type: 'Auto', name: 'E-Rickshaw (Pre-Paid)', from: 'Railway Station', frequency: 'Available 6AM–10PM', fare: '₹30 fixed', crowdLevel: 'low' },
  { id: 't3', type: 'Train', name: 'Nashik Road Railway Station', from: '8 km from Ramkund', frequency: 'Multiple daily trains', fare: 'Varies', crowdLevel: 'high' },
  { id: 't4', type: 'Shuttle', name: 'Kumbh Mela Shuttle', from: 'Parking Zones A–F', frequency: 'Continuous', fare: '₹10', crowdLevel: 'moderate' },
];

export const HOTELS = [
  { id: 'h1', name: 'Hotel Panchavati Elite', stars: 4, distance: '0.5 km from Ramkund', price: '₹2,800/night', available: true, facilities: ['AC', 'WiFi', 'Restaurant', 'Parking'] },
  { id: 'h2', name: 'Kumbh Pilgrim Bhavan', stars: 2, distance: '0.3 km from Ghats', price: '₹650/night', available: true, facilities: ['Basic Rooms', 'Locker', 'Hot Water'] },
  { id: 'h3', name: 'The Gateway Hotel', stars: 5, distance: '3 km from City Center', price: '₹8,500/night', available: false, facilities: ['Pool', 'Spa', 'Multiple Dining', 'Valet'] },
  { id: 'h4', name: 'Dharamshala – Ram Sewa Mandal', stars: 1, distance: '0.1 km from Kalaram Temple', price: '₹200/night (donation)', available: true, facilities: ['Dormitory', 'Langar', 'Prayer Hall'] },
];

export const HOSPITALS = [
  { id: 'hosp1', name: 'Nashik Civil Hospital', type: 'Government', distance: '2.1 km', beds: 850, contact: '0253-2577555', emergencyOpen: true },
  { id: 'hosp2', name: 'Dr. Vasantrao Pawar Medical College', type: 'Medical College', distance: '4.3 km', beds: 1200, contact: '0253-2512777', emergencyOpen: true },
  { id: 'hosp3', name: 'Wockhardt Hospital', type: 'Private', distance: '3.8 km', beds: 200, contact: '0253-6610101', emergencyOpen: true },
  { id: 'hosp4', name: 'Kumbh Medical Camp – Zone A', type: 'Emergency Camp', distance: '0.2 km', beds: 50, contact: '1800-XXX-XXXX', emergencyOpen: true },
  { id: 'hosp5', name: 'Kumbh Medical Camp – Zone B', type: 'Emergency Camp', distance: '0.6 km', beds: 50, contact: '1800-XXX-XXXX', emergencyOpen: true },
];

export const POLICE_STATIONS = [
  { id: 'ps1', name: 'Nashik Kumbh Mela Police HQ', distance: '0.4 km', contact: '0253-2311000', type: 'Kumbh Special' },
  { id: 'ps2', name: 'Panchavati Police Station', distance: '1.1 km', contact: '0253-2313000', type: 'City Police' },
  { id: 'ps3', name: 'Ramkund Watch Post', distance: '0.1 km', contact: '100', type: 'Outpost' },
];

export const PARKING_ZONES = [
  { id: 'park1', name: 'Zone A – Near Railway Station', capacity: 2000, available: 342, distance: '2.1 km', fare: '₹50/day', shuttle: true },
  { id: 'park2', name: 'Zone B – Nashik Road', capacity: 3500, available: 891, distance: '3.5 km', fare: '₹50/day', shuttle: true },
  { id: 'park3', name: 'Zone C – Deolali Camp', capacity: 5000, available: 2140, distance: '8 km', fare: '₹50/day', shuttle: true },
  { id: 'park4', name: 'Two-Wheeler Zone – Panchavati', capacity: 4000, available: 780, distance: '0.5 km', fare: '₹20/day', shuttle: false },
];

export const NOTIFICATIONS = [
  {
    id: 'n1',
    type: 'emergency',
    title: 'Crowd Alert – Ramkund Area',
    message: 'Critical crowd density detected near Ramkund Ghat. Please avoid this area for next 2 hours. Alternative: Shivaji Ghat is available.',
    time: '2 min ago',
    read: false,
  },
  {
    id: 'n2',
    type: 'event',
    title: 'Reminder: Nag Panchami Snan',
    message: 'The Nag Panchami bathing event starts tomorrow at 4:00 AM. Reach ghats by 3:30 AM for best experience.',
    time: '1 hr ago',
    read: false,
  },
  {
    id: 'n3',
    type: 'route',
    title: 'Route Update – NH-3 Closed',
    message: 'NH-3 towards Trimbakeshwar is closed for procession from 6 AM to 2 PM today. Take alternate route via Gangapur Road.',
    time: '3 hr ago',
    read: true,
  },
  {
    id: 'n4',
    type: 'announcement',
    title: 'Government Notice',
    message: 'Plastic carry bags are prohibited in the Kumbh Mela area. Violations are subject to ₹500 fine. Use cloth bags provided free at information centers.',
    time: '5 hr ago',
    read: true,
  },
  {
    id: 'n5',
    type: 'event',
    title: 'Tonight: Sangeet Kumbh',
    message: 'Classical music performance by Pt. Rajan Sajan Misra at Godavari Riverbank Stage tonight at 7 PM. Entry free.',
    time: '6 hr ago',
    read: true,
  },
];

export const AI_SUGGESTIONS = [
  'Where should I go today?',
  'Which route is less crowded?',
  'Nearest hospital to me?',
  "Today's bathing events?",
  'Create a 1-day itinerary',
  'Where to park my car?',
  'Best time to visit Trimbakeshwar?',
  'Lost & Found center location?',
];

export const AI_RESPONSES: Record<string, string> = {
  'where should i go today': 'Based on current crowd data, I recommend:\n\n1. **Kalaram Temple** (Moderate crowd – 55%) – Beautiful morning darshan, best before 8 AM\n2. **Panchavati Forest** (Low crowd) – Peaceful walk through sacred banyan trees\n3. **Saptashrungi Temple** (Low crowd – only 30%) – If you have a vehicle, excellent choice today\n\nAvoid Ramkund Ghat right now – crowd is at 75% (High). Best time to visit is after 6 PM.',

  'which route is less crowded': 'Current route analysis (as of now):\n\n✅ **Less Crowded Routes:**\n• Gangapur Road → Panchavati (via College Road) – 12 min\n• Railway Station → Ramkund (via Ashok Stambh) – 18 min\n\n⚠️ **Avoid Currently:**\n• Dwarka Circle → MG Road (heavy traffic)\n• NH-3 towards Trimbakeshwar (procession until 2 PM)\n\nI recommend using the shuttle service from Parking Zone B for the most stress-free travel.',

  'nearest hospital': 'Your nearest hospitals:\n\n🏥 **Kumbh Medical Camp Zone A** – 0.2 km away\n• Emergency services, first aid, doctor available 24/7\n• Contact: 1800-XXX-XXXX (toll-free)\n\n🏥 **Nashik Civil Hospital** – 2.1 km\n• Full emergency services, 850 beds\n• Contact: 0253-2577555\n\nFor any emergency, tap the **SOS button** on the home screen for immediate assistance.',

  "today's bathing events": 'Upcoming bathing events:\n\n🔱 **Nag Panchami Snan** – August 9, 2027\n• 4:00 AM – 2:00 PM at All Ghats\n• Expected: 20 lakh+ pilgrims\n• Arrive before 3:30 AM for best access\n\n📅 Next major events:\n• Raksha Bandhan Snan – August 16\n• Amavasya Snan – August 30\n• Shahi Snan (Niranjani Akhara) – September 7\n\n⚠️ Tip: For Shahi Snan dates, arrive a day early and stay overnight near the ghats.',

  'create a 1-day itinerary': '**Your Optimized 1-Day Nashik Kumbh Itinerary:**\n\n🌅 **5:00 AM** – Morning dip at Ramkund Ghat (arrive early to beat crowds)\n🛕 **7:00 AM** – Darshan at Kalaram Temple (morning aarti at 6:30 AM)\n☕ **8:30 AM** – Breakfast at Panchavati Dining Hall (Misal Pav, Poha)\n🌳 **9:30 AM** – Walk through Panchavati sacred complex & Sita Cave\n🚌 **11:00 AM** – Shuttle to Trimbakeshwar Jyotirlinga (2hr round trip)\n🍽️ **2:00 PM** – Lunch at Krishna Dining (thali ₹80)\n🛍️ **3:30 PM** – Shopping at Saraf Bazaar (mala, trinkets)\n🎵 **6:00 PM** – Evening aarti at Godavari Ghat\n🌙 **7:00 PM** – Sangeet Kumbh classical music (free entry)\n\nTotal walking: ~4 km. Book parking in Zone A.',
};

export const WEATHER = {
  temp: 28,
  feels_like: 32,
  humidity: 78,
  description: 'Partly Cloudy',
  wind: '12 km/h NW',
  icon: '⛅',
  forecast: [
    { day: 'Today', icon: '⛅', high: 30, low: 23 },
    { day: 'Aug 9', icon: '🌧️', high: 27, low: 21, note: 'Snan Day' },
    { day: 'Aug 10', icon: '🌦️', high: 28, low: 22 },
    { day: 'Aug 11', icon: '☀️', high: 31, low: 24 },
    { day: 'Aug 12', icon: '⛅', high: 29, low: 23 },
  ],
};

export const MAP_MARKERS = [
  { id: 'm1', type: 'religious', name: 'Panchavati', lat: 19.9982, lng: 73.7910, crowd: 'moderate', x: 55, y: 50 },
  { id: 'm2', type: 'ghat', name: 'Ramkund', lat: 19.9975, lng: 73.7898, crowd: 'high', x: 48, y: 52 },
  { id: 'm3', type: 'temple', name: 'Trimbakeshwar', lat: 19.9312, lng: 73.5301, crowd: 'high', x: 25, y: 70 },
  { id: 'm4', type: 'religious', name: 'Tapovan', lat: 19.9910, lng: 73.8050, crowd: 'low', x: 65, y: 60 },
  { id: 'm5', type: 'ghat', name: 'Godavari Ghat', lat: 19.9960, lng: 73.7882, crowd: 'critical', x: 44, y: 57 },
  { id: 'm6', type: 'hospital', name: 'Civil Hospital', lat: 19.9998, lng: 73.7950, crowd: 'low', x: 65, y: 42 },
  { id: 'm7', type: 'police', name: 'Kumbh Police HQ', lat: 19.9970, lng: 73.7920, crowd: 'low', x: 58, y: 54 },
  { id: 'm8', type: 'parking', name: 'Zone A Parking', lat: 20.0010, lng: 73.7970, crowd: 'moderate', x: 70, y: 38 },
];

export const CATEGORIES = [
  { id: 'c1', name: 'Religious', icon: '🙏', color: 'bg-orange-100 text-orange-700', count: 2 },
  { id: 'c2', name: 'Ghats', icon: '🌊', color: 'bg-blue-100 text-blue-700', count: 2 },
  { id: 'c3', name: 'Temples', icon: '🛕', color: 'bg-amber-100 text-amber-700', count: 1 },
];
