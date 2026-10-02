# KumbhSmart Backend – REST API

Express + MongoDB (MERN) backend for the **KumbhSmart Tourism User Module**.

---

## 🗂️ Project Structure

```
backend/
├── config/
│   └── db.js                    # MongoDB connection
├── controllers/
│   ├── auth.controller.js       # Register / Login / Me
│   ├── user.controller.js       # Profile, Saved Places, Schedule
│   ├── place.controller.js      # Tourist places CRUD + nearby search
│   ├── event.controller.js      # Kumbh Mela events CRUD
│   ├── trip.controller.js       # User itinerary CRUD
│   ├── notification.controller.js
│   ├── emergency.controller.js  # SOS + Emergency contacts
│   ├── lostFound.controller.js  # Lost & Found reports
│   ├── ai.controller.js         # AI Assistant chat
│   └── map.controller.js        # Map markers, crowd, transport, parking
├── middleware/
│   └── auth.middleware.js       # JWT protect + role authorize
├── models/
│   ├── User.model.js
│   ├── Place.model.js           # 2dsphere geo-index
│   ├── Event.model.js
│   ├── Trip.model.js
│   ├── Notification.model.js
│   ├── LostFound.model.js
│   └── EmergencyAlert.model.js  # 2dsphere geo-index
├── routes/
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── place.routes.js
│   ├── event.routes.js
│   ├── trip.routes.js
│   ├── notification.routes.js
│   ├── emergency.routes.js
│   ├── lostFound.routes.js
│   ├── ai.routes.js
│   └── map.routes.js
├── scripts/
│   └── seed.js                  # Database seeder
├── utils/
│   └── helpers.js               # Token generation, response helpers
├── .env                         # Environment variables
├── .env.example
├── package.json
└── server.js                    # Express entry point
```

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Configure environment
Copy `.env.example` to `.env` and update values:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/kumbhsmart
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:8443
```

### 3. Seed the database
```bash
npm run seed
```

### 4. Start the server
```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

---

## 📡 API Endpoints

Base URL: `http://localhost:5000/api/v1`

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | ❌ | Register a new user |
| POST | `/auth/login` | ❌ | Login |
| GET | `/auth/me` | ✅ | Get current user |
| POST | `/auth/logout` | ✅ | Logout |

### Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/profile` | ✅ | Get profile |
| PUT | `/users/profile` | ✅ | Update profile |
| PUT | `/users/password` | ✅ | Change password |
| GET | `/users/saved-places` | ✅ | Get saved places |
| POST | `/users/saved-places/:placeId` | ✅ | Save a place |
| DELETE | `/users/saved-places/:placeId` | ✅ | Unsave a place |
| POST | `/users/schedule/:eventId` | ✅ | Add event to schedule |
| DELETE | `/users/schedule/:eventId` | ✅ | Remove from schedule |
| DELETE | `/users/account` | ✅ | Deactivate account |

### Places
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/places` | ❌ | All places (filter by category/search) |
| GET | `/places/nearby?lng=&lat=&maxDistance=` | ❌ | Nearby places |
| GET | `/places/:id` | ❌ | Place details |
| POST | `/places` | 🔒 Admin | Create place |
| PUT | `/places/:id` | 🔒 Admin | Update place |
| DELETE | `/places/:id` | 🔒 Admin | Delete place |

### Events
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/events` | ❌ | All events (filter: type, important) |
| GET | `/events/:id` | ❌ | Event details |
| POST | `/events` | 🔒 Admin | Create event |
| PUT | `/events/:id` | 🔒 Admin | Update event |
| DELETE | `/events/:id` | 🔒 Admin | Delete event |

### Trips
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/trips` | ✅ | My trips |
| GET | `/trips/:id` | ✅ | Trip details |
| POST | `/trips` | ✅ | Create trip |
| PUT | `/trips/:id` | ✅ | Update trip |
| DELETE | `/trips/:id` | ✅ | Delete trip |

### Notifications
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/notifications` | ✅ | Get notifications |
| PATCH | `/notifications/:id/read` | ✅ | Mark as read |
| PATCH | `/notifications/read-all` | ✅ | Mark all as read |

### Emergency
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/emergency/contacts` | ❌ | Emergency contacts |
| POST | `/emergency/sos` | ✅ | Raise SOS alert |
| GET | `/emergency/my-alerts` | ✅ | My SOS history |

### Lost & Found
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/lost-found` | ❌ | Browse all open reports |
| POST | `/lost-found` | ✅ | Submit a report |
| GET | `/lost-found/my-reports` | ✅ | My reports |
| PATCH | `/lost-found/:id/resolve` | ✅ | Mark as resolved |
| DELETE | `/lost-found/:id` | ✅ | Delete report |

### AI Assistant
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/ai/suggestions` | ❌ | Quick suggestion chips |
| POST | `/ai/chat` | ✅ | Send chat message |

### Map
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/map/markers` | ❌ | All map markers |
| GET | `/map/crowd` | ❌ | Crowd levels |
| GET | `/map/transport` | ❌ | Transport options |
| GET | `/map/parking` | ❌ | Parking zones |

---

## 🔐 Authentication

All protected routes require:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## 🛠️ Tech Stack
- **Runtime**: Node.js 22
- **Framework**: Express 4
- **Database**: MongoDB + Mongoose 8
- **Auth**: JWT (jsonwebtoken) + bcryptjs
- **Validation**: express-validator
- **Dev**: Nodemon
