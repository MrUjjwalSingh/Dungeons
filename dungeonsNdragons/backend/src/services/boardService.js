const { Team, Announcement } = require('../models');

const boardService = {
  /* Leaderboard: teams sorted by sum of all stats */
  getLeaderboard: async () => {
    const teams = await Team.find();
    const ranked = teams.map(t => ({
      id: t._id,
      name: t.name,
      power: t.power,
      hp: t.hp,
      mana: t.mana,
      agility: t.agility,
      brain_power: t.brain_power,
      total_stats: t.power + t.hp + t.mana + t.agility + t.brain_power,
    }))
      .sort((a, b) => b.total_stats - a.total_stats);

    return ranked;
  },

  /* Recent announcements */
  getAnnouncements: async () => {
    const anns = await Announcement.find().sort({ createdAt: -1 }).limit(20);
    return anns;
  },
};

module.exports = boardService;
