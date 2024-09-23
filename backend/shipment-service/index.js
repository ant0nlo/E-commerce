// index.js
require('dotenv').config();
const amqp = require('amqplib');
const { MongoClient } = require('mongodb');

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

// RabbitMQ Connection and Consumer Setup
async function consumeMessages() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue('shipment_queue', { durable: true });
    await channel.assertQueue('notification_queue', { durable: true });

    console.log('Shipment Service waiting for messages');

    channel.consume('shipment_queue', async (msg) => {
      if (msg !== null) {
        const order = JSON.parse(msg.content.toString());
        console.log('Preparing shipment for order:', order.id);

        // Simulate shipment processing
        const shipmentSuccess = true; // Replace with real shipment logic

        if (shipmentSuccess) {
          // Update order status in MongoDB
          await db.collection('orders').updateOne(
            { id: order.id },
            { $set: { status: 'SHIPPED' } }
          );
          console.log('Order shipped:', order.id);

          // Send message to Notification Service
          const notificationOrder = { ...order, status: 'SHIPPED' };
          channel.sendToQueue('notification_queue', Buffer.from(JSON.stringify(notificationOrder)), { persistent: true });
          console.log('Order sent to notification queue:', order.id);
        } else {
          // Handle shipment failure
          await db.collection('orders').updateOne(
            { id: order.id },
            { $set: { status: 'SHIPMENT_FAILED' } }
          );
          console.log('Shipment failed for order:', order.id);
        }

        channel.ack(msg);
      }
    });
  } catch (err) {
    console.error('Error in Shipment Service:', err);
  }
}

consumeMessages();
