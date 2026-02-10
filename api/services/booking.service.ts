import { BookingStatus, BookingSubStatus } from '@prisma/client';
import prisma from '../lib/prisma';
import { customerSockets, io, providerSockets } from '../socket';
import { AppError } from '../utils/AppError';
import { getEtaAndDistance, isGeoJSONPoint } from './geo.service';
import { PRICE_PER_KM } from './pricing.service';

import { razorpay } from '../razorpay';
const OTP_TTL_MS = 10 * 60 * 1000;

export class BookingService {
    private static generateOtp() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    private static async captureAuthorizedPayment(booking: { paymentMethod: string; razorpayOrderId: string | null }) {
        if (booking.paymentMethod !== 'CARD' || !booking.razorpayOrderId) return;

        try {
            // Fetch payments for this order
            const payments = await razorpay.orders.fetchPayments(booking.razorpayOrderId);
            const authorizedPayment = payments.items.find((p: any) => p.status === 'authorized');

            if (authorizedPayment) {
                await razorpay.payments.capture(authorizedPayment.id, authorizedPayment.amount, authorizedPayment.currency);
                console.log(`Payment captured for booking ${booking.razorpayOrderId}`);
            }
        } catch (error) {
            console.error("Failed to capture payment:", error);
        }
    }

    private static getLocationDescription(point: any) {
        if (!point || typeof point !== 'object') return null;
        if (typeof point.description === 'string' && point.description.trim().length > 0) {
            return point.description.trim();
        }
        return null;
    }

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
                garage: true,
                towTruck: true,
                service: true,
                sparePart: true,
                vehicle: true
            },
            orderBy: { bookedAt: 'desc' }
        });
    }

    static async expireOverdueBookings() {
        const now = new Date();

        const overdueSearching = await prisma.booking.findMany({
            where: {
                status: BookingStatus.SEARCHING,
                expiresAt: { lt: now },
            },
            select: {
                id: true,
                user: { select: { clerkId: true } },
            },
        });

        for (const booking of overdueSearching) {
            const result = await prisma.booking.updateMany({
                where: {
                    id: booking.id,
                    status: BookingStatus.SEARCHING,
                    expiresAt: { lt: now },
                },
                data: {
                    status: BookingStatus.EXPIRED,
                    cancellationReason: 'Search expired.',
                },
            });

            if (result.count > 0) {
                const customerSocketId = customerSockets[booking.user.clerkId];
                if (customerSocketId) {
                    io.to(customerSocketId).emit('booking_expired', { bookingId: booking.id });
                }
            }
        }

        const overduePayments = await prisma.booking.findMany({
            where: {
                status: BookingStatus.AWAITING_PAYMENT,
                paymentExpiresAt: { lt: now },
            },
            select: {
                id: true,
                user: { select: { clerkId: true } },
            },
        });

        for (const booking of overduePayments) {
            const result = await prisma.booking.updateMany({
                where: {
                    id: booking.id,
                    status: BookingStatus.AWAITING_PAYMENT,
                    paymentExpiresAt: { lt: now },
                },
                data: {
                    status: BookingStatus.CANCELLED,
                    cancellationReason: 'Payment window expired.',
                },
            });

            if (result.count > 0) {
                const customerSocketId = customerSockets[booking.user.clerkId];
                if (customerSocketId) {
                    io.to(customerSocketId).emit('booking_status_updated', {
                        bookingId: booking.id,
                        status: BookingStatus.CANCELLED,
                    });
                }
            }
        }
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
            if (!user.razorpayCustomerId || !(sparePart!.store as any).razorpayAccountId) {
                console.warn(`[Razorpay Bypass] Razorpay accounts not configured for booking ${updatedBooking.id}. Forcing CASH payment.`);
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

            const amountInPaise = Math.round(finalAmount * 100);

            // Razorpay Transfers logic would go here if needed.
            // For now, we create the order.

            const sellerAccountId = (sparePart!.store as any).razorpayAccountId;

            const options: any = {
                amount: amountInPaise,
                currency: 'INR',
                receipt: `receipt_booking_${updatedBooking.id}`,
                notes: {
                    bookingId: updatedBooking.id,
                    type: 'spare_part_purchase'
                }
            };

            const order = await razorpay.orders.create(options);
            await prisma.booking.update({ where: { id: updatedBooking.id }, data: { razorpayOrderId: order.id } });

            const customerSocketId = customerSockets[user.clerkId];
            if (customerSocketId) {
                io.to(customerSocketId).emit('spare_part_order_accepted', {
                    bookingId: updatedBooking.id,
                    orderId: order.id,
                    amount: order.amount,
                    currency: order.currency,
                    key: process.env.RAZORPAY_KEY_ID
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

        const bookings = await prisma.booking.findMany({
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

        return await Promise.all(
            bookings.map(async (booking: any) => {
                let distance = booking.distance ?? null;
                if (distance == null && isGeoJSONPoint(booking.pickupLocation) && isGeoJSONPoint(garage.location)) {
                    try {
                        const origin = { lat: garage.location.coordinates[1], lon: garage.location.coordinates[0] };
                        const destination = { lat: booking.pickupLocation.coordinates[1], lon: booking.pickupLocation.coordinates[0] };
                        const etaResult = await getEtaAndDistance(origin, destination);
                        distance = etaResult.distanceKm ?? null;
                    } catch {
                        distance = null;
                    }
                }

                return {
                    ...booking,
                    distance,
                    pickupAddress: this.getLocationDescription(booking.pickupLocation),
                    destinationAddress: this.getLocationDescription(booking.destinationLocation),
                };
            })
        );
    }

    static async getTowTruckBookings(towTruckOwnerId: string, statusQuery: string) {
        const statuses = statusQuery?.split(',').filter(s => Object.values(BookingStatus).includes(s as BookingStatus)) as BookingStatus[];
        if (!statuses || statuses.length === 0) throw new AppError(400, "A valid booking status is required.");

        const user = await prisma.user.findUnique({ where: { clerkId: towTruckOwnerId } });
        if (!user) throw new AppError(404, "User not found.");

        const towTruck = await prisma.towTruck.findUnique({ where: { ownerId: user.id } });
        if (!towTruck) throw new AppError(404, "Tow Truck profile not found.");

        const statusesToFetch = ['AWAITING_PAYMENT', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'EXPIRED'];

        const bookings = await prisma.booking.findMany({
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

        return bookings.map((booking: any) => ({
            ...booking,
            pickupAddress: this.getLocationDescription(booking.pickupLocation),
            destinationAddress: this.getLocationDescription(booking.destinationLocation),
        }));
    }

    static async acceptBooking(bookingId: string, garageOwnerId: string) {
        const garage = await prisma.garage.findFirst({
            where: { owner: { clerkId: garageOwnerId } },
            include: { services: { include: { service: true } } }
        });
        if (!garage) throw new AppError(403, "Garage profile not found.");

        const bookingToAccept = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { user: true, service: true }
        });
        if (!bookingToAccept) throw new AppError(404, "Booking request not found.");

        if (bookingToAccept.status !== BookingStatus.SEARCHING) throw new AppError(409, "This request has already been handled.");
        if (bookingToAccept.expiresAt && new Date() > bookingToAccept.expiresAt) throw new AppError(410, "This request has expired.");
        if (!bookingToAccept.eligibleProviderIds.includes(garage.id)) throw new AppError(403, "Your garage is not eligible for this request.");

        const isRoadsideBikeBooking = bookingToAccept.service?.category === 'ROADSIDE_BIKE';
        const exactGarageService = garage.services.find(s => s.serviceId === bookingToAccept.serviceId);
        const fallbackBikeService = garage.services.find(s => s.service?.category === 'ROADSIDE_BIKE');
        const garageService = isRoadsideBikeBooking ? (exactGarageService ?? fallbackBikeService) : exactGarageService;
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
                service: { connect: { id: garageService.serviceId } },
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
                    const payload = {
                        ...updatedBooking,
                        distance: distanceToPickup,
                        totalDistance: totalTowingDistance,
                        finalAmount: estimatedFare,
                    };
                    io.to(socketId).emit('new_tow_request_for_garage', payload);
                    io.to(socketId).emit('new_booking_request', payload);
                    io.to(socketId).emit('new_booking', payload);
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
        if (!booking.otp || !booking.otpExpiresAt) throw new AppError(409, "OTP has not been generated yet.");
        if (booking.otp !== otp) throw new AppError(400, "Invalid OTP provided.");
        if (booking.otpExpiresAt && new Date() > booking.otpExpiresAt) throw new AppError(410, "The OTP has expired.");

        await this.captureAuthorizedPayment({
            paymentMethod: booking.paymentMethod,
            razorpayOrderId: booking.razorpayOrderId
        });

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: BookingStatus.COMPLETED,
                subStatus: BookingSubStatus.SERVICE_COMPLETED,
                paymentStatus: booking.paymentMethod === 'CASH' ? 'paid_in_cash' : 'paid',
                serviceEndedAt: new Date(),
                otp: null,
                otpExpiresAt: null,
            },
            include: { user: true }
        });

        const customerSocketId = customerSockets[updatedBooking.user.clerkId];
        if (customerSocketId) {
            io.to(customerSocketId).emit('service_completed', { bookingId: updatedBooking.id });
        }

        return { success: true, booking: updatedBooking };
    }

    static async requestService(clerkId: string, serviceId: string, vehicleId: string, userLat: number, userLon: number, pickupDescription?: string) {
        const user = await prisma.user.findUnique({ where: { clerkId } });
        if (!user) throw new AppError(404, "User not found.");
        const userId = user.id;

        const service = await prisma.service.findUnique({ where: { id: serviceId } });
        if (!service) throw new AppError(404, "Service not found.");

        const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
        if (!vehicle) throw new AppError(404, "Vehicle not found.");

        const nearbyGaragesRaw = await prisma.garage.aggregateRaw({
            pipeline: [
                {
                    '$geoNear': {
                        near: { type: "Point", coordinates: [userLon, userLat] },
                        distanceField: "distance",
                        maxDistance: 50000,
                        query: { isOpen: true, status: 'APPROVED' },
                        spherical: true
                    }
                },
                { '$limit': 20 }
            ]
        });

        if (!Array.isArray(nearbyGaragesRaw) || nearbyGaragesRaw.length === 0) {
            throw new AppError(404, "No garages found nearby.");
        }

        const nearbyGarageIds = nearbyGaragesRaw.map((g: any) => g._id.$oid);

        const isRoadsideBikeRequest = service.category === 'ROADSIDE_BIKE';
        const eligibleGarages = await prisma.garage.findMany({
            where: {
                id: { in: nearbyGarageIds },
                services: isRoadsideBikeRequest
                    ? { some: { service: { category: 'ROADSIDE_BIKE' } } }
                    : { some: { serviceId: service.id } }
            },
            include: { services: { include: { service: true } } }
        });

        if (eligibleGarages.length === 0) {
            throw new AppError(404, "No garages found nearby offering this service.");
        }

        const eligibleIds = eligibleGarages.map(g => g.id);

        const firstGarage = eligibleGarages[0];
        const firstGarageExactService = firstGarage.services.find(s => s.serviceId === service.id);
        const firstGarageBikeService = firstGarage.services.find(s => s.service?.category === 'ROADSIDE_BIKE');
        const initialServicePrice = isRoadsideBikeRequest
            ? (firstGarageExactService?.price ?? firstGarageBikeService?.price ?? 0)
            : (firstGarageExactService?.price ?? 0);

        const booking = await prisma.booking.create({
            data: {
                userId,
                serviceId,
                vehicleId,
                status: BookingStatus.SEARCHING,
                bookingType: 'ROADSIDE_ASSISTANCE',
                eligibleProviderIds: eligibleIds,
                pickupLocation: {
                    type: 'Point',
                    coordinates: [userLon, userLat],
                    ...(pickupDescription ? { description: pickupDescription } : {}),
                },
                expiresAt: new Date(Date.now() + 5 * 60 * 1000),
                basePrice: initialServicePrice,
                finalAmount: 0
            }
        });

        for (const garage of eligibleGarages) {
            const socketId = providerSockets[garage.id];
            if (socketId) {
                const garageService = garage.services.find(s => s.serviceId === service.id);
                const fallbackBikeService = garage.services.find(s => s.service?.category === 'ROADSIDE_BIKE');
                const quotedPrice = isRoadsideBikeRequest
                    ? (garageService?.price ?? fallbackBikeService?.price)
                    : garageService?.price;
                const payload = {
                    bookingId: booking.id,
                    serviceName: service.name,
                    vehicle: { brand: vehicle.brand, model: vehicle.model },
                    userLocation: { lat: userLat, lon: userLon },
                    pickupAddress: pickupDescription || null,
                    price: quotedPrice
                };
                io.to(socketId).emit('new_booking_request', payload);
                io.to(socketId).emit('new_booking', payload);
            }
        }

        return { success: true, bookingId: booking.id };
    }

    static async requestTowing(clerkId: string, vehicleId: string, vehicleType: string, pickup: any, destination: any) {
        const user = await prisma.user.findUnique({ where: { clerkId } });
        if (!user) throw new AppError(404, "User not found.");
        const userId = user.id;

        if (!pickup || !pickup.latitude || !pickup.longitude) throw new AppError(400, "Invalid pickup location.");

        const nearbyTrucksRaw = await prisma.liveTruckLocation.aggregateRaw({
            pipeline: [
                {
                    '$geoNear': {
                        near: { type: "Point", coordinates: [pickup.longitude, pickup.latitude] },
                        distanceField: "distance",
                        maxDistance: 50000,
                        query: { isAvailable: true },
                        spherical: true
                    }
                },
                { '$limit': 20 }
            ]
        });

        if (!Array.isArray(nearbyTrucksRaw) || nearbyTrucksRaw.length === 0) {
            throw new AppError(404, "No tow trucks found nearby.");
        }

        const nearbyTruckIds = nearbyTrucksRaw.map((t: any) => t.towTruckId.$oid);

        const eligibleTrucks = await prisma.towTruck.findMany({
            where: {
                id: { in: nearbyTruckIds },
                status: 'APPROVED',
                services: { some: { vehicleType: vehicleType as any } }
            },
            include: { services: true }
        });

        if (eligibleTrucks.length === 0) {
            throw new AppError(404, "No tow trucks found nearby for this vehicle type.");
        }

        const eligibleIds = eligibleTrucks.map(t => t.id);

        const booking = await prisma.booking.create({
            data: {
                userId,
                vehicleId,
                status: BookingStatus.SEARCHING,
                bookingType: 'DIRECT_TOW',
                eligibleProviderIds: eligibleIds,
                pickupLocation: {
                    type: 'Point',
                    coordinates: [pickup.longitude, pickup.latitude],
                    ...(pickup?.description ? { description: pickup.description } : {}),
                },
                destinationLocation: destination ? {
                    type: 'Point',
                    coordinates: [destination.longitude, destination.latitude],
                    ...(destination?.description ? { description: destination.description } : {}),
                } : undefined,
                expiresAt: new Date(Date.now() + 5 * 60 * 1000),
                basePrice: 0,
                finalAmount: 0
            }
        });

        for (const truck of eligibleTrucks) {
            const socketId = providerSockets[truck.id];
            if (socketId) {
                const payload = {
                    bookingId: booking.id,
                    vehicleType,
                    pickupLocation: pickup,
                    destinationLocation: destination,
                    pickupAddress: pickup?.description || null,
                    destinationAddress: destination?.description || null,
                };
                io.to(socketId).emit('new_booking_request', payload);
                io.to(socketId).emit('new_booking', payload);
            }
        }

        return { success: true, bookingId: booking.id };
    }

    static async requestTowToGarage(clerkId: string, vehicleId: string, pickup: any) {
        const user = await prisma.user.findUnique({ where: { clerkId } });
        if (!user) throw new AppError(404, "User not found.");
        const userId = user.id;

        if (!pickup || !pickup.latitude || !pickup.longitude) throw new AppError(400, "Invalid pickup location.");

        const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
        if (!vehicle) throw new AppError(404, "Vehicle not found.");

        const nearbyGaragesRaw = await prisma.garage.aggregateRaw({
            pipeline: [
                {
                    '$geoNear': {
                        near: { type: "Point", coordinates: [pickup.longitude, pickup.latitude] },
                        distanceField: "distance",
                        maxDistance: 50000,
                        query: { isOpen: true, status: 'APPROVED' },
                        spherical: true
                    }
                },
                { '$limit': 20 }
            ]
        });

        if (!Array.isArray(nearbyGaragesRaw) || nearbyGaragesRaw.length === 0) {
            throw new AppError(404, "No garages found nearby.");
        }

        const nearbyGarageIds = nearbyGaragesRaw.map((g: any) => g._id.$oid);
        const eligibleGarages = await prisma.garage.findMany({
            where: {
                id: { in: nearbyGarageIds },
                status: 'APPROVED',
                isOpen: true,
            },
        });

        if (eligibleGarages.length === 0) {
            throw new AppError(404, "No garages available nearby.");
        }

        const booking = await prisma.booking.create({
            data: {
                userId,
                vehicleId,
                bookingType: 'TOW_TO_GARAGE',
                status: BookingStatus.SEARCHING,
                subStatus: BookingSubStatus.AWAITING_GARAGE_ACCEPTANCE,
                eligibleProviderIds: eligibleGarages.map(g => g.id),
                pickupLocation: {
                    type: 'Point',
                    coordinates: [pickup.longitude, pickup.latitude],
                    ...(pickup?.description ? { description: pickup.description } : {}),
                },
                expiresAt: new Date(Date.now() + 5 * 60 * 1000),
                basePrice: 0,
                finalAmount: 0,
            },
            include: {
                user: { select: { firstName: true, lastName: true } },
                vehicle: true,
            }
        });

        for (const garage of eligibleGarages) {
            const socketId = providerSockets[garage.id];
            if (socketId) {
                io.to(socketId).emit('new_tow_in_request', booking);
                io.to(socketId).emit('new_booking_request', booking);
                io.to(socketId).emit('new_booking', booking);
            }
        }

        return { success: true, bookingId: booking.id, eligibleGarageCount: eligibleGarages.length };
    }

    static async getBookingStatus(bookingId: string, customerClerkId: string) {
        let booking = await prisma.booking.findFirst({
            where: { id: bookingId, user: { clerkId: customerClerkId } },
            include: {
                garage: { select: { id: true, name: true, rating: true, address: true, location: true } },
                towTruck: {
                    select: {
                        id: true,
                        name: true,
                        model: true,
                        make: true,
                        liveLocation: { select: { location: true } },
                    }
                },
            }
        });

        if (!booking) throw new AppError(404, "Booking not found.");

        if (booking.status === BookingStatus.AWAITING_PAYMENT && booking.paymentExpiresAt && new Date() > booking.paymentExpiresAt) {
            booking = await prisma.booking.update({
                where: { id: booking.id },
                data: { status: BookingStatus.CANCELLED, cancellationReason: 'Payment window expired.' },
                include: {
                    garage: { select: { id: true, name: true, rating: true, address: true, location: true } },
                    towTruck: {
                        select: {
                            id: true,
                            name: true,
                            model: true,
                            make: true,
                            liveLocation: { select: { location: true } },
                        }
                    },
                }
            });
        }

        if (booking.status === BookingStatus.SEARCHING && booking.expiresAt && new Date() > booking.expiresAt) {
            booking = await prisma.booking.update({
                where: { id: booking.id },
                data: { status: BookingStatus.EXPIRED, cancellationReason: 'Search expired.' },
                include: {
                    garage: { select: { id: true, name: true, rating: true, address: true, location: true } },
                    towTruck: {
                        select: {
                            id: true,
                            name: true,
                            model: true,
                            make: true,
                            liveLocation: { select: { location: true } },
                        }
                    },
                }
            });
        }

        const provider = booking.towTruck ?? booking.garage;
        const providerLocation = booking.towTruck?.liveLocation?.location ?? booking.garage?.location;
        if ((booking.status === BookingStatus.CONFIRMED || booking.status === BookingStatus.AWAITING_PAYMENT) && provider && isGeoJSONPoint(booking.pickupLocation) && isGeoJSONPoint(providerLocation)) {
            const userCoords = booking.pickupLocation.coordinates;
            const providerCoords = providerLocation.coordinates;
            const { etaMinutes, distanceKm } = await getEtaAndDistance(
                { lat: userCoords[1], lon: userCoords[0] },
                { lat: providerCoords[1], lon: providerCoords[0] }
            );
            return {
                status: booking.status,
                otp: booking.otp,
                provider: { ...provider, eta: etaMinutes, distance: distanceKm },
                finalPrice: booking.finalAmount,
            };
        }

        return {
            status: booking.status,
            otp: booking.otp,
            provider,
            finalPrice: booking.finalAmount,
        };
    }

    static async createRazorpayOrder(bookingId: string, customerClerkId: string) {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { garage: true, towTruck: true, user: true },
        });

        if (!booking || booking.user.clerkId !== customerClerkId) {
            throw new AppError(404, "Booking not found or not owned by user.");
        }
        if (booking.status !== BookingStatus.AWAITING_PAYMENT) {
            throw new AppError(409, "This booking is not awaiting payment.");
        }
        if (booking.paymentExpiresAt && new Date() > booking.paymentExpiresAt) {
            throw new AppError(410, "The payment window for this booking has expired.");
        }

        const provider = booking.towTruck ?? booking.garage;
        if (!provider || !provider.razorpayAccountId) {
            // throw new AppError(400, "Provider is not set up to receive payments.");
            console.log("Provider not setup for Razorpay, defaulting to platform account.");
        }

        let razorpayCustomerId = booking.user.razorpayCustomerId;
        if (!razorpayCustomerId) {
            try {
                const customer = await razorpay.customers.create({
                    email: booking.user.email,
                    name: `${booking.user.firstName} ${booking.user.lastName || ''}`.trim(),
                    contact: booking.user.phone,
                });
                razorpayCustomerId = customer.id;
                await prisma.user.update({
                    where: { id: booking.user.id },
                    data: { razorpayCustomerId },
                });
            } catch (e) {
                console.error("Failed to create razorpay customer", e);
                // Proceed without saving customer ID if it fails, or handle appropriately
            }
        }

        const amountInPaise = Math.round(booking.finalAmount * 100);
        if (amountInPaise <= 0) throw new AppError(400, "Invalid booking amount for payment.");

        const options: any = {
            amount: amountInPaise,
            currency: 'INR',
            receipt: `receipt_booking_${booking.id}`,
            notes: {
                bookingId: booking.id,
                userId: booking.user.id,
                type: 'service_booking'
            }
        }

        // Add transfers if provider has an account
        if (provider && provider.razorpayAccountId) {
            const platformFee = Math.round(amountInPaise * 0.10);
            const providerAmount = amountInPaise - platformFee;
            options.transfers = [
                {
                    account: provider.razorpayAccountId,
                    amount: providerAmount,
                    currency: "INR",
                    on_hold: 1, // Hold until service completion?
                    // For services, might want to transfer AFTER completion.
                    // If we do it here, it transfers on capture.
                }
            ];
        }

        const order = await razorpay.orders.create(options);

        await prisma.booking.update({
            where: { id: booking.id },
            data: { razorpayOrderId: order.id, paymentMethod: 'CARD' },
        });

        return {
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID,
            customerId: razorpayCustomerId || null
        };
    }

    static async confirmPayment(bookingId: string, customerClerkId: string, paymentId: string, signature: string) {
        const booking = await prisma.booking.findFirst({
            where: { id: bookingId, user: { clerkId: customerClerkId } },
        });
        if (!booking) throw new AppError(404, "Booking not found.");
        if (booking.status !== BookingStatus.AWAITING_PAYMENT) throw new AppError(409, "This booking is not awaiting payment.");
        // if (booking.paymentExpiresAt && new Date() > booking.paymentExpiresAt) throw new AppError(410, "The payment window for this booking has expired.");
        if (!booking.razorpayOrderId) throw new AppError(400, "Payment has not been initiated for this booking.");

        // Verify signature
        const crypto = require('crypto');
        const generated_signature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(booking.razorpayOrderId + "|" + paymentId)
            .digest('hex');

        if (generated_signature !== signature) {
            throw new AppError(400, "Payment verification failed: Invalid signature.");
        }

        // Ideally fetch payment and check status, but signature verification is strong enough for success.

        const updatedBooking = await prisma.booking.update({
            where: { id: booking.id },
            data: {
                status: BookingStatus.CONFIRMED,
                paymentStatus: 'authorized', // captured later on service completion
                paymentMethod: 'CARD',
                paymentExpiresAt: null,
                otp: null,
                otpExpiresAt: null,
            },
            include: { garage: true, towTruck: true, user: true }
        });

        const providerIds = [updatedBooking.garageId, updatedBooking.towTruckId].filter(Boolean) as string[];
        for (const providerId of providerIds) {
            const socketId = providerSockets[providerId];
            if (socketId) {
                io.to(socketId).emit('payment_confirmed', { bookingId: updatedBooking.id });
                io.to(socketId).emit('booking_status_updated', { bookingId: updatedBooking.id, status: updatedBooking.status });
            }
        }

        return { success: true, booking: updatedBooking };
    }

    static async confirmCashBooking(bookingId: string, customerClerkId: string) {
        const booking = await prisma.booking.findFirst({
            where: { id: bookingId, user: { clerkId: customerClerkId } },
        });
        if (!booking) throw new AppError(404, "Booking not found.");
        if (booking.status !== BookingStatus.AWAITING_PAYMENT) throw new AppError(409, "This booking is not awaiting payment.");
        if (booking.paymentExpiresAt && new Date() > booking.paymentExpiresAt) throw new AppError(410, "The payment window for this booking has expired.");

        const updatedBooking = await prisma.booking.update({
            where: { id: booking.id },
            data: {
                status: BookingStatus.CONFIRMED,
                paymentStatus: 'pending_cash',
                paymentMethod: 'CASH',
                razorpayOrderId: null,
                paymentExpiresAt: null,
                otp: null,
                otpExpiresAt: null,
            },
            include: { garage: true, towTruck: true, user: true }
        });

        const providerIds = [updatedBooking.garageId, updatedBooking.towTruckId].filter(Boolean) as string[];
        for (const providerId of providerIds) {
            const socketId = providerSockets[providerId];
            if (socketId) {
                io.to(socketId).emit('booking_confirmed_by_user', { bookingId: updatedBooking.id });
                io.to(socketId).emit('booking_status_updated', { bookingId: updatedBooking.id, status: updatedBooking.status });
            }
        }

        return { success: true, booking: updatedBooking };
    }

    static async requestCompletionOtp(bookingId: string, providerClerkId: string) {
        const booking = await prisma.booking.findFirst({
            where: {
                id: bookingId,
                OR: [
                    { garage: { owner: { clerkId: providerClerkId } } },
                    { towTruck: { owner: { clerkId: providerClerkId } } },
                ],
            },
            include: {
                user: true,
                garage: { include: { owner: true } },
                towTruck: { include: { owner: true } },
            },
        });

        if (!booking) throw new AppError(404, "Booking not found or not assigned to you.");

        const providerCanRequestOtp =
            booking.status === BookingStatus.CONFIRMED || booking.status === BookingStatus.IN_PROGRESS;
        if (!providerCanRequestOtp) {
            throw new AppError(409, "OTP can only be generated for active confirmed/in-progress jobs.");
        }

        const isGarageOwner = booking.garage?.owner?.clerkId === providerClerkId;
        const isTowTruckOwner = booking.towTruck?.owner?.clerkId === providerClerkId;
        if (isGarageOwner && !isTowTruckOwner && booking.bookingType === 'TOW_TO_GARAGE') {
            if (
                booking.status !== BookingStatus.IN_PROGRESS ||
                booking.subStatus !== BookingSubStatus.SERVICE_IN_PROGRESS
            ) {
                throw new AppError(409, "Tow-to-garage completion OTP can be generated only after service is in progress.");
            }
            if (booking.finalEstimateAmount === null || booking.finalEstimateAmount === undefined) {
                throw new AppError(409, "Submit final quote before requesting completion OTP.");
            }
        }

        const now = new Date();
        const hasActiveOtp = booking.otp && booking.otpExpiresAt && booking.otpExpiresAt > now;
        const otp = hasActiveOtp ? booking.otp! : this.generateOtp();
        const otpExpiresAt = hasActiveOtp ? booking.otpExpiresAt! : new Date(Date.now() + OTP_TTL_MS);

        await prisma.booking.update({
            where: { id: booking.id },
            data: { otp, otpExpiresAt },
        });

        const customerSocketId = customerSockets[booking.user.clerkId];
        if (customerSocketId) {
            io.to(customerSocketId).emit('booking_otp_generated', {
                bookingId: booking.id,
                otp,
                otpExpiresAt,
            });
        }

        return { success: true, bookingId: booking.id, otpExpiresAt };
    }

    static async cancelByUser(bookingId: string, customerClerkId: string, reason = 'Cancelled by user.') {
        const booking = await prisma.booking.findFirst({
            where: { id: bookingId, user: { clerkId: customerClerkId } },
        });
        if (!booking) throw new AppError(404, "Booking not found.");

        const cancellableStatuses: BookingStatus[] = [BookingStatus.SEARCHING, BookingStatus.AWAITING_PAYMENT, BookingStatus.CONFIRMED];
        if (!cancellableStatuses.includes(booking.status)) {
            throw new AppError(403, "This booking cannot be cancelled at its current stage.");
        }

        if (booking.razorpayOrderId) {
            // Can't easily cancel an authorized order in Razorpay without refund if captured.
            // If just authorized, we usually don't need to do anything as it autovoids if not captured.
            // But if captured (not typical here), we'd need to refund.
            console.log("Cancelling booking with orderId:", booking.razorpayOrderId);
        }

        const updatedBooking = await prisma.booking.update({
            where: { id: booking.id },
            data: {
                status: BookingStatus.CANCELLED,
                cancellationReason: reason,
                paymentStatus: booking.paymentMethod === 'CARD' ? 'cancelled' : booking.paymentStatus,
            },
        });

        const providerIds = [booking.garageId, booking.towTruckId].filter(Boolean) as string[];
        for (const providerId of providerIds) {
            const socketId = providerSockets[providerId];
            if (socketId) {
                io.to(socketId).emit('booking_cancelled_by_customer', { bookingId: booking.id, reason });
                io.to(socketId).emit('booking_status_updated', { bookingId: booking.id, status: BookingStatus.CANCELLED });
            }
        }

        return { success: true, booking: updatedBooking };
    }

    static async cancelByProvider(bookingId: string, providerClerkId: string, reason: string) {
        const booking = await prisma.booking.findFirst({
            where: {
                id: bookingId,
                OR: [
                    { garage: { owner: { clerkId: providerClerkId } } },
                    { towTruck: { owner: { clerkId: providerClerkId } } },
                ],
            },
            include: { user: true },
        });

        if (!booking) throw new AppError(404, "Booking not found or you are not the assigned provider.");
        const providerCancellableStatuses: BookingStatus[] = [BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS, BookingStatus.AWAITING_PAYMENT];
        if (!providerCancellableStatuses.includes(booking.status)) {
            throw new AppError(403, "This booking cannot be cancelled at its current stage.");
        }

        let paymentStatus = booking.paymentStatus;
        if (booking.razorpayOrderId) {
            const payments = await razorpay.orders.fetchPayments(booking.razorpayOrderId);
            const capturedPayment = payments.items.find((p: any) => p.status === 'captured');

            if (capturedPayment) {
                await razorpay.payments.refund(capturedPayment.id, {
                    "amount": capturedPayment.amount,
                    "speed": "normal",
                    "notes": {
                        "reason": "Cancelled by provider"
                    },
                    "receipt": "refund_" + booking.id
                });
                paymentStatus = 'refunded';
            } else {
                paymentStatus = 'cancelled';
            }
        }

        const updatedBooking = await prisma.booking.update({
            where: { id: booking.id },
            data: {
                status: BookingStatus.CANCELLED,
                paymentStatus,
                cancellationReason: reason,
            },
        });

        const customerSocketId = customerSockets[booking.user.clerkId];
        if (customerSocketId) {
            io.to(customerSocketId).emit('booking_cancelled_by_provider', { bookingId: booking.id, reason });
        }

        return { success: true, booking: updatedBooking };
    }

    static async verifyTowOtp(bookingId: string, otp: string, towTruckOwnerId: string) {
        const booking = await prisma.booking.findFirst({
            where: { id: bookingId, towTruck: { owner: { clerkId: towTruckOwnerId } } },
            include: { user: true }
        });

        if (!booking) throw new AppError(404, "Booking not found or not assigned to you.");
        if (!booking.otp || !booking.otpExpiresAt) throw new AppError(409, "OTP has not been generated yet.");
        if (booking.otp !== otp) throw new AppError(400, "Invalid OTP provided.");
        if (booking.otpExpiresAt && new Date() > booking.otpExpiresAt) throw new AppError(410, "The OTP has expired.");

        await this.captureAuthorizedPayment({
            paymentMethod: booking.paymentMethod,
            razorpayOrderId: booking.razorpayOrderId
        });

        const isTowToGarage = booking.bookingType === 'TOW_TO_GARAGE';
        const updatedBooking = await prisma.booking.update({
            where: { id: booking.id },
            data: isTowToGarage
                ? {
                    status: BookingStatus.IN_PROGRESS,
                    subStatus: BookingSubStatus.AWAITING_GARAGE_QUOTE,
                    otp: null,
                    otpExpiresAt: null,
                    paymentStatus: booking.paymentMethod === 'CASH' ? 'paid_in_cash' : 'paid',
                }
                : {
                    status: BookingStatus.COMPLETED,
                    subStatus: BookingSubStatus.SERVICE_COMPLETED,
                    serviceEndedAt: new Date(),
                    otp: null,
                    otpExpiresAt: null,
                    paymentStatus: booking.paymentMethod === 'CASH' ? 'paid_in_cash' : 'paid',
                },
        });

        if (isTowToGarage && updatedBooking.garageId) {
            const garageSocketId = providerSockets[updatedBooking.garageId];
            if (garageSocketId) {
                io.to(garageSocketId).emit('vehicle_delivered', { bookingId: updatedBooking.id });
                io.to(garageSocketId).emit('booking_status_updated', { bookingId: updatedBooking.id, status: updatedBooking.status, subStatus: updatedBooking.subStatus });
            }
        }

        const customerSocketId = customerSockets[booking.user.clerkId];
        if (customerSocketId) {
            const event = isTowToGarage ? 'vehicle_delivered' : 'service_completed';
            io.to(customerSocketId).emit(event, { bookingId: updatedBooking.id });
        }

        return { success: true, booking: updatedBooking };
    }

    static async submitQuote(
        bookingId: string,
        garageOwnerId: string,
        payload: { vehicleStatus: string; servicesRequired: string; servicesEstimate?: string; jobEstimate: number; notes?: string }
    ) {
        const booking = await prisma.booking.findFirst({
            where: { id: bookingId, garage: { owner: { clerkId: garageOwnerId } } },
            include: { user: true }
        });

        if (!booking) throw new AppError(404, "Booking not found or not assigned to you.");
        if (booking.bookingType !== 'TOW_TO_GARAGE') throw new AppError(400, "Quotes are only supported for tow-to-garage bookings.");
        const canSubmitQuote =
            (booking.status === BookingStatus.IN_PROGRESS &&
                (booking.subStatus === BookingSubStatus.AWAITING_GARAGE_QUOTE || booking.subStatus === BookingSubStatus.QUOTE_REJECTED)) ||
            (booking.status === BookingStatus.CONFIRMED &&
                (booking.subStatus === BookingSubStatus.TOW_TRUCK_ASSIGNED || booking.subStatus === BookingSubStatus.VEHICLE_DELIVERED));
        if (!canSubmitQuote) throw new AppError(409, "Booking is not ready for quote submission.");

        const currentQuoteHistory = Array.isArray(booking.quoteHistory) ? booking.quoteHistory : [];
        const quoteEntry = {
            type: 'initial',
            submittedAt: new Date().toISOString(),
            vehicleStatus: payload.vehicleStatus,
            servicesRequired: payload.servicesRequired,
            servicesEstimate: payload.servicesEstimate || '',
            jobEstimate: payload.jobEstimate,
            notes: payload.notes || '',
        };

        const nextQuoteHistory = [...currentQuoteHistory, quoteEntry] as any;

        const updatedBooking = await prisma.booking.update({
            where: { id: booking.id },
            data: {
                status: BookingStatus.IN_PROGRESS,
                vehicleStatus: payload.vehicleStatus,
                servicesRequired: payload.servicesRequired,
                servicesEstimate: payload.servicesEstimate || '',
                jobEstimate: payload.jobEstimate,
                notes: payload.notes || booking.notes || null,
                initialEstimateAmount: payload.jobEstimate,
                subStatus: BookingSubStatus.AWAITING_QUOTE_APPROVAL,
                quoteHistory: nextQuoteHistory,
            },
        });

        const customerSocketId = customerSockets[booking.user.clerkId];
        if (customerSocketId) {
            io.to(customerSocketId).emit('garage_quote_submitted', { bookingId: updatedBooking.id, quote: quoteEntry });
        }

        return { success: true, booking: updatedBooking };
    }

    static async submitFinalQuote(
        bookingId: string,
        garageOwnerId: string,
        payload: { jobEstimate: number; notes?: string }
    ) {
        const booking = await prisma.booking.findFirst({
            where: { id: bookingId, garage: { owner: { clerkId: garageOwnerId } } },
            include: { user: true }
        });

        if (!booking) throw new AppError(404, "Booking not found or not assigned to you.");
        if (booking.bookingType !== 'TOW_TO_GARAGE') throw new AppError(400, "Final quote is only supported for tow-to-garage bookings.");
        if (booking.status !== BookingStatus.IN_PROGRESS) throw new AppError(409, "Booking is not in progress.");

        const currentQuoteHistory = Array.isArray(booking.quoteHistory) ? booking.quoteHistory : [];
        const quoteEntry = {
            type: 'final',
            submittedAt: new Date().toISOString(),
            jobEstimate: payload.jobEstimate,
            notes: payload.notes || '',
        };

        const nextQuoteHistory = [...currentQuoteHistory, quoteEntry] as any;

        const updatedBooking = await prisma.booking.update({
            where: { id: booking.id },
            data: {
                finalEstimateAmount: payload.jobEstimate,
                finalAmount: payload.jobEstimate,
                // Tow-to-garage repair settlement is handled in cash at completion.
                paymentMethod: 'CASH',
                paymentStatus: 'pending_cash',
                notes: payload.notes || booking.notes || null,
                subStatus: BookingSubStatus.AWAITING_FINAL_APPROVAL,
                quoteHistory: nextQuoteHistory,
            },
        });

        const customerSocketId = customerSockets[booking.user.clerkId];
        if (customerSocketId) {
            io.to(customerSocketId).emit('garage_final_quote_submitted', { bookingId: updatedBooking.id, quote: quoteEntry });
        }

        return { success: true, booking: updatedBooking };
    }

    static async approveQuote(bookingId: string, customerClerkId: string) {
        const booking = await prisma.booking.findFirst({
            where: { id: bookingId, user: { clerkId: customerClerkId } },
            include: { garage: true },
        });

        if (!booking) throw new AppError(404, "Booking not found.");
        if (booking.bookingType !== 'TOW_TO_GARAGE') throw new AppError(400, "Quote approval is only supported for tow-to-garage bookings.");

        const approvingInitial = booking.subStatus === BookingSubStatus.AWAITING_QUOTE_APPROVAL;
        const approvingFinal = booking.subStatus === BookingSubStatus.AWAITING_FINAL_APPROVAL;
        if (!approvingInitial && !approvingFinal) {
            throw new AppError(409, "There is no pending quote awaiting your approval.");
        }

        const updatedBooking = await prisma.booking.update({
            where: { id: booking.id },
            data: {
                status: BookingStatus.IN_PROGRESS,
                subStatus: BookingSubStatus.SERVICE_IN_PROGRESS,
                quoteRejectionReason: null,
            },
        });

        if (booking.garageId) {
            const garageSocketId = providerSockets[booking.garageId];
            if (garageSocketId) {
                io.to(garageSocketId).emit(approvingInitial ? 'quote_approved_by_customer' : 'final_quote_approved_by_customer', {
                    bookingId: booking.id,
                });
                io.to(garageSocketId).emit('booking_status_updated', {
                    bookingId: booking.id,
                    status: updatedBooking.status,
                    subStatus: updatedBooking.subStatus,
                });
            }
        }

        return { success: true, booking: updatedBooking };
    }

    static async rejectQuote(bookingId: string, customerClerkId: string, reason?: string) {
        const booking = await prisma.booking.findFirst({
            where: { id: bookingId, user: { clerkId: customerClerkId } },
            include: { garage: true },
        });

        if (!booking) throw new AppError(404, "Booking not found.");
        if (booking.bookingType !== 'TOW_TO_GARAGE') throw new AppError(400, "Quote rejection is only supported for tow-to-garage bookings.");

        const rejectingInitial = booking.subStatus === BookingSubStatus.AWAITING_QUOTE_APPROVAL;
        const rejectingFinal = booking.subStatus === BookingSubStatus.AWAITING_FINAL_APPROVAL;
        if (!rejectingInitial && !rejectingFinal) {
            throw new AppError(409, "There is no pending quote awaiting your response.");
        }

        const rejectionReason = reason?.trim() || 'Rejected by customer.';

        const updatedBooking = await prisma.booking.update({
            where: { id: booking.id },
            data: rejectingInitial
                ? {
                    status: BookingStatus.IN_PROGRESS,
                    subStatus: BookingSubStatus.QUOTE_REJECTED,
                    quoteRejectionReason: rejectionReason,
                }
                : {
                    status: BookingStatus.IN_PROGRESS,
                    subStatus: BookingSubStatus.SERVICE_IN_PROGRESS,
                    finalEstimateAmount: null,
                    quoteRejectionReason: rejectionReason,
                },
        });

        if (booking.garageId) {
            const garageSocketId = providerSockets[booking.garageId];
            if (garageSocketId) {
                io.to(garageSocketId).emit(rejectingInitial ? 'quote_rejected_by_customer' : 'final_quote_rejected_by_customer', {
                    bookingId: booking.id,
                    reason: rejectionReason,
                });
                io.to(garageSocketId).emit('booking_status_updated', {
                    bookingId: booking.id,
                    status: updatedBooking.status,
                    subStatus: updatedBooking.subStatus,
                });
            }
        }

        return { success: true, booking: updatedBooking };
    }
}
