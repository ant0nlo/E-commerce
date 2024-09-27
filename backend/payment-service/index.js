require('dotenv').config();
const express = require('express');
const amqp = require('amqplib');
const { MongoClient } = require('mongodb');
const axios = require('axios');
const cors = require('cors'); // Import CORS


const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(express.json());

const RABBITMQ_URL = process.env.RABBITMQ_URL;
const MONGODB_URI = process.env.MONGODB_URI;
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;
const PAYPAL_API = process.env.PAYPAL_API || 'https://api-m.sandbox.paypal.com';
const PORT = process.env.PAYMENT_SERVICE_PORT || 5001;

// MongoDB Connection
let db;
MongoClient.connect(MONGODB_URI, { useUnifiedTopology: true })
  .then((client) => {
    db = client.db('e-comm-api-db');
    console.log('Connected to MongoDB');
  })
  .catch((err) => console.error('Failed to connect to MongoDB', err));

let channel;

async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    console.log('RabbitMQ connection established.');
    
    channel = await connection.createChannel();
    console.log('RabbitMQ channel created successfully.');

    await channel.assertQueue('shipment_queue', { durable: true });
    await channel.assertQueue('payment_queue', { durable: true });
    console.log('Payment queue asserted.');
    
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error);
  }
}

// Call the connect function
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

// Function to verify payment (optional, based on requirements)
async function verifyPayment(paymentResult) {
  // Implement verification logic if needed
  // For demonstration, returning true
  return true;
}

// Function to process payment
async function processPayment(msg) {
  if (msg !== null) {
    const order = JSON.parse(msg.content.toString());
    console.log('Processing payment for order:', order.id);

    try {
      // Optionally, verify the payment using PayPal's API
      const isValidPayment = await verifyPayment(order.paymentResult);
      if (!isValidPayment) {
        throw new Error('Invalid payment');
      }

      // Update order status to PAID
      await db.collection('orders').updateOne(
        { id: order.id },
        { $set: { status: 'PAID', paymentResult: order.paymentResult } }
      );
      console.log(`Order ${order.id} marked as PAID`);

      // Send message to Shipment Service
      const shipmentOrder = { ...order, status: 'READY_FOR_SHIPMENT' };
      channel.sendToQueue('shipment_queue', Buffer.from(JSON.stringify(shipmentOrder)), { persistent: true });
      console.log(`Order ${order.id} sent to shipment queue`);

      // Acknowledge the message
      channel.ack(msg);
    } catch (error) {
      console.error('Error processing payment:', error);
      // Optionally, implement retry logic or move message to a dead-letter queue
      channel.nack(msg, false, false); // Discard the message
    }
  }
}

// Payment Confirmation Endpoint
/* app.post('/api/payment/confirm', async (req, res) => {
  const { orderId, paymentResult } = req.body;
  console.log('Received payment confirmation:', req.body);
  if (!orderId || !paymentResult) {
    return res.status(400).json({ success: false, error: 'Missing orderId or paymentResult' });
  }

  try {
    // Optionally, verify the payment with PayPal
    const accessToken = await getPayPalAccessToken();
    const verifyResponse = await axios.get(`${PAYPAL_API}/v2/checkout/orders/${paymentResult.id}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (verifyResponse.data.status !== 'COMPLETED') {
      throw new Error('Payment not completed');
    }

    // Update order status to PAID
    await db.collection('orders').updateOne(
      { id: orderId },
      { $set: { status: 'PAID', paymentResult: paymentResult } }
    );

    console.log(`Order ${orderId} marked as PAID`);

    // Send message to Shipment Service
    const order = await db.collection('orders').findOne({ id: orderId });
    const shipmentOrder = { ...order, status: 'READY_FOR_SHIPMENT' };
    channel.sendToQueue('shipment_queue', Buffer.from(JSON.stringify(shipmentOrder)), { persistent: true });
    console.log(`Order ${orderId} sent to shipment queue`);

    res.json({ success: true });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ success: false, error: 'Failed to confirm payment' });
  }
}); */

// Payment Confirmation Endpoint
app.post('/api/payment/confirm', async (req, res) => {
  const { orderId, paymentResult } = req.body;
  console.log('Received payment confirmation:', req.body);
  
  if (!orderId || !paymentResult) {
    return res.status(400).json({ success: false, error: 'Missing orderId or paymentResult' });
  }

  try {
    // Update order status to PAID
    await db.collection('orders').updateOne(
      { id: orderId },
      { $set: { status: 'PAID', paymentResult: paymentResult } }
    );

    console.log(`Order ${orderId} marked as PAID`);

    // Send message to Shipment Service
    const order = await db.collection('orders').findOne({ id: orderId });
    const shipmentOrder = { ...order, status: 'READY_FOR_SHIPMENT' };
    channel.sendToQueue('shipment_queue', Buffer.from(JSON.stringify(shipmentOrder)), { persistent: true });
    console.log(`Order ${orderId} sent to shipment queue`);

    res.json({ success: true });
  } catch (error) {
    console.error('Error confirming payment:', error);
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
