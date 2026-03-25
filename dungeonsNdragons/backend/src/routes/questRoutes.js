const express = require('express');
const router = express.Router();
const questController = require('../controllers/questController');
const { requireAdmin } = require('../middleware/auth');

router.get('/', questController.list);
router.post('/', requireAdmin, questController.create);
router.post('/:questId/start', requireAdmin, questController.start);
router.post('/:questId/complete', requireAdmin, questController.complete);
router.patch('/:questId', requireAdmin, questController.updateConfig);

module.exports = router;
