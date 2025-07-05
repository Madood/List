// jest.mock('../src/middleware/errorHandler', () => ({
//         getCookie: jest.fn(),
//         notFound: (req, res, next) => res.status(404).send('Not Found')
//       })); 

      
// const request = require('supertest');
// const app = require('../src/app');

// describe('GET /api/items', () => {
//   it('should return a 200 status code', async () => {
//     const res = await request(app).get('/api/items');
//     expect(res.statusCode).toBe(200);
//   });
// });

// tests/items.test.js

// ✅ Mock middleware to prevent unwanted side effects during tests
jest.mock('../src/middleware/errorHandler', () => ({
        getCookie: jest.fn(),
        notFound: (req, res, next) => res.status(404).send('Not Found'),
      }));
      
      const request = require('supertest');
      const app = require('../src/app');
      
      describe('Items API', () => {
        // ✅ GET all items
        it('should return 200 and a list of items', async () => {
          const res = await request(app).get('/api/items');
          expect(res.statusCode).toBe(200);
          expect(Array.isArray(res.body)).toBe(true);
        });
      
        // ✅ GET item by ID
        it('should return an item by valid ID', async () => {
          const res = await request(app).get('/api/items');
          const firstItem = res.body[0];
          const detail = await request(app).get(`/api/items/${firstItem.id}`);
          expect(detail.statusCode).toBe(200);
          expect(detail.body.id).toBe(firstItem.id);
        });
      
        // ❌ GET with non-existent ID
        it('should return 404 for a non-existent item ID', async () => {
          const res = await request(app).get('/api/items/9999999');
          expect(res.statusCode).toBe(404);
        });
      
        // ❌ GET with malformed ID
        it('should return 404 for malformed item ID', async () => {
          const res = await request(app).get('/api/items/invalid-id');
          expect(res.statusCode).toBe(404);
        });
      
        // ✅ POST valid item
        it('should create a new item and return 201', async () => {
          const newItem = { name: 'Jest Created Item' };
          const res = await request(app)
            .post('/api/items')
            .send(newItem)
            .set('Accept', 'application/json');
      
          expect(res.statusCode).toBe(201);
          expect(res.body.name).toBe(newItem.name);
          expect(res.body.id).toBeDefined();
        });
      
        // ❌ POST empty item should fail
        it('should fail to create item with empty body', async () => {
          const res = await request(app)
            .post('/api/items')
            .send({})
            .set('Accept', 'application/json');
      
          expect(res.statusCode).toBeGreaterThanOrEqual(400);
        });
      
        // ✅ GET with query string
        it('should filter items by query string', async () => {
          // First insert a known item
          await request(app)
            .post('/api/items')
            .send({ name: 'FilterTestItem' })
            .set('Accept', 'application/json');
      
          const res = await request(app).get('/api/items?q=FilterTestItem');
      
          expect(res.statusCode).toBe(200);
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0].name).toMatch(/FilterTestItem/i);
        });
      
        // ✅ GET with limit
        it('should return limited number of items', async () => {
          const res = await request(app).get('/api/items?limit=2');
          expect(res.statusCode).toBe(200);
          expect(res.body.length).toBeLessThanOrEqual(2);
        });
      });
      