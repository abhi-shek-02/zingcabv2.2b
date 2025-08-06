# 🚗 ZingCab - Geolocation-Based Cab Booking System

[![Node.js](https://img.shields.io/badge/Node.js-18.20.8-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18.2-blue.svg)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-4.4.5-purple.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Enhanced Route System](#enhanced-route-system)
- [Quick Start](#quick-start)
- [API Documentation](#api-documentation)
- [Configuration](#configuration)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

ZingCab is a modern, geolocation-based cab booking system designed for West Bengal, featuring:

- **Geolocation-Based Pricing**: Dynamic pricing based on geographic zones
- **Enhanced Fixed Routes**: Seasonal, event-based, and time-based pricing
- **Real-time Fare Calculation**: Advanced pricing algorithms
- **Multi-Vehicle Support**: 5 core vehicle types from hatchback to crysta
- **RESTful API**: Comprehensive backend services
- **Modern Frontend**: React-based user interface

## ✨ Features

### 🗺️ Geolocation System
- **Zone-Based Pricing**: 50+ geographic zones across West Bengal
- **Distance Calculation**: Haversine formula for accurate distances
- **Dynamic Zone Detection**: Real-time location-based pricing

### 💰 Advanced Pricing Engine
- **Fixed Routes**: 28+ predefined routes with special pricing
- **Seasonal Pricing**: Summer, Monsoon, Winter adjustments
- **Event-Based Pricing**: Festival and special event pricing
- **Time-Based Pricing**: Peak hour and off-peak pricing
- **Multiplier System**: Night, festive, and demand-based surcharges

### 🚗 Vehicle Fleet
- **5 Core Vehicle Types**: hatchback, sedan, suv, crysta, scorpio
- **Flexible Pricing**: Per-km rates, rental packages, and base fares
- **Service Types**: One-way, round-trip, rental, and airport transfers

### 🔧 Technical Features
- **RESTful API**: Comprehensive backend services
- **Real-time Updates**: Live pricing and availability
- **Scalable Architecture**: Microservices-ready design
- **Security**: Helmet, CORS, rate limiting
- **Database**: Supabase (PostgreSQL) integration

## 🏗️ Architecture

```
zingcabv2.2b/
├── 📁 frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/             # Page components
│   │   ├── lib/               # Utility libraries
│   │   └── styles/            # CSS and styling
│   ├── public/                # Static assets
│   └── package.json           # Frontend dependencies
│
├── 📁 backend/                 # Node.js backend application
│   ├── config/                # Configuration files
│   │   ├── car_types.json     # Vehicle pricing configuration
│   │   ├── zones.json         # Geographic zones
│   │   ├── routes.json        # Fixed route pricing
│   │   ├── multipliers.json   # Surcharge multipliers
│   │   └── policy.json        # Business policies
│   ├── routes/                # API route handlers
│   ├── utils/                 # Utility functions
│   ├── test_suite/            # Comprehensive test suite
│   └── server.js              # Main server file
│
├── 📁 docs/                   # Documentation
├── 📁 scripts/                # Build and deployment scripts
└── README.md                  # This file
```

## 🚀 Enhanced Route System

### Overview
The enhanced fixed route system supports dynamic pricing based on seasons, events, and time slots, providing maximum flexibility for revenue optimization.

### Key Features

#### **Seasonal Pricing**
- **Summer** (March-June): Higher prices for tourist destinations
- **Monsoon** (July-September): Lower prices due to weather
- **Winter** (December-February): Special pricing for hill stations

#### **Event-Based Pricing**
- **beach_season**: March-June for beach destinations
- **religious_festival**: October-November for religious sites
- **iskcon_festival**: February-March for Mayapur
- **makar_sankranti**: January 10-20 for Gangasagar

#### **Time-Based Pricing**
- **peak_hours**: 7 AM - 10 AM
- **evening_peak**: 5 PM - 8 PM

### Route Types
- **tourist**: Beach destinations, hill stations
- **business**: Industrial areas, corporate hubs
- **religious**: Temples, pilgrimage sites
- **educational**: Universities, educational institutions

### Example Route Configuration
```json
{
  "id": "kolkata-digha",
  "start": "Kolkata",
  "end": "Digha",
  "route_type": "tourist",
  "fares": {
    "sedan": 3699,
    "suv": 4499
  },
  "conditions": {
    "seasonal": {
      "summer": {
        "sedan": 3999,
        "suv": 4799
      }
    },
    "events": {
      "beach_season": {
        "sedan": 4199,
        "suv": 4999
      }
    }
  },
  "active": true,
  "priority": 1
}
```

### Route Management API
```bash
# Get all routes
GET /api/routes

# Add new route
POST /api/routes

# Test route pricing
POST /api/routes/test-pricing

# Get route statistics
GET /api/routes/stats
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.20.8 or higher
- **npm** or **yarn** package manager
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/zingcabv2.2b.git
   cd zingcabv2.2b
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   npm install
   
   # Install frontend dependencies (if separate)
   cd frontend && npm install
   ```

3. **Environment Setup**
   ```bash
   # Backend environment
   cp .env.example .env
   # Edit .env with your configuration
   
   # Frontend environment
   cp frontend/.env.example frontend/.env
   # Edit frontend/.env with your configuration
   ```

4. **Start the application**
   ```bash
   # Start backend server
   npm run dev:backend
   
   # Start frontend (in another terminal)
   npm run dev:frontend
   ```

### Development Commands

```bash
# Backend development
npm run dev:backend          # Start backend with nodemon
npm run test:backend         # Run backend tests
npm run lint:backend         # Lint backend code

# Frontend development
npm run dev:frontend         # Start frontend with Vite
npm run build:frontend       # Build frontend for production
npm run test:frontend        # Run frontend tests

# Full stack
npm run dev                  # Start both frontend and backend
npm run test                 # Run all tests
npm run build                # Build for production

# Enhanced route testing
npm run test:enhanced-routes # Test enhanced route system
```

## 📚 API Documentation

### Core Endpoints

#### Fare Estimation
```http
POST /api/fare/estimate
Content-Type: application/json

{
  "pickup_lat": 22.5726,
  "pickup_lng": 88.3639,
  "drop_lat": 21.6291,
  "drop_lng": 87.5325,
  "car_type": "sedan",
  "service_type": "oneway",
  "pickup_time": "09:00",
  "journey_date": "2024-01-15"
}
```

#### Route Management
```http
GET    /api/routes              # Get all routes
POST   /api/routes              # Add new route
PUT    /api/routes/:id          # Update route
DELETE /api/routes/:id          # Delete route
GET    /api/routes/stats        # Get route statistics
```

#### Booking Management
```http
POST   /api/booking             # Create booking
GET    /api/booking/:id         # Get booking details
PUT    /api/booking/:id         # Update booking
DELETE /api/booking/:id         # Cancel booking
```

### Response Format

```json
{
  "success": true,
  "data": {
    "estimated_fare": 3699,
    "pricing_type": "fixed_route",
    "breakdown": {
      "base_fare": 3699,
      "gst": 666,
      "driver_allowance": 200,
      "total": 4565
    }
  }
}
```

## ⚙️ Configuration

### Vehicle Types

The system supports 5 core vehicle types with configurable pricing:

```json
{
  "hatchback": {
    "base_fare": 149,
    "per_km_oneway": 14,
    "per_km_roundtrip": 12,
    "rental_package": 499
  },
  "sedan": {
    "base_fare": 199,
    "per_km_oneway": 17,
    "per_km_roundtrip": 15,
    "rental_package": 599
  },
  "suv": {
    "base_fare": 249,
    "per_km_oneway": 18,
    "per_km_roundtrip": 17,
    "rental_package": 799
  },
  "crysta": {
    "base_fare": 299,
    "per_km_oneway": 20,
    "per_km_roundtrip": 18,
    "rental_package": 899
  },
  "scorpio": {
    "base_fare": 279,
    "per_km_oneway": 19,
    "per_km_roundtrip": 17,
    "rental_package": 849
  }
}
```

### Geographic Zones

50+ zones across West Bengal with radius-based pricing:

```json
[
  {
    "district": "Kolkata",
    "locations": [
      {
        "name": "Kolkata",
        "center": { "lat": 22.5726, "lng": 88.3639 },
        "radius_km": 20
      }
    ]
  }
]
```

### Fixed Routes

Enhanced routes with conditional pricing:

```json
{
  "id": "kolkata-digha",
  "start": "Kolkata",
  "end": "Digha",
  "route_type": "tourist",
  "fares": { "sedan": 3699, "suv": 4499 },
  "conditions": {
    "seasonal": {
      "summer": { "sedan": 3999, "suv": 4799 }
    }
  }
}
```

## 🧪 Testing

### Test Suite

Comprehensive test coverage for all pricing scenarios:

```bash
# Run all tests
npm run test

# Run specific test suites
npm run test:fixed-routes
npm run test:zone-based
npm run test:standard-pricing
npm run test:roundtrip
npm run test:rental
npm run test:edge-cases
npm run test:enhanced-routes
```

### Test Coverage

- ✅ **Fixed Routes**: 28+ predefined routes
- ✅ **Zone-Based Pricing**: Intra-zone and inter-zone calculations
- ✅ **Standard Pricing**: Fallback calculator pricing
- ✅ **Roundtrip Service**: Special roundtrip calculations
- ✅ **Rental Service**: Package and extra km pricing
- ✅ **Edge Cases**: Error handling and validation
- ✅ **Enhanced Routes**: Seasonal, event, and time-based pricing

### Example Test

```javascript
// Test seasonal pricing
const result = await axios.post('/api/routes/test-pricing', {
  start: 'Kolkata',
  end: 'Digha',
  service_type: 'oneway',
  car_type: 'sedan',
  date: '2024-05-15', // Summer
  time: '09:00'
});

// Expected: Summer pricing applied
expect(result.data.data.final_fare).toBe(3999);
```

## 🚀 Deployment

### Production Build

```bash
# Build frontend
npm run build:frontend

# Build backend
npm run build:backend

# Start production server
npm start
```

### Environment Variables

```bash
# Backend
PORT=3001
NODE_ENV=production
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key

# Frontend
VITE_API_BASE_URL=http://localhost:3001/api
VITE_OLAMAPS_API_KEY=your_ola_maps_key
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/CONTRIBUTING.md) for details.

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Standards

- **ESLint** for JavaScript linting
- **Prettier** for code formatting
- **Jest** for testing
- **Conventional Commits** for commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs/](docs/) folder
- **Issues**: [GitHub Issues](https://github.com/your-username/zingcabv2.2b/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/zingcabv2.2b/discussions)
- **Email**: support@zingcab.in

## 🙏 Acknowledgments

- **Ola Maps API** for geolocation services
- **Supabase** for database services
- **React** and **Vite** for frontend framework
- **Express.js** for backend framework
- **West Bengal Tourism** for location data

---

**Made with ❤️ for West Bengal** 