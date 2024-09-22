// index.js
require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const amqp = require('amqplib');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

const RABBITMQ_URL = process.env.RABBITMQ_URL;
const MONGODB_URI = process.env.MONGODB_URI;

// MongoDB Connection
let db;
MongoClient.connect(MONGODB_URI, { useUnifiedTopology: true })
  .then((client) => {
    db = client.db('orderdb');
    console.log('Connected to MongoDB');
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
  } catch (err) {
    console.error('Failed to connect to RabbitMQ', err);
  }
}
connectRabbitMQ();

// Place Order Endpoint
app.post('/order', async (req, res) => {
  const order = {
    id: uuidv4(),
    items: req.body.items,
    total: req.body.total,
    userEmail: req.body.userEmail,
    status: 'PENDING'
  };

  try {
    // Save order to MongoDB
    await db.collection('orders').insertOne(order);
    console.log('Order saved:', order.id);

    // Send message to Payment Processing Service
    const orderBuffer = Buffer.from(JSON.stringify(order));
    channel.sendToQueue('payment_queue', orderBuffer, { persistent: true });
    console.log('Order sent to payment queue');

    res.status(201).json({ message: 'Order placed successfully', orderId: order.id });
  } catch (err) {
    console.error('Error placing order:', err);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

app.listen(3001, () => {
  console.log('Order Service running on port 3001');
});
