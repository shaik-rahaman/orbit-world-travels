import mongoose, { Connection } from 'mongoose';
import { Logger } from '@/shared/utils/response';

let mongoConnection: Connection | null = null;

export async function connectMongoDB(): Promise<Connection> {
  if (mongoConnection) {
    Logger.info('MongoDB already connected');
    return mongoConnection;
  }

  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    const connection = await mongoose.connect(mongoUri, {
      retryWrites: true,
      w: 'majority',
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10,
      minPoolSize: 2,
      maxConnecting: 2,
      waitQueueTimeoutMS: 30000,
    });

    mongoConnection = connection.connection;
    Logger.info('✅ MongoDB connected successfully');
    return mongoConnection;
  } catch (error) {
    Logger.error('❌ MongoDB connection failed:', error);
    throw error;
  }
}

export async function disconnectMongoDB(): Promise<void> {
  if (mongoConnection) {
    await mongoose.disconnect();
    mongoConnection = null;
    Logger.info('MongoDB disconnected');
  }
}

export function getMongoConnection(): Connection {
  if (!mongoConnection) {
    throw new Error('MongoDB not connected. Call connectMongoDB() first.');
  }
  return mongoConnection;
}

export default {
  connectMongoDB,
  disconnectMongoDB,
  getMongoConnection,
};
