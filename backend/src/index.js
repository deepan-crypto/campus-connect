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
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(bodyParser.json());

// Socket.IO connection handling - simplified for now
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
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

// Make io accessible from routes
app.set('io', io);

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
