const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const eventsRouter = require('./routes/events');
const connectionsRouter = require('./routes/connections');
const mentorshipRouter = require('./routes/mentorship');
const feedbackRouter = require('./routes/feedback');
const messagesRouter = require('./routes/messages');
const postsRouter = require('./routes/posts');
const commentsRouter = require('./routes/comments');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // In production, set this to your frontend URL
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(bodyParser.json());

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Authenticate socket connection
  socket.on('authenticate', async (token) => {
    try {
      const user = verifyToken(token);
      if (user) {
        // Associate socket with user ID
        socket.userId = user.id;
        socket.join(`user:${user.id}`);
        console.log(`User ${user.id} authenticated`);
        socket.emit('authenticated', { success: true });
        
        // Notify user about pending connection requests
        const pendingRequests = await prisma.connection.findMany({
          where: { 
            receiverId: user.id, 
            status: 'pending' 
          },
          include: {
            requester: {
              select: {
                id: true,
                name: true,
                profile: true
              }
            }
          }
        });
        
        if (pendingRequests.length > 0) {
          socket.emit('connection:pending-requests', pendingRequests);
        }
      }
    } catch (err) {
      console.error('Authentication error:', err);
      socket.emit('authenticated', { success: false, error: 'Invalid token' });
    }
  });
  
  // Connection request
  socket.on('connection:request', async (data) => {
    try {
      const { receiverId } = data;
      if (!socket.userId) {
        socket.emit('error', { message: 'Unauthorized' });
        return;
      }
      
      // Create connection request
      const connection = await prisma.connection.create({
        data: {
          requesterId: socket.userId,
          receiverId: receiverId,
          status: 'pending'
        },
        include: {
          requester: {
            select: {
              id: true,
              name: true,
              profile: true
            }
          }
        }
      });
      
      // Notify requester
      socket.emit('connection:request-sent', connection);
      
      // Notify receiver if online
      io.to(`user:${receiverId}`).emit('connection:request-received', connection);
    } catch (err) {
      console.error('Connection request error:', err);
      socket.emit('error', { message: 'Failed to send connection request' });
    }
  });
  
  // Connection response (accept/reject)
  socket.on('connection:respond', async (data) => {
    try {
      const { connectionId, accept } = data;
      if (!socket.userId) {
        socket.emit('error', { message: 'Unauthorized' });
        return;
      }
      
      // Get connection and verify receiver
      const connection = await prisma.connection.findUnique({
        where: { id: connectionId },
        include: {
          requester: {
            select: {
              id: true,
              name: true,
              profile: true
            }
          },
          receiver: {
            select: {
              id: true,
              name: true,
              profile: true
            }
          }
        }
      });
      
      if (!connection) {
        socket.emit('error', { message: 'Connection request not found' });
        return;
      }
      
      if (connection.receiverId !== socket.userId) {
        socket.emit('error', { message: 'Not authorized to respond to this request' });
        return;
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
              profile: true
            }
          },
          receiver: {
            select: {
              id: true,
              name: true,
              profile: true
            }
          }
        }
      });
      
      // Notify both users
      socket.emit('connection:updated', updatedConnection);
      io.to(`user:${connection.requesterId}`).emit('connection:updated', updatedConnection);
    } catch (err) {
      console.error('Connection response error:', err);
      socket.emit('error', { message: 'Failed to respond to connection request' });
    }
  });
  
  // Disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Helper function to verify JWT token
function verifyToken(token) {
  try {
    const jwt = require('jsonwebtoken');
    return jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key');
  } catch (err) {
    return null;
  }
}

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/events', eventsRouter);
app.use('/api/connections', connectionsRouter);
app.use('/api/mentorship', mentorshipRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/posts', postsRouter);
app.use('/api/comments', commentsRouter);

app.get('/', (req, res) => res.json({ ok: true, message: 'Campus Connect API' }));

// Make io accessible from routes
app.set('io', io);

const port = process.env.PORT || 4000;
server.listen(port, () => console.log(`Backend running on http://localhost:${port}`));
