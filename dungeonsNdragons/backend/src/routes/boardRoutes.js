const express = require('express');
const router = express.Router();
const boardController = require('../controllers/boardController');
const { requireAdmin } = require('../middleware/auth');

router.get('/leaderboard', boardController.leaderboard);
router.get('/announcements', boardController.announcements);
router.post('/adbreak', requireAdmin, boardController.triggerAdBreak);

module.exports = router;
