import { AppDataSource } from '../config/database';
import { Venue, VenueType, VenueStatus } from '../entities/Venue.entity';
import { User, Role } from '../entities/User.entity';
import { Availability } from '../entities/Availability.entity';
import bcrypt from 'bcryptjs';

function nextDates(n: number): string[] {
  const dates: string[] = [];
  const base = new Date();
  for (let i = 1; i <= n; i++) {
    const d = new Date(base);
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

function defaultSlots(): { time: string; available: boolean }[] {
  const slots = [];
  for (let h = 8; h <= 20; h++) {
    slots.push({ time: `${String(h).padStart(2, '0')}:00`, available: true });
  }
  return slots;
}

const KERALA_VENUES = [
  {
    name: 'Skyline Banquet Hall',
    description: 'Premium banquet hall in the heart of Kochi with panoramic city views.',
    type: VenueType.BIRTHDAY_HALL,
    address: 'MG Road, Ernakulam',
    city: 'Kochi',
    latitude: 9.9312,
    longitude: 76.2673,
    capacityMin: 50,
    capacityMax: 500,
    pricePerHour: 5000,
    priceHalfDay: 20000,
    priceFullDay: 35000,
    amenities: ['AC', 'Parking', 'Catering', 'DJ', 'Stage', 'WiFi'],
  },
  {
    name: 'Backwater Bliss Resort',
    description: 'Luxury resort on Vembanad Lake with houseboat experience.',
    type: VenueType.RESORT,
    address: 'Kumarakom, Kottayam',
    city: 'Kottayam',
    latitude: 9.6162,
    longitude: 76.4258,
    capacityMin: 10,
    capacityMax: 200,
    pricePerHour: 8000,
    priceHalfDay: 30000,
    priceFullDay: 55000,
    amenities: ['Pool', 'Spa', 'Restaurant', 'Boat Rides', 'WiFi', 'AC'],
  },
  {
    name: 'TechHub Meetup Space',
    description: 'Modern coworking and event space for tech meetups and workshops.',
    type: VenueType.MEETUP,
    address: 'Infopark, Kakkanad',
    city: 'Kochi',
    latitude: 10.0261,
    longitude: 76.3083,
    capacityMin: 10,
    capacityMax: 100,
    pricePerHour: 1500,
    priceHalfDay: 5000,
    priceFullDay: 9000,
    amenities: ['Projector', 'Whiteboard', 'High-Speed WiFi', 'AC', 'Coffee Machine'],
  },
  {
    name: 'Calicut Convention Centre',
    description: 'Spacious auditorium suitable for conferences and cultural events.',
    type: VenueType.AUDITORIUM,
    address: 'Beach Road, Kozhikode',
    city: 'Kozhikode',
    latitude: 11.2588,
    longitude: 75.7804,
    capacityMin: 100,
    capacityMax: 1000,
    pricePerHour: 10000,
    priceHalfDay: 40000,
    priceFullDay: 70000,
    amenities: ['Stage', 'AC', 'Sound System', 'Lighting', 'Backstage', 'Parking'],
  },
  {
    name: 'The Malabar Cafe',
    description: 'Cozy cafe with private dining rooms for small gatherings.',
    type: VenueType.CAFE,
    address: 'Mananchira Square, Kozhikode',
    city: 'Kozhikode',
    latitude: 11.2503,
    longitude: 75.7729,
    capacityMin: 5,
    capacityMax: 40,
    pricePerHour: 800,
    priceHalfDay: 3000,
    priceFullDay: 5000,
    amenities: ['WiFi', 'Board Games', 'Outdoor Seating', 'Projector'],
  },
  {
    name: 'Trivandrum Grand Hotel',
    description: 'Five-star hotel with multiple event halls and wedding venues.',
    type: VenueType.HOTEL,
    address: 'Statue Junction, Thiruvananthapuram',
    city: 'Thiruvananthapuram',
    latitude: 8.5241,
    longitude: 76.9366,
    capacityMin: 50,
    capacityMax: 800,
    pricePerHour: 12000,
    priceHalfDay: 50000,
    priceFullDay: 90000,
    amenities: ['Valet Parking', 'Catering', 'Bridal Suite', 'Pool', 'Gym', 'WiFi'],
  },
  {
    name: 'Palakkad Heritage Hall',
    description: 'Traditional Kerala-style heritage venue perfect for weddings.',
    type: VenueType.VENUE_HALL,
    address: 'Fort Road, Palakkad',
    city: 'Palakkad',
    latitude: 10.7867,
    longitude: 76.6548,
    capacityMin: 100,
    capacityMax: 600,
    pricePerHour: 4000,
    priceHalfDay: 15000,
    priceFullDay: 28000,
    amenities: ['Elephant Ride', 'Traditional Decor', 'Catering', 'Parking'],
  },
  {
    name: 'Lulu Mall Event Space',
    description: 'Modern event space inside Lulu Mall Kochi for product launches.',
    type: VenueType.MALL,
    address: 'Lulu Mall, Edappally',
    city: 'Kochi',
    latitude: 10.0286,
    longitude: 76.3099,
    capacityMin: 50,
    capacityMax: 300,
    pricePerHour: 7000,
    priceHalfDay: 25000,
    priceFullDay: 45000,
    amenities: ['LED Wall', 'AC', 'Food Court Access', 'Parking', 'WiFi'],
  },
  {
    name: 'Munnar Misty Retreat',
    description: 'Scenic hill station retreat ideal for team outings and celebrations.',
    type: VenueType.RESORT,
    address: 'Mattupetty Road, Munnar',
    city: 'Munnar',
    latitude: 10.0889,
    longitude: 77.0595,
    capacityMin: 10,
    capacityMax: 80,
    pricePerHour: 6000,
    priceHalfDay: 22000,
    priceFullDay: 40000,
    amenities: ['Trekking', 'Bonfire', 'AC Rooms', 'Restaurant', 'Tea Garden Tour'],
  },
  {
    name: 'Thrissur Pooram Hall',
    description: 'Cultural event space near the famous Thrissur Pooram grounds.',
    type: VenueType.BIRTHDAY_HALL,
    address: 'Thekkinkadu Maidan, Thrissur',
    city: 'Thrissur',
    latitude: 10.5276,
    longitude: 76.2144,
    capacityMin: 30,
    capacityMax: 250,
    pricePerHour: 3500,
    priceHalfDay: 12000,
    priceFullDay: 22000,
    amenities: ['Stage', 'Sound System', 'Parking', 'Catering', 'AC'],
  },
  {
    name: 'Alleppey Houseboat Lounge',
    description: 'Unique floating venue on a premium houseboat for intimate events.',
    type: VenueType.VENUE_HALL,
    address: 'Finishing Point, Alappuzha',
    city: 'Alappuzha',
    latitude: 9.4981,
    longitude: 76.3388,
    capacityMin: 5,
    capacityMax: 30,
    pricePerHour: 4500,
    priceHalfDay: 18000,
    priceFullDay: 32000,
    amenities: ['Canoe', 'Sunset Cruise', 'Chef', 'WiFi', 'AC Rooms'],
  },
  {
    name: 'Kannur Startup Hub',
    description: 'Dynamic startup incubation space available for workshops and seminars.',
    type: VenueType.MEETUP,
    address: 'Smart City, Kannur',
    city: 'Kannur',
    latitude: 11.8745,
    longitude: 75.3704,
    capacityMin: 20,
    capacityMax: 120,
    pricePerHour: 1200,
    priceHalfDay: 4000,
    priceFullDay: 7500,
    amenities: ['3D Printer', 'Maker Space', 'Projector', 'High-Speed WiFi', 'AC'],
  },
];

export async function seedVenues(): Promise<void> {
  const userRepo = AppDataSource.getRepository(User);
  const venueRepo = AppDataSource.getRepository(Venue);
  const availRepo = AppDataSource.getRepository(Availability);

  let owner = await userRepo.findOne({ where: { email: 'owner@bookmyvenue.in' } });
  if (!owner) {
    owner = userRepo.create({
      name: 'Demo Owner',
      email: 'owner@bookmyvenue.in',
      passwordHash: await bcrypt.hash('password123', 12),
      role: Role.OWNER,
      isVerified: true,
    });
    await userRepo.save(owner);
  }

  let admin = await userRepo.findOne({ where: { email: 'admin@bookmyvenue.in' } });
  if (!admin) {
    admin = userRepo.create({
      name: 'Admin',
      email: 'admin@bookmyvenue.in',
      passwordHash: await bcrypt.hash('admin1234', 12),
      role: Role.ADMIN,
      isVerified: true,
    });
    await userRepo.save(admin);
  }

  const dates = nextDates(14);

  for (const vData of KERALA_VENUES) {
    const existing = await venueRepo.findOne({ where: { name: vData.name } });
    if (existing) continue;

    const venue = venueRepo.create({
      ...vData,
      ownerId: owner.id,
      status: VenueStatus.APPROVED,
    });
    await venueRepo.save(venue);

    for (const date of dates) {
      const avail = availRepo.create({ venueId: venue.id, date, slots: defaultSlots() });
      await availRepo.save(avail);
    }
  }
}
