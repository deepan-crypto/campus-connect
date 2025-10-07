const express = require('express');
const { ObjectId } = require('mongodb');
const { getDB } = require('../db');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// Get current user (must be before /:id route)
router.get('/me', authenticate, async (req, res) => {
  try {
    const db = await getDB();
    const usersCollection = db.collection('users');
    
    const user = await usersCollection.findOne(
      { _id: new ObjectId(req.user.id) },
      { projection: { password: 0 } }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
      year: user.year,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

router.get('/', authenticate, async (req, res) => {
  try {
    const db = await getDB();
    const usersCollection = db.collection('users');
    
    // Return minimal profiles
    const users = await usersCollection.find({}, {
      projection: { password: 0 } // Exclude password
    }).toArray();
    
    const usersWithId = users.map(u => ({
      id: u._id.toString(),
      email: u.email,
      name: u.name,
      role: u.role,
      department: u.department,
      year: u.year
    }));
    
    res.json(usersWithId);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const db = await getDB();
    const usersCollection = db.collection('users');
    
    // Handle special case for "me"
    let userId = req.params.id;
    if (userId === 'me') {
      userId = req.user.id;
    }
    
    // Validate ObjectId format
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
    
    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } } // Exclude password
    );
    
    if (!user) {
      return res.status(404).json({ error: 'Not found' });
    }
    
    res.json({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
      year: user.year
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const db = await getDB();
    const usersCollection = db.collection('users');
    
    const { name, department, year } = req.body;
    
    const result = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { 
        $set: { 
          name,
          department,
          year,
          updatedAt: new Date()
        } 
      },
      { 
        returnDocument: 'after',
        projection: { password: 0 }
      }
    );
    
    if (!result.value) {
      return res.status(404).json({ error: 'Not found' });
    }
    
    res.json({ 
      ok: true, 
      user: {
        id: result.value._id.toString(),
        name: result.value.name,
        role: result.value.role,
        department: result.value.department,
        year: result.value.year
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

module.exports = router;
