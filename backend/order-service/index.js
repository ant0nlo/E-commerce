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
    db = client.db('e-comm-api-db');
    console.log('Connected to MongoDB');

    // Start the server after successful DB connection
    app.listen(PORT, () => {
      console.log(`Order Service running on port ${PORT}`);
    });
  })
  .catch((err) => console.error('Failed to connect to MongoDB', err));

// RabbitMQ Connection за Shipment и Notification Services
let channel;
async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertQueue('shipment_queue', { durable: true });
    await channel.assertQueue('notification_queue', { durable: true });
    console.log('Connected to RabbitMQ for Shipment and Notification Services');
  } catch (err) {
    console.error('Failed to connect to RabbitMQ', err);
  }
}
connectRabbitMQ();

// Създаване на поръчка след успешно плащане
app.post('/create-order', async (req, res) => {
    const { items, total, userEmail, shipmentInfo, paymentResult } = req.body;

    // Валидация на входните данни
    if (!items || !userEmail || !shipmentInfo || !paymentResult) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const order = {
        id: uuidv4(),
        items,
        total,
        userEmail,
        shipmentInfo,
        paymentResult,
        status: 'PAID',
        createdAt: new Date()
    };

    try {
        // Запазване на поръчката в MongoDB
        await db.collection('orders').insertOne(order);
        console.log('Order saved:', order.id);

        // Изпращане на съобщение към Shipment Service
        const shipmentOrder = { ...order, status: 'READY_FOR_SHIPMENT' };
        channel.sendToQueue('shipment_queue', Buffer.from(JSON.stringify(shipmentOrder)), { persistent: true });
        console.log('Order sent to shipment queue');

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