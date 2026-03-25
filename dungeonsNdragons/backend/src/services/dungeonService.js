const { Dungeon, Team, Player, Announcement } = require('../models');

const dungeonService = {
    /* List all dungeons */
    getAllDungeons: async () => {
        const dungeons = await Dungeon.find();
        return dungeons.map(d => ({ id: d._id, name: d.name, description: d.description, required_stat: d.required_stat, required_amount: d.required_amount, equipment_name: d.equipment_name, class_granted: d.class_granted }));
    },

    /* Check if a team can enter a dungeon */
    checkEligibility: async (dungeonId, teamId) => {
        const dungeon = await Dungeon.findById(dungeonId);
        if (!dungeon) throw new Error('Dungeon not found');

        const team = await Team.findById(teamId);
        if (!team) throw new Error('Team not found');

        const hasStat = (team[dungeon.required_stat] || 0) >= dungeon.required_amount;
        const alreadyOwns = team.equipment.includes(dungeon.equipment_name);

        return {
            eligible: hasStat && !alreadyOwns,
            reason: alreadyOwns ? 'Already own this equipment' : !hasStat ? `Need ${dungeon.required_amount} ${dungeon.required_stat}` : 'Ready',
            dungeon: dungeon.name,
        };
    },

    /* Clear a dungeon — grants equipment + class */
    clearDungeon: async (dungeonId, teamId, playerId) => {
        const dungeon = await Dungeon.findById(dungeonId);
        if (!dungeon) throw new Error('Dungeon not found');

        const team = await Team.findById(teamId);
        if (!team) throw new Error('Team not found');

        // Stat check
        if ((team[dungeon.required_stat] || 0) < dungeon.required_amount) {
            throw new Error(`Not enough ${dungeon.required_stat}. Need ${dungeon.required_amount}, have ${team[dungeon.required_stat]}`);
        }

        // Duplicate equipment check
        if (team.equipment.includes(dungeon.equipment_name)) {
            throw new Error('Team already has this equipment');
        }

        // Player class check
        const player = await Player.findById(playerId);
        if (!player || player.team.toString() !== team._id.toString()) {
            throw new Error('Player not found in this team');
        }
        if (player.class !== 'Human') {
            throw new Error(`${player.name} already has a class (${player.class})`);
        }

        // Grant equipment to team
        team.equipment.push(dungeon.equipment_name);
        await team.save();

        // Assign class to player
        player.class = dungeon.class_granted;
        await player.save();

        await Announcement.create({
            message: `⚔️ ${team.name} cleared "${dungeon.name}"! ${player.name} is now a ${dungeon.class_granted}. Equipment: ${dungeon.equipment_name}.`
        });

        return {
            dungeon: dungeon.name,
            equipment: dungeon.equipment_name,
            player: { id: player._id, name: player.name, class: player.class },
        };
    },
};

module.exports = dungeonService;
