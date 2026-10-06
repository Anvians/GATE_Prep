require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const topicRoutes = require('./routes/topics');
const mockRoutes = require('./routes/mocks');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gate-tracker';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/topics', topicRoutes);
app.use('/api/mocks', mockRoutes);

// Simple exam-config endpoint (target date is fixed for this tracker).
// GATE 2027 runs Feb 6-7, 13-14 and 20-21; your paper's exact date and shift
// are on your admit card, so change examDate here once you have it.
app.get('/api/config', (req, res) => {
  res.json({ examDate: '2027-02-06T00:00:00+05:30', targetScore: 60 });
});

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
