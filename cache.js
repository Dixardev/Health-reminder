// cache.js
const { createClient } = require('redis');
require('dotenv').config();

const client = createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT, 10)
    }
});

client.on('error', (err) => {
    console.error('Redis error:', err);
});

client.connect().catch((err) => {
    console.error('Redis connection error:', err);
});

module.exports = client;
