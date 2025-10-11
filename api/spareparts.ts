import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';
import { Request, Response, Router } from 'express';
import prisma from './lib/prisma';

const sparePartsRouter = Router();
sparePartsRouter.use(ClerkExpressWithAuth());

// Endpoint to create/update a spare part store
sparePartsRouter.post('/store', async (req: Request, res: Response) => {
    const { name, description, location } = req.body;
    const ownerId = req.auth.userId;

    if (!name || !location) {
        return res.status(400).json({ error: 'Name and location are required.' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { clerkId: ownerId } });
        if (!user) return res.status(404).json({ error: 'User not found.' });

        const store = await prisma.sparePartStore.upsert({
            where: { ownerId: user.id },
            update: { name, description, location },
            create: { name, description, location, owner: { connect: { id: user.id } } },
        });
        return res.status(201).json(store);
    } catch (error: any) {
        return res.status(500).json({ error: 'Failed to create or update store.' });
    }
});

// Endpoint to add a new spare part
sparePartsRouter.post('/', async (req: Request, res: Response) => {
    const ownerId = req.auth.userId;
    const { partName, description, price, quantity, category, brand, model, year, images, location } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { clerkId: ownerId } });
        if (!user) return res.status(404).json({ error: 'User not found.' });

        let store = await prisma.sparePartStore.findUnique({ where: { ownerId: user.id } });
        
        if (!store) {
            // Create a default store for the user
            store = await prisma.sparePartStore.create({
                data: {
                    name: `${user.firstName}'s Parts`,
                    description: 'Auto-generated spare parts store.',
                    location: location, // Use the location of the first part as store location
                    owner: { connect: { id: user.id } }
                }
            });
        }

        const newPart = await prisma.sparePart.create({
            data: {
                partName, description, price, quantity, category, brand, model, year, images, location,
                store: { connect: { id: store.id } },
            },
        });
        return res.status(201).json(newPart);
    } catch (error: any) {
        return res.status(500).json({ error: 'Failed to add spare part.' });
    }
});

// Endpoint to get all spare parts for the logged-in user's store
sparePartsRouter.get('/my-parts', async (req: Request, res: Response) => {
    const ownerId = req.auth.userId;

    try {
        const user = await prisma.user.findUnique({ where: { clerkId: ownerId } });
        if (!user) return res.status(404).json({ error: 'User not found.' });

        const store = await prisma.sparePartStore.findUnique({ where: { ownerId: user.id } });
        if (!store) {
            // If the user has a store but it's not found, this is an issue.
            // If they don't have a store, they simply have no parts.
            return res.status(200).json([]);
        }

        const parts = await prisma.sparePart.findMany({
            where: { storeId: store.id },
            orderBy: {
                partName: 'asc'
            }
        });

        return res.status(200).json(parts);
    } catch (error: any) {
        return res.status(500).json({ error: 'Failed to fetch spare parts.' });
    }
});

// Endpoint to get spare parts near a location
sparePartsRouter.get('/nearby', async (req: Request, res: Response) => {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
        return res.status(400).json({ error: 'Latitude and longitude are required.' });
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lon as string);

    try {
        const parts = await prisma.sparePart.aggregateRaw({
            pipeline: [
                {
                    '$lookup': {
                        from: 'spare_part_stores',
                        localField: 'storeId',
                        foreignField: '_id',
                        as: 'store'
                    }
                },
                {
                    '$unwind': '$store'
                },
                {
                    '$addFields': {
                        id: { '$toString': '$_id' }
                    }
                },
                {
                    '$project': {
                        _id: 0
                    }
                }
            ]
        });
        return res.status(200).json(parts);
    } catch (error: any) {
        return res.status(500).json({ error: 'Failed to fetch nearby spare parts.' });
    }
});

// Endpoint to delete a spare part
sparePartsRouter.delete('/:partId', async (req: Request, res: Response) => {
    const { partId } = req.params;
    const ownerId = req.auth.userId;

    try {
        const user = await prisma.user.findUnique({ where: { clerkId: ownerId } });
        if (!user) return res.status(404).json({ error: 'User not found.' });

        const part = await prisma.sparePart.findUnique({ where: { id: partId }, include: { store: true } });
        if (!part || part.store.ownerId !== user.id) {
            return res.status(403).json({ error: 'Part not found or user is not the owner.' });
        }

        await prisma.sparePart.delete({ where: { id: partId } });
        return res.status(204).send();
    } catch (error: any) {
        return res.status(500).json({ error: 'Failed to delete spare part.' });
    }
});

// Endpoint to get a single spare part by ID
sparePartsRouter.get('/:partId', async (req: Request, res: Response) => {
    const { partId } = req.params;
    try {
        const part = await prisma.sparePart.findUnique({
            where: { id: partId },
            include: { store: { include: { owner: true } } }
        });
        if (!part) {
            return res.status(404).json({ error: 'Spare part not found.' });
        }
        return res.status(200).json(part);
    } catch (error: any) {
        return res.status(500).json({ error: 'Failed to fetch spare part.' });
    }
});

export default sparePartsRouter;
