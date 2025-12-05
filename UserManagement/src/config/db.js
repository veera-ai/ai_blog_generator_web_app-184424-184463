'use strict';
/**
 * MongoDB connection setup using Mongoose with retry and graceful shutdown.
 */

const mongoose = require('mongoose');

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

let retries = 0;

/**
 * Connect to MongoDB using the MONGODB_URI environment variable.
 * Retries a few times on failure with exponential backoff.
 * @returns {Promise<void>}
 */
async function connectWithRetry() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('MONGODB_URI is not set; database features will be unavailable.');
    return;
  }

  try {
    await mongoose.connect(uri, {
      // these options are defaults in newer mongoose, but kept for clarity
      autoIndex: true,
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    retries += 1;
    console.error(`MongoDB connection error (attempt ${retries}/${MAX_RETRIES}):`, err.message);
    if (retries < MAX_RETRIES) {
      const delay = RETRY_DELAY_MS * retries;
      await new Promise((res) => setTimeout(res, delay));
      return connectWithRetry();
    }
    console.error('Max retries reached. Proceeding without DB connection.');
  }
}

/**
 * Gracefully close the Mongoose connection.
 * @returns {Promise<void>}
 */
async function closeConnection() {
  try {
    await mongoose.connection.close(false);
    console.log('MongoDB connection closed.');
  } catch (err) {
    console.error('Error closing MongoDB connection:', err.message);
  }
}

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('Mongoose disconnected.');
});

process.on('SIGINT', async () => {
  await closeConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeConnection();
  process.exit(0);
});

module.exports = {
  connectWithRetry,
  closeConnection,
  mongoose,
};
