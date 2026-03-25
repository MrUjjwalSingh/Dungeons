const mongoose = require('mongoose');

/* ───── Team ───── */
const teamSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    power: { type: Number, default: 10 },
    hp: { type: Number, default: 10 },
    mana: { type: Number, default: 10 },
    agility: { type: Number, default: 10 },
    brain_power: { type: Number, default: 10 },
    equipment: { type: [String], default: [] },
}, { timestamps: true });

const Team = mongoose.model('Team', teamSchema);

/* ───── Player ───── */
const playerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    class: { type: String, default: 'Human' },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
}, { timestamps: true });

const Player = mongoose.model('Player', playerSchema);

/* ───── Quest ───── */
const questSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, default: '' },
    bet_stat: { type: String, required: true },
    bet_amount: { type: Number, required: true },
    reward_stat: { type: String, required: true },
    reward_amount: { type: Number, required: true },
});

const Quest = mongoose.model('Quest', questSchema);

/* ───── Dungeon ───── */
const dungeonSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, default: '' },
    required_stat: { type: String, required: true },
    required_amount: { type: Number, required: true },
    equipment_name: { type: String, required: true },
    class_granted: { type: String, required: true },
});

const Dungeon = mongoose.model('Dungeon', dungeonSchema);

/* ───── Announcement ───── */
const announcementSchema = new mongoose.Schema({
    message: { type: String, required: true },
}, { timestamps: true });

// Use created_at alias for frontend compatibility
announcementSchema.set('toJSON', {
    transform: (doc, ret) => {
        ret.id = ret._id;
        ret.created_at = ret.createdAt;
        delete ret.__v;
        return ret;
    }
});

const Announcement = mongoose.model('Announcement', announcementSchema);

module.exports = { Team, Player, Quest, Dungeon, Announcement };
