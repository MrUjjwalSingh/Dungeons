const boardService = require('../services/boardService');
const { Announcement } = require('../models');

const leaderboard = async (req, res) => {
    try {
        const rankings = await boardService.getLeaderboard();
        res.json({ leaderboard: rankings });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const announcements = async (req, res) => {
    try {
        const feed = await boardService.getAnnouncements();
        res.json({ announcements: feed });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/* POST /api/board/adbreak — triggers a global sponsor ad break */
const triggerAdBreak = async (req, res) => {
    try {
        await Announcement.create({
            message: '__ADBREAK__'
        });
        res.json({ message: 'Ad break triggered!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { leaderboard, announcements, triggerAdBreak };
