const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

const feedbacks = [];

router.post('/event', authenticate, (req, res) => {
  const { eventId, rating, text } = req.body;
  if (!eventId || !rating) return res.status(400).json({ error: 'Missing fields' });
  const fb = { id: `${Date.now()}`, eventId, userId: req.user.sub, rating, text, createdAt: new Date().toISOString() };
  feedbacks.push(fb);
  res.json(fb);
});

router.get('/event/:id', authenticate, (req, res) => {
  const ev = feedbacks.filter(f => f.eventId === req.params.id);
  res.json(ev);
});

module.exports = { feedbackRouter: router };
