import app from './app';
import { config } from './config/env';
import { connectMongoDB, disconnectMongoDB } from './config/mongodb';
import { Logger } from './shared/utils/response';

const PORT = config.app.port;

async function startServer() {
  try {
    // Connect to MongoDB
    try {
      await connectMongoDB();
    } catch (mongoError) {
      Logger.warn('⚠️ MongoDB connection failed, but continuing with API server', mongoError);
      // Continue anyway - API can work without DB initially
    }

    // Start server
    app.listen(PORT, () => {
      Logger.info(`✓ Orbit World Backend running on port ${PORT}`);
      Logger.info(`✓ Environment: ${config.app.env}`);
      Logger.info(
        `✓ API Base URL: http://localhost:${PORT}/api/orbit-world`
      );
    });
  } catch (error) {
    Logger.error('Failed to start server', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  Logger.info('Shutting down gracefully...');
  await disconnectMongoDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  Logger.info('Shutting down gracefully...');
  await disconnectMongoDB();
  process.exit(0);
});

startServer();
