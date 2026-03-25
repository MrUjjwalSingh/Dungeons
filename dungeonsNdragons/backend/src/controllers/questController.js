const questService = require('../services/questService');
const { Quest } = require('../models');

const list = async (req, res) => {
    try {
        const quests = await questService.getAllQuests();
        res.json({ quests });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/* POST /api/quests/:questId/start — deduct wager upfront */
const start = async (req, res) => {
    try {
        const { questId } = req.params;
        const { teamId } = req.body;

        if (!teamId) {
            return res.status(400).json({ error: 'teamId is required.' });
        }

        const result = await questService.startQuest(questId, teamId);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/* POST /api/quests/:questId/complete — award reward on success */
const complete = async (req, res) => {
    try {
        const { questId } = req.params;
        const { teamId, success } = req.body;

        if (!teamId || typeof success !== 'boolean') {
            return res.status(400).json({ error: 'teamId and success (boolean) are required.' });
        }

        const result = await questService.completeQuest(questId, teamId, success);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/* PATCH /api/quests/:questId — update quest configuration */
const updateConfig = async (req, res) => {
    try {
        const { questId } = req.params;
        const { name, description, bet_stat, bet_amount, reward_stat, reward_amount } = req.body;

        const allowed = {};
        if (name !== undefined) allowed.name = name;
        if (description !== undefined) allowed.description = description;
        if (bet_stat !== undefined) allowed.bet_stat = bet_stat;
        if (bet_amount !== undefined) allowed.bet_amount = Number(bet_amount);
        if (reward_stat !== undefined) allowed.reward_stat = reward_stat;
        if (reward_amount !== undefined) allowed.reward_amount = Number(reward_amount);

        const quest = await Quest.findByIdAndUpdate(questId, allowed, { new: true, runValidators: true });
        if (!quest) return res.status(404).json({ error: 'Quest not found' });

        res.json({
            message: 'Quest updated',
            quest: {
                id: quest._id, name: quest.name, description: quest.description,
                bet_stat: quest.bet_stat, bet_amount: quest.bet_amount,
                reward_stat: quest.reward_stat, reward_amount: quest.reward_amount,
            },
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/* POST /api/quests — create a new quest */
const create = async (req, res) => {
    try {
        const { name, description, bet_stat, bet_amount, reward_stat, reward_amount } = req.body;
        if (!name || !bet_stat || bet_amount === undefined || !reward_stat || reward_amount === undefined) {
            return res.status(400).json({ error: 'name, bet_stat, bet_amount, reward_stat, and reward_amount are required.' });
        }
        const quest = await Quest.create({
            name,
            description: description || '',
            bet_stat,
            bet_amount: Number(bet_amount),
            reward_stat,
            reward_amount: Number(reward_amount),
        });
        res.status(201).json({
            message: 'Quest created',
            quest: {
                id: quest._id, name: quest.name, description: quest.description,
                bet_stat: quest.bet_stat, bet_amount: quest.bet_amount,
                reward_stat: quest.reward_stat, reward_amount: quest.reward_amount,
            },
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

module.exports = { list, start, complete, updateConfig, create };
