const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async (retries = 5) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 15000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        minPoolSize: 2,
        heartbeatFrequencyMS: 10000,
        retryReads: true,
        retryWrites: true,
        connectTimeoutMS: 15000,
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);

      mongoose.connection.on('disconnected', () => {
        console.warn('[MongoDB] Disconnected. Mongoose will auto-reconnect...');
      });
      mongoose.connection.on('reconnected', () => {
        console.log('[MongoDB] Reconnected successfully');
      });
      mongoose.connection.on('error', (err) => {
        console.error('[MongoDB] Connection error:', err.message);
      });
      return;
    } catch (error) {
      console.error(`[MongoDB] Attempt ${attempt}/${retries} failed: ${error.message}`);
      if (attempt < retries) {
        const waitSec = attempt * 3;
        console.log(`[MongoDB] Retrying in ${waitSec}s...`);
        await new Promise(r => setTimeout(r, waitSec * 1000));
      }
    }
  }
  console.log('Server will continue without DB. Fix MONGODB_URI in .env and restart.');
};

module.exports = connectDB;
