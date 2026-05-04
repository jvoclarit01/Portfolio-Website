import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify email configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('Email configuration error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address',
      });
    }

    // Prepare email
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.EMAIL_TO || process.env.SMTP_USER,
      subject: `Portfolio Contact: ${name}`,
      text: `
Name: ${name}
Email: ${email}

Message:
${message}
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #00f0ff;">New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p><strong>Message:</strong></p>
          <p style="background: #f5f5f5; padding: 15px; border-radius: 5px;">${message.replace(/\n/g, '<br>')}</p>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Store in database
    const stmt = db.prepare(`
      INSERT INTO submissions (name, email, message, status)
      VALUES (?, ?, ?, 'new')
    `);
    const result = stmt.run(name, email, message);

    res.json({
      success: true,
      message: 'Message sent successfully!',
      id: result.lastInsertRowid,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again.',
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get all submissions (admin endpoint)
app.get('/api/submissions', (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM submissions';
    const params = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const stmt = db.prepare(query);
    const submissions = stmt.all(...params);

    res.json({ success: true, data: submissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch submissions' });
  }
});

// Update submission status
app.patch('/api/submissions/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['new', 'read', 'replied', 'archived'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const stmt = db.prepare(`
      UPDATE submissions
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    const result = stmt.run(status, id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    res.json({ success: true, message: 'Status updated' });
  } catch (error) {
    console.error('Error updating submission:', error);
    res.status(500).json({ success: false, message: 'Failed to update submission' });
  }
});

// Delete submission
app.delete('/api/submissions/:id', (req, res) => {
  try {
    const { id } = req.params;

    const stmt = db.prepare('DELETE FROM submissions WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    res.json({ success: true, message: 'Submission deleted' });
  } catch (error) {
    console.error('Error deleting submission:', error);
    res.status(500).json({ success: false, message: 'Failed to delete submission' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
