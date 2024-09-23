require('dotenv').config();
const amqp = require('amqplib');
const { MongoClient } = require('mongodb');

const RABBITMQ_URL = process.env.RABBITMQ_URL;
const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.SHIPMENT_SERVICE_PORT || 5002;

// MongoDB Connection
let db;
MongoClient.connect(MONGODB_URI, { useUnifiedTopology: true })
  .then((client) => {
    db = client.db('orderdb');
    console.log('Connected to MongoDB');
  })
  .catch((err) => console.error('Failed to connect to MongoDB', err));

// RabbitMQ Connection and Consumer Setup
let channel;
async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertQueue('shipment_queue', { durable: true });
    await channel.assertQueue('dead_letter_queue', { durable: true });
    console.log('Connected to RabbitMQ');

    // Start consuming messages
    channel.consume('shipment_queue', processShipment, { noAck: false });
  } catch (err) {
    console.error('Error in Shipment Service:', err);
  }
}
connectRabbitMQ();

// Function to process shipment
async function processShipment(msg) {
  if (msg !== null) {
    const order = JSON.parse(msg.content.toString());
    console.log('Processing shipment for order:', order.id);

    try {
      // Simulate shipment processing (replace with real logic)
      // For example, integrate with a logistics API

      // Update order status to SHIPPED
      await db.collection('orders').updateOne(
        { id: order.id },
        { $set: { status: 'SHIPPED' } }
      );
      console.log(`Order ${order.id} marked as SHIPPED`);

      // Send message to Notification Service
      const notificationOrder = { ...order, status: 'SHIPPED' };
      channel.sendToQueue('notification_queue', Buffer.from(JSON.stringify(notificationOrder)), { persistent: true });
      console.log(`Order ${order.id} sent to notification queue`);

      // Acknowledge the message
      channel.ack(msg);
    } catch (error) {
      console.error('Error processing shipment:', error);
      // Optionally, implement retry logic or move message to a dead-letter queue
      channel.nack(msg, false, false); // Discard the message
    }
  }
}

// Health Check Endpoint
const express = require('express');
const app = express();

app.get('/health', (req, res) => {
  res.status(200).send('Shipment Service is healthy');
});

app.listen(PORT, () => {
  console.log(`Shipment Service running on port ${PORT}`);
});