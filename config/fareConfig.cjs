/**
 * Fare Configuration
 * 
 * Defines base fare and per-km rates for different car types
 * Used for distance-based pricing calculations
 * 
 * @module config/fareConfig
 */

const fareConfig = {
  carTypes: {
    hatchback: {
      baseFare: 500,
      perKmRate: 12,
      name: 'Hatchback'
    },
    sedan: {
      baseFare: 600,
      perKmRate: 14,
      name: 'Sedan'
    },
    suv: {
      baseFare: 800,
      perKmRate: 18,
      name: 'SUV'
    },
    crysta: {
      baseFare: 1000,
      perKmRate: 20,
      name: 'Innova Crysta'
    },
    scorpio: {
      baseFare: 900,
      perKmRate: 19,
      name: 'Scorpio'
    }
  },

  // Trip type multipliers
  tripTypeMultipliers: {
    oneway: 1.0,
    roundtrip: 1.8,
    rental: 1.0, // Rental has its own pricing logic
    airport: 1.0
  },

  // Additional charges (if needed)
  additionalCharges: {
    nightCharge: 0.1, // 10% extra for night trips (10 PM - 6 AM)
    festiveCharge: 0.15, // 15% extra during festivals
    tollCharges: 0, // Included in base fare
    stateTax: 0 // Included in base fare
  }
};

module.exports = fareConfig;

