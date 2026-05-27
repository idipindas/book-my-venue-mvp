import { cloudinary, deleteCloudinaryAsset, extractPublicId } from '../../lib/cloudinary';
import { AppError } from '../../lib/errors';

export const MediaService = {
  async uploadPhotos(files: Express.Multer.File[]): Promise<string[]> {
    const uploads = files.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'bookmyvenue/venues', resource_type: 'image' },
            (error, result) => {
              if (error || !result) return reject(error ?? new Error('Upload failed'));
              resolve(result.secure_url);
            }
          );
          stream.end(file.buffer);
        })
    );
    return Promise.all(uploads);
  },

  async deletePhoto(publicId: string): Promise<void> {
    if (!publicId) throw new AppError('INVALID_ID', 'Invalid photo ID.', 400);
    await deleteCloudinaryAsset(`bookmyvenue/venues/${publicId}`);
  },

  extractPublicId,
};
