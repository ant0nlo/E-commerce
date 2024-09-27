require('dotenv').config();
const express = require('express');
const cors = require('cors'); 
const { MongoClient } = require('mongodb');
const axios = require('axios');

const app = express();

// CORS Configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://e-comm-3ab.pages.dev' // Заменете с реалния домейн на фронтенда
    : `http://localhost:3000`, // За разработка
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI;
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;
const PAYPAL_API = process.env.PAYPAL_API || 'https://api-m.sandbox.paypal.com';
const PORT = process.env.PAYMENT_SERVICE_PORT || 5001;
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3001/create-order';

// MongoDB Connection (ако е необходимо)
let db;
MongoClient.connect(MONGODB_URI, { useUnifiedTopology: true })
  .then((client) => {
    db = client.db('e-comm-api-db');
    console.log('Connected to MongoDB in Payment Service');
  })
  .catch((err) => console.error('Failed to connect to MongoDB', err));

  let channel;
  async function connectRabbitMQ() {
    try {
      const connection = await amqp.connect(process.env.RABBITMQ_URL);
      channel = await connection.createChannel();
      await channel.assertQueue('shipment_queue', { durable: true });
      console.log('Connected to RabbitMQ in Payment Service');
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
    }
  }
  
  connectRabbitMQ();

// Function to get PayPal access token
async function getPayPalAccessToken() {
  const response = await axios({
    url: `${PAYPAL_API}/v1/oauth2/token`,
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    auth: {
      username: PAYPAL_CLIENT_ID,
      password: PAYPAL_SECRET
    },
    data: 'grant_type=client_credentials'
  });

  return response.data.access_token;
}

// Payment Confirmation Endpoint
app.post('/api/payment/confirm', async (req, res) => {
  const { orderId, paymentResult, shipmentInfo } = req.body;
  console.log('Received payment confirmation:', req.body);
  
  if (!orderId || !paymentResult || !shipmentInfo) {
    return res.status(400).json({ success: false, error: 'Missing orderId, paymentResult, or shipmentInfo' });
  }

  try {
    // Възможно е да искате да извършите допълнителна валидация на плащането с PayPal

    // Създаване на поръчка чрез Order Service
    const createOrderResponse = await axios.post(ORDER_SERVICE_URL, {
      items: paymentResult.items, // Уверете се, че тези данни са налични
      total: paymentResult.total,
      userEmail: paymentResult.userEmail,
      shipmentInfo: shipmentInfo,
      paymentResult: paymentResult
    });

    if (createOrderResponse.status === 201) {
      console.log(`Order ${createOrderResponse.data.orderId} created successfully`);
      res.json({ success: true, orderId: createOrderResponse.data.orderId });
    } else {
      throw new Error('Failed to create order');
    }
  } catch (error) {
    console.error('Error confirming payment:', error.response ? error.response.data : error.message);
    res.status(500).json({ success: false, error: 'Failed to confirm payment' });
  }
});

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).send('Payment Service is healthy');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Payment Service running on port ${PORT}`);
});