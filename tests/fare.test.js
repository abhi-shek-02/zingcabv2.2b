const request = require('supertest');
const app = require('../server');

describe('Fare API', () => {
  describe('POST /api/fare/estimate', () => {
    
    it('should return a fare estimate for a one-way trip', async () => {
      const res = await request(app)
        .post('/api/fare/estimate')
        .send({
          service_type: 'oneway',
          pick_up_location: 'Mumbai',
          drop_location: 'Pune',
          car_type: 'sedan',
          journey_date: '2025-01-01',
          pick_up_time: '10:00 AM'
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('selected_car');
      expect(res.body.data).toHaveProperty('all_car_fares');
      expect(res.body.data.selected_car.car_type).toBe('sedan');
    });

    it('should return a fare estimate for a round trip', async () => {
        const res = await request(app)
          .post('/api/fare/estimate')
          .send({
            service_type: 'roundtrip',
            pick_up_location: 'Kolkata',
            drop_location: 'Durgapur',
            car_type: 'suv',
            journey_date: '2025-01-01',
            return_date: '2025-01-03',
            pick_up_time: '08:00 PM'
          });
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.service_details.service_type).toBe('roundtrip');
        expect(res.body.data.selected_car.car_type).toBe('suv');
    });

    it('should return a fare estimate for a rental trip', async () => {
        const res = await request(app)
          .post('/api/fare/estimate')
          .send({
            service_type: 'rental',
            pick_up_location: 'Delhi',
            car_type: 'hatchback',
            rental_booking_type: '8hr/80km',
            journey_date: '2025-02-10',
            pick_up_time: '12:00 PM'
          });
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.service_details.service_type).toBe('rental');
        expect(res.body.data.selected_car.car_type).toBe('hatchback');
    });

    it('should return 400 for missing required fields', async () => {
      const res = await request(app)
        .post('/api/fare/estimate')
        .send({
          service_type: 'oneway',
          // Missing other fields
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Missing required fields');
    });

    it('should return fare estimates for all car types', async () => {
      const res = await request(app)
        .post('/api/fare/estimate')
        .send({
          service_type: 'airport',
          pick_up_location: 'Goa',
          drop_location: 'Panjim',
          car_type: 'crysta',
          journey_date: '2025-03-15',
          pick_up_time: '04:30 AM'
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.all_car_fares).toHaveProperty('hatchback');
      expect(res.body.data.all_car_fares).toHaveProperty('sedan');
      expect(res.body.data.all_car_fares).toHaveProperty('suv');
      expect(res.body.data.all_car_fares).toHaveProperty('crysta');
      expect(res.body.data.all_car_fares).toHaveProperty('scorpio');
    });
  });
}); 