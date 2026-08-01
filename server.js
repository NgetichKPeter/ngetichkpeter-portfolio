const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Neon PostgreSQL connection with SSL enabled
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// GET /api/updates
app.get('/api/updates', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM updates ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/comments
app.get('/api/comments', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM comments ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Export Express app for Vercel Serverless
module.exports = app;
