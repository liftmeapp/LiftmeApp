import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';
import { Client } from '@googlemaps/google-maps-services-js';
import cors from 'cors';
import express, { Request, Response } from 'express';
import prisma from './lib/prisma'; // Import the shared prisma instance


const router = express.Router();
router.use(cors());
const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
const googleMapsClient = new Client();

async function getEtaAndDistance(
    origin: { lat: number; lon: number }, destination: { lat: number; lon: number }) {
    try {
        const response = await googleMapsClient.directions({
            params: {
                origin: `${origin.lat},${origin.lon}`, // Pass coordinates as a string
                destination: `${destination.lat},${destination.lon}`, // Pass coordinates as a string
                key: process.env.GOOGLE_MAPS_API_KEY!,
            },
            timeout: 1000, // Optional timeout
        });
        // ... the rest of the function is the same ...
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


//garageNearby
// In your api/garages.ts file

router.get(
    '/api/garages/nearby',
    async (req: Request, res: Response) => {
        try {
            // FIX #1: Make sure to get 'serviceId' from the query as well
            const { lat, lon, category, serviceId } = req.query;

            if (!lat || !lon) {
                return res.status(400).json({ error: 'Latitude and longitude are required.' });
            }
            const latitude = parseFloat(lat as string);
            const longitude = parseFloat(lon as string);
            if (isNaN(latitude) || isNaN(longitude)) {
                return res.status(400).json({ error: 'Invalid coordinate values.' });
            }

            const geoQuery: any = { isOpen: true, status: 'APPROVED' };

            // Only apply the category filter if a specific service is NOT being requested
            // FIX #2: Correctly split the category string and use the '$in' operator
            if (category && typeof category === 'string' && !serviceId) {
                const categoryArray = category.split(',').map(cat => cat.trim());
                geoQuery.supportedVehicleTypes = { '$in': categoryArray };
            }

            const pipeline: any[] = [
                {
                    '$geoNear': {
                        near: { type: "Point", coordinates: [longitude, latitude] },
                        distanceField: "distance",
                        maxDistance: 50000, // 50km radius
                        query: geoQuery,
                        spherical: true
                    }
                },
            ];

            // FIX #3: Re-introduce the entire serviceId filtering logic
            if (serviceId) {
                pipeline.push(
                    {
                        '$lookup': {
                            from: "garage_services",
                            let: {
                                garage_id: "$_id",
                                service_id_string: serviceId
                            },
                            pipeline: [
                                {
                                    '$match': {
                                        '$expr': {
                                            '$and': [
                                                { '$eq': ["$garageId", "$$garage_id"] },
                                                { '$eq': ["$serviceId", { '$toObjectId': "$$service_id_string" }] }
                                            ]
                                        }
                                    }
                                }
                            ],
                            as: "offeredServices"
                        }
                    },
                    {
                        '$match': {
                            "offeredServices": { '$ne': [] }
                        }
                    }
                );
            }

            pipeline.push({ '$limit': 20 });

            console.log('[API /garages/nearby] Executing Pipeline:', JSON.stringify(pipeline, null, 2));

            const nearbyGarages = await prisma.garage.aggregateRaw({
                pipeline: pipeline
            });

            console.log(`[Garages] Found ${Array.isArray(nearbyGarages) ? nearbyGarages.length : 0} garages.`);
            return res.status(200).json(nearbyGarages);

        } catch (error: any) {
            console.error("--- 💥 GARAGE NEARBY API ERROR 💥 ---");
            console.error("Error Details:", error.message || error);
            return res.status(500).json({ error: 'Failed to execute geographical search.' });
        }
    }
);

router.get(
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

router.post(
    '/api/garages',
    ClerkExpressWithAuth(),
    async (req: Request, res: Response) => {
        const ownerId = req.auth.userId;
        if (!ownerId) {
            return res.status(401).json({ error: 'Unauthorized: No user ID in token.' });
        }
        const { details, services, location, supportedVehicleTypes } = req.body;
        const { name, licenseNumber, address, ownerName, numberOfEmployees, contactEmail, contactPhone, operatingHours, razorpayAccountId } = details;

        if (!name || !licenseNumber || !location || !services) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }
        if (!Array.isArray(services) || services.length === 0) {
            return res.status(400).json({ error: 'At least one service must be provided.' });
        }
        try {
            const user = await prisma.user.findUnique({ where: { clerkId: ownerId } });
            if (!user) {
                return res.status(404).json({ error: 'Your user profile could not be found.' });
            }
            const garageData = {
                name, licenseNumber, address, ownerName, razorpayAccountId: razorpayAccountId || null, location,
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

router.get(
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
                    razorpayAccountId: true,
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

router.put(
    '/api/garages/:garageId',
    ClerkExpressWithAuth(),
    async (req: Request, res: Response) => {
        const ownerId = req.auth.userId;
        const { garageId } = req.params;
        const { details, services, location, supportedVehicleTypes } = req.body;

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
                    supportedVehicleTypes: Array.isArray(supportedVehicleTypes) ? supportedVehicleTypes : existingGarage.supportedVehicleTypes,
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

router.delete(
    '/api/garages/:garageId',
    ClerkExpressWithAuth(),
    async (req: Request, res: Response) => {
        const ownerId = req.auth.userId;
        const { garageId } = req.params;
        try {
            if (!ownerId) {
                return res.status(401).json({ error: 'Unauthorized - User ID not found' });
            }
            const garage = await prisma.garage.findFirst({
                where: { id: garageId, owner: { clerkId: ownerId } },
            });
            if (!garage) return res.status(403).json({ error: 'You are not authorized to delete this garage.' });

            await prisma.garageService.deleteMany({ where: { garageId: garageId } });
            await prisma.garage.delete({ where: { id: garageId } });
            return res.status(200).json({ message: 'Garage deleted successfully' });
        } catch (error) {
            return res.status(500).json({ error: 'Failed to delete garage.' });
        }
    }
);

router.get(
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

export default router;
