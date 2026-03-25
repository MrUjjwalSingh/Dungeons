const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { requireAdmin } = require('../middleware/auth');

router.post('/', teamController.register);
router.get('/', teamController.list);
router.get('/:id', teamController.getById);
router.patch('/:id/stats', requireAdmin, teamController.updateStat);

module.exports = router;
