import multer from 'multer';
import { AppError } from '../lib/errors';

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE, files: 10 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('INVALID_FILE_TYPE', 'Only JPEG, PNG, and WebP images are allowed.', 400));
    }
  },
});
