const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const { _usersStore } = require('./auth');

const router = express.Router();

const requests = []; // { id, from, to, status }
const connections = []; // { userA, userB }

router.post('/request', authenticate, (req, res) => {
  const from = req.user.sub;
  const { to } = req.body;
  if (!to) return res.status(400).json({ error: 'Missing to' });
  const existing = requests.find(r => r.from === from && r.to === to && r.status === 'pending');
  if (existing) return res.status(409).json({ error: 'Already requested' });
  const reqObj = { id: `${Date.now()}`, from, to, status: 'pending' };
  requests.push(reqObj);
  res.json(reqObj);
});

router.post('/respond', authenticate, (req, res) => {
  const user = req.user.sub;
  const { requestId, accept } = req.body;
  const r = requests.find(x => x.id === requestId);
  if (!r) return res.status(404).json({ error: 'Not found' });
  if (r.to !== user) return res.status(403).json({ error: 'Not authorized' });
  r.status = accept ? 'accepted' : 'rejected';
  if (accept) connections.push({ userA: r.from, userB: r.to });
  res.json(r);
});

router.get('/me', authenticate, (req, res) => {
  const user = req.user.sub;
  const myConnections = connections.filter(c => c.userA === user || c.userB === user).map(c => (c.userA === user ? c.userB : c.userA));
  res.json({ connections: myConnections, requests: requests.filter(r => r.to === user || r.from === user) });
});

module.exports = { connectionsRouter: router };
