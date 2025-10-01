"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const clerk_sdk_node_1 = require("@clerk/clerk-sdk-node");
const google_maps_services_js_1 = require("@googlemaps/google-maps-services-js");
const client_1 = require("@prisma/client");
const express_1 = require("express");
const stripe_1 = __importDefault(require("stripe"));
const prisma_1 = __importDefault(require("./lib/prisma"));
const socket_1 = require("./socket");
const bookingsRouter = (0, express_1.Router)();
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-04-10' });
const googleMapsClient = new google_maps_services_js_1.Client();
const PRICE_PER_KM = 15;
bookingsRouter.use((0, clerk_sdk_node_1.ClerkExpressWithAuth)());
function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
function isGeoJSONPoint(obj) {
    return obj && typeof obj === 'object' && obj.type === 'Point' && Array.isArray(obj.coordinates) &&
        obj.coordinates.length === 2 && typeof obj.coordinates[0] === 'number' && typeof obj.coordinates[1] === 'number';
}
async function getEtaAndDistance(origin, destination) {
    try {
        const response = await googleMapsClient.directions({
            params: {
                origin: `${origin.lat},${origin.lon}`,
                destination: `${destination.lat},${destination.lon}`,
                key: process.env.GOOGLE_MAPS_API_KEY,
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
    }
    catch (error) {
        console.error("Google Directions API Error:", error);
        return { etaMinutes: null, distanceKm: null };
    }
}
bookingsRouter.get('/garage/bookings', async (req, res) => {
    const garageOwnerId = req.auth.userId;
    const statuses = req.query.status?.split(',').filter(s => Object.values(client_1.BookingStatus).includes(s));
    if (!garageOwnerId)
        return res.status(401).json({ error: "Unauthorized" });
    if (!statuses || statuses.length === 0) {
        return res.status(400).json({ error: "At least one valid booking status is required." });
    }
    try {
        const user = await prisma_1.default.user.findUnique({ where: { clerkId: garageOwnerId } });
        if (!user)
            return res.status(404).json({ error: "User not found." });
        const garage = await prisma_1.default.garage.findUnique({ where: { ownerId: user.id } });
        if (!garage)
            return res.status(404).json({ error: "Garage profile not found." });
        let bookings;
        const isSearching = statuses.includes(client_1.BookingStatus.SEARCHING);
        const otherStatuses = statuses.filter(s => s !== client_1.BookingStatus.SEARCHING);
        bookings = await prisma_1.default.booking.findMany({
            where: {
                OR: [
                    { garageId: garage.id, status: { in: statuses } },
                    { status: client_1.BookingStatus.SEARCHING, eligibleProviderIds: { has: garage.id }, expiresAt: { gt: new Date() } }
                ]
            },
            include: { user: true, vehicle: true, service: true },
            orderBy: { bookedAt: 'desc' }
        });
        return res.status(200).json(bookings);
    }
    catch (error) {
        console.error("Failed to fetch garage bookings:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
bookingsRouter.get('/tow-truck/bookings', async (req, res) => {
    const towTruckOwnerId = req.auth.userId;
    const statuses = req.query.status?.split(',').filter(s => Object.values(client_1.BookingStatus).includes(s));
    if (!towTruckOwnerId)
        return res.status(401).json({ error: "Unauthorized" });
    if (!statuses || statuses.length === 0) {
        return res.status(400).json({ error: "A valid booking status is required." });
    }
    try {
        const user = await prisma_1.default.user.findUnique({ where: { clerkId: towTruckOwnerId } });
        if (!user)
            return res.status(404).json({ error: "User not found." });
        const towTruck = await prisma_1.default.towTruck.findUnique({ where: { ownerId: user.id } });
        if (!towTruck)
            return res.status(404).json({ error: "Tow Truck profile not found." });
        let bookings;
        const isSearching = statuses.includes(client_1.BookingStatus.SEARCHING);
        const otherStatuses = statuses.filter(s => s !== client_1.BookingStatus.SEARCHING);
        bookings = await prisma_1.default.booking.findMany({
            where: {
                OR: [
                    { towTruckId: towTruck.id, status: { in: statuses } },
                    { status: client_1.BookingStatus.SEARCHING, eligibleProviderIds: { has: towTruck.id }, expiresAt: { gt: new Date() } }
                ]
            },
            include: { user: true, vehicle: true },
            orderBy: { bookedAt: 'desc' }
        });
        return res.status(200).json(bookings);
    }
    catch (error) {
        console.error("Failed to fetch tow truck bookings:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
bookingsRouter.post('/bookings/:id/accept', async (req, res) => {
    const { id: bookingId } = req.params;
    const garageOwnerId = req.auth.userId;
    try {
        const garage = await prisma_1.default.garage.findFirst({
            where: { owner: { clerkId: garageOwnerId } },
            include: { services: true }
        });
        if (!garage)
            return res.status(403).json({ error: "Garage profile not found." });
        const bookingToAccept = await prisma_1.default.booking.findUnique({
            where: { id: bookingId },
            include: { user: true }
        });
        if (!bookingToAccept)
            return res.status(404).json({ error: "Booking request not found." });
        if (bookingToAccept.status !== client_1.BookingStatus.SEARCHING) {
            return res.status(409).json({ error: "This request has already been handled." });
        }
        if (bookingToAccept.expiresAt && new Date() > bookingToAccept.expiresAt) {
            return res.status(410).json({ error: "This request has expired." });
        }
        if (!bookingToAccept.eligibleProviderIds.includes(garage.id)) {
            return res.status(403).json({ error: "Your garage is not eligible for this request." });
        }
        const garageService = garage.services.find(s => s.serviceId === bookingToAccept.serviceId);
        if (!garageService) {
            return res.status(400).json({ error: "This garage does not offer the requested service." });
        }
        const servicePrice = garageService.price;
        let finalAmount = servicePrice;
        let etaMinutes = null;
        let distanceKm = null;
        const userLocation = bookingToAccept.pickupLocation;
        const garageLocation = garage.location;
        if (isGeoJSONPoint(userLocation) && isGeoJSONPoint(garageLocation)) {
            const origin = { lat: userLocation.coordinates[1], lon: userLocation.coordinates[0] };
            const destination = { lat: garageLocation.coordinates[1], lon: garageLocation.coordinates[0] };
            const etaResult = await getEtaAndDistance(destination, origin);
            etaMinutes = etaResult.etaMinutes;
            distanceKm = etaResult.distanceKm;
            if (distanceKm !== null) {
                const distanceCost = distanceKm * PRICE_PER_KM;
                finalAmount += distanceCost;
            }
        }
        const updatedBooking = await prisma_1.default.booking.update({
            where: { id: bookingId },
            data: {
                status: client_1.BookingStatus.AWAITING_PAYMENT,
                garage: { connect: { id: garage.id } },
                basePrice: servicePrice,
                finalAmount: finalAmount,
                eligibleProviderIds: [],
                expiresAt: null,
                paymentExpiresAt: new Date(Date.now() + 6 * 60 * 1000),
            },
            include: { user: true, garage: true }
        });
        const customerSocketId = socket_1.customerSockets[updatedBooking.user.clerkId];
        if (customerSocketId) {
            const providerPayload = {
                ...updatedBooking.garage,
                eta: etaMinutes,
                distance: distanceKm,
                finalPrice: finalAmount
            };
            socket_1.io.to(customerSocketId).emit('booking_accepted', {
                bookingId: updatedBooking.id,
                provider: providerPayload
            });
            console.log(`📬 Emitted 'booking_accepted' to customer ${updatedBooking.user.clerkId} with final price ${finalAmount}`);
        }
        return res.status(200).json({ success: true, booking: updatedBooking });
    }
    catch (error) {
        console.error("Failed to accept booking:", error);
        return res.status(500).json({ error: 'An internal server error occurred.' });
    }
});
bookingsRouter.post('/bookings/:id/accept-tow', async (req, res) => {
    const { id: bookingId } = req.params;
    const towTruckOwnerId = req.auth.userId;
    try {
        const towTruck = await prisma_1.default.towTruck.findFirst({ where: { owner: { clerkId: towTruckOwnerId } } });
        if (!towTruck)
            return res.status(403).json({ error: "Tow Truck profile not found." });
        const bookingToAccept = await prisma_1.default.booking.findUnique({ where: { id: bookingId } });
        if (!bookingToAccept)
            return res.status(404).json({ error: "Booking request not found." });
        if (bookingToAccept.status !== client_1.BookingStatus.SEARCHING) {
            return res.status(409).json({ error: "This request has already been handled by another provider." });
        }
        if (bookingToAccept.expiresAt && new Date() > bookingToAccept.expiresAt) {
            return res.status(410).json({ error: "This request has expired." });
        }
        if (!bookingToAccept.eligibleProviderIds.includes(towTruck.id)) {
            return res.status(403).json({ error: "Your tow truck is not eligible for this request." });
        }
        const updatedBooking = await prisma_1.default.booking.update({
            where: { id: bookingId },
            data: {
                status: client_1.BookingStatus.AWAITING_PAYMENT,
                towTruck: { connect: { id: towTruck.id } },
                eligibleProviderIds: [],
                expiresAt: null,
                paymentExpiresAt: new Date(Date.now() + 6 * 60 * 1000),
            },
            include: { user: true, towTruck: true }
        });
        const customerSocketId = socket_1.customerSockets[updatedBooking.user.clerkId];
        if (customerSocketId) {
            socket_1.io.to(customerSocketId).emit('booking_accepted', {
                bookingId: updatedBooking.id,
                provider: updatedBooking.towTruck
            });
            console.log(`📬 Emitted 'booking_accepted' to customer ${updatedBooking.user.clerkId}`);
        }
        return res.status(200).json({ success: true, booking: updatedBooking });
    }
    catch (error) {
        console.error("Failed to accept tow booking:", error);
        return res.status(500).json({ error: 'An internal server error occurred.' });
    }
});
bookingsRouter.post('/bookings/:id/decline', async (req, res) => {
    const { id: bookingId } = req.params;
    const garageOwnerId = req.auth.userId;
    try {
        const garage = await prisma_1.default.garage.findFirst({ where: { owner: { clerkId: garageOwnerId } } });
        if (!garage)
            return res.status(403).json({ error: "Garage profile not found." });
        const booking = await prisma_1.default.booking.findUnique({ where: { id: bookingId } });
        if (!booking || booking.status !== 'SEARCHING') {
            return res.status(404).json({ error: 'Request is no longer active.' });
        }
        const updatedEligibleIds = booking.eligibleProviderIds.filter(id => id !== garage.id);
        const updatedBooking = await prisma_1.default.booking.update({
            where: { id: bookingId },
            data: {
                eligibleProviderIds: updatedEligibleIds,
                status: updatedEligibleIds.length === 0 ? client_1.BookingStatus.CANCELLED : booking.status,
            },
        });
        return res.status(200).json({ success: true, status: updatedBooking.status });
    }
    catch (error) {
        console.error("Failed to decline booking:", error);
        return res.status(500).json({ error: 'An internal server error occurred' });
    }
});
bookingsRouter.post('/bookings/:id/decline-tow', async (req, res) => {
    const { id: bookingId } = req.params;
    const towTruckOwnerId = req.auth.userId;
    try {
        const towTruck = await prisma_1.default.towTruck.findFirst({ where: { owner: { clerkId: towTruckOwnerId } } });
        if (!towTruck)
            return res.status(403).json({ error: "Tow Truck profile not found." });
        const booking = await prisma_1.default.booking.findUnique({ where: { id: bookingId } });
        if (!booking || booking.status !== 'SEARCHING') {
            return res.status(404).json({ error: 'Request is no longer active.' });
        }
        const updatedEligibleIds = booking.eligibleProviderIds.filter(id => id !== towTruck.id);
        const updatedBooking = await prisma_1.default.booking.update({
            where: { id: bookingId },
            data: {
                eligibleProviderIds: updatedEligibleIds,
                status: updatedEligibleIds.length === 0 ? client_1.BookingStatus.CANCELLED : booking.status,
            },
        });
        return res.status(200).json({ success: true, status: updatedBooking.status });
    }
    catch (error) {
        console.error("Failed to decline tow booking:", error);
        return res.status(500).json({ error: 'An internal server error occurred' });
    }
});
bookingsRouter.post('/bookings/:id/verify-otp', async (req, res) => {
    const { id: bookingId } = req.params;
    const { otp } = req.body;
    const garageOwnerId = req.auth.userId;
    if (!otp)
        return res.status(400).json({ error: "OTP is required." });
    try {
        const booking = await prisma_1.default.booking.findFirst({
            where: { id: bookingId, garage: { owner: { clerkId: garageOwnerId } } },
            include: { user: true }
        });
        if (!booking)
            return res.status(404).json({ error: "Booking not found or not assigned to you." });
        if (booking.status !== 'CONFIRMED')
            return res.status(409).json({ error: 'Booking is not in a verifiable state.' });
        if (booking.otp !== otp)
            return res.status(400).json({ error: 'Invalid OTP provided.' });
        if (booking.otpExpiresAt && new Date() > booking.otpExpiresAt)
            return res.status(410).json({ error: 'The OTP has expired.' });
        if (!booking.paymentIntentId)
            return res.status(400).json({ error: 'Cannot complete service: Payment Intent not found.' });
        await stripe.paymentIntents.capture(booking.paymentIntentId);
        const updatedBooking = await prisma_1.default.booking.update({
            where: { id: bookingId },
            data: {
                status: client_1.BookingStatus.COMPLETED,
                paymentStatus: 'paid',
                serviceStartedAt: new Date(),
                otp: null,
                otpExpiresAt: null,
            }
        });
        const customerSocketId = socket_1.customerSockets[booking.user.clerkId];
        if (customerSocketId) {
            socket_1.io.to(customerSocketId).emit('service_completed', { bookingId: updatedBooking.id });
            console.log(`✅ Emitted 'service_completed' to customer ${booking.user.clerkId}`);
        }
        return res.status(200).json({ success: true, message: 'Service started and payment captured successfully.' });
    }
    catch (error) {
        console.error("Failed to verify OTP and capture payment:", error);
        if (error instanceof stripe_1.default.errors.StripeError) {
            return res.status(402).json({ error: `Payment capture failed: ${error.message}` });
        }
        return res.status(500).json({ error: 'An internal server error occurred' });
    }
});
bookingsRouter.post('/bookings/:id/verify-otp-tow', async (req, res) => {
    const { id: bookingId } = req.params;
    const { otp } = req.body;
    const towTruckOwnerId = req.auth.userId;
    if (!otp)
        return res.status(400).json({ error: "OTP is required." });
    try {
        const booking = await prisma_1.default.booking.findFirst({
            where: { id: bookingId, towTruck: { owner: { clerkId: towTruckOwnerId } } },
            include: { user: true }
        });
        if (!booking)
            return res.status(404).json({ error: "Booking not found or not assigned to you." });
        if (booking.status !== 'CONFIRMED')
            return res.status(409).json({ error: 'Booking is not in a verifiable state.' });
        if (booking.otp !== otp)
            return res.status(400).json({ error: 'Invalid OTP provided.' });
        if (booking.otpExpiresAt && new Date() > booking.otpExpiresAt)
            return res.status(410).json({ error: 'The OTP has expired.' });
        if (!booking.paymentIntentId)
            return res.status(400).json({ error: 'Cannot complete service: Payment Intent not found.' });
        await stripe.paymentIntents.capture(booking.paymentIntentId);
        const updatedBooking = await prisma_1.default.booking.update({
            where: { id: bookingId },
            data: {
                status: client_1.BookingStatus.COMPLETED,
                paymentStatus: 'paid',
                serviceStartedAt: new Date(),
                otp: null,
                otpExpiresAt: null,
            }
        });
        const customerSocketId = socket_1.customerSockets[booking.user.clerkId];
        if (customerSocketId) {
            socket_1.io.to(customerSocketId).emit('service_completed', { bookingId: updatedBooking.id });
            console.log(`✅ Emitted 'service_completed' to customer ${booking.user.clerkId}`);
        }
        return res.status(200).json({ success: true, message: 'Service started and payment captured successfully.' });
    }
    catch (error) {
        console.error("Failed to verify OTP and capture payment for tow booking:", error);
        if (error instanceof stripe_1.default.errors.StripeError) {
            return res.status(402).json({ error: `Payment capture failed: ${error.message}` });
        }
        return res.status(500).json({ error: 'An internal server error occurred' });
    }
});
bookingsRouter.get('/bookings/active', async (req, res) => {
    const customerClerkId = req.auth.userId;
    if (!customerClerkId)
        return res.status(401).json({ error: 'Unauthorized' });
    try {
        const activeBookings = await prisma_1.default.booking.findMany({
            where: {
                user: { clerkId: customerClerkId },
                status: { in: [client_1.BookingStatus.CONFIRMED, client_1.BookingStatus.IN_PROGRESS] }
            },
            include: {
                garage: true,
                towTruck: {
                    include: {
                        liveLocation: true
                    }
                },
                service: true,
            },
            orderBy: {
                bookedAt: 'desc'
            }
        });
        const bookingsWithEta = await Promise.all(activeBookings.map(async (booking) => {
            const provider = booking.garage || booking.towTruck;
            const providerLocation = booking.garage?.location || booking.towTruck?.liveLocation?.location;
            if (provider && isGeoJSONPoint(booking.pickupLocation) && isGeoJSONPoint(providerLocation)) {
                const userCoords = booking.pickupLocation.coordinates;
                const providerCoords = providerLocation.coordinates;
                const { etaMinutes, distanceKm } = await getEtaAndDistance({ lat: providerCoords[1], lon: providerCoords[0] }, { lat: userCoords[1], lon: userCoords[0] });
                return { ...booking, providerEta: etaMinutes, providerDistance: distanceKm };
            }
            return { ...booking, providerEta: null, providerDistance: null };
        }));
        return res.status(200).json(bookingsWithEta);
    }
    catch (error) {
        console.error("Failed to fetch active bookings:", error);
        return res.status(500).json({ error: 'An internal server error occurred' });
    }
});
bookingsRouter.post('/bookings/request-service', async (req, res) => {
    const { serviceId, vehicleId, userLat, userLon } = req.body;
    const ownerId = req.auth.userId;
    if (!serviceId || !vehicleId || userLat == null || userLon == null || !ownerId) {
        return res.status(400).json({ reason: "Missing required parameters or not authenticated." });
    }
    const SEARCH_TIMEOUT_MINUTES = 5;
    try {
        const service = await prisma_1.default.service.findUnique({ where: { id: serviceId } });
        if (!service)
            return res.status(404).json({ reason: "Service not found." });
        const allGaragesOfferingService = await prisma_1.default.garage.findMany({
            where: { status: 'APPROVED', isOpen: true, services: { some: { serviceId: serviceId } } },
            include: { services: { include: { service: true } } }
        });
        const nearbyProviders = [];
        for (const garage of allGaragesOfferingService) {
            console.log(`[Geo-Check] Evaluating garage: ${garage.name} (ID: ${garage.id})`);
            const garageLocation = garage.location?.coordinates;
            if (garageLocation) {
                try {
                    const { distanceKm } = await getEtaAndDistance({ lat: userLat, lon: userLon }, { lat: garageLocation[1], lon: garageLocation[0] });
                    console.log(`[Geo-Check] Calculated distance for ${garage.name}: ${distanceKm} km`);
                    if (distanceKm !== null && distanceKm <= 30) {
                        nearbyProviders.push({ providerId: garage.id, price: garage.services.find(s => s.serviceId === serviceId)?.price || 0 });
                    }
                }
                catch (distanceError) {
                    console.warn(`Could not calculate distance for garage "${garage.name}". Error:`, distanceError);
                }
            }
            else {
                console.warn(`Garage "${garage.name}" has invalid location data.`);
            }
        }
        if (nearbyProviders.length === 0) {
            return res.status(404).json({ reason: `No garages were found within 30km that offer "${service.name}".` });
        }
        const user = await prisma_1.default.user.findUnique({ where: { clerkId: ownerId } });
        if (!user)
            return res.status(404).json({ reason: "User profile not found." });
        const newBooking = await prisma_1.default.booking.create({
            data: {
                status: client_1.BookingStatus.SEARCHING,
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
        const detailedBooking = await prisma_1.default.booking.findUnique({
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
                    const garage = await prisma_1.default.garage.findUnique({ where: { id: providerId } });
                    if (garage && garage.location && isGeoJSONPoint(garage.location)) {
                        const garageLocation = { lat: garage.location.coordinates[1], lon: garage.location.coordinates[0] };
                        const { distanceKm } = await getEtaAndDistance(userLocation, garageLocation);
                        const socketId = socket_1.providerSockets[providerId];
                        if (socketId) {
                            socket_1.io.to(socketId).emit('new_booking', { ...detailedBooking, distance: distanceKm });
                            console.log(`📬 Emitted 'new_booking' to provider ${providerId} (garage) on socket ${socketId}`);
                        }
                        else {
                            console.log(`- Provider ${providerId} is not connected.`);
                        }
                    }
                }
                catch (e) {
                    console.error(`Failed to process and emit for provider ${providerId}`, e);
                }
            }
        }
        return res.status(202).json({ bookingId: newBooking.id });
    }
    catch (error) {
        console.error("CRITICAL ERROR in /request-service:", error);
        return res.status(500).json({ reason: 'An internal server error occurred.', details: error.message });
    }
});
bookingsRouter.get('/bookings/:id/status', async (req, res) => {
    const { id } = req.params;
    const ownerId = req.auth.userId;
    try {
        let booking = await prisma_1.default.booking.findFirst({
            where: { id: id, user: { clerkId: ownerId } },
            include: {
                garage: { select: { id: true, name: true, rating: true, address: true, location: true } },
                towTruck: { select: { id: true, name: true, model: true, make: true, liveLocation: true } },
            }
        });
        if (!booking)
            return res.status(404).json({ error: "Booking not found." });
        if (booking.status === client_1.BookingStatus.AWAITING_PAYMENT && booking.paymentExpiresAt && new Date() > booking.paymentExpiresAt) {
            booking = await prisma_1.default.booking.update({
                where: { id: booking.id },
                data: { status: client_1.BookingStatus.CANCELLED },
                include: {
                    garage: { select: { id: true, name: true, rating: true, address: true, location: true } },
                    towTruck: { select: { id: true, name: true, model: true, make: true, liveLocation: true } },
                }
            });
        }
        if (booking.status === client_1.BookingStatus.SEARCHING && booking.expiresAt && new Date() > booking.expiresAt) {
            booking = await prisma_1.default.booking.update({
                where: { id: booking.id },
                data: { status: client_1.BookingStatus.EXPIRED },
                include: {
                    garage: { select: { id: true, name: true, rating: true, address: true, location: true } },
                    towTruck: { select: { id: true, name: true, model: true, make: true, liveLocation: true } },
                }
            });
        }
        if (booking.status === client_1.BookingStatus.CONFIRMED && (booking.garage || booking.towTruck)) {
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
    }
    catch (error) {
        console.error("Failed to get booking status:", error);
        return res.status(500).json({ error: 'An internal server error occurred.', details: error.message });
    }
});
bookingsRouter.post('/bookings/:bookingId/confirm-payment', async (req, res) => {
    const { bookingId } = req.params;
    const customerClerkId = req.auth.userId;
    if (!customerClerkId)
        return res.status(401).json({ error: 'Unauthorized' });
    try {
        const booking = await prisma_1.default.booking.findFirst({
            where: { id: bookingId, user: { clerkId: customerClerkId } }
        });
        if (!booking)
            return res.status(404).json({ error: 'Booking not found.' });
        if (booking.status !== 'AWAITING_PAYMENT')
            return res.status(409).json({ error: 'This booking is not awaiting payment.' });
        if (booking.paymentExpiresAt && new Date() > booking.paymentExpiresAt)
            return res.status(410).json({ error: 'The payment window for this booking has expired.' });
        if (!booking.paymentIntentId)
            return res.status(400).json({ error: 'Payment has not been initiated for this booking.' });
        const intent = await stripe.paymentIntents.retrieve(booking.paymentIntentId);
        if (intent.status !== 'requires_capture') {
            return res.status(400).json({ error: 'Payment could not be authorized. Please try again.' });
        }
        const otp = generateOtp();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        const updatedBooking = await prisma_1.default.booking.update({
            where: { id: bookingId },
            data: {
                status: client_1.BookingStatus.CONFIRMED,
                paymentStatus: 'authorized',
                paymentExpiresAt: null,
                otp: otp,
                otpExpiresAt: otpExpiresAt,
            }
        });
        return res.status(200).json({ success: true, booking: updatedBooking });
    }
    catch (error) {
        console.error("Failed to confirm payment:", error);
        return res.status(500).json({ error: 'An internal server error occurred' });
    }
});
bookingsRouter.post('/bookings/:bookingId/create-payment-intent', async (req, res) => {
    const { bookingId } = req.params;
    const customerClerkId = req.auth.userId;
    if (!customerClerkId)
        return res.status(401).json({ error: 'Unauthorized' });
    let booking;
    try {
        booking = await prisma_1.default.booking.findUnique({
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
            await prisma_1.default.user.update({ where: { id: booking.user.id }, data: { stripeCustomerId } });
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
        await prisma_1.default.booking.update({ where: { id: bookingId }, data: { paymentIntentId: paymentIntent.id } });
        return res.status(200).json({ clientSecret: paymentIntent.client_secret });
    }
    catch (error) {
        if (booking && error.type === 'StripeInvalidRequestError' && error.param === 'transfer_data[destination]') {
            const provider = booking.garage || booking.towTruck;
            console.error(`CRITICAL: Invalid Stripe destination account ID for provider. Provider Type: ${booking.garage ? 'Garage' : 'TowTruck'}, Provider ID: ${provider?.id}, Stripe Account ID: ${provider?.stripeAccountId}`);
            return res.status(400).json({ error: 'This service provider is not currently set up to receive payments. Please contact support and reference this booking.' });
        }
        console.error("Payment Intent Error:", error);
        return res.status(500).json({ error: 'An error occurred while processing your payment.' });
    }
});
bookingsRouter.post('/bookings/:bookingId/cancel-by-user', async (req, res) => {
    const { bookingId } = req.params;
    const customerClerkId = req.auth.userId;
    if (!customerClerkId)
        return res.status(401).json({ error: 'Unauthorized' });
    try {
        const booking = await prisma_1.default.booking.findFirst({
            where: { id: bookingId, user: { clerkId: customerClerkId } }
        });
        if (!booking)
            return res.status(404).json({ error: 'Booking not found.' });
        const cancellableStatuses = [
            client_1.BookingStatus.SEARCHING,
            client_1.BookingStatus.AWAITING_PAYMENT,
            client_1.BookingStatus.CONFIRMED,
        ];
        if (!cancellableStatuses.includes(booking.status)) {
            return res.status(403).json({ error: 'This booking cannot be cancelled at its current stage.' });
        }
        if (booking.status === client_1.BookingStatus.CONFIRMED) {
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
        await prisma_1.default.booking.update({
            where: { id: bookingId },
            data: {
                status: client_1.BookingStatus.CANCELLED,
                cancellationReason: 'Cancelled by user.',
            }
        });
        return res.status(200).json({ success: true, message: 'Booking cancelled.' });
    }
    catch (error) {
        console.error("Failed to cancel booking by user:", error);
        return res.status(500).json({ error: 'An internal server error occurred' });
    }
});
bookingsRouter.post('/bookings/:bookingId/cancel-by-provider', async (req, res) => {
    const { bookingId } = req.params;
    const { reason } = req.body;
    const providerClerkId = req.auth.userId;
    if (!reason)
        return res.status(400).json({ error: 'A reason for cancellation is required.' });
    try {
        const booking = await prisma_1.default.booking.findFirst({
            where: {
                id: bookingId,
                OR: [
                    { garage: { owner: { clerkId: providerClerkId } } },
                    { towTruck: { owner: { clerkId: providerClerkId } } },
                ],
            },
            include: { garage: true, towTruck: true },
        });
        if (!booking || (!booking.garage && !booking.towTruck))
            return res.status(404).json({ error: 'Booking not found or you are not the assigned provider.' });
        if (![client_1.BookingStatus.CONFIRMED, client_1.BookingStatus.IN_PROGRESS].includes(booking.status)) {
            return res.status(403).json({ error: 'This booking cannot be cancelled at its current stage.' });
        }
        if (booking.paymentIntentId && booking.paymentIntentId.startsWith('pi_')) {
            if (booking.paymentStatus === 'paid') {
                await stripe.refunds.create({ payment_intent: booking.paymentIntentId });
            }
            else if (booking.paymentStatus === 'authorized') {
                await stripe.paymentIntents.cancel(booking.paymentIntentId);
            }
        }
        await prisma_1.default.booking.update({
            where: { id: bookingId },
            data: {
                status: client_1.BookingStatus.CANCELLED,
                paymentStatus: booking.paymentStatus === 'paid' ? 'refunded' : 'cancelled',
                cancellationReason: reason,
            }
        });
        return res.status(200).json({ success: true, message: 'Booking cancelled and refund processed.' });
    }
    catch (error) {
        console.error("Failed to cancel booking by provider:", error);
        return res.status(500).json({ error: 'An internal server error occurred' });
    }
});
bookingsRouter.post('/bookings/request-towing', async (req, res) => {
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
        const user = await prisma_1.default.user.findUnique({ where: { clerkId: ownerId } });
        if (!user)
            return res.status(404).json({ reason: "User profile not found." });
        console.log(`[API] Finding nearby tow trucks for a ${vehicleType} near pickup location.`);
        const nearbyTrucksRaw = await prisma_1.default.liveTruckLocation.aggregateRaw({
            pipeline: [
                {
                    '$geoNear': {
                        near: { type: "Point", coordinates: [pickup.longitude, pickup.latitude] },
                        distanceField: "distance",
                        maxDistance: 30000,
                        query: { isAvailable: true },
                        spherical: true
                    }
                },
                { '$limit': 20 }
            ]
        });
        console.log('[Geo-Check] Raw nearby trucks found by $geoNear:', JSON.stringify(nearbyTrucksRaw));
        if (!Array.isArray(nearbyTrucksRaw) || nearbyTrucksRaw.length === 0) {
            return res.status(404).json({ reason: "No tow trucks are available in your area right now." });
        }
        const nearbyTruckIds = nearbyTrucksRaw.map((truck) => truck.towTruckId.$oid);
        const eligibleTrucks = await prisma_1.default.towTruck.findMany({
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
        const basePrice = eligibleTrucks[0].services[0].price;
        const newBooking = await prisma_1.default.booking.create({
            data: {
                status: client_1.BookingStatus.SEARCHING,
                user: { connect: { id: user.id } },
                vehicle: { connect: { id: vehicleId } },
                basePrice: basePrice,
                finalAmount: basePrice,
                expiresAt: new Date(Date.now() + SEARCH_TIMEOUT_MINUTES * 60 * 1000),
                eligibleProviderIds: eligibleProviderIds,
                pickupLocation: pickup,
                destinationLocation: destination,
            }
        });
        console.log("✅ [API] Towing Booking created successfully with ID:", newBooking.id);
        console.log("   - Eligible Tow Truck IDs:", newBooking.eligibleProviderIds);
        const detailedBooking = await prisma_1.default.booking.findUnique({
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
                    const truckLocation = await prisma_1.default.liveTruckLocation.findUnique({ where: { towTruckId: providerId } });
                    if (truckLocation && truckLocation.location && isGeoJSONPoint(truckLocation.location)) {
                        const providerCoords = { lat: truckLocation.location.coordinates[1], lon: truckLocation.location.coordinates[0] };
                        const { distanceKm } = await getEtaAndDistance(userLocation, providerCoords);
                        const socketId = socket_1.providerSockets[providerId];
                        if (socketId) {
                            socket_1.io.to(socketId).emit('new_booking', { ...detailedBooking, distance: distanceKm });
                            console.log(`📬 Emitted 'new_booking' to provider ${providerId} (tow truck) on socket ${socketId}`);
                        }
                        else {
                            console.log(`- Provider ${providerId} is not connected.`);
                        }
                    }
                }
                catch (e) {
                    console.error(`Failed to process and emit for provider ${providerId}`, e);
                }
            }
        }
        return res.status(202).json({ bookingId: newBooking.id, eligibleTruckCount: eligibleTrucks.length });
    }
    catch (error) {
        console.error("🔴 [API] CRITICAL ERROR in /request-towing:", error);
        return res.status(500).json({ reason: 'An internal server error occurred.', details: error.message });
    }
});
bookingsRouter.get('/stripe/payment-methods', async (req, res) => {
    const customerClerkId = req.auth.userId;
    if (!customerClerkId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const user = await prisma_1.default.user.findUnique({
            where: { clerkId: customerClerkId },
        });
        if (!user || !user.stripeCustomerId) {
            return res.status(200).json([]);
        }
        const paymentMethods = await stripe.paymentMethods.list({
            customer: user.stripeCustomerId,
            type: 'card',
        });
        const savedCards = paymentMethods.data.map(pm => ({
            id: pm.id,
            brand: pm.card?.brand,
            last4: pm.card?.last4,
            exp_month: pm.card?.exp_month,
            exp_year: pm.card?.exp_year,
        }));
        return res.status(200).json(savedCards);
    }
    catch (error) {
        console.error("🔴 [API] Error fetching payment methods:", error);
        return res.status(500).json({ error: 'Failed to retrieve payment methods.' });
    }
});
bookingsRouter.post('/stripe/create-setup-intent', async (req, res) => {
    const customerClerkId = req.auth.userId;
    if (!customerClerkId)
        return res.status(401).json({ error: 'Unauthorized' });
    try {
        const user = await prisma_1.default.user.findUnique({ where: { clerkId: customerClerkId } });
        if (!user)
            return res.status(404).json({ error: 'User not found.' });
        let stripeCustomerId = user.stripeCustomerId;
        if (!stripeCustomerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: `${user.firstName} ${user.lastName || ''}`,
                phone: user.phone,
            });
            stripeCustomerId = customer.id;
            await prisma_1.default.user.update({
                where: { clerkId: customerClerkId },
                data: { stripeCustomerId: stripeCustomerId },
            });
        }
        const setupIntent = await stripe.setupIntents.create({
            customer: stripeCustomerId,
            payment_method_types: ['card'],
            usage: 'on_session',
        });
        return res.status(200).json({ clientSecret: setupIntent.client_secret });
    }
    catch (error) {
        console.error("🔴 [API] Error creating setup intent:", error);
        return res.status(500).json({ error: 'Could not prepare to save card.' });
    }
});
bookingsRouter.post('/stripe/detach-payment-method', async (req, res) => {
    const { paymentMethodId } = req.body;
    const customerClerkId = req.auth.userId;
    if (!customerClerkId)
        return res.status(401).json({ error: 'Unauthorized' });
    if (!paymentMethodId)
        return res.status(400).json({ error: 'paymentMethodId is required.' });
    try {
        const detachedPaymentMethod = await stripe.paymentMethods.detach(paymentMethodId);
        return res.status(200).json({ success: true, id: detachedPaymentMethod.id });
    }
    catch (error) {
        console.error("🔴 [API] Error detaching payment method:", error);
        return res.status(500).json({ error: 'Failed to detach payment method.' });
    }
});
bookingsRouter.post('/stripe/disconnect-account', async (req, res) => {
    const ownerClerkId = req.auth.userId;
    const { businessType } = req.body;
    if (!ownerClerkId)
        return res.status(401).json({ error: 'Unauthorized' });
    if (!businessType)
        return res.status(400).json({ error: 'businessType is required.' });
    if (businessType !== 'garage' && businessType !== 'tow-truck')
        return res.status(400).json({ error: 'Invalid businessType.' });
    try {
        const user = await prisma_1.default.user.findUnique({
            where: { clerkId: ownerClerkId },
            include: { garage: true, towTruck: true },
        });
        if (!user)
            return res.status(404).json({ error: 'User not found.' });
        const business = businessType === 'garage' ? user.garage : user.towTruck;
        if (!business)
            return res.status(404).json({ error: `No ${businessType} found for this user.` });
        if (businessType === 'garage') {
            await prisma_1.default.garage.update({ where: { id: business.id }, data: { stripeAccountId: null } });
        }
        else {
            await prisma_1.default.towTruck.update({ where: { id: business.id }, data: { stripeAccountId: null } });
        }
        console.log(`[StripeConnect] Disconnected Stripe account for ${businessType} ID: ${business.id}`);
        return res.status(200).json({ success: true, message: 'Stripe account disconnected successfully.' });
    }
    catch (error) {
        console.error("🔴 [API] Error disconnecting Stripe account:", error);
        return res.status(500).json({ error: 'Failed to disconnect Stripe account.' });
    }
});
bookingsRouter.post('/stripe/create-connect-account', async (req, res) => {
    const ownerClerkId = req.auth.userId;
    const { businessType, businessId } = req.body;
    if (!ownerClerkId)
        return res.status(401).json({ error: 'Unauthorized' });
    if (!businessType || !businessId)
        return res.status(400).json({ error: 'businessType and businessId are required.' });
    if (businessType !== 'garage' && businessType !== 'tow-truck')
        return res.status(400).json({ error: 'Invalid businessType.' });
    try {
        let user = await prisma_1.default.user.findUnique({
            where: { clerkId: ownerClerkId },
            include: { garage: true, towTruck: true },
        });
        if (!user)
            return res.status(404).json({ error: 'User not found.' });
        if (!user.email || !user.email.trim() || user.email.endsWith('@placeholder.email')) {
            console.log(`[StripeConnect] User ${user.id} has invalid email: "${user.email}". Fetching from Clerk...`);
            const clerkUser = await clerk_sdk_node_1.clerkClient.users.getUser(ownerClerkId);
            const primaryEmailObject = clerkUser.emailAddresses.find(e => e.id === clerkUser.primaryEmailAddressId);
            const primaryEmail = primaryEmailObject?.emailAddress;
            if (primaryEmail && primaryEmail.trim()) {
                console.log(`[StripeConnect] Found primary email on Clerk: "${primaryEmail}". Updating local DB.`);
                user = await prisma_1.default.user.update({
                    where: { id: user.id },
                    data: { email: primaryEmail },
                    include: { garage: true, towTruck: true },
                });
            }
            else {
                console.error(`[StripeConnect] Could not find a valid email for user ${user.id} on Clerk.`);
                return res.status(400).json({ error: 'A valid email is required to create a Stripe account, but none was found for your profile.' });
            }
        }
        const business = businessType === 'garage' ? user.garage : user.towTruck;
        if (!business || business.id !== businessId)
            return res.status(403).json({ error: 'User does not own this business.' });
        let accountId = business.stripeAccountId;
        if (!accountId) {
            const account = await stripe.accounts.create({
                type: 'express',
                country: 'IN',
                email: user.email,
                business_type: 'individual',
            });
            accountId = account.id;
            if (businessType === 'garage') {
                await prisma_1.default.garage.update({ where: { id: businessId }, data: { stripeAccountId: accountId } });
            }
            else {
                await prisma_1.default.towTruck.update({ where: { id: businessId }, data: { stripeAccountId: accountId } });
            }
        }
        const accountLink = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: `${process.env.APP_URL}/settings/payments?reauth=true`,
            return_url: `${process.env.APP_URL}/settings/payments?stripe_return=true`,
            type: 'account_onboarding',
        });
        return res.status(200).json({ url: accountLink.url });
    }
    catch (error) {
        console.error("🔴 [API] Error creating Stripe connect account:", error);
        return res.status(500).json({ error: 'Failed to create Stripe connection.' });
    }
});
exports.default = bookingsRouter;
//# sourceMappingURL=bookings.js.map