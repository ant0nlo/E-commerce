process.env.NODE_ENV = 'test';
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/test';
process.env.JWT_SECRET = 'test_secret';

const request = require('supertest');

const { app } = require('../index');

describe('API availability', () => {
  it('responds to the health endpoint', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.text).toBe('Successfully connected...');
  });

  it('rejects order requests without required data', async () => {
    const response = await request(app)
      .post('/order')
      .send({ items: [], total: 0, userEmail: '' });

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/missing required fields/i);
  });

  it('rejects order requests with invalid items', async () => {
    const response = await request(app)
      .post('/order')
      .send({
        items: [{ productId: 'abc', size: 'invalid', quantity: 0 }],
        total: 120,
        userEmail: 'test@example.com'
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/no valid order items/i);
  });
});
