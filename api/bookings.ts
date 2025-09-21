
import { io, providerSockets, customerSockets } from './socket';
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';

import { Client } from '@googlemaps/google-maps-services-js';
import { BookingStatus } from '@prisma/client';
import { randomUUID } from 'crypto';
import { Request, Response, Router } from 'express';
import Stripe from 'stripe';
import prisma from './lib/prisma';

const bookingsRouter = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' });
const googleMapsClient = new Client();

bookingsRouter.use(ClerkExpressWithAuth());

function generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

interface GeoJSONPoint {
    type: 'Point';
    coordinates: [number, number];
}

function isGeoJSONPoint(obj: any): obj is GeoJSONPoint {
    return obj && typeof obj === 'object' && obj.type === 'Point' && Array.isArray(obj.coordinates) &&
           obj.coordinates.length === 2 && typeof obj.coordinates[0] === 'number' && typeof obj.coordinates[1] === 'number';
}

async function getEtaAndDistance(
    origin: { lat: number; lon: number }, destination: { lat: number; lon: number }) {
    try {
        const response = await googleMapsClient.directions({
            params: {
                origin: `${origin.lat},${origin.lon}`,
                destination: `${destination.lat},${destination.lon}`,
                key: process.env.GOOGLE_MAPS_API_KEY!,
            },
            timeout: 1000,
        });
        if (response.data.routes.length > 0 && response.data.routes[0].legs.length > 0) {
            const leg = response.data.routes[0].legs[0];
            return {
                etaMinutes: Math.round(leg.duration.value / 60),
                distanceKm: Math.round(leg.distance.value / 1000),
            };
        }
        return { etaMinutes: null, distanceKm: null };
    } catch (error) {
        console.error("Google Directions API Error:", error);
        return { etaMinutes: null, distanceKm: null };
    }
}

// ===================================================================
//  PROVIDER-FACING BOOKING ROUTES
// ===================================================================

bookingsRouter.get('/garage/bookings', async (req: Request, res: Response) => {
    const garageOwnerId = req.auth.userId;
    const statuses = (req.query.status as string)?.split(',').filter(s => Object.values(BookingStatus).includes(s as BookingStatus)) as BookingStatus[];

    if (!garageOwnerId) return res.status(401).json({ error: "Unauthorized" });
    if (!statuses || statuses.length === 0) {
        return res.status(400).json({ error: "At least one valid booking status is required." });
    }
    
    try {
        const user = await prisma.user.findUnique({ where: { clerkId: garageOwnerId } });
        if (!user) return res.status(404).json({ error: "User not found." });
        
        const garage = await prisma.garage.findUnique({ where: { ownerId: user.id } });
        if (!garage) return res.status(404).json({ error: "Garage profile not found." });

        let bookings: any[]; // Declare bookings here

        const isSearching = statuses.includes(BookingStatus.SEARCHING);
        const otherStatuses = statuses.filter(s => s !== BookingStatus.SEARCHING);

        bookings = await prisma.booking.findMany({
            where: {
                OR: [
                    { garageId: garage.id, status: { in: statuses } },
                    { status: BookingStatus.SEARCHING, eligibleProviderIds: { has: garage.id }, expiresAt: { gt: new Date() } }
                ]
            },
            include: { user: true, vehicle: true, service: true },
            orderBy: { bookedAt: 'desc' }
        });
        
        return res.status(200).json(bookings);

    } catch (error: any) {
        console.error("Failed to fetch garage bookings:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

bookingsRouter.get('/tow-truck/bookings', async (req: Request, res: Response) => {
    const towTruckOwnerId = req.auth.userId;
    const statuses = (req.query.status as string)?.split(',').filter(s => Object.values(BookingStatus).includes(s as BookingStatus)) as BookingStatus[];

    if (!towTruckOwnerId) return res.status(401).json({ error: "Unauthorized" });
    if (!statuses || statuses.length === 0) {
        return res.status(400).json({ error: "A valid booking status is required." });
    }
    
    try {
        const user = await prisma.user.findUnique({ where: { clerkId: towTruckOwnerId } });
        if (!user) return res.status(404).json({ error: "User not found." });
        
        const towTruck = await prisma.towTruck.findUnique({ where: { ownerId: user.id } });
        if (!towTruck) return res.status(404).json({ error: "Tow Truck profile not found." });

        let bookings: any[]; // Declare bookings here

        const isSearching = statuses.includes(BookingStatus.SEARCHING);
        const otherStatuses = statuses.filter(s => s !== BookingStatus.SEARCHING);

        bookings = await prisma.booking.findMany({
            where: {
                OR: [
                    { towTruckId: towTruck.id, status: { in: statuses } },
                    { status: BookingStatus.SEARCHING, eligibleProviderIds: { has: towTruck.id }, expiresAt: { gt: new Date() } }
                ]
            },
            include: { user: true, vehicle: true },
            orderBy: { bookedAt: 'desc' }
        });
        
        return res.status(200).json(bookings);

    } catch (error: any) {
        console.error("Failed to fetch tow truck bookings:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

bookingsRouter.post('/bookings/:id/accept', async (req: Request, res: Response) => {
    const { id: bookingId } = req.params;
    const garageOwnerId = req.auth.userId;
    
    try {
        const garage = await prisma.garage.findFirst({ where: { owner: {clerkId: garageOwnerId} } });
        if (!garage) return res.status(403).json({ error: "Garage profile not found."});

        const bookingToAccept = await prisma.booking.findUnique({ where: { id: bookingId } });
        if (!bookingToAccept) return res.status(404).json({ error: "Booking request not found." });

        if (bookingToAccept.status !== BookingStatus.SEARCHING) {
            return res.status(409).json({ error: "This request has already been handled by another provider." });
        }
        if (bookingToAccept.expiresAt && new Date() > bookingToAccept.expiresAt) {
            return res.status(410).json({ error: "This request has expired." });
        }
        if (!bookingToAccept.eligibleProviderIds.includes(garage.id)) {
            return res.status(403).json({ error: "Your garage is not eligible for this request." });
        }

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: BookingStatus.AWAITING_PAYMENT,
                garage: { connect: { id: garage.id } },
                eligibleProviderIds: [],
                expiresAt: null,
                paymentExpiresAt: new Date(Date.now() + 6 * 60 * 1000),
            },
            include: { user: true, garage: true }
        });

        // --- Notify customer via WebSocket ---
        const customerSocketId = customerSockets[updatedBooking.user.clerkId];
        if (customerSocketId) {
            io.to(customerSocketId).emit('booking_accepted', {
                bookingId: updatedBooking.id,
                provider: updatedBooking.garage
            });
            console.log(`📬 Emitted 'booking_accepted' to customer ${updatedBooking.user.clerkId}`);
        }

        return res.status(200).json({ success: true, booking: updatedBooking });

    } catch (error: any) {
        console.error("Failed to accept booking:", error);
        return res.status(500).json({ error: 'An internal server error occurred.' });
    }
});

bookingsRouter.post('/bookings/:id/accept-tow', async (req: Request, res: Response) => {
    const { id: bookingId } = req.params;
    const towTruckOwnerId = req.auth.userId;
    
    try {
        const towTruck = await prisma.towTruck.findFirst({ where: { owner: {clerkId: towTruckOwnerId} } });
        if (!towTruck) return res.status(403).json({ error: "Tow Truck profile not found."});

        const bookingToAccept = await prisma.booking.findUnique({ where: { id: bookingId } });
        if (!bookingToAccept) return res.status(404).json({ error: "Booking request not found." });

        if (bookingToAccept.status !== BookingStatus.SEARCHING) {
            return res.status(409).json({ error: "This request has already been handled by another provider." });
        }
        if (bookingToAccept.expiresAt && new Date() > bookingToAccept.expiresAt) {
            return res.status(410).json({ error: "This request has expired." });
        }
        if (!bookingToAccept.eligibleProviderIds.includes(towTruck.id)) {
            return res.status(403).json({ error: "Your tow truck is not eligible for this request." });
        }

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: BookingStatus.AWAITING_PAYMENT,
                towTruck: { connect: { id: towTruck.id } },
                eligibleProviderIds: [],
                expiresAt: null,
                paymentExpiresAt: new Date(Date.now() + 6 * 60 * 1000),
            },
            include: { user: true, towTruck: true }
        });

        // --- Notify customer via WebSocket ---
        const customerSocketId = customerSockets[updatedBooking.user.clerkId];
        if (customerSocketId) {
            io.to(customerSocketId).emit('booking_accepted', {
                bookingId: updatedBooking.id,
                provider: updatedBooking.towTruck
            });
            console.log(`📬 Emitted 'booking_accepted' to customer ${updatedBooking.user.clerkId}`);
        }

        return res.status(200).json({ success: true, booking: updatedBooking });

    } catch (error: any) {
        console.error("Failed to accept tow booking:", error);
        return res.status(500).json({ error: 'An internal server error occurred.' });
    }
});

bookingsRouter.post('/bookings/:id/decline', async (req: Request, res: Response) => {
    const { id: bookingId } = req.params;
    const garageOwnerId = req.auth.userId;

    try {
        const garage = await prisma.garage.findFirst({ where: { owner: { clerkId: garageOwnerId } } });
        if (!garage) return res.status(403).json({ error: "Garage profile not found." });
        
        const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
        if (!booking || booking.status !== 'SEARCHING') {
            return res.status(404).json({ error: 'Request is no longer active.' });
        }

        const updatedEligibleIds = booking.eligibleProviderIds.filter(id => id !== garage.id);

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                eligibleProviderIds: updatedEligibleIds,
                status: updatedEligibleIds.length === 0 ? BookingStatus.CANCELLED : booking.status,
            },
        });

        return res.status(200).json({ success: true, status: updatedBooking.status });

    } catch (error) {
        console.error("Failed to decline booking:", error);
        return res.status(500).json({ error: 'An internal server error occurred' });
    }
});

bookingsRouter.post('/bookings/:id/decline-tow', async (req: Request, res: Response) => {
    const { id: bookingId } = req.params;
    const towTruckOwnerId = req.auth.userId;

    try {
        const towTruck = await prisma.towTruck.findFirst({ where: { owner: { clerkId: towTruckOwnerId } } });
        if (!towTruck) return res.status(403).json({ error: "Tow Truck profile not found." });
        
        const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
        if (!booking || booking.status !== 'SEARCHING') {
            return res.status(404).json({ error: 'Request is no longer active.' });
        }

        const updatedEligibleIds = booking.eligibleProviderIds.filter(id => id !== towTruck.id);

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                eligibleProviderIds: updatedEligibleIds,
                status: updatedEligibleIds.length === 0 ? BookingStatus.CANCELLED : booking.status,
            },
        });

        return res.status(200).json({ success: true, status: updatedBooking.status });

    } catch (error) {
        console.error("Failed to decline tow booking:", error);
        return res.status(500).json({ error: 'An internal server error occurred' });
    }
});

bookingsRouter.post('/bookings/:id/verify-otp', async (req: Request, res: Response) => {
    const { id: bookingId } = req.params;
    const { otp } = req.body;
    const garageOwnerId = req.auth.userId;

    if (!otp) return res.status(400).json({ error: "OTP is required." });

    try {
        const booking = await prisma.booking.findFirst({
            where: { id: bookingId, garage: { owner: { clerkId: garageOwnerId } } }
        });

        if (!booking) return res.status(404).json({ error: "Booking not found or not assigned to you." });
        if (booking.status !== 'CONFIRMED') return res.status(409).json({ error: 'Booking is not in a verifiable state.' });
        if (booking.otp !== otp) return res.status(400).json({ error: 'Invalid OTP provided.' });
        if (booking.otpExpiresAt && new Date() > booking.otpExpiresAt) return res.status(410).json({ error: 'The OTP has expired.' });
        if (!booking.paymentIntentId) return res.status(400).json({ error: 'Cannot complete service: Payment Intent not found.' });

        await stripe.paymentIntents.capture(booking.paymentIntentId);

        await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: BookingStatus.IN_PROGRESS,
                paymentStatus: 'paid',
                serviceStartedAt: new Date(),
                otp: null,
                otpExpiresAt: null,
            }
        });

        return res.status(200).json({ success: true, message: 'Service started and payment captured successfully.' });

    } catch (error: any) {
        console.error("Failed to verify OTP and capture payment:", error);
        if (error instanceof Stripe.errors.StripeError) {
            return res.status(402).json({ error: `Payment capture failed: ${error.message}` });
        }
        return res.status(500).json({ error: 'An internal server error occurred' });
    }
});

bookingsRouter.post('/bookings/:id/verify-otp-tow', async (req: Request, res: Response) => {
    const { id: bookingId } = req.params;
    const { otp } = req.body;
    const towTruckOwnerId = req.auth.userId;

    if (!otp) return res.status(400).json({ error: "OTP is required." });

    try {
        const booking = await prisma.booking.findFirst({
            where: { id: bookingId, towTruck: { owner: { clerkId: towTruckOwnerId } } }
        });

        if (!booking) return res.status(404).json({ error: "Booking not found or not assigned to you." });
        if (booking.status !== 'CONFIRMED') return res.status(409).json({ error: 'Booking is not in a verifiable state.' });
        if (booking.otp !== otp) return res.status(400).json({ error: 'Invalid OTP provided.' });
        if (booking.otpExpiresAt && new Date() > booking.otpExpiresAt) return res.status(410).json({ error: 'The OTP has expired.' });
        if (!booking.paymentIntentId) return res.status(400).json({ error: 'Cannot complete service: Payment Intent not found.' });

        await stripe.paymentIntents.capture(booking.paymentIntentId);

        await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: BookingStatus.IN_PROGRESS,
                paymentStatus: 'paid',
                serviceStartedAt: new Date(),
                otp: null,
                otpExpiresAt: null,
            }
        });

        return res.status(200).json({ success: true, message: 'Service started and payment captured successfully.' });

    } catch (error: any) {
        console.error("Failed to verify OTP and capture payment for tow booking:", error);
        if (error instanceof Stripe.errors.StripeError) {
            return res.status(402).json({ error: `Payment capture failed: ${error.message}` });
        }
        return res.status(500).json({ error: 'An internal server error occurred' });
    }
});

// ===================================================================
//  CUSTOMER-FACING BOOKING ROUTES
// ===================================================================

bookingsRouter.post('/bookings/request-service', async (req: Request, res: Response) => {
    const { serviceId, vehicleId, userLat, userLon } = req.body;
    const ownerId = req.auth.userId;

    if (!serviceId || !vehicleId || userLat == null || userLon == null || !ownerId) {
        return res.status(400).json({ reason: "Missing required parameters or not authenticated." });
    }

    const SEARCH_TIMEOUT_MINUTES = 5;

    try {
        const service = await prisma.service.findUnique({ where: { id: serviceId } });
        if (!service) return res.status(404).json({ reason: "Service not found." });
        
        const allGaragesOfferingService = await prisma.garage.findMany({
            where: { status: 'APPROVED', isOpen: true, services: { some: { serviceId: serviceId } } },
            include: { services: { include: { service: true } } }
        });

        const nearbyProviders = [];
        for (const garage of allGaragesOfferingService) {
            console.log(`[Geo-Check] Evaluating garage: ${garage.name} (ID: ${garage.id})`); // <-- ADDED LOG
            const garageLocation = (garage.location as any)?.coordinates;
            if (garageLocation) {
                try {
                    const { distanceKm } = await getEtaAndDistance({ lat: userLat, lon: userLon }, { lat: garageLocation[1], lon: garageLocation[0] });
                    console.log(`[Geo-Check] Calculated distance for ${garage.name}: ${distanceKm} km`); // <-- ADDED LOG
                    if (distanceKm !== null && distanceKm <= 30) {
                        nearbyProviders.push({ providerId: garage.id, price: garage.services.find(s => s.serviceId === serviceId)?.price || 0 });
                    }
                } catch (distanceError) {
                    console.warn(`Could not calculate distance for garage "${garage.name}". Error:`, distanceError);
                }
            } else {
                console.warn(`Garage "${garage.name}" has invalid location data.`);
            }
        }
        
        if (nearbyProviders.length === 0) {
            return res.status(404).json({ reason: `No garages were found within 30km that offer "${service.name}".` });
        }

        const user = await prisma.user.findUnique({ where: { clerkId: ownerId } });
        if (!user) return res.status(404).json({ reason: "User profile not found." });

        const newBooking = await prisma.booking.create({
            data: {
                status: BookingStatus.SEARCHING,
                user: { connect: { id: user.id } },
                vehicle: { connect: { id: vehicleId } },
                service: { connect: { id: serviceId } },
                basePrice: nearbyProviders[0].price,
                finalAmount: nearbyProviders[0].price,
                expiresAt: new Date(Date.now() + SEARCH_TIMEOUT_MINUTES * 60 * 1000),
                eligibleProviderIds: nearbyProviders.map(p => p.providerId),
                pickupLocation: { type: 'Point', coordinates: [userLon, userLat] },
            }
        });

        // --- Real-time notification logic ---
        const detailedBooking = await prisma.booking.findUnique({
            where: { id: newBooking.id },
            include: {
                user: { select: { firstName: true, lastName: true } },
                vehicle: true,
                service: true
            }
        });

        if (detailedBooking) {
            console.log(`[Socket.IO] Broadcasting booking ${detailedBooking.id} to ${detailedBooking.eligibleProviderIds.length} providers.`);
            const userLocation = { lat: userLat, lon: userLon };
            for (const providerId of detailedBooking.eligibleProviderIds) {
                try {
                    const garage = await prisma.garage.findUnique({ where: { id: providerId } });
                    if (garage && garage.location && isGeoJSONPoint(garage.location)) {
                        const garageLocation = { lat: garage.location.coordinates[1], lon: garage.location.coordinates[0] };
                        const { distanceKm } = await getEtaAndDistance(userLocation, garageLocation);

                        const socketId = providerSockets[providerId];
                        if (socketId) {
                            io.to(socketId).emit('new_booking', { ...detailedBooking, distance: distanceKm });
                            console.log(`📬 Emitted 'new_booking' to provider ${providerId} (garage) on socket ${socketId}`);
                        } else {
                            console.log(`- Provider ${providerId} is not connected.`);
                        }
                    }
                } catch (e) {
                    console.error(`Failed to process and emit for provider ${providerId}`, e);
                }
            }
        }
        // --- End of real-time logic ---
        
        return res.status(202).json({ bookingId: newBooking.id });

    } catch (error: any) {
        console.error("CRITICAL ERROR in /request-service:", error);
        return res.status(500).json({ reason: 'An internal server error occurred.', details: error.message });
    }
});

bookingsRouter.get('/bookings/:id/status', async(req: Request, res: Response) => {
    const { id } = req.params;
    const ownerId = req.auth.userId;

    try {
        let booking = await prisma.booking.findFirst({
            where: { id: id, user: { clerkId: ownerId } },
            include: {
                garage: { select: { id: true, name: true, rating: true, address: true, location: true } },
                towTruck: { select: { id: true, name: true, model: true, make: true, liveLocation: true } },
            }
        });

        if (!booking) return res.status(404).json({ error: "Booking not found."});

        if (booking.status === BookingStatus.AWAITING_PAYMENT && booking.paymentExpiresAt && new Date() > booking.paymentExpiresAt) {
            booking = await prisma.booking.update({
                where: { id: booking.id },
                data: { status: BookingStatus.CANCELLED },
                include: { garage: { select: { id: true, name: true, rating: true, address: true, location: true } } }
            });
            // TODO: Notify garage that the user failed to pay in time.
        }

        if (booking.status === BookingStatus.SEARCHING && booking.expiresAt && new Date() > booking.expiresAt) {
            booking = await prisma.booking.update({
                where: { id: booking.id },
                data: { status: BookingStatus.EXPIRED },
                include: { garage: { select: { id: true, name: true, rating: true, address: true, location: true } } }
            });
        }
        
        if (booking.status === BookingStatus.CONFIRMED && (booking.garage || booking.towTruck)) {
            const provider = booking.garage || booking.towTruck;
            const providerLocation = booking.garage?.location || booking.towTruck?.liveLocation;

            if (!isGeoJSONPoint(booking.pickupLocation) || !isGeoJSONPoint(providerLocation)) {
                return res.status(200).json({ status: booking.status, otp: booking.otp, provider: { ...provider, eta: null, distance: null }, finalPrice: booking.finalAmount, error: "Could not calculate ETA due to invalid location data." });
            }

            const userCoords = booking.pickupLocation.coordinates;
            const providerCoords = providerLocation.coordinates;
            
            const { etaMinutes, distanceKm } = await getEtaAndDistance({ lat: userCoords[1], lon: userCoords[0] }, { lat: providerCoords[1], lon: providerCoords[0] });
            
            return res.status(200).json({
                status: booking.status,
                otp: booking.otp,
                provider: { ...provider, eta: etaMinutes, distance: distanceKm },
                finalPrice: booking.finalAmount
            });
        }

        return res.status(200).json({ status: booking.status, provider: booking.garage, finalPrice: booking.finalAmount });

    } catch (error: any) {
         console.error("Failed to get booking status:", error);
        return res.status(500).json({ error: 'An internal server error occurred.', details: error.message });
    }
});

bookingsRouter.post('/bookings/:bookingId/confirm-payment', async (req: Request, res: Response) => {
    const { bookingId } = req.params;
    const customerClerkId = req.auth.userId;

    if (!customerClerkId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const booking = await prisma.booking.findFirst({
            where: { id: bookingId, user: { clerkId: customerClerkId } }
        });

        if (!booking) return res.status(404).json({ error: 'Booking not found.' });
        if (booking.status !== 'AWAITING_PAYMENT') return res.status(409).json({ error: 'This booking is not awaiting payment.' });
        if (booking.paymentExpiresAt && new Date() > booking.paymentExpiresAt) return res.status(410).json({ error: 'The payment window for this booking has expired.' });
        if (!booking.paymentIntentId) return res.status(400).json({ error: 'Payment has not been initiated for this booking.' });

        const intent = await stripe.paymentIntents.retrieve(booking.paymentIntentId);
        if (intent.status !== 'requires_capture') {
            return res.status(400).json({ error: 'Payment could not be authorized. Please try again.' });
        }

        const otp = generateOtp();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: BookingStatus.CONFIRMED,
                paymentStatus: 'authorized',
                paymentExpiresAt: null,
                otp: otp,
                otpExpiresAt: otpExpiresAt,
            }
        });

        // TODO: Notify garage that payment is authorized and they can proceed.
        return res.status(200).json({ success: true, booking: updatedBooking });

    } catch (error: any) {
        console.error("Failed to confirm payment:", error);
        return res.status(500).json({ error: 'An internal server error occurred' });
    }
});

bookingsRouter.post('/bookings/:bookingId/create-payment-intent', async (req: Request, res: Response) => {
    const { bookingId } = req.params;
    const customerClerkId = req.auth.userId;

    if (!customerClerkId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { garage: true, towTruck: true, user: true },
        });

        if (!booking || booking.user.clerkId !== customerClerkId) {
            return res.status(404).json({ error: 'Booking not found or not owned by user.' });
        }

        const provider = booking.garage || booking.towTruck;
        if (!provider || !provider.stripeAccountId) {
            return res.status(400).json({ error: 'Provider is not set up to receive payments.' });
        }

        let stripeCustomerId = booking.user.stripeCustomerId;
        if (!stripeCustomerId) {
            const customer = await stripe.customers.create({ email: booking.user.email, name: `${booking.user.firstName} ${booking.user.lastName}` });
            stripeCustomerId = customer.id;
            await prisma.user.update({ where: { id: booking.user.id }, data: { stripeCustomerId } });
        }

        const amountInCents = Math.round(booking.finalAmount * 100);
        const applicationFee = Math.round(amountInCents * 0.10);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: 'inr',
            customer: stripeCustomerId,
            application_fee_amount: applicationFee,
            transfer_data: {
                destination: provider.stripeAccountId,
            },
            capture_method: 'manual',
            metadata: {
                bookingId: booking.id,
                userId: booking.user.id,
            }
        });

        await prisma.booking.update({ where: { id: bookingId }, data: { paymentIntentId: paymentIntent.id }});

        return res.status(200).json({ clientSecret: paymentIntent.client_secret });

    } catch (error: any) {
         console.error("Payment Intent Error:", error);
        return res.status(500).json({ error: error.message });
    }
});

// ===================================================================
//  CANCELLATION & REFUND ROUTES
// ===================================================================

bookingsRouter.post('/bookings/:bookingId/cancel-by-user', async (req: Request, res: Response) => {
    const { bookingId } = req.params;
    const customerClerkId = req.auth.userId;

    if (!customerClerkId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const booking = await prisma.booking.findFirst({
            where: { id: bookingId, user: { clerkId: customerClerkId } }
        });

        if (!booking) return res.status(404).json({ error: 'Booking not found.' });

        const cancellableStatuses = [
            BookingStatus.SEARCHING,
            BookingStatus.AWAITING_PAYMENT,
            BookingStatus.CONFIRMED,
        ];

        if (!cancellableStatuses.includes(booking.status)) {
            return res.status(403).json({ error: 'This booking cannot be cancelled at its current stage.' });
        }

        // If confirmed, only allow cancellation within 2 minutes.
        if (booking.status === BookingStatus.CONFIRMED) {
            const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
            if (booking.updatedAt < twoMinutesAgo) {
                return res.status(403).json({ error: 'This booking was confirmed more than 2 minutes ago and can no longer be cancelled.' });
            }
        }

        if (booking.paymentIntentId && booking.paymentIntentId.startsWith('pi_')) {
            const intent = await stripe.paymentIntents.retrieve(booking.paymentIntentId);
            if (intent.status === 'requires_capture') {
                await stripe.paymentIntents.cancel(booking.paymentIntentId);
            }
        }

        await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: BookingStatus.CANCELLED,
                cancellationReason: 'Cancelled by user.',
            }
        });

        // TODO: Notify garage of the cancellation.
        return res.status(200).json({ success: true, message: 'Booking cancelled.' });

    } catch (error: any) {
        console.error("Failed to cancel booking by user:", error);
        return res.status(500).json({ error: 'An internal server error occurred' });
    }
});

bookingsRouter.post('/bookings/:bookingId/cancel-by-provider', async (req: Request, res: Response) => {
    const { bookingId } = req.params;
    const { reason } = req.body;
    const providerClerkId = req.auth.userId;

    if (!reason) return res.status(400).json({ error: 'A reason for cancellation is required.' });

    try {
        const booking = await prisma.booking.findFirst({
            where: {
                id: bookingId,
                OR: [
                    { garage: { owner: { clerkId: providerClerkId } } },
                    { towTruck: { owner: { clerkId: providerClerkId } } },
                ],
            },
            include: { garage: true, towTruck: true },
        });

        if (!booking || (!booking.garage && !booking.towTruck)) return res.status(404).json({ error: 'Booking not found or you are not the assigned provider.' });

        if (![BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS].includes(booking.status)) {
            return res.status(403).json({ error: 'This booking cannot be cancelled at its current stage.' });
        }

        if (booking.paymentIntentId && booking.paymentIntentId.startsWith('pi_')) {
            if (booking.paymentStatus === 'paid') {
                await stripe.refunds.create({ payment_intent: booking.paymentIntentId });
            } else if (booking.paymentStatus === 'authorized') {
                await stripe.paymentIntents.cancel(booking.paymentIntentId);
            }
        }

        await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: BookingStatus.CANCELLED,
                paymentStatus: booking.paymentStatus === 'paid' ? 'refunded' : 'cancelled',
                cancellationReason: reason,
            }
        });

        // TODO: Notify user of the cancellation and refund.
        return res.status(200).json({ success: true, message: 'Booking cancelled and refund processed.' });

    } catch (error: any) {
        console.error("Failed to cancel booking by provider:", error);
        return res.status(500).json({ error: 'An internal server error occurred' });
    }
});

bookingsRouter.post(
    '/bookings/request-towing',
    async (req: Request, res: Response) => {
        console.log("--- [API] Received /request-towing ---");
        const { vehicleId, vehicleType, pickup, destination } = req.body;
        console.log("[API] Towing Request Body:", JSON.stringify(req.body));
        const ownerId = req.auth.userId;

        if (!vehicleId || !vehicleType || !pickup?.latitude || !destination?.latitude) {
            console.log("🔴 [API] Towing validation failed: Missing required parameters.");
            return res.status(400).json({ reason: "Missing required parameters for towing." });
        }

        const SEARCH_TIMEOUT_MINUTES = 6;

        try {
            const user = await prisma.user.findUnique({ where: { clerkId: ownerId } });
            if (!user) return res.status(404).json({ reason: "User profile not found." });

            console.log(`[API] Finding nearby tow trucks for a ${vehicleType} near pickup location.`);

            // Find all available tow trucks within 30km of the pickup location
            const nearbyTrucksRaw = await prisma.liveTruckLocation.aggregateRaw({
                pipeline: [
                    {
                        '$geoNear': {
                            near: { type: "Point", coordinates: [pickup.longitude, pickup.latitude] },
                            distanceField: "distance",
                            maxDistance: 30000, // 30km in meters
                            query: { isAvailable: true },
                            spherical: true
                        }
                    },
                    { '$limit': 20 }
                ]
            });

            console.log('[Geo-Check] Raw nearby trucks found by $geoNear:', JSON.stringify(nearbyTrucksRaw)); // <-- ADDED LOG

            if (!Array.isArray(nearbyTrucksRaw) || nearbyTrucksRaw.length === 0) {
                 return res.status(404).json({ reason: "No tow trucks are available in your area right now." });
            }

            // Now, filter these nearby trucks to find which ones can service the required vehicleType
            const nearbyTruckIds = nearbyTrucksRaw.map((truck: any) => truck.towTruckId.$oid);
            const eligibleTrucks = await prisma.towTruck.findMany({
                where: {
                    id: { in: nearbyTruckIds },
                    status: 'APPROVED',
                    services: { some: { vehicleType: vehicleType } }
                },
                include: {
                    services: { where: { vehicleType: vehicleType } }
                }
            });

            if (eligibleTrucks.length === 0) {
                return res.status(404).json({ reason: `No tow trucks found nearby that can handle a ${vehicleType}.` });
            }
            
            console.log(`[API] Found ${eligibleTrucks.length} eligible tow trucks. Broadcasting request...`);

            const eligibleProviderIds = eligibleTrucks.map(truck => truck.id);
            const basePrice = eligibleTrucks[0].services[0].price; // Use price from the first eligible truck as a baseline

            const newBooking = await prisma.booking.create({
                data: {
                    status: BookingStatus.SEARCHING,
                    user: { connect: { id: user.id } },
                    vehicle: { connect: { id: vehicleId } },
                    basePrice: basePrice,
                    finalAmount: basePrice, // This will be recalculated later
                    expiresAt: new Date(Date.now() + SEARCH_TIMEOUT_MINUTES * 60 * 1000),
                    eligibleProviderIds: eligibleProviderIds,
                    pickupLocation: pickup,
                    destinationLocation: destination,
                }
            });
            
            console.log("✅ [API] Towing Booking created successfully with ID:", newBooking.id);
            console.log("   - Eligible Tow Truck IDs:", newBooking.eligibleProviderIds);

            // --- Real-time notification logic for towing ---
            const detailedBooking = await prisma.booking.findUnique({
                where: { id: newBooking.id },
                include: {
                    user: { select: { firstName: true, lastName: true } },
                    vehicle: true,
                }
            });

            if (detailedBooking) {
                console.log(`[Socket.IO] Broadcasting tow booking ${detailedBooking.id} to ${detailedBooking.eligibleProviderIds.length} providers.`);
                const userLocation = { lat: pickup.latitude, lon: pickup.longitude };
                for (const providerId of detailedBooking.eligibleProviderIds) {
                    try {
                        const truckLocation = await prisma.liveTruckLocation.findUnique({ where: { towTruckId: providerId } });
                        if (truckLocation && truckLocation.location && isGeoJSONPoint(truckLocation.location)) {
                            const providerCoords = { lat: truckLocation.location.coordinates[1], lon: truckLocation.location.coordinates[0] };
                            const { distanceKm } = await getEtaAndDistance(userLocation, providerCoords);

                            const socketId = providerSockets[providerId];
                            if (socketId) {
                                io.to(socketId).emit('new_booking', { ...detailedBooking, distance: distanceKm });
                                console.log(`📬 Emitted 'new_booking' to provider ${providerId} (tow truck) on socket ${socketId}`);
                            } else {
                                console.log(`- Provider ${providerId} is not connected.`);
                            }
                        }
                    } catch (e) {
                        console.error(`Failed to process and emit for provider ${providerId}`, e);
                    }
                }
            }
            // --- End of real-time logic ---

            return res.status(202).json({ bookingId: newBooking.id, eligibleTruckCount: eligibleTrucks.length });

        } catch (error: any) {
            console.error("🔴 [API] CRITICAL ERROR in /request-towing:", error);
            return res.status(500).json({ reason: 'An internal server error occurred.', details: error.message });
        }
    }
);

export default bookingsRouter;