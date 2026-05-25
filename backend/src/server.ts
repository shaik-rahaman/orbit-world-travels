import app from './app';
import { config } from './config/env';
import { connectMongoDB, disconnectMongoDB } from './config/mongodb';
import { Logger } from './shared/utils/response';

const PORT = config.app.port;

async function startServer() {
  try {
    // Validate critical environment variables
    if (!config.database.mongoUri) {
      const errorMsg = '❌ FATAL: MONGODB_URI is not configured. Set MONGODB_URI in your .env file before starting the application.';
      console.error(errorMsg);
      Logger.error(errorMsg);
      process.exit(1);
    }

    // Connect to MongoDB
    try {
      await connectMongoDB();
      Logger.info('✓ MongoDB connected successfully');
    } catch (mongoError) {
      Logger.error('❌ MongoDB connection failed. This is critical for application functionality.', mongoError);
      process.exit(1);
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
