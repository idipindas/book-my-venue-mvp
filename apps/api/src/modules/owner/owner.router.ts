import { NextFunction, Request, Response, Router } from 'express';
import { OwnerController } from './owner.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { roleGuard } from '../../middleware/role.middleware';
import { validateBody } from '../../middleware/validate.middleware';
import { CreateVenueDto, UpdateVenueDto, SetAvailabilityDto, DeclineBookingDto } from './owner.dto';
import { Role } from '../../entities/User.entity';
import { venuePhotoUpload } from '../../middleware/upload.middleware';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

function parseAmenities(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value !== 'string') return [];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
  } catch {
    // fall through to comma-separated parsing
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function toNumberOrUndefined(value: unknown) {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

async function validateCreateVenueMultipart(req: Request, res: Response, next: NextFunction) {
  const files = (req.files as Express.Multer.File[]) ?? [];
  if (files.length === 0) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_PHOTO', message: 'At least 1 photo is required.' },
    });
  }
  if (files.length > 5) {
    return res.status(400).json({
      success: false,
      error: { code: 'TOO_MANY_PHOTOS', message: 'Maximum 5 photos allowed.' },
    });
  }

  const body = req.body ?? {};
  const dto = plainToInstance(CreateVenueDto, {
    ...body,
    amenities: parseAmenities(body.amenities),
    latitude: toNumberOrUndefined(body.latitude),
    longitude: toNumberOrUndefined(body.longitude),
    capacityMin: toNumberOrUndefined(body.capacityMin),
    capacityMax: toNumberOrUndefined(body.capacityMax),
    pricePerHour: toNumberOrUndefined(body.pricePerHour),
    priceHalfDay: toNumberOrUndefined(body.priceHalfDay),
    priceFullDay: toNumberOrUndefined(body.priceFullDay),
  });

  const errors = await validate(dto, { whitelist: true, forbidNonWhitelisted: false });
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request body.',
        details: errors.map((e) => ({
          field: e.property,
          constraints: e.constraints,
        })),
      },
    });
  }

  req.body = dto;
  next();
}

const router = Router();

router.use(authMiddleware, roleGuard(Role.OWNER, Role.ADMIN));

router.post('/venues', venuePhotoUpload.array('photos', 5), validateCreateVenueMultipart, OwnerController.createVenue);
router.get('/venues', OwnerController.getMyVenues);
router.get('/venues/:id', OwnerController.getMyVenueById);
router.put('/venues/:id', validateBody(UpdateVenueDto), OwnerController.updateVenue);
router.patch('/venues/:id/status', OwnerController.setVenueStatus);
router.delete('/venues/:id', OwnerController.deleteVenue);
router.put('/venues/:id/availability', validateBody(SetAvailabilityDto), OwnerController.setAvailability);

// Photo management — min 1, max 5 per venue, order preserved
router.post('/venues/:id/photos', venuePhotoUpload.array('photos', 5), OwnerController.uploadVenuePhotos);
router.delete('/venues/:id/photos', OwnerController.deleteVenuePhoto);
router.patch('/venues/:id/photos/reorder', OwnerController.reorderVenuePhotos);

router.get('/bookings', OwnerController.getIncomingBookings);
router.get('/bookings/:id', OwnerController.getBookingById);
router.patch('/bookings/:id/accept', OwnerController.acceptBooking);
router.patch('/bookings/:id/decline', validateBody(DeclineBookingDto), OwnerController.declineBooking);

router.get('/analytics', OwnerController.getAnalytics);
router.get('/payouts', (_req, res) => res.json({ success: true, data: [] }));

export default router;
