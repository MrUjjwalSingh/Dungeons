const express = require('express');
const cors = require('cors');

const teamRoutes = require('./routes/teamRoutes');
const questRoutes = require('./routes/questRoutes');
const dungeonRoutes = require('./routes/dungeonRoutes');
const boardRoutes = require('./routes/boardRoutes');
const dragonRoutes = require('./routes/dragonRoutes');

const app = express();

// Middleware
app.use(cors({
    origin: true,
    credentials: true,
}));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: '🐲 The Dragon\'s Awakening backend is running!' });
});

// Routes
app.use('/api/teams', teamRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/dungeons', dungeonRoutes);
app.use('/api/board', boardRoutes);
app.use('/api/dragon', dragonRoutes);

// Admin key verification
const { requireAdmin } = require('./middleware/auth');
app.post('/api/admin/verify', requireAdmin, (req, res) => {
    res.json({ valid: true, message: 'Welcome, Game Master.' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
