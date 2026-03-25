require('dotenv').config();

const app = require('./src/app');
const { connectDB } = require('./src/config/db');

const PORT = process.env.PORT || 3000;

const start = async () => {
    try {
        await connectDB();
        console.log('📦 Database ready');

        app.listen(PORT, () => {
            console.log(`🐲 Server is running on http://localhost:${PORT}`);
            console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
        });
    } catch (err) {
        console.error('❌ Failed to start server:', err.message);
        process.exit(1);
    }
};

start();
