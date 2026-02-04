import { BookingStatus } from '@prisma/client';
import Stripe from 'stripe';
import prisma from '../lib/prisma';
import { customerSockets, io, providerSockets } from '../socket';
import { AppError } from '../utils/AppError';
import { getEtaAndDistance, isGeoJSONPoint } from './geo.service';
import { PRICE_PER_KM } from './pricing.service';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' as any });

export class BookingService {

    static async getUserBookingHistory(userId: string) {
        const user = await prisma.user.findUnique({ where: { clerkId: userId } });
        if (!user) throw new AppError(404, "User not found.");

        return await prisma.booking.findMany({
            where: { userId: user.id },
            include: {
                garage: { select: { name: true, contactPhone: true } },
                towTruck: { select: { name: true } },
                service: { select: { name: true } },
                sparePart: { select: { partName: true } }
            },
            orderBy: { bookedAt: 'desc' }
        });
    }

    static async getActiveBookings(userId: string) {
        const user = await prisma.user.findUnique({ where: { clerkId: userId } });
        if (!user) throw new AppError(404, "User not found.");

        const activeStatuses = [
            BookingStatus.SEARCHING,
            BookingStatus.AWAITING_PAYMENT,
            BookingStatus.CONFIRMED,
            BookingStatus.IN_PROGRESS,
            BookingStatus.PENDING_ACCEPTANCE
        ];

        return await prisma.booking.findMany({
            where: {
                userId: user.id,
                status: { in: activeStatuses }
            },
            include: {
                garage: { select: { name: true, contactPhone: true } },
                towTruck: { select: { name: true } },
                service: { select: { name: true } },
                sparePart: { select: { partName: true } }
            },
            orderBy: { bookedAt: 'desc' }
        });
    }

    static async getSparePartOrders(sellerClerkId: string, statusQuery: string) {
        const store = await prisma.sparePartStore.findFirst({
            where: { owner: { clerkId: sellerClerkId } }
        });
        if (!store) throw new AppError(404, "Spare part store not found for this user.");

        let statuses: BookingStatus[];
        if (statusQuery === 'Pending') {
            statuses = [BookingStatus.PENDING_ACCEPTANCE];
        } else if (statusQuery === 'Current') {
            statuses = [BookingStatus.AWAITING_PAYMENT, BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS];
        } else if (statusQuery === 'History') {
            statuses = [BookingStatus.COMPLETED, BookingStatus.CANCELLED];
        } else {
            throw new AppError(400, "Invalid status query parameter.");
        }

        return await prisma.booking.findMany({
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
    }

    static async acceptSparePartOrder(bookingId: string, sellerClerkId: string) {
        const booking = await prisma.booking.findFirst({
            where: {
                id: bookingId,
                sparePartStore: { owner: { clerkId: sellerClerkId } }
            },
            include: { sparePart: true, user: true }
        });

        if (!booking) throw new AppError(404, "Order not found or you are not the seller.");
        if (booking.status !== 'PENDING_ACCEPTANCE') throw new AppError(409, "This order is not awaiting acceptance.");
        if (!booking.sparePart) throw new AppError(404, "Associated spare part not found.");

        const partToUpdate = booking.sparePart;
        const quantityToOrder = booking.basePrice / partToUpdate.price;

        if (partToUpdate.quantity < quantityToOrder) {
            throw new AppError(400, 'Not enough stock available to accept this order.');
        }

        const [, updatedBooking] = await prisma.$transaction([
            prisma.sparePart.update({
                where: { id: partToUpdate.id },
                data: { quantity: { decrement: quantityToOrder } },
            }),
            prisma.booking.update({
                where: { id: bookingId },
                data: {
                    status: booking.paymentMethod === 'CARD' ? BookingStatus.AWAITING_PAYMENT : BookingStatus.CONFIRMED,
                    paymentExpiresAt: null,
                },
                include: { user: true, sparePart: { include: { store: true } } }
            })
        ]);

        if (updatedBooking.paymentMethod === 'CARD') {
            const { user, sparePart, finalAmount } = updatedBooking;
            if (!user.stripeCustomerId || !(sparePart!.store as any).stripeAccountId) {
                console.warn(`[Stripe Bypass] Stripe accounts not configured for booking ${updatedBooking.id}. Forcing CASH payment.`);
                await prisma.booking.update({
                    where: { id: updatedBooking.id },
                    data: { paymentMethod: 'CASH', status: BookingStatus.CONFIRMED },
                });
                const customerSocketId = customerSockets[user.clerkId];
                if (customerSocketId) {
                    io.to(customerSocketId).emit('spare_part_order_confirmed', { bookingId: updatedBooking.id });
                }
                return { success: true, booking: updatedBooking, message: "Stripe not configured, defaulted to cash payment." };
            }

            const amountInCents = Math.round(finalAmount * 100);
            const applicationFee = Math.round(amountInCents * 0.10);

            const paymentIntent = await stripe.paymentIntents.create({
                amount: amountInCents,
                currency: 'inr',
                customer: user.stripeCustomerId,
                application_fee_amount: applicationFee,
                transfer_data: { destination: (sparePart.store as any).stripeAccountId },
                capture_method: 'manual',
                metadata: { bookingId: updatedBooking.id, type: 'spare_part_purchase' },
            });

            await prisma.booking.update({ where: { id: updatedBooking.id }, data: { paymentIntentId: paymentIntent.id } });

            const customerSocketId = customerSockets[user.clerkId];
            if (customerSocketId) {
                io.to(customerSocketId).emit('spare_part_order_accepted', {
                    bookingId: updatedBooking.id,
                    clientSecret: paymentIntent.client_secret
                });
            }
        } else {
            const customerSocketId = customerSockets[updatedBooking.user.clerkId];
            if (customerSocketId) {
                io.to(customerSocketId).emit('spare_part_order_confirmed', { bookingId: updatedBooking.id });
            }
        }

        return { success: true, booking: updatedBooking };
    }

    static async completeSparePartOrder(bookingId: string, sellerClerkId: string) {
        const booking = await prisma.booking.findFirst({
            where: {
                id: bookingId,
                sparePartStore: { owner: { clerkId: sellerClerkId } }
            },
            include: { user: true }
        });

        if (!booking) throw new AppError(404, "Order not found or you are not the seller.");
        if (booking.status !== 'CONFIRMED' && booking.status !== 'IN_PROGRESS') {
            throw new AppError(409, "This order is not in a state that can be completed.");
        }

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: BookingStatus.COMPLETED,
                paymentStatus: booking.paymentMethod === 'CASH' ? 'paid_in_cash' : booking.paymentStatus,
                serviceEndedAt: new Date(),
            }
        });

        const customerSocketId = customerSockets[booking.user.clerkId];
        if (customerSocketId) {
            io.to(customerSocketId).emit('spare_part_order_completed', { bookingId: updatedBooking.id });
        }

        return { success: true, booking: updatedBooking };
    }

    static async getGarageBookings(garageOwnerId: string, statusQuery: string) {
        const statuses = statusQuery?.split(',').filter(s => Object.values(BookingStatus).includes(s as BookingStatus)) as BookingStatus[];
        if (!statuses || statuses.length === 0) throw new AppError(400, "At least one valid booking status is required.");

        const user = await prisma.user.findUnique({ where: { clerkId: garageOwnerId } });
        if (!user) throw new AppError(404, "User not found.");

        const garage = await prisma.garage.findUnique({ where: { ownerId: user.id } });
        if (!garage) throw new AppError(404, "Garage profile not found.");

        const statusesToFetch = ['SEARCHING', 'CONFIRMED', 'IN_PROGRESS', 'AWAITING_PAYMENT', 'COMPLETED', 'CANCELLED', 'EXPIRED'];

        return await prisma.booking.findMany({
            where: {
                OR: [
                    { garageId: garage.id, status: { in: statusesToFetch as BookingStatus[] } },
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
    }

    static async getTowTruckBookings(towTruckOwnerId: string, statusQuery: string) {
        const statuses = statusQuery?.split(',').filter(s => Object.values(BookingStatus).includes(s as BookingStatus)) as BookingStatus[];
        if (!statuses || statuses.length === 0) throw new AppError(400, "A valid booking status is required.");

        const user = await prisma.user.findUnique({ where: { clerkId: towTruckOwnerId } });
        if (!user) throw new AppError(404, "User not found.");

        const towTruck = await prisma.towTruck.findUnique({ where: { ownerId: user.id } });
        if (!towTruck) throw new AppError(404, "Tow Truck profile not found.");

        const statusesToFetch = ['AWAITING_PAYMENT', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'EXPIRED'];

        return await prisma.booking.findMany({
            where: {
                OR: [
                    { towTruckId: towTruck.id, status: { in: statusesToFetch as BookingStatus[] } },
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
    }

    static async acceptBooking(bookingId: string, garageOwnerId: string) {
        const garage = await prisma.garage.findFirst({
            where: { owner: { clerkId: garageOwnerId } },
            include: { services: true }
        });
        if (!garage) throw new AppError(403, "Garage profile not found.");

        const bookingToAccept = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { user: true }
        });
        if (!bookingToAccept) throw new AppError(404, "Booking request not found.");

        if (bookingToAccept.status !== BookingStatus.SEARCHING) throw new AppError(409, "This request has already been handled.");
        if (bookingToAccept.expiresAt && new Date() > bookingToAccept.expiresAt) throw new AppError(410, "This request has expired.");
        if (!bookingToAccept.eligibleProviderIds.includes(garage.id)) throw new AppError(403, "Your garage is not eligible for this request.");

        const garageService = garage.services.find(s => s.serviceId === bookingToAccept.serviceId);
        if (!garageService) throw new AppError(400, "This garage does not offer the requested service.");
        const servicePrice = garageService.price;

        let finalAmount = servicePrice;
        let etaMinutes: number | null = null;
        let distanceKm: number | null = null;

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

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: BookingStatus.AWAITING_PAYMENT,
                garage: { connect: { id: garage.id } },
                basePrice: servicePrice,
                finalAmount: finalAmount,
                eligibleProviderIds: [],
                expiresAt: null,
                paymentExpiresAt: new Date(Date.now() + 6 * 60 * 1000),
            },
            include: { user: true, garage: true }
        });

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

        return { success: true, booking: updatedBooking };
    }

    static async acceptTowInBooking(bookingId: string, garageOwnerId: string) {
        const garage = await prisma.garage.findFirst({
            where: { owner: { clerkId: garageOwnerId } }
        });
        if (!garage) throw new AppError(403, "Garage profile not found.");

        const bookingToAccept = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { vehicle: true }
        });
        if (!bookingToAccept) throw new AppError(404, "Booking request not found.");
        if (bookingToAccept.bookingType !== 'TOW_TO_GARAGE' || bookingToAccept.status !== BookingStatus.SEARCHING) {
            throw new AppError(409, "This request is not a valid tow-in request or has already been handled.");
        }
        if (bookingToAccept.expiresAt && new Date() > bookingToAccept.expiresAt) throw new AppError(410, "This request has expired.");
        if (!bookingToAccept.eligibleProviderIds.includes(garage.id)) throw new AppError(403, "Your garage is not eligible for this request.");

        const pickup = bookingToAccept.pickupLocation as any;
        if (!pickup || !pickup.coordinates || pickup.coordinates.length !== 2) throw new AppError(400, "Booking is missing a valid pickup location.");
        if (!bookingToAccept.vehicle) throw new AppError(400, "Booking is missing vehicle information.");
        const vehicleType = bookingToAccept.vehicle.type;

        const nearbyTrucksRaw = await prisma.liveTruckLocation.aggregateRaw({
            pipeline: [
                {
                    '$geoNear': {
                        near: { type: "Point", coordinates: [pickup.coordinates[0], pickup.coordinates[1]] },
                        distanceField: "distance",
                        maxDistance: 15000,
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
            throw new AppError(404, `No tow trucks found nearby that can handle a ${vehicleType}. The booking has been cancelled.`);
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
            throw new AppError(404, `No tow trucks found nearby that can handle a ${vehicleType}. The booking has been cancelled.`);
        }

        const eligibleTowTruckIds = eligibleTrucks.map(truck => truck.id);
        const TOW_TRUCK_SEARCH_TIMEOUT_MINUTES = 5;

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                garage: { connect: { id: garage.id } },
                destinationLocation: garage.location,
                expiresAt: new Date(Date.now() + TOW_TRUCK_SEARCH_TIMEOUT_MINUTES * 60 * 1000),
                eligibleProviderIds: eligibleTowTruckIds,
                subStatus: 'AWAITING_TOW_TRUCK_ACCEPTANCE',
            },
            include: { user: true, vehicle: true, garage: true }
        });

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

        const garageSocketId = providerSockets[garage.id];
        if (garageSocketId) {
            io.to(garageSocketId).emit('tow_in_accepted_by_you', { bookingId: updatedBooking.id });
        }

        const customerSocketId = customerSockets[updatedBooking.user.clerkId];
        if (customerSocketId) {
            io.to(customerSocketId).emit('garage_found_for_tow', {
                bookingId: updatedBooking.id,
                garage: updatedBooking.garage
            });
            console.log(`📬 Emitted 'garage_found_for_tow' to customer ${updatedBooking.user.clerkId}`);
        }

        return { success: true, message: "Garage accepted. Now searching for tow truck." };
    }

    static async acceptTowBooking(bookingId: string, towTruckOwnerId: string) {
        const towTruck = await prisma.towTruck.findFirst({
            where: { owner: { clerkId: towTruckOwnerId } },
            include: { services: true }
        });
        if (!towTruck) throw new AppError(403, "Tow Truck profile not found.");

        const bookingToAccept = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { user: true, vehicle: true }
        });
        if (!bookingToAccept) throw new AppError(404, "Booking request not found.");

        if (bookingToAccept.status !== BookingStatus.SEARCHING) throw new AppError(409, "This request has already been handled by another provider.");
        if (bookingToAccept.expiresAt && new Date() > bookingToAccept.expiresAt) throw new AppError(410, "This request has expired.");
        if (!bookingToAccept.eligibleProviderIds.includes(towTruck.id)) throw new AppError(403, "Your tow truck is not eligible for this request.");

        const towTruckService = towTruck.services.find(s => s.vehicleType === bookingToAccept.vehicle?.type);
        if (!towTruckService) throw new AppError(400, "This tow truck does not offer service for the requested vehicle type.");
        const pricePerKm = towTruckService.price;

        let finalAmount = pricePerKm;
        let etaMinutes: number | null = null;
        let distanceKm: number | null = null;

        const pickupLocation = bookingToAccept.pickupLocation;
        const destinationLocation = bookingToAccept.destinationLocation;

        if (isGeoJSONPoint(pickupLocation) && isGeoJSONPoint(destinationLocation)) {
            const origin = { lat: pickupLocation.coordinates[1], lon: pickupLocation.coordinates[0] };
            const destination = { lat: destinationLocation.coordinates[1], lon: destinationLocation.coordinates[0] };

            const etaResult = await getEtaAndDistance(origin, destination);
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
                basePrice: pricePerKm,
                finalAmount: finalAmount,
                eligibleProviderIds: [],
                expiresAt: null,
                paymentExpiresAt: new Date(Date.now() + 6 * 60 * 1000),
            },
            include: { user: true, towTruck: true }
        });

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

        if (updatedBooking.bookingType === 'TOW_TO_GARAGE' && updatedBooking.garageId) {
            const garageSocketId = providerSockets[updatedBooking.garageId];
            if (garageSocketId) {
                io.to(garageSocketId).emit('tow_truck_assigned', { bookingId: updatedBooking.id, towTruck: updatedBooking.towTruck });
                console.log(`📬 Emitted 'tow_truck_assigned' to garage ${updatedBooking.garageId}`);
            }
        }

        return { success: true, booking: updatedBooking };
    }

    static async declineBooking(bookingId: string, garageOwnerId: string) {
        const garage = await prisma.garage.findFirst({ where: { owner: { clerkId: garageOwnerId } } });
        if (!garage) throw new AppError(403, "Garage profile not found.");

        const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
        if (!booking || booking.status !== 'SEARCHING') throw new AppError(404, "Request is no longer active.");

        const updatedEligibleIds = booking.eligibleProviderIds.filter(id => id !== garage.id);

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                eligibleProviderIds: updatedEligibleIds,
                status: updatedEligibleIds.length === 0 ? BookingStatus.CANCELLED : booking.status,
            },
        });

        return { success: true, status: updatedBooking.status };
    }

    static async declineTowBooking(bookingId: string, towTruckOwnerId: string) {
        const towTruck = await prisma.towTruck.findFirst({ where: { owner: { clerkId: towTruckOwnerId } } });
        if (!towTruck) throw new AppError(403, "Tow Truck profile not found.");

        const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
        if (!booking || booking.status !== 'SEARCHING') throw new AppError(404, "Request is no longer active.");

        const updatedEligibleIds = booking.eligibleProviderIds.filter(id => id !== towTruck.id);

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                eligibleProviderIds: updatedEligibleIds,
                status: updatedEligibleIds.length === 0 ? BookingStatus.CANCELLED : booking.status,
            },
        });

        return { success: true, status: updatedBooking.status };
    }

    static async verifyOtp(bookingId: string, otp: string, garageOwnerId: string) {
        const booking = await prisma.booking.findFirst({
            where: { id: bookingId, garage: { owner: { clerkId: garageOwnerId } } },
            include: { user: true }
        });

        if (!booking) throw new AppError(404, "Booking not found or not assigned to you.");
        if (booking.otp !== otp) throw new AppError(400, "Invalid OTP provided.");
        if (booking.otpExpiresAt && new Date() > booking.otpExpiresAt) throw new AppError(410, "The OTP has expired.");

        const isTowToGarageService = booking.bookingType === 'TOW_TO_GARAGE' && booking.status === BookingStatus.IN_PROGRESS && booking.subStatus === 'SERVICE_IN_PROGRESS';
        const isStandardService = booking.status === BookingStatus.CONFIRMED;

        if (!isStandardService && !isTowToGarageService) {
            throw new AppError(409, "Booking is not in a verifiable state.");
        }

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: BookingStatus.COMPLETED,
                serviceEndedAt: new Date(),
                otp: null,
                otpExpiresAt: null,
                subStatus: 'SERVICE_COMPLETED'
            }
        });

        return { success: true, booking: updatedBooking };
    }
}
