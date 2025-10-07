const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const { getDB } = require('../db');

const router = express.Router();
const { addToBlacklist } = require('../blacklist');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined in environment variables.");
  // In a real app, you might want to exit the process
  // process.exit(1); 
}

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

    const db = await getDB();
    const usersCollection = db.collection('users');

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
    const userId = result.insertedId.toString();

    console.log('User created successfully:', {
      id: userId,
      email: newUser.email,
      role: newUser.role
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: userId, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data without password
    const userForResponse = {
      id: userId,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      department: newUser.department,
      year: newUser.year,
      createdAt: newUser.createdAt
    };

    res.status(201).json({
      user: userForResponse,
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
    const db = await getDB();
    const usersCollection = db.collection('users');
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
    const userId = user._id.toString();

    // Login successful, create JWT token with user info
    const token = jwt.sign(
      { 
        userId: userId, 
        role: user.role,
        email: user.email
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;
    userWithoutPassword.id = userId;
    
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
