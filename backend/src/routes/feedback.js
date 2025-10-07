const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const { getDB } = require('../db');
const { ObjectId } = require('mongodb');

const router = express.Router();

// Submit feedback for an event
router.post('/event', authenticate, async (req, res) => {
  try {
    const db = await getDB();
    const { eventId, rating, text } = req.body;
    
    if (!eventId || !rating) {
      return res.status(400).json({ error: 'Missing required fields: eventId and rating' });
    }

    const feedback = {
      eventId: new ObjectId(eventId),
      userId: new ObjectId(req.user.id),
      rating: parseInt(rating, 10),
      text: text || '',
      createdAt: new Date(),
    };

    const result = await db.collection('feedback').insertOne(feedback);
    res.status(201).json({ ...feedback, _id: result.insertedId });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// Get feedback for a specific event
router.get('/event/:id', authenticate, async (req, res) => {
  try {
    const db = await getDB();
    const eventId = new ObjectId(req.params.id);
    
    const feedback = await db.collection('feedback').find({ eventId: eventId }).toArray();
    res.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

module.exports = router;
