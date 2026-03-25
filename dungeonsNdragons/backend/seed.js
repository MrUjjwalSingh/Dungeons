require('dotenv').config();
const mongoose = require('mongoose');
const { Quest, Dungeon } = require('./src/models');

const QUESTS = [
    { name: 'Goblin Ambush', description: 'Fight off goblin raiders on the western road.', bet_stat: 'agility', bet_amount: 5, reward_stat: 'agility', reward_amount: 15 },
    { name: 'The Cursed Well', description: 'Drink from the well and risk a magical curse.', bet_stat: 'hp', bet_amount: 10, reward_stat: 'mana', reward_amount: 20 },
    { name: 'Arm Wrestling Orc', description: 'Challenge the tavern orc to a test of raw strength.', bet_stat: 'power', bet_amount: 8, reward_stat: 'power', reward_amount: 18 },
    { name: 'Riddle of the Sphinx', description: 'Answer three riddles from a stone guardian.', bet_stat: 'brain_power', bet_amount: 10, reward_stat: 'brain_power', reward_amount: 25 },
    { name: 'Potion Roulette', description: 'Drink a random potion from the alchemist\'s stock.', bet_stat: 'hp', bet_amount: 15, reward_stat: 'hp', reward_amount: 30 },
    { name: 'Shadow Sprint', description: 'Race through a shadow-filled corridor before the gate shuts.', bet_stat: 'agility', bet_amount: 12, reward_stat: 'agility', reward_amount: 22 },
    { name: 'Arcane Gambit', description: 'Channel raw mana into a volatile crystal.', bet_stat: 'mana', bet_amount: 10, reward_stat: 'mana', reward_amount: 20 },
];

const DUNGEONS = [
    { name: 'The Sunken Keep', description: 'Flooded corridors with forgotten wardens.', required_stat: 'agility', required_amount: 30, equipment_name: 'Trident of Tides', class_granted: 'Swordsman' },
    { name: 'Iron Bastion', description: 'A fortress of iron and fire.', required_stat: 'power', required_amount: 35, equipment_name: 'Shield of Embers', class_granted: 'Defender' },
    { name: 'Crystal Caverns', description: 'Glittering caves pulsing with arcane energy.', required_stat: 'mana', required_amount: 30, equipment_name: 'Staff of Echoes', class_granted: 'Mage' },
    { name: 'Thornwood Depths', description: 'A living forest that fights back.', required_stat: 'hp', required_amount: 40, equipment_name: 'Spear of Thorns', class_granted: 'Lancer' },
    { name: 'The Obsidian Spire', description: 'A tower of dark glass hiding ancient secrets.', required_stat: 'brain_power', required_amount: 35, equipment_name: 'Orb of Foresight', class_granted: 'Seer' },
];

async function seed() {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dnd_event';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // Clear existing
    await Quest.deleteMany({});
    await Dungeon.deleteMany({});
    console.log('Cleared existing quests & dungeons');

    // Insert
    await Quest.insertMany(QUESTS);
    console.log(`Seeded ${QUESTS.length} quests`);

    await Dungeon.insertMany(DUNGEONS);
    console.log(`Seeded ${DUNGEONS.length} dungeons`);

    await mongoose.disconnect();
    console.log('✅ Seed complete!');
}

seed().catch(err => {
    console.error('Seed failed:', err.message);
    process.exit(1);
});
