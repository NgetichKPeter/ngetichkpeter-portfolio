// --- ADMIN API ENDPOINTS ---

// Simple password verification middleware/check
const verifyAdmin = (req, res, next) => {
  const adminKey = req.headers['x-admin-key'] || req.body.secret;
  const validKey = process.env.ADMIN_SECRET || 'ngetich2026';

  if (adminKey !== validKey) {
    return res.status(403).json({ error: 'Forbidden: Invalid Admin Key' });
  }
  next();
};

// POST /api/admin/updates - Post a new update
app.post('/api/admin/updates', verifyAdmin, async (req, res) => {
  const { title, content, tag } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO updates (title, content, tag) VALUES ($1, $2, $3) RETURNING *',
      [title, content, tag || 'Engineering']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE /api/admin/comments/:id - Remove spam or unwanted comments
app.delete('/api/admin/comments/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM comments WHERE id = $1', [id]);
    res.json({ success: true, message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// DELETE /api/admin/updates/:id - Remove an update
app.delete('/api/admin/updates/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM updates WHERE id = $1', [id]);
    res.json({ success: true, message: 'Update deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete update' });
  }
});
