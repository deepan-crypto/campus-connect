const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const { getDB } = require('../db');

const router = express.Router();
const { addToBlacklist } = require('../blacklist');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, role, name, department, year } = req.body;
    
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const db = getDB();
    const usersCollection = db.collection('User');

    // Check if user exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Validate password
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user with provided details
    console.log('Creating user with data:', { email, name, role, department, year });
    
    const newUser = {
      email,
      password: hashedPassword,
      name,
      role,
      department: department || '',
      year: year || '',
      createdAt: new Date()
    };

    const result = await usersCollection.insertOne(newUser);
    const user = { ...newUser, id: result.insertedId.toString(), _id: result.insertedId };

    console.log('User created successfully:', {
      id: user.id,
      email: user.email,
      role: user.role
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
      token
    });
  } catch (error) {
    console.error('Signup error:', error);
    console.error('Request body:', JSON.stringify(req.body, null, 2));
    
    res.status(500).json({
      error: 'Something went wrong during signup',
      details: error.message
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
    console.log('Login attempt:', { email });
    const db = getDB();
    const usersCollection = db.collection('User');
    
    const user = await usersCollection.findOne({ email });
    
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Login successful, create JWT token with user info
    const token = jwt.sign(
      { 
        userId: user._id.toString(), 
        role: user.role,
        email: user.email
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;
    userWithoutPassword.id = user._id.toString();
    
    res.json({
      user: userWithoutPassword,
      token,
      message: `Welcome back, ${user.name}!`
    });
  } catch (error) {
    console.error('Login error:', error);
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
