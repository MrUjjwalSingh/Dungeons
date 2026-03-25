const { Quest, Team, Announcement } = require('../models');

const questService = {
    /* List all quests */
    getAllQuests: async () => {
        const quests = await Quest.find();
        return quests.map(q => ({
            id: q._id, name: q.name, description: q.description,
            bet_stat: q.bet_stat, bet_amount: q.bet_amount,
            reward_stat: q.reward_stat, reward_amount: q.reward_amount,
        }));
    },

    /**
     * Start a quest — deducts the wager stat from the team BEFORE the game begins.
     * This is the "wager upfront" mechanic.
     */
    startQuest: async (questId, teamId) => {
        const quest = await Quest.findById(questId);
        if (!quest) throw new Error('Quest not found');

        const team = await Team.findById(teamId);
        if (!team) throw new Error('Team not found');

        const currentVal = team[quest.bet_stat] || 0;
        if (currentVal < quest.bet_amount) {
            throw new Error(
                `Not enough ${quest.bet_stat.replace('_', ' ')}! Need ${quest.bet_amount}, have ${currentVal}.`
            );
        }

        // Deduct wager stat upfront
        team[quest.bet_stat] = currentVal - quest.bet_amount;
        await team.save();

        await Announcement.create({
            message: `⚔️ ${team.name} has wagered ${quest.bet_amount} ${quest.bet_stat.replace('_', ' ')} on "${quest.name}". The game begins!`
        });

        return {
            status: 'started',
            quest: quest.name,
            wagered: { stat: quest.bet_stat, amount: quest.bet_amount },
            team: {
                id: team._id, name: team.name,
                power: team.power, hp: team.hp, mana: team.mana,
                agility: team.agility, brain_power: team.brain_power
            },
        };
    },

    /**
     * Complete a quest — if success, awards the reward stat.
     * If failure, the wager is already lost (deducted at start). Nothing more happens.
     */
    completeQuest: async (questId, teamId, success) => {
        const quest = await Quest.findById(questId);
        if (!quest) throw new Error('Quest not found');

        const team = await Team.findById(teamId);
        if (!team) throw new Error('Team not found');

        if (success) {
            // Win: add reward stat
            team[quest.reward_stat] = (team[quest.reward_stat] || 0) + quest.reward_amount;
            await team.save();
            await Announcement.create({
                message: `🏆 ${team.name} completed "${quest.name}" and gained +${quest.reward_amount} ${quest.reward_stat.replace('_', ' ')}!`
            });
        } else {
            // Lose: wager was already deducted at start, nothing else to do
            await Announcement.create({
                message: `💀 ${team.name} failed "${quest.name}". Their wagered ${quest.bet_amount} ${quest.bet_stat.replace('_', ' ')} is lost forever.`
            });
        }

        return {
            outcome: success ? 'success' : 'failure',
            quest: quest.name,
            team: {
                id: team._id, name: team.name,
                power: team.power, hp: team.hp, mana: team.mana,
                agility: team.agility, brain_power: team.brain_power
            },
        };
    },
};

module.exports = questService;
