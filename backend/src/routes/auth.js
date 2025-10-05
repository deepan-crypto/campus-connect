const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const TOKEN_EXPIRES = '7d';

// Simple in-memory users store for scaffold/demo purposes
const users = [];

router.post('/signup', async (req, res) => {
  const { email, password, name, role = 'student' } = req.body;
  if (!email || !password || !name) return res.status(400).json({ error: 'Missing fields' });
  const existing = users.find(u => u.email === email);
  if (existing) return res.status(409).json({ error: 'Email already registered' });
  const hash = await bcrypt.hash(password, 10);
  const user = { id: uuidv4(), email, passwordHash: hash, name, role, verified: false };
  users.push(user);
  const token = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

module.exports = { authRouter: router, _usersStore: users };
