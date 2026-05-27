import 'reflect-metadata';
import 'dotenv/config';
import { AppDataSource } from '../config/database';
import { seedVenues } from './venues.seed';
import { logger } from '../lib/logger';

async function main(): Promise<void> {
  await AppDataSource.initialize();
  logger.info('Running seeds...');
  await seedVenues();
  logger.info('Seed complete: 12 venues + demo users created');
  await AppDataSource.destroy();
}

main().catch((err) => {
  logger.error({ err }, 'Seed failed');
  process.exit(1);
});
