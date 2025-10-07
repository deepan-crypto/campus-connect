const express = require('express');
const { ObjectId } = require('mongodb');
const { getDB } = require('../db');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// Get all conversations for the current user
router.get('/conversations', authenticate, async (req, res) => {
  try {
    const db = await getDB();
    const userId = new ObjectId(req.user.id);

    const conversations = await db.collection('conversations').aggregate([
      { $match: { participants: userId } },
      {
        $lookup: {
          from: 'users',
          localField: 'participants',
          foreignField: '_id',
          as: 'participantDetails'
        }
      },
      {
        $project: {
          _id: 1,
          participants: '$participantDetails',
          lastMessage: 1,
          updatedAt: 1,
          createdAt: 1
        }
      }
    ]).toArray();

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations', details: error.message });
  }
});

// Create a new conversation or get existing one
router.post('/conversations', authenticate, async (req, res) => {
  try {
    const db = await getDB();
    const { participantId } = req.body;
    const userId = new ObjectId(req.user.id);
    const otherParticipantId = new ObjectId(participantId);

    if (!participantId) {
      return res.status(400).json({ error: 'Participant ID is required' });
    }

    // Check if a conversation with these two participants already exists
    let conversation = await db.collection('conversations').findOne({
      participants: { $all: [userId, otherParticipantId], $size: 2 }
    });

    if (conversation) {
      return res.json(conversation);
    }

    // If not, create a new one
    const newConversation = {
      participants: [userId, otherParticipantId],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('conversations').insertOne(newConversation);
    conversation = { ...newConversation, _id: result.insertedId };

    res.status(201).json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Get messages for a conversation
router.get('/conversations/:conversationId/messages', authenticate, async (req, res) => {
  try {
    const db = await getDB();
    const { conversationId } = req.params;
    const userId = new ObjectId(req.user.id);

    // Ensure the user is part of the conversation
    const conversation = await db.collection('conversations').findOne({
      _id: new ObjectId(conversationId),
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found or you are not a participant.' });
    }

    const messages = await db.collection('messages').find({
      conversationId: new ObjectId(conversationId)
    }).sort({ createdAt: 1 }).toArray();

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a message
router.post('/conversations/:conversationId/messages', authenticate, async (req, res) => {
  try {
    const db = await getDB();
    const { content } = req.body;
    const { conversationId } = req.params;
    const senderId = new ObjectId(req.user.id);

    if (!content) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Ensure the user is part of the conversation
    const conversation = await db.collection('conversations').findOne({
      _id: new ObjectId(conversationId),
      participants: senderId
    });

    if (!conversation) {
      return res.status(403).json({ error: 'You are not a participant of this conversation.' });
    }

    const newMessage = {
      conversationId: new ObjectId(conversationId),
      senderId: senderId,
      content: content,
      createdAt: new Date(),
      readBy: [senderId]
    };

    const result = await db.collection('messages').insertOne(newMessage);
    const message = { ...newMessage, _id: result.insertedId };

    // Update the conversation's last message and timestamp
    await db.collection('conversations').updateOne(
      { _id: new ObjectId(conversationId) },
      { 
        $set: { 
          lastMessage: message,
          updatedAt: new Date()
        }
      }
    );
    
    // Emit message via socket.io to other participants
    const io = req.app.get('io');
    conversation.participants.forEach(participantId => {
      if (!participantId.equals(senderId)) {
        io.to(participantId.toString()).emit('new_message', message);
      }
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Mark messages as read
router.patch('/conversations/:conversationId/read', authenticate, async (req, res) => {
  try {
    const db = await getDB();
    const { conversationId } = req.params;
    const userId = new ObjectId(req.user.id);

    await db.collection('messages').updateMany(
      { 
        conversationId: new ObjectId(conversationId),
        readBy: { $ne: userId }
      },
      { $addToSet: { readBy: userId } }
    );

    res.json({ ok: true, message: 'Messages marked as read.' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

module.exports = router;
