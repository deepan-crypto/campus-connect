const express = require('express');
const { ObjectId } = require('mongodb');
const { getDB } = require('../db');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// Get all conversations for the current user
router.get('/conversations', authenticate, async (req, res) => {
  try {
    // Return empty array for now - will implement later
    res.json([]);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations', details: error.message });
  }
});

// Create a new conversation
router.post('/conversations', authenticate, async (req, res) => {
  try {
    const { participantId } = req.body;
    
    if (!participantId) {
      return res.status(400).json({ error: 'Participant ID is required' });
    }
    
    // Stub response
    res.status(201).json({
      id: new ObjectId().toString(),
      participants: [req.user.id, participantId],
      createdAt: new Date(),
      messages: []
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Get messages for a conversation
router.get('/conversations/:conversationId/messages', authenticate, async (req, res) => {
  try {
    // Return empty array for now
    res.json([]);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a message
router.post('/conversations/:conversationId/messages', authenticate, async (req, res) => {
  try {
    const { content } = req.body;
    const { conversationId } = req.params;
    
    if (!content) {
      return res.status(400).json({ error: 'Message content is required' });
    }
    
    // Stub response
    res.status(201).json({
      id: new ObjectId().toString(),
      content,
      senderId: req.user.id,
      conversationId,
      createdAt: new Date()
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Mark messages as read
router.patch('/conversations/:conversationId/read', authenticate, async (req, res) => {
  try {
    res.json({ ok: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

module.exports = router;
