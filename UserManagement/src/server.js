require('dotenv').config();
const app = require('./app');
const { connectWithRetry, closeConnection } = require('./config/db');

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';

(async () => {
  await connectWithRetry();

  const server = app.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}`);
  });

  const shutdown = async (signal) => {
    try {
      console.log(`${signal} received: closing HTTP server`);
      server.close(async () => {
        console.log('HTTP server closed');
        await closeConnection();
        process.exit(0);
      });
      // Force exit if not closed in time
      setTimeout(async () => {
        console.warn('Force exiting after timeout...');
        await closeConnection();
        process.exit(1);
      }, 10000);
    } catch (err) {
      console.error('Error during shutdown:', err);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  module.exports = server;
})();
