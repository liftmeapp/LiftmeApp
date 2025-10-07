// /api/index.ts
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import express, { Request, Response } from 'express';
import { createServer } from 'http';


const prisma = new PrismaClient();
const app = express();
const httpServer = createServer(app);
app.use(cors());
const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

//garageNearby
app.get(
    '/api/garages/nearby',
    async (req: Request, res: Response) => {
        try {
            const { lat, lon, category } = req.query;
            if (!lat || !lon) {
                return res.status(400).json({ error: 'Latitude and longitude are required.' });
            }
            const latitude = parseFloat(lat as string);
            const longitude = parseFloat(lon as string);
            if (isNaN(latitude) || isNaN(longitude)) {
                return res.status(400).json({ error: 'Invalid coordinate values.' });
            }

            const geoQuery: any = { isOpen: true };
            if (category && typeof category === 'string') {
                geoQuery.supportedVehicleTypes = category;
            }

            console.log(`[Garages] Searching near: Lon=${longitude}, Lat=${latitude} with query:`, geoQuery);
            const nearbyGarages = await prisma.garage.aggregateRaw({
                pipeline: [
                    {
                        '$geoNear': {
                            near: { type: "Point", coordinates: [longitude, latitude] },
                            distanceField: "distance",
                            maxDistance: 50000,
                            query: geoQuery,
                            spherical: true
                        }
                    },
                    { '$limit': 50 } // Increased limit for better coverage
                ]
            });
            console.log(`[Garages] Found ${Array.isArray(nearbyGarages) ? nearbyGarages.length : 0} garages via geoNear.`);
            return res.status(200).json(nearbyGarages);
        } catch (error: any) {
            console.error("--- 💥 GARAGE NEARBY API ERROR 💥 ---");
            console.error("Error Details:", error.message || error);
            return res.status(500).json({ error: 'Failed to execute geographical search. Check server logs for index errors.' });
        }
    }
);

app.get(
    '/api/garages/test',
    ClerkExpressWithAuth(),
    async (req: Request, res: Response) => {
        try {
            const garages = await prisma.garage.findMany({ where: { isOpen: true }, take: 5 });
            const testData = garages.map((garage: any) => ({
                id: garage.id,
                name: garage.name,
                isOpen: garage.isOpen,
                location: garage.location,
                hasValidLocation: !!(garage.location as any)?.coordinates
            }));
            return res.status(200).json({
                message: "Test successful",
                garageCount: garages.length,
                garages: testData
            });
        } catch (error: unknown) {
            console.error("Test failed:", error);
            return res.status(500).json({
                error: 'Test failed',
                details: error instanceof Error ? error.message : String(error)
            });
        }
    }
);

app.post(
    '/api/garages',
    ClerkExpressWithAuth(),
    async (req: Request, res: Response) => {
        const ownerId = req.auth.userId;
        if (!ownerId) {
            return res.status(401).json({ error: 'Unauthorized: No user ID in token.' });
        }
        const { details, services, location } = req.body;
        const { name, licenseNumber, address, ownerName, numberOfEmployees, contactEmail, contactPhone, operatingHours, stripeAccountId } = details;

        if (!name || !licenseNumber || !location || !services || !stripeAccountId) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }
        if (!Array.isArray(services) || services.length === 0) {
            return res.status(400).json({ error: 'At least one service must be provided.'});
        }
        try {
            const user = await prisma.user.findUnique({ where: { clerkId: ownerId } });
            if (!user) {
                return res.status(404).json({ error: 'Your user profile could not be found.' });
            }
            const garageData = {
                name, licenseNumber, address, ownerName, stripeAccountId, location,
                contactEmail: contactEmail || null,
                contactPhone: contactPhone || null,
                operatingHours: operatingHours && typeof operatingHours === 'object' ? operatingHours : {},
                numberOfEmployees: parseInt(String(numberOfEmployees), 10) || 0,
                owner: { connect: { id: user.id } },
                services: {
                    create: services.map((service: { serviceId: string; price: number }) => ({
                        price: service.price,
                        service: { connect: { id: service.serviceId } },
                    })),
                },
            };
            const newGarage = await prisma.garage.create({ data: garageData });
            if (!user.role.includes('GARAGE_OWNER')) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        role: {
                            push: 'GARAGE_OWNER'
                        }
                    },
                });
            }
            return res.status(201).json(newGarage);
        } catch (error: any) {
            console.error("--- 💥 FAILED in /api/garages catch block 💥 ---", error);
            if (error.code === 'P2002') {
                return res.status(409).json({ error: `A garage with these details already exists.` });
            }
            return res.status(500).json({ error: 'An unexpected error occurred while creating the garage.' });
        }
    }
);

// --- Parameterized routes last ---

app.get(
    '/api/garages/:garageId',
    ClerkExpressWithAuth(),
    async (req: Request, res: Response) => {
        const { garageId } = req.params;
        try {
            const garage = await prisma.garage.findUnique({
                where: { id: garageId },
                select: { // Explicitly select fields
                    id: true,
                    name: true,
                    address: true,
                    ownerName: true,
                    licenseNumber: true,
                    contactPhone: true,
                    contactEmail: true,
                    numberOfEmployees: true,
                    operatingHours: true,
                    stripeAccountId: true,
                    status: true,
                    location: true, // Keep location for editing purposes
                    services: {
                        include: {
                            service: true // Include service details for each garage service
                        }
                    },
                },
            });
            if (!garage) return res.status(404).json({ error: 'Garage not found.' });
            return res.status(200).json(garage);
        } catch (error: any) { // Add type to error for better logging
            console.error("Failed to fetch garage details:", error); // More specific logging
            return res.status(500).json({ error: 'Failed to fetch garage details.', details: error.message }); // Include error message
        }
    }
);

app.put(
    '/api/garages/:garageId',
    ClerkExpressWithAuth(),
    async (req: Request, res: Response) => {
        const ownerId = req.auth.userId;
        const { garageId } = req.params;
        const { details, services, location } = req.body;

        if (!ownerId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        if (!details || !services || !location) {
            return res.status(400).json({ error: 'Missing details, services, or location in request body.' });
        }

        try {
            const existingGarage = await prisma.garage.findFirst({
                where: { id: garageId, owner: { clerkId: ownerId } },
            });

            if (!existingGarage) {
                return res.status(403).json({ error: 'You are not authorized to edit this garage.' });
            }

            // Use a transaction to ensure data integrity, with an increased timeout
            const updatedGarage = await prisma.$transaction(async (tx) => {
                // 1. Delete existing services for this garage
                await tx.garageService.deleteMany({ where: { garageId: garageId } });

                // 2. Prepare the data for update
                const dataToUpdate: any = {
                    name: details.name,
                    licenseNumber: details.licenseNumber,
                    address: details.address,
                    ownerName: details.ownerName,
                    numberOfEmployees: parseInt(String(details.numberOfEmployees), 10) || 0,
                    contactEmail: details.contactEmail,
                    contactPhone: details.contactPhone,
                    operatingHours: details.operatingHours && typeof details.operatingHours === 'object' ? details.operatingHours : {},
                    location: location,
                    services: {
                        create: services.map((service: { serviceId: string; price: number }) => ({
                            price: service.price,
                            service: { connect: { id: service.serviceId } },
                        })),
                    },
                };

                // 3. Conditionally add the status if it's part of the re-application
                if (details.status) {
                    dataToUpdate.status = details.status;
                }

                // 4. Update the garage with new details and create new services
                const result = await tx.garage.update({
                    where: { id: garageId },
                    data: dataToUpdate,
                    include: { services: { include: { service: true } } } // Include services in the response
                });
                return result;
            }, {
                timeout: 30000, // Set timeout to 30 seconds
            });

            return res.status(200).json(updatedGarage);

        } catch (error) {
            console.error("Failed to update garage:", error);
            return res.status(500).json({ error: 'Failed to update garage.' });
        }
    }
);

app.delete(
    '/api/garages/:garageId',
    ClerkExpressWithAuth(),
    async (req: Request, res: Response) => {
        const ownerId = req.auth.userId;
        const { garageId } = req.params;
        try {
            if (!ownerId) {
                return res.status(401).json({ error: 'Unauthorized - No user ID provided' });
            }
            const garage = await prisma.garage.findFirst({
                where: { id: garageId, owner: { clerkId: ownerId } },
            });
            if (!garage) return res.status(403).json({ error: 'You are not authorized to delete this garage.' });

            await prisma.garageService.deleteMany({ where: { garageId: garageId }});
            await prisma.garage.delete({ where: { id: garageId } });
            return res.status(200).json({ message: 'Garage deleted successfully' });
        } catch (error) {
            return res.status(500).json({ error: 'Failed to delete garage.' });
        }
    }
);

app.get(
    '/api/garages/:garageId/bookings',
    ClerkExpressWithAuth(),
    async (req: Request, res: Response) => {
        const ownerId = req.auth.userId;
        if (!ownerId) {
            return res.status(403).json({ error: 'User not authenticated' });
        }
        try {
            const { garageId } = req.params;
            const garage = await prisma.garage.findFirst({
                where: { id: garageId, owner: { clerkId: ownerId } },
            });
            if (!garage) {
                return res.status(403).json({ error: 'You are not authorized to view these bookings.' });
            }
            const bookings = await prisma.booking.findMany({
                where: { garageId: garageId },
                include: {
                    user: { select: { firstName: true, lastName: true } },
                    vehicle: { select: { brand: true, name: true, plateNumber: true } },
                    service: true,
                },
                orderBy: { bookedAt: 'desc' },
            });
            const validBookings = bookings.filter(booking => booking.user && booking.vehicle);
            return res.status(200).json(validBookings);
        } catch (error: any) {
            console.error(`Failed to fetch garage bookings:`, error);
            return res.status(500).json({ error: 'Failed to fetch bookings.', details: error.message });
        }
    }
);
