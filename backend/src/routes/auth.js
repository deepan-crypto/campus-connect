const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();
const { addToBlacklist } = require('../blacklist');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

// Signup
router.post('/signup', async (req, res) => {
  const { email, password, name, role } = req.body;

  if (!email || !password || !name || !role) {
    return res.status(400).json({ error: 'Email, password, name, and role are required' });
  }

  // Validate role
  const validRoles = ['student', 'faculty', 'alumni'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ 
      error: 'Invalid role. Role must be one of: student, faculty, or alumni' 
    });
  }

  try {
    console.log('Signup request:', { email, name, role });

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Validate password
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user with transaction to ensure both user and profile are created
    const user = await prisma.$transaction(async (prisma) => {
      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role,
        },
      });

      const profile = await prisma.profile.create({
        data: {
          bio: '',
          avatarUrl: '',
          userId: newUser.id,
        },
      });

      return {
        ...newUser,
        profile,
      };
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      error: process.env.NODE_ENV === 'development' 
        ? `Error: ${error.message}` 
        : 'Something went wrong during signup'
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true }
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Login successful, create JWT token with user info
    const token = jwt.sign(
      { 
        userId: user.id, 
        role: user.role,
        email: user.email
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      user: userWithoutPassword,
      token,
      message: `Welcome back, ${user.name}!`
    });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    addToBlacklist(token);
  }
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
