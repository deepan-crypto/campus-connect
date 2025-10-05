const express = require('express');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// in-memory events
const events = [];

router.get('/', authenticate, (req, res) => {
  const { q, type } = req.query;
  let results = events;
  if (type) results = results.filter(e => e.eventType === type);
  if (q) results = results.filter(e => e.title.includes(q) || e.description.includes(q) || e.tags.join(',').includes(q));
  res.json(results);
});

router.post('/', authenticate, authorizeRoles('faculty', 'admin', 'alumni'), (req, res) => {
  const data = req.body;
  if (!data.title || !data.startDate) return res.status(400).json({ error: 'Missing fields' });
  const event = {
    id: uuidv4(),
    title: data.title,
    description: data.description || '',
    eventType: data.eventType || 'social',
    location: data.location || '',
    startDate: data.startDate,
    endDate: data.endDate,
    capacity: data.capacity,
    bannerUrl: data.bannerUrl,
    tags: data.tags || [],
    createdBy: req.user.sub,
    rsvpCount: { going: 0, interested: 0 },
    rsvps: {},
  };
  events.push(event);
  res.json(event);
});

router.post('/:id/rsvp', authenticate, (req, res) => {
  const { status } = req.body; // 'going' | 'interested' | 'not'
  const ev = events.find(e => e.id === req.params.id);
  if (!ev) return res.status(404).json({ error: 'Not found' });
  const userId = req.user.sub;
  const prev = ev.rsvps[userId];
  if (prev === status) {
    // toggle off
    delete ev.rsvps[userId];
    if (status === 'going') ev.rsvpCount.going = Math.max(0, ev.rsvpCount.going - 1);
    if (status === 'interested') ev.rsvpCount.interested = Math.max(0, ev.rsvpCount.interested - 1);
    return res.json({ ok: true, event: ev });
  }
  if (prev === 'going') ev.rsvpCount.going = Math.max(0, ev.rsvpCount.going - 1);
  if (prev === 'interested') ev.rsvpCount.interested = Math.max(0, ev.rsvpCount.interested - 1);
  ev.rsvps[userId] = status;
  if (status === 'going') ev.rsvpCount.going++;
  if (status === 'interested') ev.rsvpCount.interested++;
  res.json({ ok: true, event: ev });
});

module.exports = { eventsRouter: router };
