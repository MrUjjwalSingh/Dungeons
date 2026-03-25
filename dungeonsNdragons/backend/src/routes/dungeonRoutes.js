const express = require('express');
const router = express.Router();
const dungeonController = require('../controllers/dungeonController');
const { requireAdmin } = require('../middleware/auth');

router.get('/', dungeonController.list);
router.post('/', requireAdmin, dungeonController.create);
router.post('/:dungeonId/enter', dungeonController.enter);
router.post('/:dungeonId/clear', requireAdmin, dungeonController.clear);
router.patch('/:dungeonId', requireAdmin, dungeonController.updateConfig);

module.exports = router;
