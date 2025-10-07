const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const { getDB } = require('../db');
const { ObjectId } = require('mongodb');

const router = express.Router();

// Helper to project user fields
const userProjection = {
  id: '$_id',
  _id: 0,
  name: 1,
  email: 1,
  role: 1,
  profile: 1,
};

// Get my connections and connection requests
router.get('/me', authenticate, async (req, res) => {
  try {
    const db = await getDB();
    const userId = new ObjectId(req.user.id);

    // Aggregation pipeline to fetch connections and populate user details
    const pipeline = (status, side) => ([
      {
        $match: {
          [side.field]: userId,
          status: status,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: side.populate,
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      { $unwind: '$userDetails' },
      {
        $project: {
          id: '$_id',
          status: 1,
          createdAt: 1,
          user: {
            id: '$userDetails._id',
            name: '$userDetails.name',
            email: '$userDetails.email',
            role: '$userDetails.role',
            profile: '$userDetails.profile',
          },
        },
      },
    ]);

    const acceptedAsRequester = await db.collection('connections').aggregate(pipeline('accepted', { field: 'requesterId', populate: 'receiverId' })).toArray();
    const acceptedAsReceiver = await db.collection('connections').aggregate(pipeline('accepted', { field: 'receiverId', populate: 'requesterId' })).toArray();
    const formattedConnections = [...acceptedAsRequester, ...acceptedAsReceiver];

    const pendingRequests = await db.collection('connections').aggregate(pipeline('pending', { field: 'receiverId', populate: 'requesterId' })).toArray();
    const sentRequests = await db.collection('connections').aggregate(pipeline('pending', { field: 'requesterId', populate: 'receiverId' })).toArray();

    res.json({
      connections: formattedConnections,
      pendingRequests,
      sentRequests,
    });
  } catch (error) {
    console.error('Error fetching connections:', error);
    res.status(500).json({ error: 'Failed to fetch connections' });
  }
});

// Send a connection request
router.post('/request/:receiverId', authenticate, async (req, res) => {
  try {
    const db = await getDB();
    const requesterId = new ObjectId(req.user.id);
    const receiverId = new ObjectId(req.params.receiverId);

    if (requesterId.equals(receiverId)) {
      return res.status(400).json({ error: 'You cannot connect with yourself.' });
    }

    // Check if a connection already exists
    const existingConnection = await db.collection('connections').findOne({
      $or: [
        { requesterId, receiverId },
        { requesterId: receiverId, receiverId: requesterId },
      ],
    });

    if (existingConnection) {
      return res.status(400).json({ error: 'A connection or request already exists.' });
    }

    const newRequest = {
      requesterId,
      receiverId,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('connections').insertOne(newRequest);
    
    // In a real app, you'd emit a notification to the receiver
    // const io = req.app.get('io');
    // io.to(receiverId.toString()).emit('new_connection_request', result.ops[0]);

    res.status(201).json(result.ops[0]);
  } catch (error) {
    console.error('Error sending connection request:', error);
    res.status(500).json({ error: 'Failed to send connection request' });
  }
});

// Accept a connection request
router.post('/accept/:requestId', authenticate, async (req, res) => {
  try {
    const db = await getDB();
    const userId = new ObjectId(req.user.id);
    const requestId = new ObjectId(req.params.requestId);

    const request = await db.collection('connections').findOne({ _id: requestId });

    if (!request || !request.receiverId.equals(userId) || request.status !== 'pending') {
      return res.status(404).json({ error: 'Connection request not found or you are not the receiver.' });
    }

    const result = await db.collection('connections').updateOne(
      { _id: requestId },
      { $set: { status: 'accepted', updatedAt: new Date() } }
    );

    if (result.modifiedCount === 0) {
        return res.status(404).json({ error: 'Could not accept the request.' });
    }

    const updatedRequest = await db.collection('connections').findOne({ _id: requestId });

    // In a real app, you'd emit a notification to the requester
    // const io = req.app.get('io');
    // io.to(request.requesterId.toString()).emit('connection_request_accepted', updatedRequest);

    res.json(updatedRequest);
  } catch (error) {
    console.error('Error accepting connection request:', error);
    res.status(500).json({ error: 'Failed to accept connection request' });
  }
});

// Reject a connection request
router.post('/reject/:requestId', authenticate, async (req, res) => {
  try {
    const db = await getDB();
    const userId = new ObjectId(req.user.id);
    const requestId = new ObjectId(req.params.requestId);

    const request = await db.collection('connections').findOne({ _id: requestId });

    if (!request || !request.receiverId.equals(userId) || request.status !== 'pending') {
      return res.status(404).json({ error: 'Connection request not found or you are not the receiver.' });
    }

    await db.collection('connections').deleteOne({ _id: requestId });

    res.status(204).send();
  } catch (error) {
    console.error('Error rejecting connection request:', error);
    res.status(500).json({ error: 'Failed to reject connection request' });
  }
});

// Get suggestions for connections
router.get('/suggestions', authenticate, async (req, res) => {
    try {
        const db = await getDB();
        const userId = new ObjectId(req.user.id);

        // Get IDs of users the current user is already connected with or has a pending request with
        const existingConnections = await db.collection('connections').find({
            $or: [{ requesterId: userId }, { receiverId: userId }]
        }).toArray();

        const connectedUserIds = existingConnections.flatMap(conn => [conn.requesterId, conn.receiverId]);
        const excludedIds = [...new Set([userId, ...connectedUserIds])];

        // Find users who are not the current user and not already connected
        const suggestions = await db.collection('users').find({
            _id: { $nin: excludedIds }
        }).project(userProjection).limit(10).toArray();

        res.json(suggestions);
    } catch (error) {
        console.error('Error fetching connection suggestions:', error);
        res.status(500).json({ error: 'Failed to fetch suggestions' });
    }
});

module.exports = router;


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
