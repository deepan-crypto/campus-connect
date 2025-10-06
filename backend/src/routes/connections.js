const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Get my connections and connection requests
router.get('/me', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get accepted connections
    const acceptedConnections = await prisma.connection.findMany({
      where: {
        OR: [
          { requesterId: userId, status: 'accepted' },
          { receiverId: userId, status: 'accepted' }
        ]
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            profile: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            profile: true
          }
        }
      }
    });

    // Get incoming pending requests
    const pendingRequests = await prisma.connection.findMany({
      where: {
        receiverId: userId,
        status: 'pending'
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            profile: true
          }
        }
      }
    });

    // Get outgoing pending requests
    const sentRequests = await prisma.connection.findMany({
      where: {
        requesterId: userId,
        status: 'pending'
      },
      include: {
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            profile: true
          }
        }
      }
    });

    // Format connections for client
    const formattedConnections = acceptedConnections.map(conn => {
      const otherUser = conn.requesterId === userId ? conn.receiver : conn.requester;
      return {
        id: conn.id,
        user: otherUser,
        status: conn.status,
        createdAt: conn.createdAt
      };
    });

    res.json({
      connections: formattedConnections,
      pendingRequests,
      sentRequests
    });
  } catch (error) {
    console.error('Error fetching connections:', error);
    res.status(500).json({ error: 'Failed to fetch connections' });
  }
});

// Send a connection request
router.post('/request', authenticate, async (req, res) => {
  try {
    const requesterId = req.user.id;
    const { receiverId } = req.body;

    if (!receiverId) {
      return res.status(400).json({ error: 'Receiver ID is required' });
    }

    // Check if users are the same
    if (requesterId === receiverId) {
      return res.status(400).json({ error: 'Cannot connect with yourself' });
    }

    // Check if a connection already exists
    const existingConnection = await prisma.connection.findFirst({
      where: {
        OR: [
          { requesterId, receiverId },
          { requesterId: receiverId, receiverId: requesterId }
        ]
      }
    });

    if (existingConnection) {
      return res.status(409).json({ 
        error: 'Connection already exists', 
        status: existingConnection.status 
      });
    }

    // Create connection request
    const connection = await prisma.connection.create({
      data: {
        requesterId,
        receiverId,
        status: 'pending'
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            profile: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            profile: true
          }
        }
      }
    });

    // Emit real-time notification if Socket.IO is available
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${receiverId}`).emit('connection:request-received', connection);
    }

    res.status(201).json(connection);
  } catch (error) {
    console.error('Error creating connection request:', error);
    res.status(500).json({ error: 'Failed to create connection request' });
  }
});

// Respond to a connection request
router.post('/respond', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { connectionId, accept } = req.body;

    if (!connectionId) {
      return res.status(400).json({ error: 'Connection ID is required' });
    }

    // Find the connection
    const connection = await prisma.connection.findUnique({
      where: { id: connectionId }
    });

    if (!connection) {
      return res.status(404).json({ error: 'Connection request not found' });
    }

    // Verify the user is the receiver
    if (connection.receiverId !== userId) {
      return res.status(403).json({ error: 'Not authorized to respond to this request' });
    }

    // Update connection status
    const updatedConnection = await prisma.connection.update({
      where: { id: connectionId },
      data: { status: accept ? 'accepted' : 'rejected' },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            profile: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            profile: true
          }
        }
      }
    });

    // Emit real-time notification if Socket.IO is available
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${connection.requesterId}`).emit('connection:updated', updatedConnection);
    }

    res.json(updatedConnection);
  } catch (error) {
    console.error('Error responding to connection request:', error);
    res.status(500).json({ error: 'Failed to respond to connection request' });
  }
});

// Get connection suggestions
router.get('/suggestions', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    // Get user details to match based on department, skills, etc.
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get existing connections and requests
    const connections = await prisma.connection.findMany({
      where: {
        OR: [
          { requesterId: userId },
          { receiverId: userId }
        ]
      }
    });

    // IDs to exclude (self + connections)
    const excludeIds = [
      userId,
      ...connections.map(c => c.requesterId === userId ? c.receiverId : c.requesterId)
    ];

    // Find users with similar profiles or interests
    const suggestions = await prisma.user.findMany({
      where: {
        id: { notIn: excludeIds }
      },
      include: {
        profile: true
      },
      take: parseInt(limit)
    });

    // Remove sensitive information
    const formattedSuggestions = suggestions.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile: user.profile
    }));

    res.json(formattedSuggestions);
  } catch (error) {
    console.error('Error fetching connection suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch connection suggestions' });
  }
});

// Remove a connection
router.delete('/:connectionId', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { connectionId } = req.params;

    const connection = await prisma.connection.findUnique({
      where: { id: connectionId }
    });

    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    // Verify user is part of the connection
    if (connection.requesterId !== userId && connection.receiverId !== userId) {
      return res.status(403).json({ error: 'Not authorized to remove this connection' });
    }

    // Delete the connection
    await prisma.connection.delete({
      where: { id: connectionId }
    });

    // Emit real-time notification if Socket.IO is available
    const io = req.app.get('io');
    if (io) {
      const otherUserId = connection.requesterId === userId ? connection.receiverId : connection.requesterId;
      io.to(`user:${otherUserId}`).emit('connection:removed', { connectionId });
    }

    res.json({ success: true, message: 'Connection removed' });
  } catch (error) {
    console.error('Error removing connection:', error);
    res.status(500).json({ error: 'Failed to remove connection' });
  }
});

module.exports = router;
