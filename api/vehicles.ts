import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';
import express, { Request, Response } from 'express';
import prisma from './lib/prisma';
import { ensureUserRecord } from './utils/ensureUserRecord';

const vehiclesRouter = express.Router();

vehiclesRouter.get(
    '/api/vehicles',
    ClerkExpressWithAuth(),
    async (req: Request, res: Response) => {
        const ownerId = req.auth.userId;
        if (!ownerId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        try {
            console.log(`[API /api/vehicles] Fetching vehicles for clerkId: ${ownerId}`);
            const user = await ensureUserRecord(prisma, ownerId);
            if (!user) {
                console.warn(`[API /api/vehicles] User not found for clerkId: ${ownerId}`);
                return res.status(200).json([]);
            }
            console.log(`[API /api/vehicles] Found user with DB id: ${user.id}. Now fetching vehicles.`);

            const vehicles = await prisma.vehicle.findMany({
                where: { userId: user.id },
                orderBy: { createdAt: 'desc' },
            });

            console.log(`[API /api/vehicles] Found ${vehicles.length} vehicles for user ${user.id}.`);
            return res.status(200).json(vehicles);
        } catch (error) {
            console.error("[API /api/vehicles] CRITICAL: Failed to fetch vehicles.", error);
            return res.status(500).json({ error: 'An internal error occurred while fetching vehicles.' });
        }
    }
);

vehiclesRouter.post(
    '/api/vehicles',
    ClerkExpressWithAuth(),
    async (req: Request, res: Response) => {
        const ownerId = req.auth.userId;
        if (!ownerId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { brand, name, model, year, plateNumber, color, type } = req.body;
        if (!brand || !name || !plateNumber || !type || !year) {
            return res.status(400).json({ error: "Missing required vehicle fields." });
        }
        try {
            const ensuredUser = await ensureUserRecord(prisma, ownerId);
            if (!ensuredUser) {
                return res.status(404).json({ error: 'User profile not found.' });
            }
            const userWithVehicleCount = await prisma.user.findUnique({
                where: { id: ensuredUser.id },
                include: { _count: { select: { vehicles: true } } },
            });
            if (!userWithVehicleCount) {
                return res.status(404).json({ error: 'User profile not found.' });
            }
            // if (!userWithVehicleCount.isPremium && userWithVehicleCount._count.vehicles >= 3) {
            //     return res.status(403).json({ error: 'Vehicle limit reached. Please upgrade to a Premium account to add more vehicles.' });
            // }
            const newVehicle = await prisma.vehicle.create({
                data: {
                    brand, name, model, plateNumber, color,
                    year: parseInt(String(year), 10),
                    type: type,
                    user: { connect: { id: userWithVehicleCount.id } },
                },
            });
            return res.status(201).json(newVehicle);
        } catch (error: any) {
            console.error("Failed to create vehicle:", error);
            if (error.code === 'P2002') {
                return res.status(409).json({ error: 'A vehicle with this plate number already exists.' });
            }
            return res.status(500).json({ error: 'An internal server error occurred.' });
        }
    }
);

vehiclesRouter.delete(
    '/api/vehicles/:id',
    ClerkExpressWithAuth(),
    async (req: Request, res: Response) => {
        const ownerId = req.auth.userId;
        if (!ownerId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const vehicleId = req.params.id;
        try {
            const vehicle = await prisma.vehicle.findUnique({
                where: { id: vehicleId },
                include: { user: true }
            });
            if (!vehicle) {
                return res.status(404).json({ error: 'Vehicle not found.' });
            }
            if (vehicle.user.clerkId !== ownerId) {
                return res.status(403).json({ error: 'You are not authorized to delete this vehicle.' });
            }
            await prisma.vehicle.delete({ where: { id: vehicleId } });
            return res.status(204).send();
        } catch (error) {
            console.error("Failed to delete vehicle:", error);
            return res.status(500).json({ error: 'An internal server error occurred.' });
        }
    }
);

export default vehiclesRouter;
