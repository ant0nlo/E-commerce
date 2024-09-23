require('dotenv').config();
const express = require('express');
const cors = require('cors'); 
const { MongoClient } = require('mongodb');
const amqp = require('amqplib');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());
app.use(cors());

const RABBITMQ_URL = process.env.RABBITMQ_URL;
const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.ORDER_SERVICE_PORT || 3001;

// MongoDB Connection
let db;
MongoClient.connect(MONGODB_URI, { useUnifiedTopology: true })
  .then((client) => {
    db = client.db('orderdb');
    console.log('Connected to MongoDB');

    // Start the server after successful DB connection
    app.listen(PORT, () => {
      console.log(`Order Service running on port ${PORT}`);
    });
  })
  .catch((err) => console.error('Failed to connect to MongoDB', err));

// RabbitMQ Connection
let channel;
async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertQueue('payment_queue', { durable: true });
    console.log('Connected to RabbitMQ');

    // Start consuming messages
    channel.consume('payment_queue', processPayment, { noAck: false });
  } catch (err) {
    console.error('Failed to connect to RabbitMQ', err);
  }
}
connectRabbitMQ();

// Function to process payment (if any logic needed here)
async function processPayment(msg) {
  // Placeholder if needed
  channel.ack(msg);
}

// Place Order Endpoint
app.post('/order', async (req, res) => {
  const { items, total, userEmail } = req.body;

  // Validate input data
  if (!items || !userEmail) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const order = {
    id: uuidv4(),
    items,
    total,
    userEmail,
    status: 'PENDING'
  };

  try {
    // Save order to MongoDB
    await db.collection('orders').insertOne(order);
    console.log('Order saved:', order.id);

    // Send message to Payment Service via RabbitMQ
    const orderBuffer = Buffer.from(JSON.stringify(order));
    channel.sendToQueue('payment_queue', orderBuffer, { persistent: true });
    console.log('Order sent to payment queue');

    res.status(201).json({ message: 'Order placed successfully', orderId: order.id });
  } catch (err) {
    console.error('Error placing order:', err);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// Get Order Status Endpoint
app.get('/order/:id', async (req, res) => {
  const orderId = req.params.id;

  try {
    const order = await db.collection('orders').findOne({ id: orderId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});