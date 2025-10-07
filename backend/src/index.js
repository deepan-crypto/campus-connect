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
const { connectDB } = require('./db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Be more specific in production
    methods: ["GET", "POST"]
  }
});

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Allow your frontend origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(bodyParser.json());

// Make io accessible from routes
app.set('io', io);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join a room based on user ID
  socket.on('join_room', (userId) => {
    socket.join(userId);
    console.log(`User ${socket.id} joined room ${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// API Routes
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

const port = process.env.PORT || 4000;

// Connect to MongoDB before starting server
connectDB()
  .then(() => {
    server.listen(port, () => console.log(`Backend running on http://localhost:${port}`));
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  });
