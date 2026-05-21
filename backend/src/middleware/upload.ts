import multer, { StorageEngine } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { config } from '@/config/env';

/**
 * Configure multer storage
 */
const storage: StorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = config.file.uploadDir;

    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

/**
 * File filter for document uploads
 */
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Allowed file types
  const allowedMimes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'image/gif',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed`));
  }
};

/**
 * Multer instance for document uploads
 */
export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.file.maxSize,
  },
});

/**
 * Middleware to handle file upload with field name
 */
export const uploadDocumentMiddleware = uploadMiddleware.single('document');
