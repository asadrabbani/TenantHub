const app = require('./app');
const dotenv = require('dotenv');
const connectDatabase = require('./config/database');

dotenv.config();

// Connect to database
connectDatabase().catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
});

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
    console.log(`TenantHub API listening on http://127.0.0.1:${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error(`Unhandled rejection: ${err.message}`);
    server.close(() => {
        process.exit(1);
    });
});

for (const signal of ['SIGTERM', 'SIGINT']) {
    process.on(signal, () => server.close(() => process.exit(0)));
}
