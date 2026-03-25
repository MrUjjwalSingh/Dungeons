const teamService = require('../services/teamService');

const register = async (req, res) => {
    try {
        const { teamName, players } = req.body;
        if (!teamName || !players) {
            return res.status(400).json({ error: 'teamName and players (array of 3 names) are required.' });
        }
        const result = await teamService.registerTeam(teamName, players);
        res.status(201).json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const list = async (req, res) => {
    try {
        const teams = await teamService.getAllTeams();
        res.json({ teams });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getById = async (req, res) => {
    try {
        const result = await teamService.getTeamById(req.params.id);
        res.json(result);
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
};

/* PATCH /api/teams/:id/stats — admin manual stat override */
const updateStat = async (req, res) => {
    try {
        const { statName, delta } = req.body;

        if (!statName || delta === undefined) {
            return res.status(400).json({ error: 'statName and delta (number) are required.' });
        }

        const result = await teamService.updateStat(req.params.id, statName, Number(delta));
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

module.exports = { register, list, getById, updateStat };
