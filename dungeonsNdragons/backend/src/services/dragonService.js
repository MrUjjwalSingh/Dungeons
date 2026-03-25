const { Team, Announcement } = require('../models');

const dragonService = {
    /* Check if a team has enough equipment for the dragon fight */
    checkDragonEligibility: async (teamId) => {
        const team = await Team.findById(teamId);
        if (!team) throw new Error('Team not found');

        return {
            eligible: team.equipment.length >= 3,
            equipment_count: team.equipment.length,
            required: 3,
            team: team.name,
        };
    },

    /* Resolve the final dragon fight */
    fightDragon: async (teamId, victory) => {
        const team = await Team.findById(teamId);
        if (!team) throw new Error('Team not found');

        if (team.equipment.length < 3) {
            throw new Error('Team needs at least 3 equipment pieces to fight the dragon');
        }

        if (victory) {
            await Announcement.create({
                message: `🐉🏆 ${team.name} has SLAIN THE DRAGON! The realm is saved! All hail the victorious guild!`
            });
        } else {
            // On defeat, lose some stats
            team.hp = Math.max(0, team.hp - 10);
            team.power = Math.max(0, team.power - 5);
            await team.save();
            await Announcement.create({
                message: `🐉💀 ${team.name} challenged the Dragon and was defeated! They limp back to the tavern, battered and broken.`
            });
        }

        return {
            outcome: victory ? 'victory' : 'defeat',
            team: team.name,
        };
    },
};

module.exports = dragonService;
