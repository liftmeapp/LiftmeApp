
import { ClerkExpressWithAuth, clerkClient } from '@clerk/clerk-sdk-node';
import { Client } from '@googlemaps/google-maps-services-js';
import { BookingStatus } from '@prisma/client';
import { Request, Response, Router } from 'express';
import Stripe from 'stripe';
import prisma from './lib/prisma';
import { customerSockets, io, providerSockets } from './socket';

const bookingsRouter = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' as any });
const googleMapsClient = new Client();
const PRICE_PER_KM = 15; // in INR

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
//  SPARE PART SELLER ROUTES
// ===================================================================

bookingsRouter.get('/spare-parts/orders', async (req: Request, res: Response) => {
    const sellerClerkId = req.auth.userId;
    const statusQuery = req.query.status as string;

    if (!sellerClerkId) return res.status(401).json({ error: "Unauthorized" });

    try {
        const store = await prisma.sparePartStore.findFirst({ 
            where: { owner: { clerkId: sellerClerkId } }
        });
        if (!store) return res.status(404).json({ error: "Spare part store not found for this user." });

        let statuses: BookingStatus[];
        if (statusQuery === 'Pending') {
            statuses = [BookingStatus.PENDING_ACCEPTANCE];
        } else if (statusQuery === 'Current') {
            statuses = [BookingStatus.AWAITING_PAYMENT, BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS];
        } else if (statusQuery === 'History') {
            statuses = [BookingStatus.COMPLETED, BookingStatus.CANCELLED];
        } else {
            return res.status(400).json({ error: "Invalid status query parameter." });
        }

        const orders = await prisma.booking.findMany({
            where: {
                sparePartStoreId: store.id,
                bookingType: 'SPARE_PART',
                status: { in: statuses },
            },
            include: {
                user: { select: { firstName: true, lastName: true, email: true } },
                sparePart: { select: { partName: true, images: true } },
            },
            orderBy: { bookedAt: 'desc' },
        });

        return res.status(200).json(orders);

    } catch (error: any) {
        console.error("Failed to fetch spare part orders:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

bookingsRouter.post('/bookings/:bookingId/accept-spare-part', async (req: Request, res: Response) => {
    const { bookingId } = req.params;
    const sellerClerkId = req.auth.userId;

    try {
        const booking = await prisma.booking.findFirst({
            where: { 
                id: bookingId,
                sparePartStore: { owner: { clerkId: sellerClerkId } }
            },
            include: { sparePart: true, user: true }
        });

        if (!booking) return res.status(404).json({ error: "Order not found or you are not the seller." });
        if (booking.status !== 'PENDING_ACCEPTANCE') return res.status(409).json({ error: "This order is not awaiting acceptance." });
        if (!booking.sparePart) return res.status(404).json({ error: "Associated spare part not found." });

        const partToUpdate = booking.sparePart;
        const quantityToOrder = booking.basePrice / partToUpdate.price; // Assuming basePrice stores total for the quantity

        if (partToUpdate.quantity < quantityToOrder) {
            return res.status(400).json({ error: 'Not enough stock available to accept this order.' });
        }

        // Use a transaction to ensure atomicity
        const [, updatedBooking] = await prisma.$transaction([
            prisma.sparePart.update({
                where: { id: partToUpdate.id },
                data: { quantity: { decrement: quantityToOrder } },
            }),
            prisma.booking.update({
                where: { id: bookingId },
                data: { 
                    status: booking.paymentMethod === 'CARD' ? BookingStatus.AWAITING_PAYMENT : BookingStatus.CONFIRMED,
                    paymentExpiresAt: booking.paymentMethod === 'CARD' ? new Date(Date.now() + 10 * 60 * 1000) : null, // 10 min payment window
                },
                include: { user: true, sparePart: { include: { store: true } } }
            })
        ]);

        // If card payment, create payment intent now
        if (updatedBooking.paymentMethod === 'CARD') {
            const { user, sparePart, finalAmount } = updatedBooking;
            if (!user.stripeCustomerId || !sparePart?.store.stripeAccountId) {
                console.warn(`[Stripe Bypass] Stripe accounts not configured for booking ${updatedBooking.id}. Forcing CASH payment.`);
                // Force to CASH payment if Stripe accounts are not configured
                await prisma.booking.update({
                    where: { id: updatedBooking.id },
                    data: { paymentMethod: 'CASH', status: BookingStatus.CONFIRMED },
                });
                // Notify customer that cash order is confirmed
                const customerSocketId = customerSockets[user.clerkId];
                if (customerSocketId) {
                    io.to(customerSocketId).emit('spare_part_order_confirmed', { bookingId: updatedBooking.id });
                }
                return res.status(200).json({ success: true, booking: updatedBooking, message: "Stripe not configured, defaulted to cash payment." });
            }

            const amountInCents = Math.round(finalAmount * 100);
            const applicationFee = Math.round(amountInCents * 0.10);

            const paymentIntent = await stripe.paymentIntents.create({
                amount: amountInCents,
                currency: 'inr',
                customer: user.stripeCustomerId,
                application_fee_amount: applicationFee,
                transfer_data: {
                    destination: sparePart.store.stripeAccountId,
                },
                capture_method: 'manual',
                metadata: { bookingId: updatedBooking.id, type: 'spare_part_purchase' },
            });

            await prisma.booking.update({ where: { id: updatedBooking.id }, data: { paymentIntentId: paymentIntent.id } });

            // Notify customer that payment is required
            const customerSocketId = customerSockets[user.clerkId];
            if (customerSocketId) {
                io.to(customerSocketId).emit('spare_part_order_accepted', { 
                    bookingId: updatedBooking.id, 
                    clientSecret: paymentIntent.client_secret 
                });
            }
        } else { // CASH payment
            // Notify customer that cash order is confirmed
            const customerSocketId = customerSockets[updatedBooking.user.clerkId];
            if (customerSocketId) {
                io.to(customerSocketId).emit('spare_part_order_confirmed', { bookingId: updatedBooking.id });
            }
        }

        return res.status(200).json({ success: true, booking: updatedBooking });

    } catch (error: any) {
        console.error("Failed to accept spare part order:", error);
        return res.status(500).json({ error: 'An internal server error occurred.' });
    }
});

bookingsRouter.post('/bookings/:bookingId/complete-spare-part', async (req: Request, res: Response) => {
    const { bookingId } = req.params;
    const sellerClerkId = req.auth.userId;

    try {
        // 1. Find the booking and verify ownership and status
        const booking = await prisma.booking.findFirst({
            where: { 
                id: bookingId,
                sparePartStore: { owner: { clerkId: sellerClerkId } }
            },
            include: { user: true }
        });

        if (!booking) {
            return res.status(404).json({ error: "Order not found or you are not the seller." });
        }

        if (booking.status !== 'CONFIRMED' && booking.status !== 'IN_PROGRESS') {
            return res.status(409).json({ error: "This order is not in a state that can be completed." });
        }

        // 2. Update the booking status to COMPLETED
        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: BookingStatus.COMPLETED,
                paymentStatus: booking.paymentMethod === 'CASH' ? 'paid_in_cash' : booking.paymentStatus, // Mark cash as paid
                serviceEndedAt: new Date(), // Mark completion time
            }
        });

        // 3. Notify the customer
        const customerSocketId = customerSockets[booking.user.clerkId];
        if (customerSocketId) {
            io.to(customerSocketId).emit('spare_part_order_completed', { bookingId: updatedBooking.id });
        }

        return res.status(200).json({ success: true, booking: updatedBooking });

    } catch (error: any) {
        console.error("Failed to complete spare part order:", error);
        return res.status(500).json({ error: 'An internal server error occurred.' });
    }
});

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

        const statusesToFetch = ['SEARCHING', 'CONFIRMED', 'IN_PROGRESS', 'AWAITING_PAYMENT', 'COMPLETED', 'CANCELLED', 'EXPIRED'];

        bookings = await prisma.booking.findMany({
            where: {
                OR: [
                    // Bookings explicitly assigned to this garage
                    { garageId: garage.id, status: { in: statusesToFetch as BookingStatus[] } },
                    // OR, any booking in the searching phase where this garage is eligible
                    {
                        status: BookingStatus.SEARCHING,
                        eligibleProviderIds: { has: garage.id },
                        expiresAt: { gt: new Date() }
                    }
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

        const statusesToFetch = ['AWAITING_PAYMENT', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'EXPIRED'];

        bookings = await prisma.booking.findMany({
            where: {
                OR: [
                    // Bookings explicitly assigned to this tow truck
                    { towTruckId: towTruck.id, status: { in: statusesToFetch as BookingStatus[] } },
                    // OR, bookings that are in any searching phase where this truck is eligible
                    { 
                        status: BookingStatus.SEARCHING, 
                        eligibleProviderIds: { has: towTruck.id }, 
                        expiresAt: { gt: new Date() } 
                    }
                ]
            },
            include: { user: true, vehicle: true, garage: true },
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
        // 1. Fetch garage with its service offerings
        const garage = await prisma.garage.findFirst({ 
            where: { owner: {clerkId: garageOwnerId} },
            include: { services: true }
        });
        if (!garage) return res.status(403).json({ error: "Garage profile not found."});

        // 2. Fetch the booking request, including user details for location
        const bookingToAccept = await prisma.booking.findUnique({ 
            where: { id: bookingId },
            include: { user: true }
        });
        if (!bookingToAccept) return res.status(404).json({ error: "Booking request not found." });

        // 3. Validate the booking status and eligibility
        if (bookingToAccept.status !== BookingStatus.SEARCHING) {
            return res.status(409).json({ error: "This request has already been handled." });
        }
        if (bookingToAccept.expiresAt && new Date() > bookingToAccept.expiresAt) {
            return res.status(410).json({ error: "This request has expired." });
        }
        if (!bookingToAccept.eligibleProviderIds.includes(garage.id)) {
            return res.status(403).json({ error: "Your garage is not eligible for this request." });
        }

        // 4. Get the specific service price from the accepting garage
        const garageService = garage.services.find(s => s.serviceId === bookingToAccept.serviceId);
        if (!garageService) {
            return res.status(400).json({ error: "This garage does not offer the requested service." });
        }
        const servicePrice = garageService.price;

        // 5. Calculate distance and final price
        let finalAmount = servicePrice;
        let etaMinutes: number | null = null;
        let distanceKm: number | null = null;

        const userLocation = bookingToAccept.pickupLocation;
        const garageLocation = garage.location;

        if (isGeoJSONPoint(userLocation) && isGeoJSONPoint(garageLocation)) {
            const origin = { lat: userLocation.coordinates[1], lon: userLocation.coordinates[0] };
            const destination = { lat: garageLocation.coordinates[1], lon: garageLocation.coordinates[0] };
            
            const etaResult = await getEtaAndDistance(destination, origin); // Garage to User
            etaMinutes = etaResult.etaMinutes;
            distanceKm = etaResult.distanceKm;

            if (distanceKm !== null) {
                const distanceCost = distanceKm * PRICE_PER_KM;
                finalAmount += distanceCost;
            }
        }

        // 6. Update booking with the new finalAmount
        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: BookingStatus.AWAITING_PAYMENT,
                garage: { connect: { id: garage.id } },
                basePrice: servicePrice, // Update base price to the actual garage's price
                finalAmount: finalAmount, // Set the calculated final amount
                eligibleProviderIds: [],
                expiresAt: null,
                paymentExpiresAt: new Date(Date.now() + 6 * 60 * 1000),
            },
            include: { user: true, garage: true }
        });

        // 7. Emit a detailed provider object in the socket event
        const customerSocketId = customerSockets[updatedBooking.user.clerkId];
        if (customerSocketId) {
            const providerPayload = {
                ...updatedBooking.garage,
                eta: etaMinutes,
                distance: distanceKm,
                finalPrice: finalAmount
            };
            io.to(customerSocketId).emit('booking_accepted', {
                bookingId: updatedBooking.id,
                provider: providerPayload
            });
            console.log(`📬 Emitted 'booking_accepted' to customer ${updatedBooking.user.clerkId} with final price ${finalAmount}`);
        }

        return res.status(200).json({ success: true, booking: updatedBooking });

    } catch (error: any) {
        console.error("Failed to accept booking:", error);
        return res.status(500).json({ error: 'An internal server error occurred.' });
    }
});

bookingsRouter.post('/bookings/:id/accept-tow-in', async (req: Request, res: Response) => {
    const { id: bookingId } = req.params;
    const garageOwnerId = req.auth.userId;
    
    try {
        // 1. Fetch the accepting garage
        const garage = await prisma.garage.findFirst({ 
            where: { owner: {clerkId: garageOwnerId} }
        });
        if (!garage) return res.status(403).json({ error: "Garage profile not found."});

        // 2. Fetch the booking and validate it
        const bookingToAccept = await prisma.booking.findUnique({ 
            where: { id: bookingId },
            include: { vehicle: true }
        });
        if (!bookingToAccept) return res.status(404).json({ error: "Booking request not found." });
        if (bookingToAccept.bookingType !== 'TOW_TO_GARAGE' || bookingToAccept.status !== BookingStatus.SEARCHING) {
            return res.status(409).json({ error: "This request is not a valid tow-in request or has already been handled." });
        }
        if (bookingToAccept.expiresAt && new Date() > bookingToAccept.expiresAt) {
            return res.status(410).json({ error: "This request has expired." });
        }
        if (!bookingToAccept.eligibleProviderIds.includes(garage.id)) {
            return res.status(403).json({ error: "Your garage is not eligible for this request." });
        }

        // 3. Find eligible tow trucks near the user's pickup location
        const pickup = bookingToAccept.pickupLocation as any;
        if (!pickup || !pickup.coordinates || pickup.coordinates.length !== 2) {
            return res.status(400).json({ error: "Booking is missing a valid pickup location." });
        }
        if (!bookingToAccept.vehicle) {
            return res.status(400).json({ error: "Booking is missing vehicle information." });
        }
        const vehicleType = bookingToAccept.vehicle.type;

        const nearbyTrucksRaw = await prisma.liveTruckLocation.aggregateRaw({
            pipeline: [
                {
                    '$geoNear': {
                        near: { type: "Point", coordinates: [pickup.coordinates[0], pickup.coordinates[1]] },
                        distanceField: "distance",
                        maxDistance: 15000, // 15km in meters
                        query: { isAvailable: true },
                        spherical: true
                    }
                },
                { '$limit': 20 }
            ]
        });

        if (!Array.isArray(nearbyTrucksRaw) || nearbyTrucksRaw.length === 0) {
            await prisma.booking.update({
                where: { id: bookingId },
                data: { status: BookingStatus.CANCELLED, cancellationReason: 'No tow trucks were available after garage acceptance.' }
            });
            return res.status(404).json({ error: `No tow trucks found nearby that can handle a ${vehicleType}. The booking has been cancelled.` });
        }

        const nearbyTruckIds = nearbyTrucksRaw.map((truck: any) => truck.towTruckId.$oid);
        const eligibleTrucks = await prisma.towTruck.findMany({
            where: {
                id: { in: nearbyTruckIds },
                status: 'APPROVED',
                services: { some: { vehicleType: vehicleType } }
            },
            include: {
                services: {
                    where: { vehicleType: vehicleType }
                }
            }
        });

        if (eligibleTrucks.length === 0) {
            await prisma.booking.update({
                where: { id: bookingId },
                data: { status: BookingStatus.CANCELLED, cancellationReason: 'No tow trucks were available after garage acceptance.' }
            });
            return res.status(404).json({ error: `No tow trucks found nearby that can handle a ${vehicleType}. The booking has been cancelled.` });
        }

        const eligibleTowTruckIds = eligibleTrucks.map(truck => truck.id);
        const TOW_TRUCK_SEARCH_TIMEOUT_MINUTES = 5;

        // 4. Update the booking to lock in the garage and start the tow truck search
        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                garage: { connect: { id: garage.id } },
                destinationLocation: garage.location, // Set garage as the destination
                expiresAt: new Date(Date.now() + TOW_TRUCK_SEARCH_TIMEOUT_MINUTES * 60 * 1000),
                eligibleProviderIds: eligibleTowTruckIds, // Now eligible providers are tow trucks
                subStatus: 'AWAITING_TOW_TRUCK_ACCEPTANCE',
            },
            include: { user: true, vehicle: true, garage: true }
        });

        // 5. Broadcast to eligible tow trucks
        const userLocation = { lat: pickup.latitude, lon: pickup.longitude };
        const garageLocation = { lat: (garage.location as any).coordinates[1], lon: (garage.location as any).coordinates[0] };
        const { distanceKm: totalTowingDistance } = await getEtaAndDistance(userLocation, garageLocation);

        for (const truck of eligibleTrucks) {
            try {
                const service = truck.services.find(s => s.vehicleType === vehicleType);
                const pricePerKm = service?.price || 0;
                const estimatedFare = totalTowingDistance !== null ? totalTowingDistance * pricePerKm : pricePerKm;

                const truckLocation = await prisma.liveTruckLocation.findUnique({ where: { towTruckId: truck.id } });
                let distanceToPickup = null;
                if (truckLocation && truckLocation.location && isGeoJSONPoint(truckLocation.location)) {
                    const providerCoords = { lat: truckLocation.location.coordinates[1], lon: truckLocation.location.coordinates[0] };
                    const { distanceKm } = await getEtaAndDistance(userLocation, providerCoords);
                    distanceToPickup = distanceKm;
                }

                const socketId = providerSockets[truck.id];
                if (socketId) {
                    io.to(socketId).emit('new_tow_request_for_garage', { 
                        ...updatedBooking, 
                        distance: distanceToPickup,
                        totalDistance: totalTowingDistance,
                        finalAmount: estimatedFare
                    });
                    console.log(`📬 Emitted 'new_tow_request_for_garage' to tow truck ${truck.id} with fare ${estimatedFare}`);
                }
            } catch (e) {
                console.error(`Failed to process and emit for tow truck ${truck.id}`, e);
            }
        }
        
        // Notify the original garage that their acceptance was successful
        const garageSocketId = providerSockets[garage.id];
        if (garageSocketId) {
            io.to(garageSocketId).emit('tow_in_accepted_by_you', { bookingId: updatedBooking.id });
        }

        // Also notify the customer that a garage has been found
        const customerSocketId = customerSockets[updatedBooking.user.clerkId];
        if (customerSocketId) {
            io.to(customerSocketId).emit('garage_found_for_tow', { 
                bookingId: updatedBooking.id, 
                garage: updatedBooking.garage 
            });
            console.log(`📬 Emitted 'garage_found_for_tow' to customer ${updatedBooking.user.clerkId}`);
        }

        return res.status(200).json({ success: true, message: "Garage accepted. Now searching for tow truck." });

    } catch (error: any) {
        console.error("Failed to accept tow-in booking:", error);
        return res.status(500).json({ error: 'An internal server error occurred.' });
    }
});

bookingsRouter.post('/bookings/:id/accept-tow', async (req: Request, res: Response) => {
    const { id: bookingId } = req.params;
    const towTruckOwnerId = req.auth.userId;
    
    try {
        const towTruck = await prisma.towTruck.findFirst({ 
            where: { owner: {clerkId: towTruckOwnerId} },
            include: { services: true }
        });
        if (!towTruck) return res.status(403).json({ error: "Tow Truck profile not found."});

        const bookingToAccept = await prisma.booking.findUnique({ 
            where: { id: bookingId },
            include: { user: true, vehicle: true } // Include vehicle to get vehicleType
        });
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

        // Get the specific service price from the accepting tow truck
        const towTruckService = towTruck.services.find(s => s.vehicleType === bookingToAccept.vehicle?.type);
        if (!towTruckService) {
            return res.status(400).json({ error: "This tow truck does not offer service for the requested vehicle type." });
        }
        const pricePerKm = towTruckService.price;

        // Calculate distance and final price
        let finalAmount = pricePerKm; // Default to the per-km rate as a minimum charge
        let etaMinutes: number | null = null;
        let distanceKm: number | null = null;

        const pickupLocation = bookingToAccept.pickupLocation;
        const destinationLocation = bookingToAccept.destinationLocation;

        if (isGeoJSONPoint(pickupLocation) && isGeoJSONPoint(destinationLocation)) {
            const origin = { lat: pickupLocation.coordinates[1], lon: pickupLocation.coordinates[0] };
            const destination = { lat: destinationLocation.coordinates[1], lon: destinationLocation.coordinates[0] };
            
            const etaResult = await getEtaAndDistance(origin, destination); // Pickup to Destination
            etaMinutes = etaResult.etaMinutes;
            distanceKm = etaResult.distanceKm;

            if (distanceKm !== null) {
                finalAmount = distanceKm * pricePerKm;
            }
        }

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: BookingStatus.AWAITING_PAYMENT,
                subStatus: 'TOW_TRUCK_ASSIGNED',
                towTruck: { connect: { id: towTruck.id } },
                basePrice: pricePerKm, // Store the per-km rate in basePrice
                finalAmount: finalAmount, // Set the calculated final amount
                eligibleProviderIds: [],
                expiresAt: null,
                paymentExpiresAt: new Date(Date.now() + 6 * 60 * 1000),
            },
            include: { user: true, towTruck: true }
        });

        // --- Notify customer via WebSocket ---
        const customerSocketId = customerSockets[updatedBooking.user.clerkId];
        if (customerSocketId) {
            const providerPayload = {
                ...updatedBooking.towTruck,
                eta: etaMinutes,
                distance: distanceKm,
                pricePerKm: pricePerKm,
                finalPrice: finalAmount
            };
            io.to(customerSocketId).emit('booking_accepted', {
                bookingId: updatedBooking.id,
                provider: providerPayload
            });
            console.log(`📬 Emitted 'booking_accepted' to customer ${updatedBooking.user.clerkId} with final price ${finalAmount}`);
        }

        // --- If this is a tow-to-garage, notify the garage ---
        if (updatedBooking.bookingType === 'TOW_TO_GARAGE' && updatedBooking.garageId) {
            const garageSocketId = providerSockets[updatedBooking.garageId];
            if (garageSocketId) {
                io.to(garageSocketId).emit('tow_truck_assigned', { bookingId: updatedBooking.id, towTruck: updatedBooking.towTruck });
                console.log(`📬 Emitted 'tow_truck_assigned' to garage ${updatedBooking.garageId}`);
            }
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
            where: { id: bookingId, garage: { owner: { clerkId: garageOwnerId } } },
            include: { user: true } 
        });

        if (!booking) return res.status(404).json({ error: "Booking not found or not assigned to you." });
        if (booking.otp !== otp) return res.status(400).json({ error: 'Invalid OTP provided.' });
        if (booking.otpExpiresAt && new Date() > booking.otpExpiresAt) return res.status(410).json({ error: 'The OTP has expired.' });

        const isTowToGarageService = booking.bookingType === 'TOW_TO_GARAGE' && booking.status === BookingStatus.IN_PROGRESS && booking.subStatus === 'SERVICE_IN_PROGRESS';
        const isStandardService = booking.status === BookingStatus.CONFIRMED;

        if (!isStandardService && !isTowToGarageService) {
            return res.status(409).json({ error: 'Booking is not in a verifiable state.' });
        }

        // --- Payment & Status Update Logic ---
        let updateData: any = {
            status: BookingStatus.COMPLETED,
            serviceEndedAt: new Date(),
            otp: null,
            otpExpiresAt: null,
            subStatus: 'SERVICE_COMPLETED'
        };

        if (isTowToGarageService) {
            // Capture garage payment if by card
            if (booking.garagePaymentStatus === 'authorized' && booking.garagePaymentIntentId) {
                await stripe.paymentIntents.capture(booking.garagePaymentIntentId);
                updateData.garagePaymentStatus = 'paid';
            } else if (booking.garagePaymentStatus === 'pending_cash') {
                updateData.garagePaymentStatus = 'paid_in_cash';
            }
        } else { // isStandardService
            // Capture standard payment if by card
            if (booking.paymentMethod === 'CARD') {
                if (!booking.paymentIntentId) {
                    return res.status(400).json({ error: 'Cannot complete service: Payment Intent not found for a card payment.' });
                }
                await stripe.paymentIntents.capture(booking.paymentIntentId);
                updateData.paymentStatus = 'paid';
            } else {
                updateData.paymentStatus = 'paid_in_cash';
            }
        }

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: updateData
        });

        // --- Notify customer that service is complete ---
        const customerSocketId = customerSockets[booking.user.clerkId];
        if (customerSocketId) {
            io.to(customerSocketId).emit('service_completed', { bookingId: updatedBooking.id });
            console.log(`✅ Emitted 'service_completed' to customer ${booking.user.clerkId}`);
        }

        return res.status(200).json({ success: true, message: 'Service completed and payment processed.' });

    } catch (error: any) {
        console.error("Failed to verify OTP and process payment:", error);
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
            where: { id: bookingId, towTruck: { owner: { clerkId: towTruckOwnerId } } },
            include: { user: true, garage: true } // Include garage for tow-to-garage flow
        });

        if (!booking) return res.status(404).json({ error: "Booking not found or not assigned to you." });
        if (booking.status !== 'CONFIRMED') return res.status(409).json({ error: 'Booking is not in a verifiable state.' });
        if (booking.otp !== otp) return res.status(400).json({ error: 'Invalid OTP provided.' });
        if (booking.otpExpiresAt && new Date() > booking.otpExpiresAt) return res.status(410).json({ error: 'The OTP has expired.' });

        // Capture payment if it's a card payment
        if (booking.paymentMethod === 'CARD') {
            if (!booking.paymentIntentId) {
                return res.status(400).json({ error: 'Cannot complete service: Payment Intent not found.' });
            }
            await stripe.paymentIntents.capture(booking.paymentIntentId);
        }

        let updatedBooking;

        if (booking.bookingType === 'TOW_TO_GARAGE') {
            // For tow-to-garage, the tow part is done, but the main service begins.
            // A NEW OTP is generated for the garage to use upon completion.
            const garageOtp = generateOtp();

            updatedBooking = await prisma.booking.update({
                where: { id: bookingId },
                data: {
                    status: BookingStatus.IN_PROGRESS, // The overall booking is now in progress at the garage.
                    subStatus: 'AWAITING_GARAGE_QUOTE', // The next step is for the garage to submit a quote.
                    paymentStatus: booking.paymentMethod === 'CARD' ? 'paid' : 'paid_in_cash', // Towing payment is settled.
                    serviceStartedAt: new Date(), // This marks the start of the garage's involvement.
                    otp: garageOtp, // The NEW OTP for the garage to use later.
                    otpExpiresAt: null,
                }
            });

            // Notify the garage that the vehicle has been delivered
            if (booking.garage?.id) {
                const garageSocketId = providerSockets[booking.garage.id];
                if (garageSocketId) {
                    io.to(garageSocketId).emit('vehicle_delivered', { bookingId: updatedBooking.id });
                    console.log(`📬 Emitted 'vehicle_delivered' to garage ${booking.garage.id}`);
                }
            }

        } else {
            // For direct tows, the job is completely finished.
            updatedBooking = await prisma.booking.update({
                where: { id: bookingId },
                data: {
                    status: BookingStatus.COMPLETED,
                    subStatus: 'SERVICE_COMPLETED',
                    paymentStatus: booking.paymentMethod === 'CARD' ? 'paid' : 'paid_in_cash',
                    serviceEndedAt: new Date(),
                    otp: null,
                    otpExpiresAt: null,
                }
            });
        }

        // Notify customer that the tow portion is complete
        const customerSocketId = customerSockets[booking.user.clerkId];
        if (customerSocketId) {
            io.to(customerSocketId).emit('service_completed', { 
                bookingId: updatedBooking.id,
                status: updatedBooking.status, // Send the new status
                subStatus: updatedBooking.subStatus
            });
            console.log(`✅ Emitted 'service_completed' to customer ${booking.user.clerkId}`);
        }

        return res.status(200).json({ success: true, message: 'Service completed and payment processed.' });

    } catch (error: any) {
        console.error("Failed to verify OTP and process payment for tow booking:", error);
        if (error instanceof Stripe.errors.StripeError) {
            return res.status(402).json({ error: `Payment capture failed: ${error.message}` });
        }
        return res.status(500).json({ error: 'An internal server error occurred' });
    }
});

bookingsRouter.post('/bookings/:id/submit-quote', async (req: Request, res: Response) => {
    const { id: bookingId } = req.params;
    const { vehicleStatus, servicesRequired, servicesEstimate, jobEstimate, notes } = req.body;
    const garageOwnerId = req.auth.userId;

    if (!jobEstimate || !servicesRequired) {
        return res.status(400).json({ error: "Job estimate and services required are mandatory." });
    }

    try {
        const garage = await prisma.garage.findFirst({ where: { owner: { clerkId: garageOwnerId } } });
        if (!garage) return res.status(403).json({ error: "Garage profile not found." });

        const booking = await prisma.booking.findFirst({
            where: { id: bookingId, garageId: garage.id },
            include: { user: true }
        });

        if (!booking) return res.status(404).json({ error: "Booking not found or not assigned to this garage." });

        const validStatuses = ['AWAITING_GARAGE_QUOTE', 'QUOTE_REJECTED'];
        if (booking.status !== 'IN_PROGRESS' || !validStatuses.includes(booking.subStatus as any)) {
            return res.status(409).json({ error: "This booking is not awaiting a quote." });
        }

        const quoteData = {
            vehicleStatus,
            servicesRequired,
            servicesEstimate,
            jobEstimate: parseFloat(jobEstimate),
            notes,
            quotedAt: new Date()
        };

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                vehicleStatus: vehicleStatus,
                servicesRequired: servicesRequired,
                servicesEstimate: servicesEstimate,
                jobEstimate: parseFloat(jobEstimate),
                initialEstimateAmount: parseFloat(jobEstimate),
                notes: notes,
                subStatus: 'AWAITING_QUOTE_APPROVAL',
                quoteRejectionReason: null, // Clear any previous rejection reason
                quoteHistory: {
                    push: quoteData
                }
            }
        });

        // Notify customer
        const customerSocketId = customerSockets[booking.user.clerkId];
        if (customerSocketId) {
            io.to(customerSocketId).emit('garage_quote_ready', {
                bookingId: updatedBooking.id,
                ...quoteData
            });
        }

        return res.status(200).json({ success: true, booking: updatedBooking });

    } catch (error: any) {
        console.error("Failed to submit quote:", error);
        return res.status(500).json({ error: 'An internal server error occurred.' });
    }
});

bookingsRouter.post('/bookings/:id/reject-quote', async (req: Request, res: Response) => {
    const { id: bookingId } = req.params;
    const { reason } = req.body;
    const customerClerkId = req.auth.userId;

    if (!reason) return res.status(400).json({ error: "A reason for rejection is required." });

    try {
        const booking = await prisma.booking.findFirst({
            where: { id: bookingId, user: { clerkId: customerClerkId } },
            include: { garage: true }
        });

        if (!booking) return res.status(404).json({ error: "Booking not found." });

        if (booking.status !== 'IN_PROGRESS' || booking.subStatus !== 'AWAITING_QUOTE_APPROVAL') {
            return res.status(409).json({ error: "This booking is not awaiting quote approval." });
        }

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                subStatus: 'QUOTE_REJECTED',
                quoteRejectionReason: reason,
            }
        });

        // Notify garage
        if (booking.garageId) {
            const garageSocketId = providerSockets[booking.garageId];
            if (garageSocketId) {
                io.to(garageSocketId).emit('quote_rejected_by_customer', {
                    bookingId: updatedBooking.id,
                    reason: reason
                });
            }
        }

        return res.status(200).json({ success: true, booking: updatedBooking });

    } catch (error: any) {
        console.error("Failed to reject quote:", error);
        return res.status(500).json({ error: 'An internal server error occurred.' });
    }
});

bookingsRouter.post('/bookings/:id/create-garage-payment-intent', async (req: Request, res: Response) => {
    const { id: bookingId } = req.params;
    const customerClerkId = req.auth.userId;

    try {
        const booking = await prisma.booking.findFirst({
            where: { id: bookingId, user: { clerkId: customerClerkId } },
            include: { user: true, garage: true }
        });

        if (!booking || !booking.garage || !booking.jobEstimate) return res.status(404).json({ error: 'Booking not found or missing required data.' });
        if (!booking.garage.stripeAccountId) return res.status(400).json({ error: 'Provider is not set up to receive payments.' });
        if (!booking.user.stripeCustomerId) return res.status(400).json({ error: 'User has no payment profile.' });

        const amountInCents = Math.round(booking.jobEstimate * 100);
        const applicationFee = Math.round(amountInCents * 0.10);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: 'inr',
            customer: booking.user.stripeCustomerId,
            application_fee_amount: applicationFee,
            transfer_data: { destination: booking.garage.stripeAccountId },
            capture_method: 'manual',
            metadata: { bookingId: booking.id, type: 'garage_service' },
        });

        await prisma.booking.update({ where: { id: bookingId }, data: { garagePaymentIntentId: paymentIntent.id } });

        return res.status(200).json({ clientSecret: paymentIntent.client_secret });

    } catch (error: any) {
        console.error("Failed to create garage payment intent:", error);
        return res.status(500).json({ error: 'An internal server error occurred.' });
    }
});

bookingsRouter.post('/bookings/:id/confirm-garage-payment', async (req: Request, res: Response) => {
    const { id: bookingId } = req.params;
    const customerClerkId = req.auth.userId;

    try {
        const booking = await prisma.booking.findFirst({
            where: { id: bookingId, user: { clerkId: customerClerkId } },
            include: { garage: true }
        });

        if (!booking) return res.status(404).json({ error: 'Booking not found.' });
        if (booking.status !== 'IN_PROGRESS' || booking.subStatus !== 'AWAITING_QUOTE_APPROVAL') {
            return res.status(409).json({ error: 'This booking is not awaiting quote approval.' });
        }
        if (!booking.garagePaymentIntentId) return res.status(400).json({ error: 'Payment has not been initiated.' });

        const intent = await stripe.paymentIntents.retrieve(booking.garagePaymentIntentId);
        if (intent.status !== 'requires_capture') {
            return res.status(400).json({ error: 'Payment could not be authorized.' });
        }

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                subStatus: 'SERVICE_IN_PROGRESS',
                garagePaymentStatus: 'authorized',
            }
        });

        // Notify garage
        if (booking.garageId) {
            const garageSocketId = providerSockets[booking.garageId];
            if (garageSocketId) {
                io.to(garageSocketId).emit('initial_quote_accepted', { bookingId: updatedBooking.id });
            }
        }

        return res.status(200).json({ success: true, booking: updatedBooking });

    } catch (error: any) {
        console.error("Failed to confirm garage payment:", error);
        return res.status(500).json({ error: 'An internal server error occurred' });
    }
});

bookingsRouter.post('/bookings/:id/confirm-garage-cash', async (req: Request, res: Response) => {
    const { id: bookingId } = req.params;
    const customerClerkId = req.auth.userId;

    try {
        const booking = await prisma.booking.findFirst({
            where: { id: bookingId, user: { clerkId: customerClerkId } },
            include: { garage: true }
        });

        if (!booking) return res.status(404).json({ error: 'Booking not found.' });
        if (booking.status !== 'IN_PROGRESS' || booking.subStatus !== 'AWAITING_QUOTE_APPROVAL') {
            return res.status(409).json({ error: 'This booking is not awaiting quote approval.' });
        }

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                subStatus: 'SERVICE_IN_PROGRESS',
                garagePaymentStatus: 'pending_cash',
            }
        });

        // Notify garage
        if (booking.garageId) {
            const garageSocketId = providerSockets[booking.garageId];
            if (garageSocketId) {
                io.to(garageSocketId).emit('initial_quote_accepted', { bookingId: updatedBooking.id });
            }
        }

        return res.status(200).json({ success: true, booking: updatedBooking });

    } catch (error: any) {
        console.error("Failed to confirm garage cash payment:", error);
        return res.status(500).json({ error: 'An internal server error occurred' });
    }
});

bookingsRouter.post('/bookings/:id/submit-final-quote', async (req: Request, res: Response) => {
    const { id: bookingId } = req.params;
    const { jobEstimate, notes } = req.body;
    const garageOwnerId = req.auth.userId;

    if (!jobEstimate) return res.status(400).json({ error: "A final job estimate is required." });

    try {
        const booking = await prisma.booking.findFirst({
            where: { id: bookingId, garage: { owner: { clerkId: garageOwnerId } } },
            include: { user: true }
        });

        if (!booking) return res.status(404).json({ error: "Booking not found." });
        if (booking.status !== 'IN_PROGRESS' || booking.subStatus !== 'SERVICE_IN_PROGRESS') {
            return res.status(409).json({ error: "Booking is not in a state to accept a final quote." });
        }

        const finalAmount = parseFloat(jobEstimate);
        const quoteData = {
            jobEstimate: finalAmount,
            notes,
            quotedAt: new Date()
        };

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                finalEstimateAmount: finalAmount,
                notes: notes, // Overwrite notes with final notes
                subStatus: 'AWAITING_FINAL_APPROVAL',
                quoteHistory: {
                    push: quoteData
                }
            }
        });

        // Notify customer
        const customerSocketId = customerSockets[booking.user.clerkId];
        if (customerSocketId) {
            io.to(customerSocketId).emit('final_quote_ready', {
                bookingId: updatedBooking.id,
                finalEstimateAmount: finalAmount,
                notes: notes
            });
        }

        return res.status(200).json({ success: true, booking: updatedBooking });

    } catch (error: any) {
        console.error("Failed to submit final quote:", error);
        return res.status(500).json({ error: 'An internal server error occurred.' });
    }
});

bookingsRouter.post('/bookings/:id/confirm-final-payment', async (req: Request, res: Response) => {
    const { id: bookingId } = req.params;
    const customerClerkId = req.auth.userId;

    try {
        const booking = await prisma.booking.findFirst({
            where: { id: bookingId, user: { clerkId: customerClerkId } },
            include: { garage: true }
        });

        if (!booking) return res.status(404).json({ error: 'Booking not found.' });
        if (booking.subStatus !== 'AWAITING_FINAL_APPROVAL') {
            return res.status(409).json({ error: 'This booking is not awaiting final payment.' });
        }

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                subStatus: 'SERVICE_IN_PROGRESS', 
                jobEstimate: booking.finalEstimateAmount, 
                garagePaymentStatus: 'paid_final', 
            }
        });

        if (booking.garageId) {
            const garageSocketId = providerSockets[booking.garageId];
            if (garageSocketId) {
                io.to(garageSocketId).emit('final_quote_accepted', { bookingId: updatedBooking.id });
            }
        }

        return res.status(200).json({ success: true, booking: updatedBooking });
    } catch (error: any) {
        console.error("Failed to confirm final payment:", error);
        return res.status(500).json({ error: 'An internal server error occurred' });
    }
});

bookingsRouter.post('/bookings/:id/confirm-final-cash', async (req: Request, res: Response) => {
    const { id: bookingId } = req.params;
    const customerClerkId = req.auth.userId;

    try {
        const booking = await prisma.booking.findFirst({
            where: { id: bookingId, user: { clerkId: customerClerkId } },
            include: { garage: true }
        });

        if (!booking) return res.status(404).json({ error: 'Booking not found.' });
        if (booking.subStatus !== 'AWAITING_FINAL_APPROVAL') {
            return res.status(409).json({ error: 'This booking is not awaiting final payment.' });
        }

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                subStatus: 'SERVICE_IN_PROGRESS',
                jobEstimate: booking.finalEstimateAmount,
                garagePaymentStatus: 'pending_final_cash',
            }
        });

        if (booking.garageId) {
            const garageSocketId = providerSockets[booking.garageId];
            if (garageSocketId) {
                io.to(garageSocketId).emit('final_quote_accepted', { bookingId: updatedBooking.id });
            }
        }

        return res.status(200).json({ success: true, booking: updatedBooking });
    } catch (error: any) {
        console.error("Failed to confirm final cash payment:", error);
        return res.status(500).json({ error: 'An internal server error occurred' });
    }
});

bookingsRouter.get('/bookings/active', async (req: Request, res: Response) => {
    const customerClerkId = req.auth.userId;
    if (!customerClerkId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const activeBookings = await prisma.booking.findMany({
            where: {
                user: { clerkId: customerClerkId },
                status: { in: [BookingStatus.PENDING_ACCEPTANCE, BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS] }
            },
            include: {
                garage: true,
                towTruck: {
                    include: {
                        liveLocation: true
                    }
                },
                service: true,
                sparePart: true,
                sparePartStore: { include: { owner: true } },
            },
            orderBy: {
                bookedAt: 'desc'
            }
        });
        
        const bookingsWithEta = await Promise.all(activeBookings.map(async (booking) => {
            let isTowingPhase = false;
            if (booking.bookingType === 'TOW_TO_GARAGE') {
                const atGarageSubStatuses = ['VEHICLE_DELIVERED', 'AWAITING_GARAGE_QUOTE', 'AWAITING_QUOTE_APPROVAL', 'SERVICE_IN_PROGRESS', 'SERVICE_COMPLETED'];
                if (booking.subStatus && !atGarageSubStatuses.includes(booking.subStatus)) {
                     isTowingPhase = true;
                }
            } else if (booking.bookingType !== 'SPARE_PART') {
                isTowingPhase = true;
            }

            if (booking.status === 'CONFIRMED' && isTowingPhase) {
                const provider = booking.garage || booking.towTruck;
                const providerLocation = booking.garage?.location || booking.towTruck?.liveLocation?.location;

                if (provider && isGeoJSONPoint(booking.pickupLocation) && isGeoJSONPoint(providerLocation)) {
                    const userCoords = booking.pickupLocation.coordinates;
                    const providerCoords = providerLocation.coordinates;
                    const { etaMinutes, distanceKm } = await getEtaAndDistance({ lat: providerCoords[1], lon: providerCoords[0] }, { lat: userCoords[1], lon: userCoords[0] });
                    return { ...booking, providerEta: etaMinutes, providerDistance: distanceKm };
                }
            }
            
            return { ...booking, providerEta: null, providerDistance: null };
        }));

        return res.status(200).json(bookingsWithEta);

    } catch (error: any) {
        console.error("Failed to fetch active bookings:", error);
        return res.status(500).json({ error: 'An internal server error occurred' });
    }
});

bookingsRouter.get('/bookings/history', async (req: Request, res: Response) => {
    const customerClerkId = req.auth.userId;
    console.log(`[API] Fetching history for customer: ${customerClerkId}`);
    if (!customerClerkId) {
        console.error("[API] Unauthorized: customerClerkId is missing.");
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const pastBookings = await prisma.booking.findMany({
            where: {
                user: { clerkId: customerClerkId },
                status: { in: [BookingStatus.COMPLETED, BookingStatus.CANCELLED, BookingStatus.EXPIRED] }
            },
            include: {
                garage: { select: { name: true } },
                towTruck: { select: { name: true } },
                service: { select: { name: true } },
            },
            orderBy: {
                bookedAt: 'desc'
            }
        });
        console.log(`[API] Found ${pastBookings.length} past bookings for ${customerClerkId}`);
        return res.status(200).json(pastBookings);

    } catch (error: any) {
        console.error("Failed to fetch past bookings:", error);
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
                bookingType: 'ROADSIDE_ASSISTANCE', // Explicitly set booking type
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
                include: {
                    garage: { select: { id: true, name: true, rating: true, address: true, location: true } },
                    towTruck: { select: { id: true, name: true, model: true, make: true, liveLocation: true } },
                }
            });
            // TODO: Notify garage that the user failed to pay in time.
        }

        if (booking.status === BookingStatus.SEARCHING && booking.expiresAt && new Date() > booking.expiresAt) {
            booking = await prisma.booking.update({
                where: { id: booking.id },
                data: { status: BookingStatus.EXPIRED },
                include: {
                    garage: { select: { id: true, name: true, rating: true, address: true, location: true } },
                    towTruck: { select: { id: true, name: true, model: true, make: true, liveLocation: true } },
                }
            });
        }
        
        const provider = booking.garage || booking.towTruck;

        if (provider && (booking.status === BookingStatus.AWAITING_PAYMENT || booking.status === BookingStatus.CONFIRMED)) {
            const providerLocation = booking.garage?.location || booking.towTruck?.liveLocation?.location;

            if (isGeoJSONPoint(booking.pickupLocation) && isGeoJSONPoint(providerLocation)) {
                const userCoords = booking.pickupLocation.coordinates;
                const providerCoords = providerLocation.coordinates;
                
                // Correctly calculate provider-to-user ETA
                const { etaMinutes, distanceKm } = await getEtaAndDistance({ lat: providerCoords[1], lon: providerCoords[0] }, { lat: userCoords[1], lon: userCoords[0] });
                
                return res.status(200).json({
                    status: booking.status,
                    otp: booking.otp,
                    provider: { ...(provider as any), eta: etaMinutes, distance: distanceKm },
                    finalPrice: booking.finalAmount
                });
            }
        }

        return res.status(200).json({ status: booking.status, provider: provider, finalPrice: booking.finalAmount, otp: booking.otp });

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

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: BookingStatus.CONFIRMED,
                paymentStatus: 'authorized',
                paymentExpiresAt: null,
                otp: otp,
                otpExpiresAt: null,
            }
        });

        // TODO: Notify garage that payment is authorized and they can proceed.
        return res.status(200).json({ success: true, booking: updatedBooking });

    } catch (error: any) {
        console.error("Failed to confirm payment:", error);
        return res.status(500).json({ error: 'An internal server error occurred' });
    }
});

bookingsRouter.post('/bookings/:bookingId/confirm-cash', async (req: Request, res: Response) => {
    const { bookingId } = req.params;
    const customerClerkId = req.auth.userId;

    if (!customerClerkId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const booking = await prisma.booking.findFirst({
            where: { id: bookingId, user: { clerkId: customerClerkId } },
        });

        if (!booking) return res.status(404).json({ error: 'Booking not found.' });
        if (booking.status !== 'AWAITING_PAYMENT') return res.status(409).json({ error: 'This booking is not awaiting payment.' });
        if (booking.paymentExpiresAt && new Date() > booking.paymentExpiresAt) return res.status(410).json({ error: 'The payment window for this booking has expired.' });

        // No payment intent to check for cash payments

        const otp = generateOtp();

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: BookingStatus.CONFIRMED,
                paymentMethod: 'CASH', // Set payment method to CASH
                paymentStatus: 'authorized', // Or a new status like 'pending_cash'
                paymentExpiresAt: null,
                otp: otp,
                otpExpiresAt: null,
            },
        });

        // Notify provider that the booking is confirmed for cash payment
        const providerId = booking.garageId || booking.towTruckId;
        if (providerId) {
            const providerSocketId = providerSockets[providerId];
            if (providerSocketId) {
                io.to(providerSocketId).emit('booking_confirmed_by_user', { 
                    bookingId: updatedBooking.id, 
                    status: updatedBooking.status,
                    paymentMethod: 'CASH'
                });
                console.log(`📬 Emitted 'booking_confirmed_by_user' (CASH) to provider ${providerId}`);
            }
        }

        return res.status(200).json({ success: true, booking: updatedBooking });

    } catch (error: any) {
        console.error("Failed to confirm cash payment:", error);
        return res.status(500).json({ error: 'An internal server error occurred' });
    }
});

bookingsRouter.post('/bookings/:bookingId/create-payment-intent', async (req: Request, res: Response) => {
    const { bookingId } = req.params;
    const customerClerkId = req.auth.userId;

    if (!customerClerkId) return res.status(401).json({ error: 'Unauthorized' });
    let booking;
    try {
        booking = await prisma.booking.findUnique({
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
        if (booking && error.type === 'StripeInvalidRequestError' && error.param === 'transfer_data[destination]') {
            const provider = booking.garage || booking.towTruck;
            console.error(`CRITICAL: Invalid Stripe destination account ID for provider. Provider Type: ${booking.garage ? 'Garage' : 'TowTruck'}, Provider ID: ${provider?.id}, Stripe Account ID: ${provider?.stripeAccountId}`);
            return res.status(400).json({ error: 'This service provider is not currently set up to receive payments. Please contact support and reference this booking.' });
        }
         console.error("Payment Intent Error:", error);
        return res.status(500).json({ error: 'An error occurred while processing your payment.' });
    }
});

bookingsRouter.post('/bookings/:id/create-final-payment-intent', async (req: Request, res: Response) => {
    const { id: bookingId } = req.params;
    const customerClerkId = req.auth.userId;

    if (!customerClerkId) return res.status(401).json({ error: 'Unauthorized' });
    let booking;
    try {
        booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { garage: true, user: true },
        });

        if (!booking || booking.user.clerkId !== customerClerkId) {
            return res.status(404).json({ error: 'Booking not found or not owned by user.' });
        }

        const provider = booking.garage;
        if (!provider || !provider.stripeAccountId) {
            return res.status(400).json({ error: 'Provider is not set up to receive payments.' });
        }

        let stripeCustomerId = booking.user.stripeCustomerId;
        if (!stripeCustomerId) {
            const customer = await stripe.customers.create({ email: booking.user.email, name: `${booking.user.firstName} ${booking.user.lastName}` });
            stripeCustomerId = customer.id;
            await prisma.user.update({ where: { id: booking.user.id }, data: { stripeCustomerId } });
        }

        if (!booking.finalEstimateAmount) return res.status(400).json({ error: 'Final estimate amount not set.' });

        const amountInCents = Math.round(booking.finalEstimateAmount * 100);
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
                type: 'final_garage_service',
            }
        });

        await prisma.booking.update({ where: { id: bookingId }, data: { garagePaymentIntentId: paymentIntent.id }});

        return res.status(200).json({ clientSecret: paymentIntent.client_secret });

    } catch (error: any) {
        if (booking && error.type === 'StripeInvalidRequestError' && error.param === 'transfer_data[destination]') {
            const provider = booking.garage;
            console.error(`CRITICAL: Invalid Stripe destination account ID for provider. Provider Type: Garage, Provider ID: ${provider?.id}, Stripe Account ID: ${provider?.stripeAccountId}`);
            return res.status(400).json({ error: 'This service provider is not currently set up to receive payments. Please contact support and reference this booking.' });
        }
         console.error("Payment Intent Error:", error);
        return res.status(500).json({ error: 'An error occurred while processing your payment.' });
    }
});

bookingsRouter.post('/bookings/request-tow-to-garage', async (req: Request, res: Response) => {
    console.log("--- [API] Received /request-tow-to-garage ---");
    const { vehicleId, pickup } = req.body;
    const ownerId = req.auth.userId;

    if (!vehicleId || !pickup?.latitude || !ownerId) {
        return res.status(400).json({ reason: "Missing vehicleId, pickup location, or authentication." });
    }

    const SEARCH_TIMEOUT_MINUTES = 5;

    try {
        const user = await prisma.user.findUnique({ where: { clerkId: ownerId } });
        if (!user) return res.status(404).json({ reason: "User profile not found." });

        const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
        if (!vehicle) return res.status(404).json({ reason: "Vehicle not found." });

        let requiredServiceCategory: string;
        switch (vehicle.type) {
            case 'SEDAN':
            case 'HATCHBACK':
            case 'SUV':
                requiredServiceCategory = 'INGARAGE_CAR';
                break;
            case 'BIKE':
                requiredServiceCategory = 'INGARAGE_BIKE';
                break;
            case 'LUXURY':
                requiredServiceCategory = 'LUXURY';
                break;
            default:
                return res.status(400).json({ reason: `The selected vehicle type (${vehicle.type}) is not supported for this service.` });
        }
        console.log(`[API] Vehicle type ${vehicle.type} requires garage category: ${requiredServiceCategory}`);

        // 1. Find all nearby, open, and approved garages
        const nearbyGaragesRaw = await prisma.garage.aggregateRaw({
            pipeline: [
                {
                    '$geoNear': {
                        near: { type: "Point", coordinates: [pickup.longitude, pickup.latitude] },
                        distanceField: "distance",
                        maxDistance: 15000, // 15km in meters
                        query: { isOpen: true, status: 'APPROVED' },
                        spherical: true
                    }
                },
                { '$limit': 50 } // Get a larger pool to filter from
            ]
        });

        if (!Array.isArray(nearbyGaragesRaw) || nearbyGaragesRaw.length === 0) {
            return res.status(404).json({ reason: `No approved garages were found within 15km.` });
        }

        // 2. From the nearby garages, find which ones actually offer the required service category.
        const nearbyGarageIds = nearbyGaragesRaw.map((g: any) => g._id.$oid);
        const garagesWithCorrectServices = await prisma.garage.findMany({
            where: {
                id: { in: nearbyGarageIds },
                services: { some: { service: { category: requiredServiceCategory as any } } }
            },
            select: { id: true }
        });

        const eligibleGarageIds = garagesWithCorrectServices.map(g => g.id);

        if (eligibleGarageIds.length === 0) {
            return res.status(404).json({ reason: `No approved garages supporting ${requiredServiceCategory} were found within 15km.` });
        }
        console.log(`[API] Found ${eligibleGarageIds.length} eligible garages.`);

        const pickupGeo = { type: 'Point', coordinates: [pickup.longitude, pickup.latitude], description: pickup.description };

        const newBooking = await prisma.booking.create({
            data: {
                bookingType: 'TOW_TO_GARAGE',
                status: BookingStatus.SEARCHING,
                subStatus: 'AWAITING_GARAGE_ACCEPTANCE',
                user: { connect: { id: user.id } },
                vehicle: { connect: { id: vehicleId } },
                basePrice: 0,
                finalAmount: 0,
                expiresAt: new Date(Date.now() + SEARCH_TIMEOUT_MINUTES * 60 * 1000),
                eligibleProviderIds: eligibleGarageIds,
                pickupLocation: pickupGeo,
            }
        });
        console.log(`[API] Created TOW_TO_GARAGE booking ${newBooking.id}`);

        const detailedBooking = await prisma.booking.findUnique({
            where: { id: newBooking.id },
            include: {
                user: { select: { firstName: true, lastName: true } },
                vehicle: true,
            }
        });

        if (detailedBooking) {
            console.log(`[Socket.IO] Broadcasting tow-in request ${detailedBooking.id} to ${detailedBooking.eligibleProviderIds.length} garages.`);
            const userLocation = { lat: pickup.latitude, lon: pickup.longitude };
            for (const providerId of detailedBooking.eligibleProviderIds) {
                try {
                    const garage = await prisma.garage.findUnique({ where: { id: providerId } });
                    if (garage && garage.location && isGeoJSONPoint(garage.location)) {
                        const garageLocation = { lat: garage.location.coordinates[1], lon: garage.location.coordinates[0] };
                        const { distanceKm } = await getEtaAndDistance(userLocation, garageLocation);

                        const socketId = providerSockets[providerId];
                        if (socketId) {
                            io.to(socketId).emit('new_tow_in_request', { ...detailedBooking, distance: distanceKm });
                            console.log(`📬 Emitted 'new_tow_in_request' to garage ${providerId} on socket ${socketId}`);
                        } else {
                            console.log(`- Garage ${providerId} is not connected.`);
                        }
                    }
                } catch (e) {
                    console.error(`Failed to process and emit for garage ${providerId}`, e);
                }
            }
        }

        return res.status(202).json({ bookingId: newBooking.id, eligibleGarageCount: eligibleGarageIds.length });

    } catch (error: any) {
        console.error("🔴 [API] CRITICAL ERROR in /request-tow-to-garage:", error);
        return res.status(500).json({ reason: 'An internal server error occurred.', details: error.message });
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

        const cancellableStatuses: BookingStatus[] = [
            BookingStatus.SEARCHING,
            BookingStatus.PENDING_ACCEPTANCE,
            BookingStatus.AWAITING_PAYMENT,
            BookingStatus.CONFIRMED,
        ];

        if (!cancellableStatuses.includes(booking.status)) {
            return res.status(403).json({ error: 'This booking cannot be cancelled at its current stage.' });
        }

        // If confirmed, only allow cancellation within 2 minutes.
        if (booking.status === BookingStatus.CONFIRMED) {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            if (booking.updatedAt < fiveMinutesAgo) {
                return res.status(403).json({ error: 'This booking was confirmed more than 5 minutes ago and can no longer be cancelled.' });
            }
        }

        if (booking.paymentIntentId && booking.paymentIntentId.startsWith('pi_')) {
            const intent = await stripe.paymentIntents.retrieve(booking.paymentIntentId);
            if (intent.status === 'requires_capture') {
                await stripe.paymentIntents.cancel(booking.paymentIntentId);
            }
        }

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: BookingStatus.CANCELLED,
                cancellationReason: 'Cancelled by user.',
            }
        });

        // Notify garage/tow truck of the cancellation.
        const providerId = booking.garageId || booking.towTruckId;
        if (providerId) {
            const providerSocketId = providerSockets[providerId];
            if (providerSocketId) {
                io.to(providerSocketId).emit('booking_cancelled_by_customer', {
                    bookingId: updatedBooking.id,
                    reason: 'Customer cancelled the booking.'
                });
                console.log(`📬 Emitted 'booking_cancelled_by_customer' to provider ${providerId}`);
            }
        }

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
            include: { garage: true, towTruck: true, user: true },
        });

        if (!booking || (!booking.garage && !booking.towTruck)) return res.status(404).json({ error: 'Booking not found or you are not the assigned provider.' });

        if (!([BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS] as BookingStatus[]).includes(booking.status)) {
            return res.status(403).json({ error: 'This booking cannot be cancelled at its current stage.' });
        }

        if (booking.paymentIntentId && booking.paymentIntentId.startsWith('pi_')) {
            if (booking.paymentStatus === 'paid') {
                await stripe.refunds.create({ payment_intent: booking.paymentIntentId });
            } else if (booking.paymentStatus === 'authorized') {
                await stripe.paymentIntents.cancel(booking.paymentIntentId);
            }
        }

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: BookingStatus.CANCELLED,
                paymentStatus: booking.paymentStatus === 'paid' ? 'refunded' : 'cancelled',
                cancellationReason: reason,
            }
        });

        // Notify user of the cancellation and refund.
        const customerSocketId = customerSockets[booking.user.clerkId];
        if (customerSocketId) {
            io.to(customerSocketId).emit('booking_cancelled_by_provider', { 
                bookingId: updatedBooking.id,
                reason: reason 
            });
            console.log(`📬 Emitted 'booking_cancelled_by_provider' to customer ${booking.user.clerkId}`);
        }

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

            const pickupGeo = { type: 'Point', coordinates: [pickup.longitude, pickup.latitude], description: pickup.description };
            const destinationGeo = { type: 'Point', coordinates: [destination.longitude, destination.latitude], description: destination.description };

            const newBooking = await prisma.booking.create({
                data: {
                    bookingType: 'DIRECT_TOW', // Explicitly set booking type
                    status: BookingStatus.SEARCHING,
                    user: { connect: { id: user.id } },
                    vehicle: { connect: { id: vehicleId } },
                    basePrice: basePrice,
                    finalAmount: basePrice, // This will be recalculated later
                    expiresAt: new Date(Date.now() + SEARCH_TIMEOUT_MINUTES * 60 * 1000),
                    eligibleProviderIds: eligibleProviderIds,
                    pickupLocation: pickupGeo,
                    destinationLocation: destinationGeo,
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
                console.log(`[Socket.IO] Broadcasting tow booking ${detailedBooking.id} to ${eligibleTrucks.length} providers.`);
                const userLocation = { lat: pickup.latitude, lon: pickup.longitude };
                const destinationLocation = { lat: destination.latitude, lon: destination.longitude };

                // Calculate the total towing distance once.
                const { distanceKm: totalTowingDistance } = await getEtaAndDistance(userLocation, destinationLocation);

                for (const truck of eligibleTrucks) {
                    try {
                        // Calculate the estimated fare for this specific truck
                        const service = truck.services.find(s => s.vehicleType === vehicleType);
                        const pricePerKm = service?.price || 0;
                        const estimatedFare = totalTowingDistance !== null ? totalTowingDistance * pricePerKm : pricePerKm;

                        // Calculate distance from truck to user
                        const truckLocation = await prisma.liveTruckLocation.findUnique({ where: { towTruckId: truck.id } });
                        let distanceToPickup = null;
                        if (truckLocation && truckLocation.location && isGeoJSONPoint(truckLocation.location)) {
                            const providerCoords = { lat: truckLocation.location.coordinates[1], lon: truckLocation.location.coordinates[0] };
                            const { distanceKm } = await getEtaAndDistance(userLocation, providerCoords);
                            distanceToPickup = distanceKm;
                        }

                        const socketId = providerSockets[truck.id];
                        if (socketId) {
                            // Send a custom payload with the calculated fare for this provider
                            io.to(socketId).emit('new_booking', { 
                                ...detailedBooking, 
                                distance: distanceToPickup,
                                totalDistance: totalTowingDistance,
                                finalAmount: estimatedFare, // Overwrite finalAmount with the estimated fare
                            });
                            console.log(`📬 Emitted 'new_booking' to provider ${truck.id} with estimated fare ${estimatedFare}`);
                        } else {
                            console.log(`- Provider ${truck.id} is not connected.`);
                        }
                    } catch (e) {
                        console.error(`Failed to process and emit for provider ${truck.id}`, e);
                    }
                }
            }
            return res.status(202).json({ bookingId: newBooking.id, eligibleTruckCount: eligibleTrucks.length });

        } catch (error: any) {
            console.error("🔴 [API] CRITICAL ERROR in /request-towing:", error);
        return res.status(500).json({ reason: 'An internal server error occurred.', details: error.message });
    }
});

bookingsRouter.get('/stripe/payment-methods', async (req: Request, res: Response) => {
    const customerClerkId = req.auth.userId;
    if (!customerClerkId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const user = await prisma.user.findUnique({
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

    } catch (error: any) {
        console.error("🔴 [API] Error fetching payment methods:", error);
        return res.status(500).json({ error: 'Failed to retrieve payment methods.' });
    }
});

bookingsRouter.post('/stripe/create-setup-intent', async (req: Request, res: Response) => {
    const customerClerkId = req.auth.userId;
    if (!customerClerkId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const user = await prisma.user.findUnique({ where: { clerkId: customerClerkId } });
        if (!user) return res.status(404).json({ error: 'User not found.' });

        let stripeCustomerId = user.stripeCustomerId;
        if (!stripeCustomerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: `${user.firstName} ${user.lastName || ''}`,
                phone: user.phone,
            });
            stripeCustomerId = customer.id;
            await prisma.user.update({
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

    } catch (error: any) {
        console.error("🔴 [API] Error creating setup intent:", error);
        return res.status(500).json({ error: 'Could not prepare to save card.' });
    }
});

bookingsRouter.post('/stripe/detach-payment-method', async (req: Request, res: Response) => {
    const { paymentMethodId } = req.body;
    const customerClerkId = req.auth.userId;

    if (!customerClerkId) return res.status(401).json({ error: 'Unauthorized' });
    if (!paymentMethodId) return res.status(400).json({ error: 'paymentMethodId is required.' });

    try {
        const detachedPaymentMethod = await stripe.paymentMethods.detach(paymentMethodId);
        return res.status(200).json({ success: true, id: detachedPaymentMethod.id });
    } catch (error: any) {
        console.error("🔴 [API] Error detaching payment method:", error);
        return res.status(500).json({ error: 'Failed to detach payment method.' });
    }
});

bookingsRouter.post('/stripe/disconnect-account', async (req: Request, res: Response) => {
    const ownerClerkId = req.auth.userId;
    const { businessType } = req.body;

    if (!ownerClerkId) return res.status(401).json({ error: 'Unauthorized' });
    if (!businessType) return res.status(400).json({ error: 'businessType is required.' });
    if (businessType !== 'garage' && businessType !== 'tow-truck') return res.status(400).json({ error: 'Invalid businessType.' });

    try {
        const user = await prisma.user.findUnique({
            where: { clerkId: ownerClerkId },
            include: { garage: true, towTruck: true },
        });

        if (!user) return res.status(404).json({ error: 'User not found.' });

        const business = businessType === 'garage' ? user.garage : user.towTruck;
        if (!business) return res.status(404).json({ error: `No ${businessType} found for this user.` });

        // It's safer to just nullify the ID in our DB than to delete the account on Stripe
        if (businessType === 'garage') {
            await prisma.garage.update({ where: { id: business.id }, data: { stripeAccountId: null } });
        } else {
            await prisma.towTruck.update({ where: { id: business.id }, data: { stripeAccountId: null } });
        }
        
        console.log(`[StripeConnect] Disconnected Stripe account for ${businessType} ID: ${business.id}`);
        return res.status(200).json({ success: true, message: 'Stripe account disconnected successfully.' });

    } catch (error: any) {
        console.error("🔴 [API] Error disconnecting Stripe account:", error);
        return res.status(500).json({ error: 'Failed to disconnect Stripe account.' });
    }
});

bookingsRouter.post('/stripe/create-connect-account', async (req: Request, res: Response) => {
    const ownerClerkId = req.auth.userId;
    const { businessType, businessId } = req.body;

    if (!ownerClerkId) return res.status(401).json({ error: 'Unauthorized' });
    if (!businessType || !businessId) return res.status(400).json({ error: 'businessType and businessId are required.' });
    if (businessType !== 'garage' && businessType !== 'tow-truck') return res.status(400).json({ error: 'Invalid businessType.' });

    try {
        let user = await prisma.user.findUnique({
            where: { clerkId: ownerClerkId },
            include: { garage: true, towTruck: true },
        });

        if (!user) return res.status(404).json({ error: 'User not found.' });

        if (!user.email || !user.email.trim() || user.email.endsWith('@placeholder.email')) {
            console.log(`[StripeConnect] User ${user.id} has invalid email: "${user.email}". Fetching from Clerk...`);
            const clerkUser = await clerkClient.users.getUser(ownerClerkId);
            const primaryEmailObject = clerkUser.emailAddresses.find(e => e.id === clerkUser.primaryEmailAddressId);
            const primaryEmail = primaryEmailObject?.emailAddress;

            if (primaryEmail && primaryEmail.trim()) {
                console.log(`[StripeConnect] Found primary email on Clerk: "${primaryEmail}". Updating local DB.`);
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: { email: primaryEmail },
                    include: { garage: true, towTruck: true }, // Re-include relations
                });
            } else {
                console.error(`[StripeConnect] Could not find a valid email for user ${user.id} on Clerk.`);
                return res.status(400).json({ error: 'A valid email is required to create a Stripe account, but none was found for your profile.' });
            }
        }

        const business = businessType === 'garage' ? user.garage : user.towTruck;
        if (!business || business.id !== businessId) return res.status(403).json({ error: 'User does not own this business.' });




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
                await prisma.garage.update({ where: { id: businessId }, data: { stripeAccountId: accountId } });
            } else {
                await prisma.towTruck.update({ where: { id: businessId }, data: { stripeAccountId: accountId } });
            }
        }

        const accountLink = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: `${process.env.APP_URL}/settings/payments?reauth=true`,
            return_url: `${process.env.APP_URL}/settings/payments?stripe_return=true`,
            type: 'account_onboarding',
        });

        return res.status(200).json({ url: accountLink.url });

    } catch (error: any) {
        console.error("🔴 [API] Error creating Stripe connect account:", error);
        return res.status(500).json({ error: 'Failed to create Stripe connection.' });
    }
});

bookingsRouter.post('/bookings/request-spare-part', async (req: Request, res: Response) => {
    const { partId, quantity, paymentMethod } = req.body;
    const customerClerkId = req.auth.userId;

    if (!partId || !quantity || !paymentMethod) {
        return res.status(400).json({ error: 'Part ID, quantity, and payment method are required.' });
    }

    try {
        const part = await prisma.sparePart.findUnique({ where: { id: partId }, include: { store: true } });
        if (!part) return res.status(404).json({ error: 'Spare part not found.' });
        if (part.quantity < quantity) return res.status(400).json({ error: 'Not enough stock available.' });

        const user = await prisma.user.findUnique({ where: { clerkId: customerClerkId } });
        if (!user) return res.status(404).json({ error: 'User not found.' });

        const finalAmount = part.price * quantity;

        const booking = await prisma.booking.create({
            data: {
                bookingType: 'SPARE_PART',
                status: 'PENDING_ACCEPTANCE',
                paymentMethod: paymentMethod,
                finalAmount: finalAmount,
                user: { connect: { id: user.id } },
                sparePart: { connect: { id: part.id } },
                sparePartStore: { connect: { id: part.storeId } },
                basePrice: finalAmount,
            }
        });

        // Notify seller of new order
        const sellerSocketId = providerSockets[part.store.ownerId];
        if (sellerSocketId) {
            io.to(sellerSocketId).emit('new_spare_part_order', booking);
        }

        return res.status(201).json({ bookingId: booking.id, message: 'Order placed and awaiting seller confirmation.' });

    } catch (error: any) {
        console.error("Failed to request spare part:", error);
        return res.status(500).json({ error: 'An internal server error occurred.' });
    }
});


bookingsRouter.post('/bookings/:bookingId/reject-quote', async (req: Request, res: Response) => {
    const { bookingId } = req.params;
    const customerClerkId = req.auth.userId;

    if (!customerClerkId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const booking = await prisma.booking.findFirst({
            where: {
                id: bookingId,
                user: { clerkId: customerClerkId }
            },
            include: { garage: true }
        });

        if (!booking) return res.status(404).json({ error: 'Booking not found.' });

        if (booking.subStatus !== 'AWAITING_QUOTE_APPROVAL') {
            return res.status(403).json({ error: 'This quote is not awaiting your approval.' });
        }

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: BookingStatus.CANCELLED,
                cancellationReason: 'Customer rejected the service quote.',
            }
        });

        if (booking.garage?.id) {
            const providerSocketId = providerSockets[booking.garage.id];
            if (providerSocketId) {
                io.to(providerSocketId).emit('quote_rejected_by_customer', {
                    bookingId: updatedBooking.id,
                    reason: 'Customer rejected the service quote.'
                });
                console.log(`📬 Emitted 'quote_rejected_by_customer' to provider ${booking.garage.id}`);
            }
        }

        return res.status(200).json({ success: true, message: 'Quote rejected and booking cancelled.' });

    } catch (error: any) {
        console.error("Failed to reject quote:", error);
        return res.status(500).json({ error: 'An internal server error occurred' });
    }
});

export default bookingsRouter;

bookingsRouter.post('/bookings/:id/submit-quote', async (req: Request, res: Response) => {
    const { id: bookingId } = req.params;
    const { vehicleStatus, servicesRequired, servicesEstimate, jobEstimate, notes } = req.body;
    const garageOwnerId = req.auth.userId;

    if (!jobEstimate || !servicesRequired) {
        return res.status(400).json({ error: "Job Estimate and Services Required are mandatory." });
    }

    try {
        const booking = await prisma.booking.findFirst({
            where: {
                id: bookingId,
                garage: { owner: { clerkId: garageOwnerId } },
            },
            include: { user: true }
        });

        if (!booking) return res.status(404).json({ error: "Booking not found or not assigned to you." });
        if (booking.bookingType !== 'TOW_TO_GARAGE' || booking.subStatus !== 'AWAITING_GARAGE_QUOTE') {
            return res.status(409).json({ error: 'This booking is not awaiting a quote.' });
        }

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                vehicleStatus: vehicleStatus,
                servicesRequired: servicesRequired,
                servicesEstimate: servicesEstimate,
                jobEstimate: jobEstimate,
                notes: notes, // Re-using this field for general notes
                subStatus: 'AWAITING_QUOTE_APPROVAL',
            }
        });

        // --- Notify customer via WebSocket ---
        const customerSocketId = customerSockets[booking.user.clerkId];
        if (customerSocketId) {
            io.to(customerSocketId).emit('garage_quote_ready', {
                bookingId: updatedBooking.id,
                quote: {
                    vehicleStatus: updatedBooking.vehicleStatus,
                    servicesRequired: updatedBooking.servicesRequired,
                    servicesEstimate: updatedBooking.servicesEstimate,
                    jobEstimate: updatedBooking.jobEstimate,
                    notes: updatedBooking.notes,
                }
            });
            console.log(`📬 Emitted 'garage_quote_ready' to customer ${booking.user.clerkId}`);
        }

        return res.status(200).json({ success: true, booking: updatedBooking });

    } catch (error: any) {
        console.error("Failed to submit quote:", error);
        return res.status(500).json({ error: 'An internal server error occurred.' });
    }
});

bookingsRouter.post('/bookings/:bookingId/reject-spare-part', async (req: Request, res: Response) => {
    const { bookingId } = req.params;
    const sellerClerkId = req.auth.userId;

    try {
        const booking = await prisma.booking.findFirst({
            where: {
                id: bookingId,
                sparePartStore: { owner: { clerkId: sellerClerkId } }
            },
            include: { user: true }
        });

        if (!booking) return res.status(404).json({ error: "Order not found or you are not the seller." });
        if (booking.status !== 'PENDING_ACCEPTANCE') return res.status(409).json({ error: "This order is not in a pending acceptance state." });

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: BookingStatus.REJECTED,
                cancellationReason: 'Seller rejected the order.',
            }
        });

        // Notify customer via WebSocket
        const customerSocketId = customerSockets[booking.user.clerkId];
        if (customerSocketId) {
            io.to(customerSocketId).emit('spare_part_order_rejected', { bookingId: updatedBooking.id });
        }

        return res.status(200).json({ success: true, booking: updatedBooking });

    } catch (error: any) {
        console.error("Failed to reject spare part order:", error);
        return res.status(500).json({ error: 'An internal server error occurred.' });
    }
});

bookingsRouter.post('/bookings/:bookingId/confirm-spare-part-payment', async (req: Request, res: Response) => {
    const { bookingId } = req.params;
    const customerClerkId = req.auth.userId;

    if (!customerClerkId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const booking = await prisma.booking.findFirst({
            where: { id: bookingId, user: { clerkId: customerClerkId } },
            include: { sparePartStore: true }
        });

        if (!booking) return res.status(404).json({ error: 'Booking not found.' });
        if (booking.bookingType !== 'SPARE_PART' || booking.status !== 'AWAITING_PAYMENT') return res.status(409).json({ error: 'This booking is not awaiting payment for a spare part.' });
        if (!booking.paymentIntentId) return res.status(400).json({ error: 'Payment has not been initiated for this booking.' });

        const intent = await stripe.paymentIntents.retrieve(booking.paymentIntentId);
        if (intent.status !== 'requires_capture') {
            return res.status(400).json({ error: 'Payment could not be authorized. Please try again.' });
        }

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: BookingStatus.CONFIRMED,
                paymentStatus: 'paid',
                paymentExpiresAt: null,
            }
        });

        // Notify seller that payment is confirmed
        if (booking.sparePartStore?.ownerId) {
            const sellerSocketId = providerSockets[booking.sparePartStore.ownerId];
            if (sellerSocketId) {
                io.to(sellerSocketId).emit('spare_part_payment_confirmed', { bookingId: updatedBooking.id });
            }
        }

        return res.status(200).json({ success: true, booking: updatedBooking });

    } catch (error: any) {
        console.error("Failed to confirm spare part payment:", error);
        return res.status(500).json({ error: 'An internal server error occurred' });
    }
});

bookingsRouter.post('/bookings/:bookingId/confirm-spare-part-cash', async (req: Request, res: Response) => {
    const { bookingId } = req.params;
    const customerClerkId = req.auth.userId;

    if (!customerClerkId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const booking = await prisma.booking.findFirst({
            where: { id: bookingId, user: { clerkId: customerClerkId } },
            include: { sparePartStore: true }
        });

        if (!booking) return res.status(404).json({ error: 'Booking not found.' });
        if (booking.bookingType !== 'SPARE_PART' || booking.status !== 'PENDING_ACCEPTANCE') return res.status(409).json({ error: 'This booking is not awaiting cash confirmation for a spare part.' });

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: BookingStatus.CONFIRMED,
                paymentMethod: 'CASH',
                paymentStatus: 'pending_cash',
            },
        });

        // Notify seller that cash order is confirmed
        if (booking.sparePartStore?.ownerId) {
            const sellerSocketId = providerSockets[booking.sparePartStore.ownerId];
            if (sellerSocketId) {
                io.to(sellerSocketId).emit('spare_part_cash_order_confirmed', { bookingId: updatedBooking.id });
            }
        }

        return res.status(200).json({ success: true, booking: updatedBooking });

    } catch (error: any) {
        console.error("Failed to confirm spare part cash payment:", error);
        return res.status(500).json({ error: 'An internal server error occurred' });
    }
});

bookingsRouter.post('/bookings/:bookingId/create-garage-payment-intent', async (req: Request, res: Response) => {
    const { bookingId } = req.params;
    const customerClerkId = req.auth.userId;

    if (!customerClerkId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { garage: true, user: true },
        });

        if (!booking || booking.user.clerkId !== customerClerkId) {
            return res.status(404).json({ error: 'Booking not found or not owned by user.' });
        }
        if (!booking.garage || !booking.garage.stripeAccountId) {
            return res.status(400).json({ error: 'Provider is not set up to receive payments.' });
        }
        if (!booking.jobEstimate) {
            return res.status(400).json({ error: 'No quote amount set for this booking.' });
        }

        const amountInCents = Math.round(booking.jobEstimate * 100);
        const applicationFee = Math.round(amountInCents * 0.10);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: 'inr',
            customer: booking.user.stripeCustomerId!,
            application_fee_amount: applicationFee,
            transfer_data: {
                destination: booking.garage.stripeAccountId,
            },
            capture_method: 'manual',
            metadata: {
                bookingId: booking.id,
                userId: booking.user.id,
                paymentType: 'garage_service'
            }
        });

        await prisma.booking.update({ where: { id: bookingId }, data: { garagePaymentIntentId: paymentIntent.id }});

        return res.status(200).json({ clientSecret: paymentIntent.client_secret });

    } catch (error: any) {
        console.error("Garage Payment Intent Error:", error);
        return res.status(500).json({ error: 'An error occurred while processing your payment.' });
    }
});

bookingsRouter.post('/bookings/:bookingId/confirm-garage-payment', async (req: Request, res: Response) => {
    const { bookingId } = req.params;
    const customerClerkId = req.auth.userId;

    if (!customerClerkId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const booking = await prisma.booking.findFirst({
            where: { id: bookingId, user: { clerkId: customerClerkId } },
            include: { garage: true }
        });

        if (!booking) return res.status(404).json({ error: 'Booking not found.' });
        if (booking.subStatus !== 'AWAITING_QUOTE_APPROVAL') return res.status(409).json({ error: 'This booking is not awaiting quote approval.' });
        if (!booking.garagePaymentIntentId) return res.status(400).json({ error: 'Payment has not been initiated for this booking.' });

        const intent = await stripe.paymentIntents.retrieve(booking.garagePaymentIntentId);
        if (intent.status !== 'requires_capture') {
            return res.status(400).json({ error: 'Payment could not be authorized. Please try again.' });
        }

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                subStatus: 'SERVICE_IN_PROGRESS',
                garagePaymentStatus: 'authorized',
            }
        });
        
        // Notify garage that service can begin
        if (booking.garage) {
            const garageSocketId = providerSockets[booking.garage.id];
            if (garageSocketId) {
                io.to(garageSocketId).emit('garage_service_approved', { bookingId: updatedBooking.id });
            }
        }

        return res.status(200).json({ success: true, booking: updatedBooking });

    } catch (error: any) {
        console.error("Failed to confirm garage payment:", error);
        return res.status(500).json({ error: 'An internal server error occurred' });
    }
});

bookingsRouter.post('/bookings/:bookingId/confirm-garage-cash', async (req: Request, res: Response) => {
    const { bookingId } = req.params;
    const customerClerkId = req.auth.userId;

    if (!customerClerkId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const booking = await prisma.booking.findFirst({
            where: { id: bookingId, user: { clerkId: customerClerkId } },
            include: { garage: true }
        });

        if (!booking) return res.status(404).json({ error: 'Booking not found.' });
        if (booking.subStatus !== 'AWAITING_QUOTE_APPROVAL') return res.status(409).json({ error: 'This booking is not awaiting quote approval.' });

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                subStatus: 'SERVICE_IN_PROGRESS',
                garagePaymentStatus: 'pending_cash',
            },
        });

        // Notify garage that service can begin
        if (booking.garage) {
            const garageSocketId = providerSockets[booking.garage.id];
            if (garageSocketId) {
                io.to(garageSocketId).emit('garage_service_approved', { bookingId: updatedBooking.id });
            }
        }

        return res.status(200).json({ success: true, booking: updatedBooking });

    } catch (error: any) {
        console.error("Failed to confirm garage cash payment:", error);
        return res.status(500).json({ error: 'An internal server error occurred' });
    }
});
