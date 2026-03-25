const express = require('express');
const router = express.Router();
const dragonController = require('../controllers/dragonController');
const { requireAdmin } = require('../middleware/auth');

router.get('/eligibility/:teamId', dragonController.eligibility);
router.post('/fight', requireAdmin, dragonController.fight);

module.exports = router;
