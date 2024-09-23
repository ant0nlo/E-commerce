// index.js
require('dotenv').config();
const amqp = require('amqplib');
const nodemailer = require('nodemailer');
const { getEmailTemplate } = require('./emailTemplates');

const RABBITMQ_URL = process.env.RABBITMQ_URL;

// Email setup
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// RabbitMQ Connection and Consumer Setup
async function consumeMessages() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue('notification_queue', { durable: true });

    console.log('Notification Service waiting for messages');

    channel.consume('notification_queue', async (msg) => {
      if (msg !== null) {
        const order = JSON.parse(msg.content.toString());
        console.log('Sending notification for order:', order.id);

        // Prepare email
        const emailTemplate = getEmailTemplate(order);

        const mailOptions = {
          from: '"E-commerce Team" <no-reply@example.com>',
          to: order.userEmail,
          subject: emailTemplate.subject,
          text: emailTemplate.text
        };

        // Send email
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return console.error('Error sending email:', error);
          }
          console.log('Email sent:', info.response);
        });

        channel.ack(msg);
      }
    });
  } catch (err) {
    console.error('Error in Notification Service:', err);
  }
}

consumeMessages();
