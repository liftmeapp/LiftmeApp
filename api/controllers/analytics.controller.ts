
import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

export const AnalyticsController = {
    async getBusinessStats(req: Request, res: Response) {
        try {
            const { providerId, type } = req.query;

            if (!providerId || !type) {
                return res.status(400).json({ error: "Missing providerId or type" });
            }

            let bookingWhere: any = {};

            if (type === 'garage') {
                bookingWhere.garageId = providerId as string;
            } else if (type === 'towTruck') {
                bookingWhere.towTruckId = providerId as string;
            } else if (type === 'sparePart') { // sparePartStoreId logic
                // For spare parts, we might be looking at storeId or sparePartId?
                // The schema has sparePartStoreId on booking.
                // Let's assume the providerId passed is the storeId.
                bookingWhere.sparePartStoreId = providerId as string;
            } else {
                return res.status(400).json({ error: "Invalid type. Must be 'garage', 'towTruck', or 'sparePart'" });
            }

            // 1. Total Bookings (All time)
            const totalBookings = await prisma.booking.count({
                where: bookingWhere
            });

            // 2. Completed Bookings (for Revenue)
            const completedBookingsCount = await prisma.booking.count({
                where: {
                    ...bookingWhere,
                    status: 'COMPLETED'
                }
            });

            // 3. Total Revenue
            const revenueAgg = await prisma.booking.aggregate({
                _sum: {
                    finalAmount: true
                },
                where: {
                    ...bookingWhere,
                    status: 'COMPLETED'
                }
            });
            const totalRevenue = revenueAgg._sum.finalAmount || 0;

            // 4. Average Order Value
            const averageRevenue = completedBookingsCount > 0 ? (totalRevenue / completedBookingsCount) : 0;

            // 5. Most Frequent Customer
            // Group by userId, count bookings.
            // Prisma groupBy is useful here
            const topCustomers = await prisma.booking.groupBy({
                by: ['userId'],
                where: {
                    ...bookingWhere,
                    status: 'COMPLETED' // Only count completed bookings for "valuable" customers? Or all? Let's say COMPLETED.
                },
                _count: {
                    id: true
                },
                orderBy: {
                    _count: {
                        id: 'desc'
                    }
                },
                take: 1
            });

            let topCustomerName = 'N/A';
            let topCustomerCount = 0;

            if (topCustomers.length > 0) {
                const customerId = topCustomers[0].userId;
                topCustomerCount = topCustomers[0]._count.id;
                const customerUser = await prisma.user.findUnique({
                    where: { id: customerId },
                    select: { firstName: true, lastName: true, email: true }
                });
                if (customerUser) {
                    topCustomerName = `${customerUser.firstName} ${customerUser.lastName || ''}`.trim();
                }
            }

            // 6. Active/Pending Count (Optional but useful)
            const pendingCount = await prisma.booking.count({
                where: {
                    ...bookingWhere,
                    status: { in: ['SEARCHING', 'PENDING', 'AWAITING_PAYMENT', 'IN_PROGRESS', 'CONFIRMED'] }
                }
            });

            return res.status(200).json({
                totalBookings,
                completedBookings: completedBookingsCount,
                totalRevenue,
                averageRevenue,
                topCustomer: {
                    name: topCustomerName,
                    bookings: topCustomerCount
                },
                pendingBookings: pendingCount
            });

        } catch (error) {
            console.error("[AnalyticsController] Error fetching stats:", error);
            return res.status(500).json({ error: "Failed to fetch analytics." });
        }
    }
};
