const express = require('express');
const { _usersStore } = require('./auth');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authenticate, (req, res) => {
  // return minimal profiles
  res.json(_usersStore.map(u => ({ id: u.id, email: u.email, name: u.name, role: u.role, verified: u.verified })));
});

router.get('/:id', authenticate, (req, res) => {
  const user = _usersStore.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json({ id: user.id, email: user.email, name: user.name, role: user.role, verified: user.verified });
});

router.put('/:id', authenticate, (req, res) => {
  const user = _usersStore.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  Object.assign(user, req.body);
  res.json({ ok: true, user: { id: user.id, name: user.name, role: user.role } });
});

module.exports = { usersRouter: router };
