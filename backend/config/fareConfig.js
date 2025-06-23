// BluSmart-style transparent pricing config for ZingCab

module.exports = {
  carTypes: {
    hatchback: {
      baseFare: 179,
      perKmOneway: 15,
      perKmRoundtrip: 14,
      rentalPackage: 499
    },
    sedan: {
      baseFare: 199,
      perKmOneway: 17,
      perKmRoundtrip: 15,
      rentalPackage: 599
    },
    suv: {
      baseFare: 249,
      perKmOneway: 18,
      perKmRoundtrip: 17,
      rentalPackage: 799
    },
    crysta: {
      baseFare: 349,
      perKmOneway: 20,
      perKmRoundtrip: 18,
      rentalPackage: 999
    },
    scorpio: {
      baseFare: 329,
      perKmOneway: 19,
      perKmRoundtrip: 18,
      rentalPackage: 949
    }
  },
  rentalIncludedKm: 40,
  rentalIncludedHours: 4,
  rentalExtraPerKm: 15 // Flat rate for extra km in rental
}; 