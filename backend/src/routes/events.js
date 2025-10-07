const express = require('express');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');
const { getDB } = require('../db');
const { ObjectId } = require('mongodb');

const router = express.Router();

// Get all events
router.get('/', authenticate, async (req, res) => {
  try {
    const db = await getDB();
    const { q, type } = req.query;
    let query = {};
    if (type) {
      query.eventType = type;
    }
    if (q) {
      query.$text = { $search: q };
    }
    const events = await db.collection('events').find(query).toArray();
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Create a new event
router.post('/', authenticate, authorizeRoles('faculty', 'admin', 'alumni'), async (req, res) => {
  try {
    const db = await getDB();
    const data = req.body;
    if (!data.title || !data.startDate) {
      return res.status(400).json({ error: 'Missing required fields: title and startDate' });
    }
    
    const event = {
      title: data.title,
      description: data.description || '',
      eventType: data.eventType || 'social',
      location: data.location || '',
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      capacity: data.capacity || null,
      bannerUrl: data.bannerUrl || '',
      tags: data.tags || [],
      createdBy: new ObjectId(req.user.id),
      rsvps: [], // Store user IDs of those who RSVP'd
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('events').insertOne(event);
    res.status(201).json({ ...event, _id: result.insertedId });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// RSVP to an event
router.post('/:id/rsvp', authenticate, async (req, res) => {
  try {
    const db = await getDB();
    const eventId = new ObjectId(req.params.id);
    const userId = new ObjectId(req.user.id);
    const { status } = req.body; // 'going' or 'interested'

    if (!['going', 'interested'].includes(status)) {
        return res.status(400).json({ error: 'Invalid RSVP status' });
    }

    const event = await db.collection('events').findOne({ _id: eventId });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if user has already RSVP'd
    const existingRsvp = event.rsvps.find(rsvp => rsvp.userId.equals(userId));

    if (existingRsvp) {
        // If status is the same, user is toggling off their RSVP
        if (existingRsvp.status === status) {
            await db.collection('events').updateOne(
                { _id: eventId },
                { $pull: { rsvps: { userId: userId } } }
            );
        } else {
            // User is changing their RSVP status
            await db.collection('events').updateOne(
                { _id: eventId, 'rsvps.userId': userId },
                { $set: { 'rsvps.$.status': status } }
            );
        }
    } else {
        // New RSVP
        await db.collection('events').updateOne(
            { _id: eventId },
            { $push: { rsvps: { userId: userId, status: status } } }
        );
    }
    
    const updatedEvent = await db.collection('events').findOne({ _id: eventId });
    res.json(updatedEvent);
  } catch (error) {
    console.error('Error RSVPing to event:', error);
    res.status(500).json({ error: 'Failed to RSVP to event' });
  }
});

module.exports = router;
