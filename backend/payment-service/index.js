require('dotenv').config();
const amqp = require('amqplib');
const { MongoClient } = require('mongodb');

const RABBITMQ_URL = process.env.RABBITMQ_URL;
const MONGODB_URI = process.env.MONGODB_URI;

let db;

// MongoDB Connection
MongoClient.connect(MONGODB_URI, { useUnifiedTopology: true })
  .then((client) => {
    db = client.db('orderdb');
    console.log('Connected to MongoDB');
    consumeMessages(); // Преместете тук, за да се извика след успешното свързване
  })
  .catch((err) => console.error('Failed to connect to MongoDB', err));

// RabbitMQ Connection and Consumer Setup
async function consumeMessages() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue('payment_queue', { durable: true });
    await channel.assertQueue('shipment_queue', { durable: true });

    console.log('Payment Service waiting for messages');

    channel.consume('payment_queue', async (msg) => {
      if (msg !== null) {
        const order = JSON.parse(msg.content.toString());
        console.log('Received order:', order.id);

        // Simulate payment processing
        const paymentSuccess = true; // This should be replaced with real payment logic

        if (paymentSuccess) {
          if (!db) {
            console.error('MongoDB is not connected');
            return;
          }
          
          // Update order status in MongoDB
          await db.collection('orders').updateOne(
            { id: order.id },
            { $set: { status: 'PAID' } }
          );
          console.log('Order payment processed:', order.id);

          // Send message to Shipment Service
          const shipmentOrder = { ...order, status: 'READY_FOR_SHIPMENT' };
          channel.sendToQueue('shipment_queue', Buffer.from(JSON.stringify(shipmentOrder)), { persistent: true });
          console.log('Order sent to shipment queue:', order.id);
        } else {
          // Handle payment failure
          if (!db) {
            console.error('MongoDB is not connected');
            return;
          }
          
          await db.collection('orders').updateOne(
            { id: order.id },
            { $set: { status: 'PAYMENT_FAILED' } }
          );
          console.log('Payment failed for order:', order.id);
        }

        channel.ack(msg);
      }
    });
  } catch (err) {
    console.error('Error in Payment Service:', err);
  }
}
