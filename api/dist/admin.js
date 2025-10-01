"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const clerk_sdk_node_1 = require("@clerk/clerk-sdk-node");
const prisma_1 = __importDefault(require("./lib/prisma"));
const client_1 = require("@prisma/client");
const adminRouter = (0, express_1.Router)();
const requireAdmin = async (req, res, next) => {
    try {
        const clerkId = req.auth.userId;
        if (!clerkId) {
            return res.status(401).json({ error: 'User not authenticated.' });
        }
        const userInDb = await prisma_1.default.user.findUnique({
            where: { clerkId: clerkId },
            select: {
                role: true,
            },
        });
        if (!userInDb || !Array.isArray(userInDb.role) || !userInDb.role.includes('ADMIN')) {
            return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
        }
        return next();
    }
    catch (error) {
        console.error("Error in requireAdmin middleware:", error);
        return res.status(500).json({ error: "Internal server error during authorization." });
    }
};
adminRouter.use((0, clerk_sdk_node_1.ClerkExpressWithAuth)());
adminRouter.use(requireAdmin);
adminRouter.get('/all-businesses', async (req, res) => {
    try {
        const [garages, towTrucks] = await Promise.all([
            prisma_1.default.garage.findMany({
                include: { owner: { select: { firstName: true, lastName: true, email: true, phone: true } } }
            }),
            prisma_1.default.towTruck.findMany({
                include: { owner: { select: { firstName: true, lastName: true, email: true, phone: true } } }
            })
        ]);
        const combinedBusinesses = [
            ...garages.map((g) => ({
                ...g,
                type: 'GARAGE',
                createdAt: g.createdAt
            })),
            ...towTrucks.map((t) => ({
                ...t,
                type: 'TOW_TRUCK',
                createdAt: t.createdAt
            }))
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        console.log(`API: Found ${combinedBusinesses.length} total businesses.`);
        return res.status(200).json(combinedBusinesses);
    }
    catch (error) {
        console.error('Admin Fetch All Businesses Error:', error);
        return res.status(500).json({ error: 'Failed to fetch all businesses.' });
    }
});
adminRouter.get('/dashboard-stats', async (req, res) => {
    try {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const [pendingGarages, pendingTowTrucks, totalUsers, totalGarages, totalTowTrucks, approvedToday, rejectedToday] = await Promise.all([
            prisma_1.default.garage.count({ where: { status: 'PENDING' } }),
            prisma_1.default.towTruck.count({ where: { status: 'PENDING' } }),
            prisma_1.default.user.count(),
            prisma_1.default.garage.count(),
            prisma_1.default.towTruck.count(),
            prisma_1.default.garage.count({ where: { status: 'APPROVED', updatedAt: { gte: startOfToday } } }),
            prisma_1.default.garage.count({ where: { status: 'REJECTED', updatedAt: { gte: startOfToday } } })
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
    }
    catch (error) {
        console.error('Admin Stats Fetch Error:', error);
        return res.status(500).json({ error: 'Failed to fetch dashboard statistics.' });
    }
});
adminRouter.get('/pending-applications', async (req, res) => {
    try {
        const pendingGarages = await prisma_1.default.garage.findMany({
            where: { status: client_1.VerificationStatus.PENDING },
            include: { owner: { select: { firstName: true, email: true } } }
        });
        const pendingTowTrucks = await prisma_1.default.towTruck.findMany({
            where: { status: 'PENDING' },
            include: { owner: { select: { firstName: true, email: true } } }
        });
        return res.status(200).json({ garages: pendingGarages, towTrucks: pendingTowTrucks });
    }
    catch (error) {
        console.error('Admin Fetch Error:', error);
        return res.status(500).json({ error: 'Failed to fetch pending applications.' });
    }
});
adminRouter.post('/applications/:type/:id/approve', async (req, res) => {
    const { type, id } = req.params;
    try {
        if (type === 'garage') {
            await prisma_1.default.garage.update({
                where: { id },
                data: { status: 'APPROVED', rejectionReason: null },
            });
        }
        else if (type === 'tow-truck') {
            await prisma_1.default.towTruck.update({
                where: { id },
                data: { status: 'APPROVED', rejectionReason: null },
            });
        }
        else {
            return res.status(400).json({ error: 'Invalid application type.' });
        }
        return res.status(200).json({ success: true, message: `${type} approved.` });
    }
    catch (error) {
        console.error('Approval Error:', error);
        return res.status(500).json({ error: 'Failed to approve application.' });
    }
});
adminRouter.post('/applications/:type/:id/reject', async (req, res) => {
    const { type, id } = req.params;
    const { reason } = req.body;
    if (!reason) {
        return res.status(400).json({ error: 'A reason for rejection is required.' });
    }
    try {
        if (type === 'garage') {
            await prisma_1.default.garage.update({
                where: { id },
                data: { status: 'REJECTED', rejectionReason: reason },
            });
        }
        else if (type === 'tow-truck') {
            await prisma_1.default.towTruck.update({
                where: { id },
                data: { status: 'REJECTED', rejectionReason: reason },
            });
        }
        else {
            return res.status(400).json({ error: 'Invalid application type.' });
        }
        return res.status(200).json({ success: true, message: `${type} rejected.` });
    }
    catch (error) {
        console.error('Rejection Error:', error);
        return res.status(500).json({ error: 'Failed to reject application.' });
    }
});
adminRouter.post('/users/:userId/ban', async (req, res) => {
    const { userId } = req.params;
    const { reason } = req.body;
    if (!reason) {
        return res.status(400).json({ error: 'A reason for banning is required.' });
    }
    try {
        console.log(`API: Admin attempting to ban user ID: ${userId} for reason: "${reason}"`);
        const transactionResult = await prisma_1.default.$transaction(async (tx) => {
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
            const updatedUser = await tx.user.update({
                where: { id: userId },
                data: { isBanned: true },
            });
            const garage = await tx.garage.findUnique({
                where: { ownerId: userId }
            });
            if (garage) {
                await tx.garage.update({
                    where: { id: garage.id },
                    data: {
                        isOpen: false,
                        status: 'REJECTED',
                        rejectionReason: `Owner banned: ${reason}`
                    }
                });
            }
            const towTruck = await tx.towTruck.findUnique({
                where: { ownerId: userId }
            });
            if (towTruck) {
                await tx.towTruck.update({
                    where: { id: towTruck.id },
                    data: {
                        status: 'REJECTED',
                        rejectionReason: `Owner banned: ${reason}`
                    }
                });
                await tx.liveTruckLocation.update({
                    where: { towTruckId: towTruck.id },
                    data: { isAvailable: false }
                });
            }
            return updatedUser;
        });
        console.log(`API: Successfully banned user ${transactionResult.id}.`);
        return res.status(200).json({ success: true, message: 'User and their businesses have been banned.' });
    }
    catch (error) {
        console.error('Admin Ban User Error:', error);
        if (error.message.includes('User not found') || error.message.includes('already banned')) {
            return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Failed to ban user.' });
    }
});
exports.default = adminRouter;
//# sourceMappingURL=admin.js.map