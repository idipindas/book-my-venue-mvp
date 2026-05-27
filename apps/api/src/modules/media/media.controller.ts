import { Request, Response, NextFunction } from 'express';
import { MediaService } from './media.service';

export const MediaController = {
  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0)
        return res.status(400).json({ success: false, error: { code: 'NO_FILES', message: 'No files uploaded.' } });

      const urls = await MediaService.uploadPhotos(files);
      res.status(201).json({ success: true, data: { urls } });
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await MediaService.deletePhoto(req.params.id);
      res.json({ success: true, data: null });
    } catch (err) {
      next(err);
    }
  },
};
