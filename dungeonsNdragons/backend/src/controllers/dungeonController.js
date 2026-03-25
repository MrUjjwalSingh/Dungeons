const dungeonService = require('../services/dungeonService');
const { Dungeon } = require('../models');

const list = async (req, res) => {
    try {
        const dungeons = await dungeonService.getAllDungeons();
        res.json({ dungeons });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const enter = async (req, res) => {
    try {
        const { dungeonId } = req.params;
        const { teamId } = req.body;
        if (!teamId) return res.status(400).json({ error: 'teamId is required.' });
        const result = await dungeonService.checkEligibility(dungeonId, teamId);
        if (!result.eligible) return res.status(403).json({ eligible: false, reason: result.reason || 'Team does not meet the stat requirements.' });
        res.json({ eligible: true, message: `Team meets the requirements!` });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const clear = async (req, res) => {
    try {
        const { dungeonId } = req.params;
        const { teamId, playerId } = req.body;
        if (!teamId) return res.status(400).json({ error: 'teamId is required.' });
        const result = await dungeonService.clearDungeon(dungeonId, teamId, playerId);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/* PATCH /api/dungeons/:dungeonId — update dungeon configuration */
const updateConfig = async (req, res) => {
    try {
        const { dungeonId } = req.params;
        const { name, description, required_stat, required_amount, equipment_name, class_granted } = req.body;

        const allowed = {};
        if (name !== undefined) allowed.name = name;
        if (description !== undefined) allowed.description = description;
        if (required_stat !== undefined) allowed.required_stat = required_stat;
        if (required_amount !== undefined) allowed.required_amount = Number(required_amount);
        if (equipment_name !== undefined) allowed.equipment_name = equipment_name;
        if (class_granted !== undefined) allowed.class_granted = class_granted;

        const dungeon = await Dungeon.findByIdAndUpdate(dungeonId, allowed, { new: true, runValidators: true });
        if (!dungeon) return res.status(404).json({ error: 'Dungeon not found' });

        res.json({ message: 'Dungeon updated', dungeon: { id: dungeon._id, name: dungeon.name, description: dungeon.description, required_stat: dungeon.required_stat, required_amount: dungeon.required_amount, equipment_name: dungeon.equipment_name, class_granted: dungeon.class_granted } });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/* POST /api/dungeons — create a new dungeon */
const create = async (req, res) => {
    try {
        const { name, description, required_stat, required_amount, equipment_name, class_granted } = req.body;
        if (!name || !required_stat || required_amount === undefined || !equipment_name || !class_granted) {
            return res.status(400).json({ error: 'name, required_stat, required_amount, equipment_name, and class_granted are required.' });
        }
        const dungeon = await Dungeon.create({
            name,
            description: description || '',
            required_stat,
            required_amount: Number(required_amount),
            equipment_name,
            class_granted,
        });
        res.status(201).json({
            message: 'Dungeon created',
            dungeon: {
                id: dungeon._id, name: dungeon.name, description: dungeon.description,
                required_stat: dungeon.required_stat, required_amount: dungeon.required_amount,
                equipment_name: dungeon.equipment_name, class_granted: dungeon.class_granted,
            },
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

module.exports = { list, enter, clear, updateConfig, create };

