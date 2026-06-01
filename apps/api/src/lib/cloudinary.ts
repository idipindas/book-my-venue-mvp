import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/env';

cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
});

export { cloudinary };

export async function deleteCloudinaryAsset(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

// Extracts the full public ID (folder/name) from a Cloudinary secure URL.
// e.g. https://res.cloudinary.com/cloud/image/upload/v123/bookmyvenue/venues/vid/abc.jpg
//   → bookmyvenue/venues/vid/abc
export function extractPublicId(url: string): string {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
  if (!match) throw new Error(`Cannot extract public ID from URL: ${url}`);
  return match[1];
}
