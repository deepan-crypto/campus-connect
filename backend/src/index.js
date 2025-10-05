const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { authRouter } = require('./routes/auth');
const { usersRouter } = require('./routes/users');
const { eventsRouter } = require('./routes/events');
const { connectionsRouter } = require('./routes/connections');
const { mentorshipRouter } = require('./routes/mentorship');
const { feedbackRouter } = require('./routes/feedback');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/events', eventsRouter);
app.use('/api/connections', connectionsRouter);
app.use('/api/mentorship', mentorshipRouter);
app.use('/api/feedback', feedbackRouter);

app.get('/', (req, res) => res.json({ ok: true, message: 'Campus Connect API' }));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Backend running on http://localhost:${port}`));
