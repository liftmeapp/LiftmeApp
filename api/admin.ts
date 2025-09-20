// /api/admin.ts
import express, { Router, Request, Response } from 'express';
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';
import prisma from './lib/prisma'; // Import the shared prisma instance
import { VerificationStatus } from '@prisma/client';

const adminRouter = Router();

// ===================================================================
//  ADMIN MIDDLEWARE (Scoped to this router)
// ===================================================================
const requireAdmin = async (req: Request, res: Response, next: Function) => {
    try {
        const clerkId = req.auth.userId;
        if (!clerkId) {
            return res.status(401).json({ error: 'User not authenticated.' });
        }
        const userInDb = await prisma.user.findUnique({
            where: { clerkId: clerkId },
            select: {
                role: true,
            },
        });
        if (!userInDb || !Array.isArray(userInDb.role) || !userInDb.role.includes('ADMIN')) {
            return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
        }
        return next();

    } catch (error) {
        console.error("Error in requireAdmin middleware:", error);
        return res.status(500).json({ error: "Internal server error during authorization." });
    }
};

adminRouter.use(ClerkExpressWithAuth());
adminRouter.use(requireAdmin);


// ===================================================================
//  ADMIN ENDPOINTS
// ===================================================================
//dashboardStats

//GET /api/admin/all-businesses
adminRouter.get('/all-businesses', async (req: Request, res: Response) => {
    try {
        const [garages, towTrucks] = await Promise.all([
            prisma.garage.findMany({
                include: { owner: { select: { firstName: true, lastName: true, email: true, phone: true } } }
            }),
            prisma.towTruck.findMany({
                include: { owner: { select: { firstName: true, lastName: true, email: true, phone: true } } }
            })
        ]);

        const combinedBusinesses = [
            ...garages.map((g) => ({ 
              ...g, 
              type: 'GARAGE' as const,
              createdAt: g.createdAt 
            })),
            ...towTrucks.map((t) => ({ 
              ...t, 
              type: 'TOW_TRUCK' as const,
              createdAt: t.createdAt 
            }))
          ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        console.log(`API: Found ${combinedBusinesses.length} total businesses.`);
        return res.status(200).json(combinedBusinesses);

    } catch (error) {
        console.error('Admin Fetch All Businesses Error:', error);
        return res.status(500).json({ error: 'Failed to fetch all businesses.' });
    }
});

adminRouter.get('/dashboard-stats', async (req: Request, res: Response) => {
    try {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        // Run all count queries in parallel for maximum efficiency
        const [
            pendingGarages,
            pendingTowTrucks,
            totalUsers,
            totalGarages,
            totalTowTrucks,
            approvedToday,
            rejectedToday
        ] = await Promise.all([
            prisma.garage.count({ where: { status: 'PENDING' } }),
            prisma.towTruck.count({ where: { status: 'PENDING' } }),
            prisma.user.count(),
            prisma.garage.count(),
            prisma.towTruck.count(),
            prisma.garage.count({ where: { status: 'APPROVED', updatedAt: { gte: startOfToday } } }),
            prisma.garage.count({ where: { status: 'REJECTED', updatedAt: { gte: startOfToday } } })
        ]);

        const stats = {
            pendingGarages,
            pendingTowTrucks,
            totalUsers,
            totalBusinesses: totalGarages + totalTowTrucks,
            approvedToday,
            rejectedToday,
        };

        return res.status(200).json(stats);
    } catch (error) {
        console.error('Admin Stats Fetch Error:', error);
        return res.status(500).json({ error: 'Failed to fetch dashboard statistics.' });
    }
});


// GET /api/admin/pending-applications
adminRouter.get('/pending-applications', async (req: Request, res: Response) => {
    try {
        const pendingGarages = await prisma.garage.findMany({
            where: { status: VerificationStatus.PENDING },
            include: { owner: { select: { firstName: true, email: true } } }
        });

        const pendingTowTrucks = await prisma.towTruck.findMany({
            where: { status: 'PENDING' },
            include: { owner: { select: { firstName: true, email: true } } }
        });

        return res.status(200).json({ garages: pendingGarages, towTrucks: pendingTowTrucks });
    } catch (error) {
        console.error('Admin Fetch Error:', error);
        return res.status(500).json({ error: 'Failed to fetch pending applications.' });
    }
});

// POST /api/admin/applications/:type/:id/approve
adminRouter.post('/applications/:type/:id/approve', async (req: Request, res: Response) => {
    const { type, id } = req.params;

    try {
        if (type === 'garage') {
            await prisma.garage.update({
                where: { id },
                data: { status: 'APPROVED', rejectionReason: null },
            });
        } else if (type === 'tow-truck') {
            await prisma.towTruck.update({
                where: { id },
                data: { status: 'APPROVED', rejectionReason: null },
            });
        } else {
            return res.status(400).json({ error: 'Invalid application type.' });
        }
        return res.status(200).json({ success: true, message: `${type} approved.` });
    } catch (error) {
        console.error('Approval Error:', error);
        return res.status(500).json({ error: 'Failed to approve application.' });
    }
});

// POST /api/admin/applications/:type/:id/reject
adminRouter.post('/applications/:type/:id/reject', async (req: Request, res: Response) => {
    const { type, id } = req.params;
    const { reason } = req.body;

    if (!reason) {
        return res.status(400).json({ error: 'A reason for rejection is required.' });
    }

    try {
        if (type === 'garage') {
            await prisma.garage.update({
                where: { id },
                data: { status: 'REJECTED', rejectionReason: reason },
            });
        } else if (type === 'tow-truck') {
            await prisma.towTruck.update({
                where: { id },
                data: { status: 'REJECTED', rejectionReason: reason },
            });
        } else {
            return res.status(400).json({ error: 'Invalid application type.' });
        }
        return res.status(200).json({ success: true, message: `${type} rejected.` });
    } catch (error) {
        console.error('Rejection Error:', error);
        return res.status(500).json({ error: 'Failed to reject application.' });
    }
});

adminRouter.post('/users/:userId/ban', async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { reason } = req.body;

    if (!reason) {
        return res.status(400).json({ error: 'A reason for banning is required.' });
    }

    try {
        console.log(`API: Admin attempting to ban user ID: ${userId} for reason: "${reason}"`);

        // Use a Prisma transaction to ensure all updates succeed or fail together
        const transactionResult = await prisma.$transaction(async (tx) => {
            // Step 1: Find the user by their database ID to get their Clerk ID
            const user = await tx.user.findUnique({
                where: { id: userId },
                select: { id: true, isBanned: true }
            });

            if (!user) {
                throw new Error('User not found.');
            }
            if (user.isBanned) {
                throw new Error('This user is already banned.');
            }

            // Step 2: Update the user in our database
            const updatedUser = await tx.user.update({
                where: { id: userId },
                data: { isBanned: true },
            });

            // Step 3: Find and disable their associated garage (if any)
            const garage = await tx.garage.findUnique({
                where: { ownerId: userId }
            });
            if (garage) {
                await tx.garage.update({
                    where: { id: garage.id },
                    data: { 
                        isOpen: false, // Prevent from appearing in searches
                        status: 'REJECTED', // Or another appropriate status
                        rejectionReason: `Owner banned: ${reason}`
                    }
                });
            }

            // Step 4: Find and disable their associated tow truck (if any)
            const towTruck = await tx.towTruck.findUnique({
                where: { ownerId: userId }
            });
            if (towTruck) {
                await tx.towTruck.update({
                    where: { id: towTruck.id },
                    data: { 
                        status: 'REJECTED', // Or another appropriate status
                        rejectionReason: `Owner banned: ${reason}`
                    }
                });
                // Also disable their live location
                await tx.liveTruckLocation.update({
                    where: { towTruckId: towTruck.id },
                    data: { isAvailable: false }
                });
            }
            
            return updatedUser;
        });

        console.log(`API: Successfully banned user ${transactionResult.id}.`);
        return res.status(200).json({ success: true, message: 'User and their businesses have been banned.' });

    } catch (error: any) {
        console.error('Admin Ban User Error:', error);
        // Differentiate between known errors and server errors
        if (error.message.includes('User not found') || error.message.includes('already banned')) {
            return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Failed to ban user.' });
    }
});




export default adminRouter;