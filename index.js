// server.js
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Read email credentials from env
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

let transporter;
if (EMAIL_USER && EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  // Verify transporter configuration at startup
  transporter
    .verify()
    .then(() => console.log('Email transporter configured and ready'))
    .catch((err) => console.error('Error configuring email transporter:', err));
} else {
  console.warn('EMAIL_USER or EMAIL_PASS is not set. Email sending will be disabled.');
}

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;


  // Ensure transporter is configured
  if (!transporter) {
    return res.status(500).json({ error: 'Email transport not configured. Set EMAIL_USER and EMAIL_PASS in .env' });
  }

  const mailOptions = {
    from: EMAIL_USER,
    replyTo: email,
    to: EMAIL_USER,
    subject: `Portfolio Contact: ${subject}`,
    html: `
      <h3>New Contact Form Submission</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong> ${message}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
