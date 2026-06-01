import multer from 'multer';
import { AppError } from '../lib/errors';

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

function imageFilter(_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  if (ALLOWED_MIME.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('INVALID_FILE_TYPE', 'Only JPEG, PNG, and WebP images are allowed.', 400));
  }
}

export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE, files: 10 },
  fileFilter: imageFilter,
});

// Venue photos: max 5 per upload batch, 5 MB each
export const venuePhotoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE, files: 5 },
  fileFilter: imageFilter,
});
