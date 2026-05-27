import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Role } from '@/types';
import { Toaster } from '@/components/ui/Toaster';
import { PageSpinner } from '@/components/ui/Spinner';

const Home = lazy(() => import('@/pages/Home'));
const Venues = lazy(() => import('@/pages/Venues'));
const VenueDetail = lazy(() => import('@/pages/VenueDetail'));
const BookingFlow = lazy(() => import('@/pages/BookingFlow'));
const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));
const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'));
const Bookings = lazy(() => import('@/pages/dashboard/Bookings'));
const BookingDetail = lazy(() => import('@/pages/dashboard/BookingDetail'));
const OwnerDashboard = lazy(() => import('@/pages/owner/OwnerDashboard'));
const MyVenues = lazy(() => import('@/pages/owner/MyVenues'));
const AddVenue = lazy(() => import('@/pages/owner/AddVenue'));
const EditVenue = lazy(() => import('@/pages/owner/EditVenue'));
const OwnerBookings = lazy(() => import('@/pages/owner/OwnerBookings'));
const Analytics = lazy(() => import('@/pages/owner/Analytics'));
const ManageAvailability = lazy(() => import('@/pages/owner/ManageAvailability'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const PendingVenues = lazy(() => import('@/pages/admin/PendingVenues'));
const UserManagement = lazy(() => import('@/pages/admin/UserManagement'));
const AdminAnalytics = lazy(() => import('@/pages/admin/AdminAnalytics'));

function Fallback() {
  return <div className="min-h-screen flex items-center justify-center"><PageSpinner /></div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <Suspense fallback={<Fallback />}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/venues" element={<Venues />} />
          <Route path="/venues/:id" element={<VenueDetail />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />

          {/* User protected — inside DashboardLayout */}
          <Route element={<ProtectedRoute role={Role.USER} />}>
            <Route path="/venues/:id/book" element={<BookingFlow />} />
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/bookings" element={<Bookings />} />
              <Route path="/dashboard/bookings/:id" element={<BookingDetail />} />
            </Route>
          </Route>

          {/* Owner protected — inside DashboardLayout */}
          <Route element={<ProtectedRoute role={Role.OWNER} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/owner" element={<OwnerDashboard />} />
              <Route path="/owner/venues" element={<MyVenues />} />
              <Route path="/owner/venues/new" element={<AddVenue />} />
              <Route path="/owner/venues/:id/edit" element={<EditVenue />} />
              <Route path="/owner/bookings" element={<OwnerBookings />} />
              <Route path="/owner/availability" element={<ManageAvailability />} />
              <Route path="/owner/analytics" element={<Analytics />} />
            </Route>
          </Route>

          {/* Admin protected — inside DashboardLayout */}
          <Route element={<ProtectedRoute role={Role.ADMIN} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/venues/pending" element={<PendingVenues />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
