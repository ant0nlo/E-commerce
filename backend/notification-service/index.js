require('dotenv').config();
const express = require('express');
const amqp = require('amqplib');
const nodemailer = require('nodemailer');
const { getEmailTemplate } = require('./emailTemplates'); // Ensure this module is properly implemented

const app = express();
app.use(express.json());

const RABBITMQ_URL = process.env.RABBITMQ_URL;
const PORT = process.env.NOTIFICATION_SERVICE_PORT || 5003;

// Email setup
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// RabbitMQ Connection and Consumer Setup
let channel;
async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertQueue('notification_queue', { durable: true });
    console.log('Connected to RabbitMQ');

    // Start consuming messages
    channel.consume('notification_queue', processNotification, { noAck: false });
  } catch (err) {
    console.error('Error in Notification Service:', err);
  }
}
connectRabbitMQ();

// Function to process notification
async function processNotification(msg) {
  if (msg !== null) {
    const order = JSON.parse(msg.content.toString());
    console.log('Processing notification for order:', order.id);

    try {
      // Prepare email
      const emailTemplate = getEmailTemplate(order);

      const mailOptions = {
        from: process.env.EMAIL_USER ,
        to: order.userEmail,
        subject: emailTemplate.subject,
        text: emailTemplate.text
      };
      console.log(mailOptions)

      // Send email
      await transporter.sendMail(mailOptions);
      console.log('Email sent for order:', order.id);

      // Acknowledge the message
      channel.ack(msg);
    } catch (error) {
      console.error('Error sending email:', error);
      // Optionally, implement retry logic or move message to a dead-letter queue
      channel.nack(msg, false, false); // Discard the message
    }
  }
}

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).send('Notification Service is healthy');
});

app.listen(PORT, () => {
  console.log(`Notification Service running on port ${PORT}`);
});