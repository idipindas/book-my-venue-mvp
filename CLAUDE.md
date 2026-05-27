# CLAUDE.md — BookMyVenue

> This file is the single source of truth for Claude when working on the BookMyVenue codebase.
> Read this entire file before writing any code, creating any file, or running any command.

---

## Project Overview

**BookMyVenue** is a location-based venue discovery and booking platform — a WeCode Community open-source project targeting Kerala, India.

It connects two sides of a marketplace:
- **Users** who need to find and book local spaces (birthday halls, cafes, auditoriums, meetup spaces, hotels, resorts, malls, venue halls)
- **Venue Owners** who want a digital presence and booking management tools

An **Admin** layer handles quality control, approvals, and platform oversight.

**Repository:** `github.com/WeCode-Community-Dev/BookMyVenue`

---

## Tech Stack

### Backend
- **Runtime:** Node.js (v20+) with TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** TypeORM (with decorators)
- **Cache:** Redis (sessions, availability caching)
- **Queue:** BullMQ (booking confirmations, notifications)
- **Auth:** JWT (access + refresh tokens) + Google OAuth 2.0
- **Validation:** class-validator + class-transformer
- **File Storage:** Cloudinary (venue photos)
- **Payments:** Razorpay (India-first, UPI support)
- **Email:** Nodemailer + Resend SMTP

### Frontend
- **Framework:** React 18 + Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **State:** Zustand (client state) + TanStack Query v5 (server state)
- **Forms:** React Hook Form + Zod validation
- **HTTP Client:** Axios
- **Maps:** Google Maps JS SDK (Phase 3+)

### DevOps / Infra
- **Containerisation:** Docker + Docker Compose
- **CI/CD:** GitHub Actions
- **Hosting:** Railway (API) + Vercel (frontend)

---

## Repository Structure

```
bookmyvenue/
├── CLAUDE.md                        ← This file
├── README.md
├── .env.example
├── docker-compose.yml
├── package.json                     ← npm workspaces root
│
├── apps/
│   ├── api/                         ← Backend (Express + TypeORM)
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   ├── env.ts           ← Typed config from process.env
│   │   │   │   ├── database.ts      ← TypeORM DataSource
│   │   │   │   ├── redis.ts         ← Redis client
│   │   │   │   └── queue.ts         ← BullMQ setup
│   │   │   ├── entities/            ← TypeORM entity classes
│   │   │   │   ├── User.entity.ts
│   │   │   │   ├── Venue.entity.ts
│   │   │   │   ├── Availability.entity.ts
│   │   │   │   ├── Booking.entity.ts
│   │   │   │   ├── Payment.entity.ts
│   │   │   │   └── Notification.entity.ts
│   │   │   ├── migrations/          ← TypeORM generated migrations
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── auth.router.ts
│   │   │   │   │   ├── auth.controller.ts
│   │   │   │   │   ├── auth.service.ts
│   │   │   │   │   └── auth.dto.ts
│   │   │   │   ├── users/
│   │   │   │   ├── venues/
│   │   │   │   ├── bookings/
│   │   │   │   ├── payments/
│   │   │   │   ├── owner/
│   │   │   │   ├── admin/
│   │   │   │   ├── media/
│   │   │   │   └── notifications/
│   │   │   ├── middleware/
│   │   │   │   ├── auth.middleware.ts     ← JWT guard
│   │   │   │   ├── role.middleware.ts     ← RBAC guard
│   │   │   │   ├── validate.middleware.ts ← class-validator DTO guard
│   │   │   │   └── upload.middleware.ts   ← Multer/Cloudinary
│   │   │   ├── lib/
│   │   │   │   ├── mailer.ts
│   │   │   │   ├── razorpay.ts
│   │   │   │   └── cloudinary.ts
│   │   │   ├── routes/
│   │   │   │   └── index.ts              ← Aggregates all module routers
│   │   │   ├── types/
│   │   │   │   └── express.d.ts          ← Augments req.user
│   │   │   └── app.ts
│   │   ├── Dockerfile
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── web/                         ← Frontend (React + Vite)
│       ├── src/
│       │   ├── main.tsx             ← Vite entry point
│       │   ├── App.tsx              ← Router setup
│       │   ├── pages/
│       │   │   ├── Home.tsx
│       │   │   ├── Venues.tsx
│       │   │   ├── VenueDetail.tsx
│       │   │   ├── BookingFlow.tsx
│       │   │   ├── auth/
│       │   │   │   ├── Login.tsx
│       │   │   │   └── Register.tsx
│       │   │   ├── dashboard/
│       │   │   │   ├── Dashboard.tsx
│       │   │   │   ├── Bookings.tsx
│       │   │   │   └── BookingDetail.tsx
│       │   │   ├── owner/
│       │   │   │   ├── OwnerDashboard.tsx
│       │   │   │   ├── MyVenues.tsx
│       │   │   │   ├── AddVenue.tsx
│       │   │   │   ├── EditVenue.tsx
│       │   │   │   ├── OwnerBookings.tsx
│       │   │   │   └── Analytics.tsx
│       │   │   └── admin/
│       │   │       ├── AdminDashboard.tsx
│       │   │       ├── PendingVenues.tsx
│       │   │       ├── UserManagement.tsx
│       │   │       └── AdminAnalytics.tsx
│       │   ├── components/
│       │   │   ├── ui/              ← Button, Input, Modal, Badge, etc.
│       │   │   ├── venue/           ← VenueCard, VenueGallery, VenueFilter
│       │   │   ├── booking/         ← DatePicker, SlotPicker, BookingSummary
│       │   │   └── layout/          ← Navbar, Footer, Sidebar, ProtectedRoute
│       │   ├── hooks/
│       │   │   ├── useAuth.ts
│       │   │   ├── useVenues.ts
│       │   │   └── useBookings.ts
│       │   ├── lib/
│       │   │   ├── axios.ts         ← Axios instance + interceptors
│       │   │   └── utils.ts
│       │   ├── store/
│       │   │   ├── auth.store.ts    ← Zustand auth store
│       │   │   └── ui.store.ts      ← Zustand UI (toasts, modals)
│       │   └── types/
│       │       └── index.ts         ← Shared TS types/interfaces
│       ├── index.html
│       ├── vite.config.ts
│       ├── tailwind.config.ts
│       ├── tsconfig.json
│       └── package.json
│
└── packages/
    └── shared-types/                ← Optional: shared DTOs across apps
```

---

## TypeORM Entity Definitions

All entities live in `apps/api/src/entities/`. Use decorator-based class definitions. Enable `"experimentalDecorators": true` and `"emitDecoratorMetadata": true` in `tsconfig.json`.

### User.entity.ts
```typescript
import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToMany
} from 'typeorm';

export enum Role {
  USER  = 'USER',
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  passwordHash: string;

  @Column({ nullable: true, unique: true })
  googleId: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: false })
  isSuspended: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Venue, (venue) => venue.owner)
  venues: Venue[];

  @OneToMany(() => Booking, (booking) => booking.user)
  bookings: Booking[];

  @OneToMany(() => Notification, (n) => n.user)
  notifications: Notification[];
}
```

### Venue.entity.ts
```typescript
import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, OneToMany, JoinColumn
} from 'typeorm';

export enum VenueType {
  BIRTHDAY_HALL = 'birthday_hall',
  CAFE          = 'cafe',
  HOTEL         = 'hotel',
  RESORT        = 'resort',
  AUDITORIUM    = 'auditorium',
  MEETUP        = 'meetup',
  MALL          = 'mall',
  VENUE_HALL    = 'venue_hall',
}

export enum VenueStatus {
  PENDING  = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  INACTIVE = 'INACTIVE',
}

@Entity('venues')
export class Venue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  ownerId: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column({ type: 'enum', enum: VenueType })
  type: VenueType;

  @Column()
  address: string;

  @Column()
  city: string;

  @Column({ default: 'Kerala' })
  state: string;

  @Column('decimal', { precision: 10, scale: 7 })
  latitude: number;

  @Column('decimal', { precision: 10, scale: 7 })
  longitude: number;

  @Column('int')
  capacityMin: number;

  @Column('int')
  capacityMax: number;

  @Column('decimal', { nullable: true })
  pricePerHour: number;

  @Column('decimal', { nullable: true })
  priceHalfDay: number;

  @Column('decimal', { nullable: true })
  priceFullDay: number;

  @Column('text', { array: true, default: [] })
  amenities: string[];

  @Column('text', { array: true, default: [] })
  photos: string[];                          // Cloudinary URLs

  @Column({ type: 'enum', enum: VenueStatus, default: VenueStatus.PENDING })
  status: VenueStatus;

  @Column({ nullable: true })
  rejectedNote: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.venues)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @OneToMany(() => Booking, (b) => b.venue)
  bookings: Booking[];

  @OneToMany(() => Availability, (a) => a.venue)
  availability: Availability[];
}
```

### Availability.entity.ts
```typescript
import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne,
  JoinColumn, Unique
} from 'typeorm';

@Entity('availability')
@Unique(['venueId', 'date'])
export class Availability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  venueId: string;

  @Column('date')
  date: string;                             // 'YYYY-MM-DD'

  // [{ time: '09:00', available: true }, ...]
  @Column('jsonb')
  slots: { time: string; available: boolean }[];

  @ManyToOne(() => Venue, (v) => v.availability)
  @JoinColumn({ name: 'venueId' })
  venue: Venue;
}
```

### Booking.entity.ts
```typescript
import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, OneToOne, JoinColumn
} from 'typeorm';

export enum BookingStatus {
  PENDING   = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  venueId: string;

  @Column('date')
  date: string;

  @Column()
  startTime: string;

  @Column()
  endTime: string;

  @Column('int')
  guestCount: number;

  @Column('decimal')
  totalAmount: number;

  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;

  @Column({ nullable: true })
  cancelledAt: Date;

  @Column({ nullable: true })
  cancelReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (u) => u.bookings)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Venue, (v) => v.bookings)
  @JoinColumn({ name: 'venueId' })
  venue: Venue;

  @OneToOne(() => Payment, (p) => p.booking)
  payment: Payment;
}
```

### Payment.entity.ts
```typescript
import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, OneToOne, JoinColumn
} from 'typeorm';

export enum PaymentStatus {
  PENDING  = 'PENDING',
  SUCCESS  = 'SUCCESS',
  FAILED   = 'FAILED',
  REFUNDED = 'REFUNDED',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  bookingId: string;

  @Column('decimal')
  amount: number;

  @Column({ default: 'INR' })
  currency: string;

  @Column({ nullable: true })
  gatewayId: string;                        // Razorpay order/payment ID

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ nullable: true })
  refundId: string;

  @Column({ nullable: true })
  refundedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @OneToOne(() => Booking, (b) => b.payment)
  @JoinColumn({ name: 'bookingId' })
  booking: Booking;
}
```

### Notification.entity.ts
```typescript
import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn
} from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  title: string;

  @Column('text')
  message: string;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (u) => u.notifications)
  @JoinColumn({ name: 'userId' })
  user: User;
}
```

---

## TypeORM DataSource Configuration

```typescript
// src/config/database.ts
import { DataSource } from 'typeorm';
import { config } from './env';
import { User } from '../entities/User.entity';
import { Venue } from '../entities/Venue.entity';
import { Availability } from '../entities/Availability.entity';
import { Booking } from '../entities/Booking.entity';
import { Payment } from '../entities/Payment.entity';
import { Notification } from '../entities/Notification.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: config.DATABASE_URL,
  synchronize: false,           // NEVER true in production — use migrations
  logging: config.NODE_ENV === 'development',
  entities: [User, Venue, Availability, Booking, Payment, Notification],
  migrations: ['src/migrations/*.ts'],
  subscribers: [],
});
```

### Migration Commands
```bash
# Generate migration from entity changes
npx typeorm migration:generate src/migrations/InitialSchema -d src/config/database.ts

# Run pending migrations
npx typeorm migration:run -d src/config/database.ts

# Revert last migration
npx typeorm migration:revert -d src/config/database.ts
```

**Rule:** Never use `synchronize: true` outside of local development. Always use migrations for schema changes.

---

## TypeORM Repository Pattern

Access entities only via the **Repository** pattern inside service files. Never use `AppDataSource` directly in controllers.

```typescript
// src/modules/venues/venues.service.ts
import { AppDataSource } from '../../config/database';
import { Venue, VenueStatus } from '../../entities/Venue.entity';
import { AppError } from '../../lib/errors';

const venueRepo = AppDataSource.getRepository(Venue);

export const VenueService = {
  async findNearby(lat: number, lng: number, radiusKm = 10) {
    // Haversine formula via raw query for geo distance
    return venueRepo.query(
      `SELECT *, (
        6371 * acos(
          cos(radians($1)) * cos(radians(latitude)) *
          cos(radians(longitude) - radians($2)) +
          sin(radians($1)) * sin(radians(latitude))
        )
      ) AS distance
      FROM venues
      WHERE status = 'APPROVED'
      HAVING distance < $3
      ORDER BY distance`,
      [lat, lng, radiusKm]
    );
  },

  async findById(id: string) {
    const venue = await venueRepo.findOne({
      where: { id },
      relations: ['owner', 'availability'],
    });
    if (!venue) throw new AppError('VENUE_NOT_FOUND', 'Venue not found.', 404);
    return venue;
  },

  async create(ownerId: string, dto: CreateVenueDto) {
    const venue = venueRepo.create({ ...dto, ownerId });
    return venueRepo.save(venue);
  },

  async update(id: string, ownerId: string, dto: UpdateVenueDto) {
    const venue = await this.findById(id);
    if (venue.ownerId !== ownerId)
      throw new AppError('FORBIDDEN', 'Not your venue.', 403);
    Object.assign(venue, dto);
    return venueRepo.save(venue);
  },
};
```

---

## Module File Pattern

Every module inside `src/modules/` follows this exact structure:

```
modules/venues/
├── venues.router.ts        ← Express router — maps HTTP paths to controller methods
├── venues.controller.ts    ← req/res handling only — calls service, returns JSON
├── venues.service.ts       ← All business logic + TypeORM repository calls
├── venues.dto.ts           ← class-validator DTO classes for request bodies
└── venues.types.ts         ← TypeScript interfaces specific to this module
```

**Rules:**
- Never put business logic in the controller
- Never call `AppDataSource` or any repository directly in the controller
- Never call `res.json()` inside the service layer
- DTOs use `class-validator` decorators for validation

### DTO Example
```typescript
// src/modules/venues/venues.dto.ts
import { IsString, IsEnum, IsNumber, IsArray, IsOptional, Min } from 'class-validator';
import { VenueType } from '../../entities/Venue.entity';

export class CreateVenueDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsEnum(VenueType)
  type: VenueType;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsNumber() @Min(1)
  capacityMin: number;

  @IsNumber() @Min(1)
  capacityMax: number;

  @IsNumber() @IsOptional()
  pricePerHour?: number;

  @IsNumber() @IsOptional()
  priceHalfDay?: number;

  @IsNumber() @IsOptional()
  priceFullDay?: number;

  @IsArray() @IsString({ each: true })
  amenities: string[];
}
```

### Validate Middleware
```typescript
// src/middleware/validate.middleware.ts
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RequestHandler } from 'express';

export function validateBody<T extends object>(DtoClass: new () => T): RequestHandler {
  return async (req, res, next) => {
    const dto = plainToInstance(DtoClass, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid request body.', details: errors },
      });
    }
    req.body = dto;
    next();
  };
}
```

---

## Complete API Reference

All routes are prefixed with `/api`. JWT required on protected routes via `Authorization: Bearer <token>`.

### 🔐 Auth — `/api/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | Public | Register — body: `{ name, email, password, role }` |
| POST | `/login` | Public | Login — returns `{ accessToken, refreshToken, user }` |
| POST | `/google` | Public | Google OAuth token exchange |
| POST | `/logout` | User | Invalidate refresh token in Redis |
| POST | `/refresh` | Public | Rotate tokens using refresh token |
| POST | `/verify-email` | Public | Verify email with one-time token |
| POST | `/forgot-password` | Public | Send reset link to email |
| POST | `/reset-password` | Public | Reset password using token |

---

### 👤 Users — `/api/users`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/me` | User | Get current user profile |
| PUT | `/me` | User | Update name / phone |
| PUT | `/me/password` | User | Change password |

---

### 🏛️ Venues — `/api/venues`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/nearby` | Public | `?lat=&lng=&radius=10` location-based |
| GET | `/search` | Public | `?q=keyword` full-text |
| GET | `/` | Public | Filtered list (see params below) |
| GET | `/:id` | Public | Venue details + relations |
| GET | `/:id/availability` | Public | `?date=YYYY-MM-DD` available slots |

**Query params for `GET /venues`:**
```
type          VenueType enum value
minCapacity   number
maxCapacity   number
minPrice      number
maxPrice      number
date          YYYY-MM-DD
city          string
page          number  (default 1)
limit         number  (default 12)
```

---

### 📅 Bookings — `/api/bookings`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/` | User | Create booking |
| GET | `/` | User | Booking history (upcoming + past) |
| GET | `/:id` | User | Single booking detail |
| DELETE | `/:id` | User | Cancel booking + trigger refund |

**POST body:**
```json
{
  "venueId": "uuid",
  "date": "YYYY-MM-DD",
  "startTime": "HH:MM",
  "endTime": "HH:MM",
  "guestCount": 50
}
```

---

### 💳 Payments — `/api/payments`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/initiate` | User | Create Razorpay order — body: `{ bookingId }` |
| POST | `/webhook` | Public | Razorpay webhook — verify signature + confirm |
| POST | `/refunds/:bookingId` | User | Request refund on cancellation |

---

### 🏢 Owner — `/api/owner`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/venues` | Owner | Submit new listing |
| GET | `/venues` | Owner | My listings |
| GET | `/venues/:id` | Owner | Single listing |
| PUT | `/venues/:id` | Owner | Update listing |
| PATCH | `/venues/:id/status` | Owner | Activate / deactivate |
| DELETE | `/venues/:id` | Owner | Delete listing |
| PUT | `/venues/:id/availability` | Owner | Set date availability |
| GET | `/bookings` | Owner | Incoming bookings |
| GET | `/bookings/:id` | Owner | Single booking |
| PATCH | `/bookings/:id/accept` | Owner | Accept booking |
| PATCH | `/bookings/:id/decline` | Owner | Decline booking |
| GET | `/analytics` | Owner | Occupancy + revenue |
| GET | `/payouts` | Owner | Payout history |

---

### 🛡️ Admin — `/api/admin`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/venues/pending` | Admin | Venues awaiting review |
| PATCH | `/venues/:id/approve` | Admin | Approve listing |
| PATCH | `/venues/:id/reject` | Admin | Reject with reason |
| GET | `/venues` | Admin | All listings (any status) |
| DELETE | `/venues/:id` | Admin | Force-remove |
| GET | `/users` | Admin | All users |
| PATCH | `/users/:id/suspend` | Admin | Suspend user |
| DELETE | `/users/:id` | Admin | Remove user |
| GET | `/bookings` | Admin | All bookings platform-wide |
| GET | `/payments` | Admin | All transactions |
| PATCH | `/payments/:id/flag` | Admin | Flag dispute |
| GET | `/analytics` | Admin | Platform-wide stats |

---

### 🖼️ Media — `/api/media`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/upload` | Owner | Upload photos (multipart/form-data, max 10, 5MB each) |
| DELETE | `/:id` | Owner | Delete photo from Cloudinary |

Accepted MIME types: `image/jpeg`, `image/png`, `image/webp`

---

### 🔔 Notifications — `/api/notifications`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | User | All notifications (paginated) |
| PATCH | `/:id/read` | User | Mark single as read |
| PATCH | `/read-all` | User | Mark all as read |

---

## Authentication & RBAC

### JWT Strategy
- **Access token:** 15 min expiry
- **Refresh token:** 7 days expiry — stored in Redis, single-use, rotated on each refresh

```typescript
// src/types/express.d.ts
import { User } from '../entities/User.entity';
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
```

### Role Guard Usage
```typescript
// In any router file
router.patch('/:id/approve', authMiddleware, roleGuard('ADMIN'), approveVenue);
router.post('/',             authMiddleware, roleGuard('OWNER'), createVenue);
router.post('/bookings',     authMiddleware, roleGuard('USER'),  createBooking);
```

### Role Hierarchy
- `ADMIN` — unrestricted access
- `OWNER` — own venues + incoming bookings only
- `USER`  — search, book, manage own bookings only

---

## Vite + React Setup

### vite.config.ts
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```

### React Router Setup (App.tsx)
```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProtectedRoute from '@/components/layout/ProtectedRoute';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/"               element={<Home />} />
          <Route path="/venues"         element={<Venues />} />
          <Route path="/venues/:id"     element={<VenueDetail />} />
          <Route path="/auth/login"     element={<Login />} />
          <Route path="/auth/register"  element={<Register />} />

          {/* User protected */}
          <Route element={<ProtectedRoute role="USER" />}>
            <Route path="/venues/:id/book"       element={<BookingFlow />} />
            <Route path="/dashboard"             element={<Dashboard />} />
            <Route path="/dashboard/bookings"    element={<Bookings />} />
            <Route path="/dashboard/bookings/:id" element={<BookingDetail />} />
          </Route>

          {/* Owner protected */}
          <Route element={<ProtectedRoute role="OWNER" />}>
            <Route path="/owner"              element={<OwnerDashboard />} />
            <Route path="/owner/venues"       element={<MyVenues />} />
            <Route path="/owner/venues/new"   element={<AddVenue />} />
            <Route path="/owner/venues/:id/edit" element={<EditVenue />} />
            <Route path="/owner/bookings"     element={<OwnerBookings />} />
            <Route path="/owner/analytics"    element={<Analytics />} />
          </Route>

          {/* Admin protected */}
          <Route element={<ProtectedRoute role="ADMIN" />}>
            <Route path="/admin"                element={<AdminDashboard />} />
            <Route path="/admin/venues/pending" element={<PendingVenues />} />
            <Route path="/admin/users"          element={<UserManagement />} />
            <Route path="/admin/analytics"      element={<AdminAnalytics />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
```

### Axios Instance
```typescript
// src/lib/axios.ts
import axios from 'axios';
import { useAuthStore } from '@/store/auth.store';

export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const { data } = await axios.post('/api/auth/refresh', {
          refreshToken: useAuthStore.getState().refreshToken,
        });
        useAuthStore.getState().setTokens(data.accessToken, data.refreshToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        useAuthStore.getState().logout();
      }
    }
    return Promise.reject(error);
  }
);
```

### Zustand Auth Store
```typescript
// src/store/auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken }),
      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),
      logout: () => set({ user: null, accessToken: null, refreshToken: null }),
    }),
    { name: 'bmv-auth' }
  )
);
```

---

## Environment Variables

### API (`apps/api/.env`)
```env
NODE_ENV=development
PORT=3000
CLIENT_URL=http://localhost:3001

# PostgreSQL
DATABASE_URL=postgresql://postgres:password@localhost:5432/bookmyvenue

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_ACCESS_SECRET=change_this_access_secret
JWT_REFRESH_SECRET=change_this_refresh_secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Email
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASS=your_resend_api_key
EMAIL_FROM=noreply@bookmyvenue.in
```

### Web (`apps/web/.env`)
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_GOOGLE_MAPS_KEY=your_maps_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

All `VITE_` prefixed variables are exposed to the browser bundle. Never put secrets in `VITE_` variables.

---

## Error Handling Convention

```typescript
// src/lib/errors.ts
export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500
  ) {
    super(message);
  }
}

// src/middleware/error.middleware.ts — register LAST in app.ts
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message, statusCode: err.statusCode },
    });
  }
  // TypeORM errors
  if (err.name === 'QueryFailedError') {
    return res.status(400).json({
      success: false,
      error: { code: 'DB_ERROR', message: 'Database operation failed.', statusCode: 400 },
    });
  }
  return res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong.', statusCode: 500 },
  });
};
```

All success responses:
```json
{ "success": true, "data": {}, "meta": { "page": 1, "limit": 12, "total": 80 } }
```

---

## Booking Flow — Business Rules

1. User selects venue + date + time slot
2. System checks `Availability` entity — slot must be `available: true`
3. Booking created with `status: PENDING`
4. Payment initiated via Razorpay — order created, `Payment` row inserted
5. Razorpay webhook fires on success → booking → `CONFIRMED`, slot → `available: false`
6. If payment not confirmed within 15 min → BullMQ job auto-cancels booking
7. Cancellation refund policy:
   - > 24h before event → 100% refund
   - 12–24h before event → 50% refund
   - < 12h before event → no refund
8. Venue owner notified on new booking; can accept/decline within 2 hours

**Race condition prevention:** Acquire a Redis distributed lock on `venue:{id}:date:{date}:slot:{time}` before writing to `Availability`. Release lock after save. Reject if lock cannot be acquired.

---

## UI Color System

```css
/* Tailwind custom tokens — add to tailwind.config.ts */
--color-primary:      #0D9488;   /* Teal — primary CTAs, links */
--color-primary-dark: #0F766E;   /* Teal hover */
--color-accent:       #F59E0B;   /* Amber — badges, highlights */
--color-navy:         #0F172A;   /* Dark navy — headings, sidebar bg */
--color-bg:           #F8FAFC;   /* Page background */
--color-surface:      #FFFFFF;   /* Cards, modals */
--color-border:       #E2E8F0;   /* Input borders, dividers */
--color-text:         #334155;   /* Body text */
--color-muted:        #94A3B8;   /* Captions, secondary labels */
--color-success:      #059669;   /* Confirmed, approved */
--color-error:        #DC2626;   /* Errors, cancellations */
--color-warning:      #D97706;   /* Pending states */
```

---

## Coding Standards

### General
- All code in **TypeScript** — no `any` types allowed
- Use `async/await` — never `.then()` chains
- All TypeORM repository calls stay in the **service layer** only
- All `process.env` access through a typed `config` object in `src/config/env.ts`
- No `console.log` in production code — use `pino` logger

### TypeORM Specific
- Always use **migrations** — never `synchronize: true` in staging/production
- Use `QueryRunner` for multi-step transactions to ensure atomicity
- Eager loading is off by default — always specify `relations` explicitly
- Use `@Index` decorator on foreign keys and frequently queried columns

### Naming Conventions
- Files: `kebab-case.ts`
- Classes & Entities: `PascalCase`
- Functions & variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- API routes: `kebab-case` (`/venue-listings` not `/venueListings`)
- React components: `PascalCase.tsx`
- React hooks: `useXxx.ts`

### Git Conventions
```
feat:     new feature
fix:      bug fix
chore:    tooling, config, deps
docs:     documentation only
refactor: no behaviour change
test:     adding/updating tests
```

Branch naming: `feat/venue-search`, `fix/booking-race-condition`, `chore/typeorm-migration`

---

## Development Setup

```bash
# 1. Clone
git clone https://github.com/WeCode-Community-Dev/BookMyVenue.git
cd BookMyVenue

# 2. Install all workspace dependencies
npm install

# 3. Start PostgreSQL + Redis
docker-compose up -d

# 4. API setup
cd apps/api
cp .env.example .env          # fill in values
npx typeorm migration:run -d src/config/database.ts
npm run seed                  # seed demo venues
npm run dev                   # http://localhost:3000

# 5. Web setup (new terminal)
cd apps/web
cp .env.example .env
npm run dev                   # http://localhost:3001
```

### package.json Scripts (API)
```json
{
  "scripts": {
    "dev":              "ts-node-dev --respawn src/app.ts",
    "build":            "tsc",
    "start":            "node dist/app.js",
    "migration:gen":    "typeorm migration:generate src/migrations/$npm_config_name -d src/config/database.ts",
    "migration:run":    "typeorm migration:run -d src/config/database.ts",
    "migration:revert": "typeorm migration:revert -d src/config/database.ts",
    "seed":             "ts-node src/seeds/run.ts",
    "test":             "jest",
    "test:api":         "jest --testPathPattern=integration"
  }
}
```

### package.json Scripts (Web)
```json
{
  "scripts": {
    "dev":     "vite",
    "build":   "tsc && vite build",
    "preview": "vite preview",
    "lint":    "eslint src --ext .ts,.tsx"
  }
}
```

---

## Testing Strategy

- **Unit tests:** Service layer (Jest + TypeORM in-memory or test DB)
- **Integration tests:** API endpoints (Supertest + isolated test DB)
- **Component tests:** React components (Vitest + React Testing Library)
- **E2E tests:** Phase 3+ (Playwright — register → search → book → pay)

```bash
npm run test          # unit (api)
npm run test:api      # integration (api)
npm run test          # component (web, uses Vitest)
```

---

## Phase 1 MVP Checklist

- [ ] TypeORM DataSource connected + all entities migrated
- [ ] User registration and login (email + Google OAuth)
- [ ] JWT auth middleware + RBAC role guard working
- [ ] Venue listing with seed data (10–15 Kerala venues)
- [ ] Location-based nearby search (Haversine via raw query)
- [ ] Venue detail page (photos, amenities, pricing, capacity)
- [ ] Filter by type, capacity, price, date
- [ ] Availability check for a selected date
- [ ] Booking creation (payment optional for MVP)
- [ ] Booking history page
- [ ] Venue owner: submit listing, edit, manage availability
- [ ] Admin: approve/reject venue listings
- [ ] React + Vite frontend with React Router v6 routing
- [ ] Responsive mobile-first UI (Tailwind)

---

## Key Architecture Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Frontend | React + Vite | Fast HMR, flexible SPA, easy contributor onboarding |
| ORM | TypeORM | Decorator-based, TypeScript-native, supports migrations |
| Database | PostgreSQL | JSONB for slots, PostGIS-ready for geo queries later |
| State | Zustand + TanStack Query | Minimal boilerplate, separates server vs client state |
| Payments | Razorpay | India-first, supports UPI, strong webhook support |
| Maps | Phase 3 | Haversine formula sufficient for Phase 1 nearby search |

---

## Community

- **Discord:** WeCode Premium Discord → `#book-my-venue`
- **WhatsApp:** WeCode Community Group (major announcements only)
- **GitHub Issues:** Feature proposals, bugs, questions — open an issue before starting work
- **PRs:** Read `CONTRIBUTING.md` before raising a PR

---

*Last updated: May 2026 — WeCode Community*