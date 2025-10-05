const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const { _usersStore } = require('./auth');

const router = express.Router();

// Simple mentorship matching: match students to alumni/faculty
function scoreMatch(student, mentor) {
  let score = 0;
  const sSkills = (student.skills || []).map(s => s.toLowerCase());
  const mSkills = (mentor.skills || []).map(s => s.toLowerCase());
  const overlap = sSkills.filter(s => mSkills.includes(s)).length;
  score += overlap * 10;
  // graduation year difference
  if (student.graduationYear && mentor.graduationYear) {
    score += Math.max(0, (mentor.graduationYear - student.graduationYear)) * 1;
  }
  // availability flag
  if (mentor.availableForMentoring) score += 20;
  return score;
}

router.get('/recommendations', authenticate, (req, res) => {
  const userId = req.user.sub;
  const user = _usersStore.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: 'Not found' });
  const students = [user];
  const mentors = _usersStore.filter(u => u.role === 'alumni' || u.role === 'faculty');
  const recs = mentors.map(m => ({ mentor: { id: m.id, name: m.name, role: m.role }, score: scoreMatch(user, m) })).sort((a,b)=>b.score-a.score);
  res.json(recs.slice(0,10));
});

router.post('/request', authenticate, (req, res) => {
  const from = req.user.sub;
  const { to, message } = req.body;
  // in a real app, persist the request
  res.json({ ok: true, request: { id: `${Date.now()}`, from, to, message, status: 'pending' } });
});

router.post('/accept/:requestId', authenticate, (req, res) => {
  const userId = req.user.sub;
  const user = _usersStore.find(u => u.id === userId);
  if (!user || (user.role !== 'alumni' && user.role !== 'faculty')) {
    return res.status(403).json({ error: 'Only alumni and faculty can accept mentorship requests' });
  }
  // In a real app, find and update the request status
  res.json({ ok: true, message: 'Mentorship request accepted' });
});

router.post('/reject/:requestId', authenticate, (req, res) => {
  const userId = req.user.sub;
  const user = _usersStore.find(u => u.id === userId);
  if (!user || (user.role !== 'alumni' && user.role !== 'faculty')) {
    return res.status(403).json({ error: 'Only alumni and faculty can reject mentorship requests' });
  }
  // In a real app, find and update the request status
  res.json({ ok: true, message: 'Mentorship request rejected' });
});

module.exports = { mentorshipRouter: router };
