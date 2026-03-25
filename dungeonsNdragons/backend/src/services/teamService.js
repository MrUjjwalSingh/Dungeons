const { Team, Player } = require('../models');

const teamService = {
    /* Register a new team with 3 players */
    registerTeam: async (teamName, playerNames) => {
        if (!teamName || !playerNames || playerNames.length !== 3) {
            throw new Error('A team needs a name and exactly 3 players');
        }

        const existing = await Team.findOne({ name: teamName });
        if (existing) throw new Error('Team name already taken');

        const team = await Team.create({ name: teamName });

        const players = await Player.insertMany(
            playerNames.map(name => ({ name, team: team._id }))
        );

        return {
            team: { id: team._id, name: team.name, power: team.power, hp: team.hp, mana: team.mana, agility: team.agility, brain_power: team.brain_power, equipment: team.equipment },
            players: players.map(p => ({ id: p._id, name: p.name, class: p.class })),
        };
    },

    /* List all teams */
    getAllTeams: async () => {
        const teams = await Team.find().sort({ createdAt: -1 });
        return teams.map(t => ({ id: t._id, name: t.name, power: t.power, hp: t.hp, mana: t.mana, agility: t.agility, brain_power: t.brain_power, equipment: t.equipment }));
    },

    /* Get single team with its players */
    getTeamById: async (id) => {
        const team = await Team.findById(id);
        if (!team) throw new Error('Team not found');

        const players = await Player.find({ team: team._id });

        return {
            team: { id: team._id, name: team.name, power: team.power, hp: team.hp, mana: team.mana, agility: team.agility, brain_power: team.brain_power, equipment: team.equipment },
            players: players.map(p => ({ id: p._id, name: p.name, class: p.class })),
        };
    },

    /**
     * Directly modify a team's stat by a delta (positive or negative).
     * Used as a fail-safe / manual override by the admin.
     * Clamps the resulting value to >= 0.
     */
    updateStat: async (teamId, statName, delta) => {
        const VALID_STATS = ['power', 'hp', 'mana', 'agility', 'brain_power'];
        if (!VALID_STATS.includes(statName)) {
            throw new Error(`Invalid stat "${statName}". Valid: ${VALID_STATS.join(', ')}`);
        }
        if (typeof delta !== 'number' || isNaN(delta)) {
            throw new Error('delta must be a number');
        }

        const team = await Team.findById(teamId);
        if (!team) throw new Error('Team not found');

        const oldVal = team[statName] || 0;
        const newVal = Math.max(0, oldVal + delta);
        team[statName] = newVal;
        await team.save();

        return {
            team: { id: team._id, name: team.name, power: team.power, hp: team.hp, mana: team.mana, agility: team.agility, brain_power: team.brain_power, equipment: team.equipment },
            adjusted: { stat: statName, oldValue: oldVal, newValue: newVal, delta },
        };
    },
};

module.exports = teamService;
