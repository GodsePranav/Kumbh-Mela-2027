/**
 * Database Seeder
 * Seeds Places, Events, and one admin user into MongoDB
 * Run: node scripts/seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Place    = require('../models/Place.model');
const Event    = require('../models/Event.model');
const User     = require('../models/User.model');
const Notification = require('../models/Notification.model');

const connectDB = require('../config/db');

// ─── Seed Data ─────────────────────────────────────────────────────────────────
const PLACES = [
  {
    placeId: 'p1', name: 'Panchavati', category: 'religious', subcategory: 'Sacred Area',
    description: 'The sacred five-banyan-tree complex where Lord Ram, Sita, and Lakshmana stayed during their exile.',
    images: ['https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=800&h=600&fit=crop'],
    rating: 4.8, reviews: 18900, distance: '1.5 km', openHours: '6:00 AM – 8:00 PM',
    crowdLevel: 'moderate', crowdPercent: 50,
    location: { type: 'Point', coordinates: [73.7910, 19.9982] },
    facilities: ['Guide Services', 'Puja Items', 'Rest Area', 'Clean Toilets'],
    tags: ['panchavati', 'ramayana', 'sacred'],
  },
  {
    placeId: 'p2', name: 'Ramkund (Ram Ghat)', category: 'ghats', subcategory: 'Sacred Ghat',
    description: 'The holiest bathing ghat on the Godavari River in Nashik.',
    images: ['https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&h=600&fit=crop'],
    rating: 4.8, reviews: 14237, distance: '0.8 km', openHours: '4:00 AM – 10:00 PM',
    crowdLevel: 'high', crowdPercent: 75,
    location: { type: 'Point', coordinates: [73.7898, 19.9975] },
    facilities: ['Changing Rooms', 'Lockers', 'Puja Items', 'Security', 'First Aid'],
    tags: ['ramkund', 'sacred', 'bathing', 'kumbh'],
  },
  {
    placeId: 'p3', name: 'Trimbakeshwar Jyotirlinga', category: 'temples', subcategory: 'Jyotirlinga',
    description: 'One of the twelve sacred Jyotirlingas of Lord Shiva in India.',
    images: ['https://images.unsplash.com/photo-1590077428593-a55bb07c4665?w=800&h=600&fit=crop'],
    rating: 4.9, reviews: 31042, distance: '28 km', openHours: '5:30 AM – 9:30 PM',
    crowdLevel: 'high', crowdPercent: 80,
    location: { type: 'Point', coordinates: [73.5301, 19.9312] },
    facilities: ['VIP Darshan', 'Prasad', 'Accommodation', 'Parking', 'Drinking Water'],
    tags: ['trimbakeshwar', 'jyotirlinga', 'shiva'],
  },
  {
    placeId: 'p4', name: 'Tapovan', category: 'religious', subcategory: 'Penance Grove',
    description: 'A serene spiritual spot at the confluence of Kapila and Godavari rivers.',
    images: ['https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop'],
    rating: 4.7, reviews: 12450, distance: '2.5 km', openHours: '6:00 AM – 7:30 PM',
    crowdLevel: 'low', crowdPercent: 35,
    location: { type: 'Point', coordinates: [73.8050, 19.9910] },
    facilities: ['Meditation Spot', 'Rest Area', 'Puja Stalls', 'Parking'],
    tags: ['tapovan', 'meditation', 'ramayana'],
  },
  {
    placeId: 'p5', name: 'Godavari Ghat', category: 'ghats', subcategory: 'Bathing Ghat',
    description: 'The grand holy riverfront stretch along the sacred Godavari River.',
    images: ['https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&h=600&fit=crop'],
    rating: 4.7, reviews: 41200, distance: '0.5 km', openHours: '24 Hours',
    crowdLevel: 'critical', crowdPercent: 90,
    location: { type: 'Point', coordinates: [73.7882, 19.9960] },
    facilities: ['Security Forces', 'Medical Camps', 'Lost & Found', 'Drinking Water'],
    tags: ['godavari', 'ghat', 'bathing', 'kumbh', 'aarti'],
  },
];

const EVENTS = [
  {
    eventId: 'e1', title: 'Guru Purnima Shahi Snan', type: 'bathing',
    date: 'July 28, 2027', time: '4:00 AM – 12:00 PM', location: 'Ramkund & Godavari Ghats',
    description: 'The first major royal bathing ceremony of Kumbh Mela 2027.',
    image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&h=500&fit=crop',
    important: true, expectedCrowd: '15 lakh+',
  },
  {
    eventId: 'e2', title: 'Ramleela – Panchavati Stage Performance', type: 'cultural',
    date: 'August 3–8, 2027', time: '7:00 PM – 10:00 PM', location: 'Panchavati Open Amphitheatre',
    description: 'A spectacular five-day Ramleela theatrical performance.',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=500&fit=crop',
    important: false,
  },
  {
    eventId: 'e3', title: 'Nag Panchami Snan', type: 'bathing',
    date: 'August 9, 2027', time: '4:00 AM – 2:00 PM', location: 'All Ghats – Godavari River',
    description: 'Major bathing date coinciding with Nag Panchami festival.',
    image: 'https://images.unsplash.com/photo-1576073719676-aa95576db207?w=800&h=500&fit=crop',
    important: true, expectedCrowd: '20 lakh+',
  },
  {
    eventId: 'e4', title: 'Classical Music Festival – Sangeet Kumbh', type: 'cultural',
    date: 'August 12–15, 2027', time: '6:00 PM – 11:00 PM', location: 'Godavari Riverbank Stage',
    description: 'A four-day classical music festival featuring Hindustani classical musicians.',
    image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&h=500&fit=crop',
    important: false,
  },
  {
    eventId: 'e5', title: 'Shahi Snan – Niranjani Akhara', type: 'bathing',
    date: 'September 7, 2027', time: '3:00 AM – 12:00 PM', location: 'Ramkund Ghat (Main)',
    description: 'The most significant Shahi Snan of Kumbh Mela 2027.',
    image: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=800&h=500&fit=crop',
    important: true, expectedCrowd: '30 lakh+',
  },
  {
    eventId: 'e6', title: 'Tribal Art & Craft Exhibition', type: 'exhibition',
    date: 'August 20–31, 2027', time: '10:00 AM – 8:00 PM', location: 'Kumbh Mela Exhibition Ground',
    description: 'Warli paintings, Gond art, bamboo craft, and traditional textiles on display.',
    image: 'https://images.unsplash.com/photo-1541753866388-0b3c701627d3?w=800&h=500&fit=crop',
    important: false,
  },
];

const NOTIFICATIONS = [
  {
    type: 'emergency',
    title: 'Crowd Alert – Ramkund Area',
    message: 'Critical crowd density detected near Ramkund Ghat. Please avoid this area for next 2 hours.',
    user: null,
  },
  {
    type: 'event',
    title: 'Reminder: Nag Panchami Snan',
    message: 'The Nag Panchami bathing event starts tomorrow at 4:00 AM. Reach ghats by 3:30 AM.',
    user: null,
  },
  {
    type: 'route',
    title: 'Route Update – NH-3 Closed',
    message: 'NH-3 towards Trimbakeshwar is closed for procession from 6 AM to 2 PM today.',
    user: null,
  },
  {
    type: 'announcement',
    title: 'Government Notice',
    message: 'Plastic carry bags are prohibited in the Kumbh Mela area. ₹500 fine for violations.',
    user: null,
  },
];

// ─── Seeder ────────────────────────────────────────────────────────────────────
const seed = async () => {
  try {
    await connectDB();
    console.log('\n🌱 Starting database seed...\n');

    // Clear existing
    await Promise.all([Place.deleteMany(), Event.deleteMany(), Notification.deleteMany()]);
    console.log('🗑️  Cleared existing data');

    // Insert places
    await Place.insertMany(PLACES);
    console.log(`✅ Inserted ${PLACES.length} places`);

    // Insert events
    await Event.insertMany(EVENTS);
    console.log(`✅ Inserted ${EVENTS.length} events`);

    // Insert notifications
    await Notification.insertMany(NOTIFICATIONS);
    console.log(`✅ Inserted ${NOTIFICATIONS.length} notifications`);

    // Create admin user (if not exists)
    const adminEmail = 'admin@kumbhsmart.in';
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create({
        name: 'KumbhSmart Admin',
        email: adminEmail,
        password: 'Admin@2027',
        language: 'en',
        role: 'admin',
        isVerified: true,
      });
      console.log('✅ Admin user created: admin@kumbhsmart.in / Admin@2027');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    console.log('\n🎉 Database seeded successfully!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seed();
