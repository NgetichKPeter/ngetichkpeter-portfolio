const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Auto-initialize DB tables
async function initDb() {
  try {
    // General Comments Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        author VARCHAR(100) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Dynamic Updates Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS updates (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        tag VARCHAR(50) DEFAULT 'General',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("PostgreSQL Tables Verified/Created");
  } catch (err) {
    console.error("Database initialization error:", err);
  }
}
initDb();

// --- REST API ENDPOINTS ---

// GET /api/updates - Fetch all portfolio updates
app.get('/api/updates', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM updates ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database fetch error' });
  }
});

// POST /api/updates - Post a new update (Tip: Keep password or admin check for yourself)
app.post('/api/updates', async (req, res) => {
  const { title, content, tag, secret } = req.body;
  
  // Basic security check (set ADMIN_SECRET in environment variables)
  if (secret !== process.env.ADMIN_SECRET && secret !== 'ngetich2026') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO updates (title, content, tag) VALUES ($1, $2, $3) RETURNING *',
      [title, content, tag || 'Engineering']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database insert error' });
  }
});

// GET & POST Comments
app.get('/api/comments', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM comments ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database fetch error' });
  }
});

app.post('/api/comments', async (req, res) => {
  const { author, content } = req.body;
  if (!author || !content) return res.status(400).json({ error: 'Missing fields' });

  try {
    const result = await pool.query(
      'INSERT INTO comments (author, content) VALUES ($1, $2) RETURNING *',
      [author, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database insert error' });
  }
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
