const express = require('express');
const { ObjectId } = require('mongodb');
const { getDB } = require('../db');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// Send a mentorship request
router.post('/request', authenticate, async (req, res) => {
  try {
    const { mentorId, message } = req.body;
    const studentId = req.user.id;

    if (!mentorId || !message) {
      return res.status(400).json({ error: 'Mentor ID and message are required.' });
    }

    if (!ObjectId.isValid(mentorId)) {
      return res.status(400).json({ error: 'Invalid Mentor ID.' });
    }

    const db = await getDB();
    const mentorshipRequestsCollection = db.collection('mentorshipRequests');
    const usersCollection = db.collection('User');

    // Check if mentor exists and is a mentor/admin
    const mentor = await usersCollection.findOne({ 
      _id: new ObjectId(mentorId),
      role: { $in: ['mentor', 'admin', 'faculty'] }
    });
    if (!mentor) {
      return res.status(404).json({ error: 'Mentor not found or user is not a mentor.' });
    }

    // Check for existing pending/active request
    const existingRequest = await mentorshipRequestsCollection.findOne({
      studentId: new ObjectId(studentId),
      mentorId: new ObjectId(mentorId),
      status: { $in: ['pending', 'active'] }
    });

    if (existingRequest) {
      return res.status(409).json({ error: 'A mentorship request to this mentor already exists.' });
    }

    const newRequest = {
      studentId: new ObjectId(studentId),
      mentorId: new ObjectId(mentorId),
      message,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await mentorshipRequestsCollection.insertOne(newRequest);
    const createdRequest = result.ops[0];

    const io = req.app.get('io');
    io.to(mentorId).emit('new_mentorship_request', createdRequest);

    res.status(201).json({ message: 'Mentorship request sent successfully.', request: createdRequest });

  } catch (error) {
    console.error('Error sending mentorship request:', error);
    res.status(500).json({ error: 'Failed to send mentorship request.' });
  }
});

// Get mentorship requests for the current user (both as student and mentor)
router.get('/requests', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const db = await getDB();
        const mentorshipRequestsCollection = db.collection('mentorshipRequests');

        const sentRequests = await mentorshipRequestsCollection.find({ studentId: new ObjectId(userId) }).toArray();
        const receivedRequests = await mentorshipRequestsCollection.find({ mentorId: new ObjectId(userId) }).toArray();

        res.json({ sent: sentRequests, received: receivedRequests });
    } catch (error) {
        console.error('Error fetching mentorship requests:', error);
        res.status(500).json({ error: 'Failed to fetch mentorship requests.' });
    }
});

// Accept a mentorship request
router.put('/requests/:requestId/accept', authenticate, async (req, res) => {
    try {
        const { requestId } = req.params;
        const mentorId = req.user.id;

        if (!ObjectId.isValid(requestId)) {
            return res.status(400).json({ error: 'Invalid request ID.' });
        }

        const db = await getDB();
        const mentorshipRequestsCollection = db.collection('mentorshipRequests');

        const result = await mentorshipRequestsCollection.findOneAndUpdate(
            { 
                _id: new ObjectId(requestId), 
                mentorId: new ObjectId(mentorId),
                status: 'pending'
            },
            { 
                $set: { status: 'active', updatedAt: new Date() }
            },
            { returnDocument: 'after' }
        );

        if (!result.value) {
            return res.status(404).json({ error: 'Request not found, already handled, or you are not the mentor.' });
        }
        
        const io = req.app.get('io');
        io.to(result.value.studentId.toString()).emit('mentorship_request_accepted', result.value);

        res.json({ message: 'Mentorship request accepted.', request: result.value });
    } catch (error) {
        console.error('Error accepting mentorship request:', error);
        res.status(500).json({ error: 'Failed to accept mentorship request.' });
    }
});

// Reject a mentorship request
router.put('/requests/:requestId/reject', authenticate, async (req, res) => {
    try {
        const { requestId } = req.params;
        const mentorId = req.user.id;

        if (!ObjectId.isValid(requestId)) {
            return res.status(400).json({ error: 'Invalid request ID.' });
        }

        const db = await getDB();
        const mentorshipRequestsCollection = db.collection('mentorshipRequests');

        const result = await mentorshipRequestsCollection.findOneAndUpdate(
            { 
                _id: new ObjectId(requestId), 
                mentorId: new ObjectId(mentorId),
                status: 'pending'
            },
            { 
                $set: { status: 'rejected', updatedAt: new Date() }
            },
            { returnDocument: 'after' }
        );

        if (!result.value) {
            return res.status(404).json({ error: 'Request not found, already handled, or you are not the mentor.' });
        }

        const io = req.app.get('io');
        io.to(result.value.studentId.toString()).emit('mentorship_request_rejected', result.value);

        res.json({ message: 'Mentorship request rejected.', request: result.value });
    } catch (error) {
        console.error('Error rejecting mentorship request:', error);
        res.status(500).json({ error: 'Failed to reject mentorship request.' });
    }
});


module.exports = router;
