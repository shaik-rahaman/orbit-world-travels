import dotenv from 'dotenv';

dotenv.config();

export const config = {
  app: {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3008', 10),
  },
  database: {
    // MongoDB Configuration
    mongoUri: process.env.MONGODB_URI,
    dbName: process.env.DB_NAME || 'orbit_world_db',
    collectionName: process.env.COLLECTION_NAME || 'travel_data',
    vectorIndexName: process.env.VECTOR_INDEX_NAME || 'vector_index',
    bm25IndexName: process.env.BM25_INDEX_NAME || 'vector_index_bm25',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'change-me-in-production',
    expiresIn: process.env.JWT_EXPIRATION || '24h',
  },
  file: {
    maxSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),
    uploadDir: process.env.UPLOAD_DIR || './uploads',
  },
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    s3Bucket: process.env.AWS_S3_BUCKET,
  },
  pdf: {
    marginTop: parseInt(process.env.PDF_MARGIN_TOP || '20', 10),
    marginBottom: parseInt(process.env.PDF_MARGIN_BOTTOM || '20', 10),
    marginLeft: parseInt(process.env.PDF_MARGIN_LEFT || '20', 10),
    marginRight: parseInt(process.env.PDF_MARGIN_RIGHT || '20', 10),
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
  groq: {
    apiKey: process.env.GROQ_API_KEY,
    model: process.env.GROQ_MODEL || 'llama-3-70b-versatile',
  },
};
