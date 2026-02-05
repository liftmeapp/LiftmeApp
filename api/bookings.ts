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
bookingsRouter.get('/bookings/:id/status', BookingsController.fetchBookingStatus);
bookingsRouter.post('/bookings/request-service', BookingsController.requestService);
bookingsRouter.post('/bookings/request-towing', BookingsController.requestTowing);
bookingsRouter.post('/bookings/request-tow-to-garage', BookingsController.requestTowToGarage);
bookingsRouter.post('/bookings/:bookingId/create-payment-intent', BookingsController.createPaymentIntent);
bookingsRouter.post('/bookings/:bookingId/confirm-payment', BookingsController.confirmPayment);
bookingsRouter.post('/bookings/:bookingId/confirm-cash', BookingsController.confirmCash);
bookingsRouter.post('/bookings/:bookingId/cancel-by-user', BookingsController.cancelByUser);
bookingsRouter.post('/bookings/:bookingId/cancel-by-provider', BookingsController.cancelByProvider);
bookingsRouter.post('/bookings/:bookingId/cancel', BookingsController.cancelByProvider); // legacy alias used by tow dashboard
bookingsRouter.post('/bookings/:bookingId/submit-quote', BookingsController.submitQuote);
bookingsRouter.post('/bookings/:bookingId/submit-final-quote', BookingsController.submitFinalQuote);
bookingsRouter.post('/bookings/:bookingId/approve-quote', BookingsController.approveQuote);
bookingsRouter.post('/bookings/:bookingId/reject-quote', BookingsController.rejectQuote);

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
bookingsRouter.post('/tow-truck/bookings/:id/accept', BookingsController.acceptTowBooking); // legacy alias
bookingsRouter.post('/tow-truck/bookings/:id/decline', BookingsController.declineTowBooking); // legacy alias

// ===================================================================
//  OTP VERIFICATION
// ===================================================================
bookingsRouter.post('/bookings/:id/request-completion-otp', BookingsController.requestCompletionOtp);
bookingsRouter.post('/bookings/:id/verify-otp', BookingsController.verifyOtp);
bookingsRouter.post('/bookings/:id/verify-otp-tow', BookingsController.verifyTowOtp);

export default bookingsRouter;
