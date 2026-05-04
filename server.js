import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';
import database from './database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Simple in-memory rate limiter
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 10; // 10 requests per window

function rateLimitMiddleware(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();

  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return next();
  }

  const data = rateLimit.get(ip);

  if (now > data.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return next();
  }

  if (data.count >= RATE_LIMIT_MAX) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.',
    });
  }

  data.count++;
  next();
}

// Simple API key authentication for admin endpoints
function authMiddleware(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
  }

  next();
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '10kb' })); // Limit body size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Serve static files from project root
app.use(express.static('.'));

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
    console.error('Email configuration error:', error.message);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Contact form endpoint
app.post('/api/contact', rateLimitMiddleware, async (req, res) => {
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

    // Sanitize inputs (basic XSS prevention)
    const sanitizedName = name.replace(/[<>]/g, '');
    const sanitizedMessage = message.replace(/[<>]/g, '');

    // Prepare email
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.EMAIL_TO || process.env.SMTP_USER,
      subject: `Portfolio Contact: ${sanitizedName}`,
      text: `
Name: ${sanitizedName}
Email: ${email}

Message:
${sanitizedMessage}
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #00f0ff;">New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${sanitizedName}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p><strong>Message:</strong></p>
          <p style="background: #f5f5f5; padding: 15px; border-radius: 5px;">${sanitizedMessage.replace(/\n/g, '<br>')}</p>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Store in database
    const db = await database.getDb();
    db.run(`
      INSERT INTO submissions (name, email, message, status)
      VALUES (?, ?, ?, 'new')
    `, [sanitizedName, email, sanitizedMessage]);
    database.save();

    res.json({
      success: true,
      message: 'Message sent successfully!',
    });
  } catch (error) {
    console.error('Error processing contact form:', error.message);
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

// Get all submissions (admin endpoint) - requires auth
app.get('/api/submissions', authMiddleware, async (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM submissions';
    const params = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const db = await database.getDb();
    const stmt = db.prepare(query);
    const submissions = stmt.getAsObject(...params);

    res.json({ success: true, data: submissions });
  } catch (error) {
    console.error('Error fetching submissions:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch submissions' });
  }
});

// Update submission status (admin endpoint) - requires auth
app.patch('/api/submissions/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['new', 'read', 'replied', 'archived'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const db = await database.getDb();
    db.run(`
      UPDATE submissions
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [status, id]);
    database.save();

    res.json({ success: true, message: 'Status updated' });
  } catch (error) {
    console.error('Error updating submission:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update submission' });
  }
});

// Delete submission (admin endpoint) - requires auth
app.delete('/api/submissions/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const db = await database.getDb();
    db.run('DELETE FROM submissions WHERE id = ?', [id]);
    database.save();

    res.json({ success: true, message: 'Submission deleted' });
  } catch (error) {
    console.error('Error deleting submission:', error.message);
    res.status(500).json({ success: false, message: 'Failed to delete submission' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
