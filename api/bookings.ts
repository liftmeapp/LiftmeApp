import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';
import { Router } from 'express';
import { BookingsController } from './controllers/bookings.controller';

const bookingsRouter = Router();

bookingsRouter.use(ClerkExpressWithAuth());

// ===================================================================
//  USER ROUTES
// ===================================================================
bookingsRouter.get('/bookings/history', BookingsController.fetchUserHistory);
bookingsRouter.get('/bookings/active', BookingsController.fetchActiveBookings);

// ===================================================================
//  SPARE PART SELLER ROUTES
// ===================================================================
bookingsRouter.get('/spare-parts/orders', BookingsController.fetchSparePartOrders);
bookingsRouter.post('/bookings/:bookingId/accept-spare-part', BookingsController.acceptSparePart);
bookingsRouter.post('/bookings/:bookingId/complete-spare-part', BookingsController.completeSparePart);

// ===================================================================
//  PROVIDER-FACING BOOKING ROUTES
// ===================================================================
bookingsRouter.get('/garage/bookings', BookingsController.fetchGarageBookings);
bookingsRouter.get('/tow-truck/bookings', BookingsController.fetchTowTruckBookings);

bookingsRouter.post('/bookings/:id/accept', BookingsController.acceptBooking);
bookingsRouter.post('/bookings/:id/accept-tow-in', BookingsController.acceptTowInBooking);
bookingsRouter.post('/bookings/:id/accept-tow', BookingsController.acceptTowBooking);
bookingsRouter.post('/bookings/:id/decline', BookingsController.declineBooking);
bookingsRouter.post('/bookings/:id/decline-tow', BookingsController.declineTowBooking);

// ===================================================================
//  OTP VERIFICATION
// ===================================================================
bookingsRouter.post('/bookings/:id/verify-otp', BookingsController.verifyOtp);

export default bookingsRouter;
