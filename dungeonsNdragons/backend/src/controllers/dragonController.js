const dragonService = require('../services/dragonService');

const eligibility = async (req, res) => {
    try {
        const result = await dragonService.checkDragonEligibility(req.params.teamId);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const fight = async (req, res) => {
    try {
        const { teamId, success } = req.body;

        if (!teamId || typeof success !== 'boolean') {
            return res.status(400).json({ error: 'teamId and success (boolean) are required.' });
        }

        const result = await dragonService.fightDragon(teamId, success);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

module.exports = { eligibility, fight };
