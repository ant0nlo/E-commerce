/* const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index'); // Assuming your main file is named app.js
const Item = mongoose.model('Item');
const Users = mongoose.model('Users');

describe('Express App Tests', () => {
  beforeAll(async () => {
    // Connect to a test database before running tests
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    // Disconnect from the test database after tests
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear the database before each test
    await Item.deleteMany({});
    await Users.deleteMany({});
  });

  describe('GET /', () => {
    it('should return 200 OK', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.text).toBe('Succssesfuly connected...');
    });
  });

  describe('POST /addproduct', () => {
    it('should add a new product', async () => {
      const newProduct = {
        name: 'Test Product',
        image: 'test.jpg',
        category: 'test',
        new_price: 100,
        old_price: 120,
      };

      const response = await request(app)
        .post('/addproduct')
        .send(newProduct);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.name).toBe(newProduct.name);

      // Check if the product was actually added to the database
      const addedProduct = await Item.findOne({ name: newProduct.name });
      expect(addedProduct).toBeTruthy();
    });
  });

  describe('POST /signup', () => {
    it('should register a new user', async () => {
      const newUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/signup')
        .send(newUser);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeTruthy();

      // Check if the user was actually added to the database
      const addedUser = await Users.findOne({ email: newUser.email });
      expect(addedUser).toBeTruthy();
    });

    it('should not register a user with an existing email', async () => {
      const existingUser = new Users({
        name: 'existing',
        email: 'existing@example.com',
        password: 'password123',
      });
      await existingUser.save();

      const newUser = {
        username: 'testuser',
        email: 'existing@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/signup')
        .send(newUser);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBe('This email is already used!');
    });
  });

  describe('POST /login', () => {
    it('should login an existing user', async () => {
      const user = new Users({
        name: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });
      await user.save();

      const loginCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/login')
        .send(loginCredentials);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeTruthy();
    });

    it('should not login with incorrect password', async () => {
      const user = new Users({
        name: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });
      await user.save();

      const loginCredentials = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const response = await request(app)
        .post('/login')
        .send(loginCredentials);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid password');
    });
  });

  // Add more test cases for other endpoints as needed
}); */