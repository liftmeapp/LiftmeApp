// /api/index.ts
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';
import { Client } from '@googlemaps/google-maps-services-js';
import { PrismaClient, Role } from '@prisma/client';
import cors from 'cors';
import express, { Request, Response } from 'express';
import { createServer } from 'http';
import adminRouter from './admin';
import bookingsRouter from './bookings';
import { attachSocketServer } from './socket';

const prisma = new PrismaClient();
const app = express();
const httpServer = createServer(app);
attachSocketServer(httpServer); // Attach the socket server
app.use(cors());
const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

if (!CLERK_WEBHOOK_SECRET) {
    throw new Error("Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to your .env file in the /api directory");
}
//Google Map setups
const googleMapsClient = new Client();

// ===================================================================
//  WEBHOOKS (MUST BE DEFINED BEFORE express.json())
// ===================================================================
app.post(
    '/api/clerk-webhook',
    express.raw({ type: 'application/json' }),
    async (req: Request, res: Response) => {
        console.log("--- Clerk Webhook Received ---");

        // 1. VERIFY THE WEBHOOK SIGNATURE
        const wh = new Webhook(CLERK_WEBHOOK_SECRET);
        let evt: any;
        try {
            const svix_id = req.headers['svix-id'] as string;
            const svix_timestamp = req.headers['svix-timestamp'] as string;
            const svix_signature = req.headers['svix-signature'] as string;

            if (!svix_id || !svix_timestamp || !svix_signature) {
                console.error('Error: Missing svix headers');
                return res.status(400).json({ error: 'Missing svix headers' });
            }
            const body = req.body;
            evt = wh.verify(body, {
                'svix-id': svix_id,
                'svix-timestamp': svix_timestamp,
                'svix-signature': svix_signature,
            });
            console.log("Webhook verified successfully. Event type:", evt.type);

        } catch (err: any) {
            console.error('🔴 Error verifying webhook:', err.message);
            // Return a 400 error to Clerk to indicate a problem with the request
            return res.status(400).json({ error: 'Webhook verification failed' });
        }

        // 2. HANDLE THE 'user.created' EVENT
        const eventType = evt.type;
        if (eventType === 'user.created') {
            console.log("Processing 'user.created' event...");
            console.log("Webhook payload (evt.data):", JSON.stringify(evt.data, null, 2));

            const { id, first_name, last_name, phone_numbers, email_addresses, unsafe_metadata } = evt.data;

            if (!id) {
                console.error('🔴 Error: Clerk user ID is missing from payload.');
                // We can respond 200 here so Clerk doesn't retry, as the payload is invalid.
                return res.status(200).json({ message: 'Error: Missing Clerk user ID' });
            }

            // --- THIS IS THE CRITICAL LOGIC CORRECTION ---
            const primaryPhoneNumber = phone_numbers?.[0]?.phone_number;
            const primaryEmail = email_addresses?.[0]?.email_address;

            // Prepare the data for Prisma, ensuring no required fields are null/undefined
            const userDataForDb = {
                clerkId: id,
                // Fallback to a placeholder if email is missing. Your schema requires it.
                email: primaryEmail || `user_${id}@placeholder.email`,
                firstName: first_name || (unsafe_metadata?.firstName as string) || 'New',
                lastName: last_name || (unsafe_metadata?.lastName as string) || 'User',
                // Fallback for phone. Your schema requires it.
                phone: primaryPhoneNumber || 'pending_phone_verification',
                role: [Role.CUSTOMER],
                isPremium: false,
                isBanned: false,
                unsafeMetadata: unsafe_metadata || {},
            };

            console.log("Attempting to create user in DB with data:", userDataForDb);

            // 3. PERFORM THE DATABASE OPERATION WITH ISOLATED ERROR HANDLING
            try {
                await prisma.user.create({
                    data: userDataForDb,
                });
                console.log("✅ User successfully created in database for Clerk ID:", id);
            } catch (dbError: any) {
                console.error('🔴 Database error creating user:', dbError);
                // Even if DB fails, send 200 to Clerk to stop it from retrying a failing operation.
                // You should have monitoring (e.g., Sentry) on this error log.
                return res.status(200).json({ message: 'Webhook processed, but DB creation failed.' });
            }
        } else {
             console.log(`Received unhandled event type: ${eventType}`);
        }

        // Send a 200 response to acknowledge receipt of the event
        return res.status(200).json({ message: 'Webhook processed successfully' });
    }
);



app.use(express.json());
app.use('/api/admin', adminRouter);
app.use('/api', bookingsRouter);

// Apply express.json() middleware for all subsequent routes

// ===================================================================
//  VEHICLE ROUTES
// ===================================================================
async function getEtaAndDistance(
    origin: { lat: number; lon: number }, destination: { lat: number; lon: number })
    {
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

app.get(
    '/api/vehicles',
    ClerkExpressWithAuth(),
    async (req: Request, res: Response) => {
        const ownerId = req.auth.userId;
        if (!ownerId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        try {
            const vehicles = await prisma.vehicle.findMany({
                where: { user: { clerkId: ownerId } },
                orderBy: { createdAt: 'desc' },
            });
            return res.status(200).json(vehicles);
        } catch (error) {
            console.error("Failed to fetch vehicles:", error);
            return res.status(500).json({ error: 'An internal error occurred while fetching vehicles.' });
        }
    }
);

app.post(
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
            const userWithVehicleCount = await prisma.user.findUnique({
                where: { clerkId: ownerId },
                include: { _count: { select: { vehicles: true } } },
            });
            if (!userWithVehicleCount) {
                return res.status(404).json({ error: 'User profile not found.' });
            }
            if (!userWithVehicleCount.isPremium && userWithVehicleCount._count.vehicles >= 3) {
                return res.status(403).json({ error: 'Vehicle limit reached. Please upgrade to a Premium account to add more vehicles.' });
            }
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

app.delete(
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

// ===================================================================
//  GARAGE ROUTES (ORDER IS IMPORTANT!)
// ===================================================================

// --- Specific routes first ---

//garageNearby
app.get(
    '/api/garages/nearby',
    async (req: Request, res: Response) => {
        try {
            const { lat, lon } = req.query;
            if (!lat || !lon) {
                return res.status(400).json({ error: 'Latitude and longitude are required.' });
            }
            const latitude = parseFloat(lat as string);
            const longitude = parseFloat(lon as string);
            if (isNaN(latitude) || isNaN(longitude)) {
                return res.status(400).json({ error: 'Invalid coordinate values.' });
            }
            console.log(`[Garages] Searching near: Lon=${longitude}, Lat=${latitude}`);
            const nearbyGarages = await prisma.garage.aggregateRaw({
                pipeline: [
                    {
                        '$geoNear': {
                            near: { type: "Point", coordinates: [longitude, latitude] },
                            distanceField: "distance",
                            maxDistance: 50000,
                            query: { isOpen: true },
                            spherical: true
                        }
                    },
                    { '$limit': 20 }
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

                // 2. Update the garage with new details and create new services
                const result = await tx.garage.update({
                    where: { id: garageId },
                    data: {
                        // Update all details from the request
                        name: details.name,
                        licenseNumber: details.licenseNumber,
                        address: details.address,
                        ownerName: details.ownerName,
                        numberOfEmployees: parseInt(String(details.numberOfEmployees), 10) || 0,
                        contactEmail: details.contactEmail,
                        contactPhone: details.contactPhone,
                        operatingHours: details.operatingHours && typeof details.operatingHours === 'object' ? details.operatingHours : {},
                        // Update location
                        location: location,
                        // Create the new set of services
                        services: {
                            create: services.map((service: { serviceId: string; price: number }) => ({
                                price: service.price,
                                service: { connect: { id: service.serviceId } },
                            })),
                        },
                    },
                    include: { services: { include: { service: true } } } // Include services in the response
                });
                return result;
            }, {
                timeout: 10000, // Set timeout to 10 seconds
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

// ===================================================================
//  TOW TRUCK ROUTES (ORDER IS IMPORTANT!)
// ===================================================================

// --- Specific routes first ---

//towtruckNearby
app.get(
    '/api/tow-trucks/nearby',
    async (req: Request, res: Response) => {
        try {
            const { lat, lon, vehicleType } = req.query;
            if (!lat || !lon || !vehicleType) {
                return res.status(400).json({ error: 'Latitude, longitude, and vehicleType are required.' });
            }
            const latitude = parseFloat(lat as string);
            const longitude = parseFloat(lon as string);

            console.log(`[Tow Trucks] Searching near: Lon=${longitude}, Lat=${latitude} for type: ${vehicleType}`);

            // For debugging, let's see what trucks exist before filtering
            const allLiveTrucks = await prisma.liveTruckLocation.findMany({
                include: { towTruck: { include: { services: true } } }
            });
            console.log(`[Tow Trucks Debug] Total live trucks in DB: ${allLiveTrucks.length}`);
            allLiveTrucks.forEach((truck: { towTruck: { name: string; services: { vehicleType: string }[] }; isAvailable: boolean }) => {
                console.log(`- Truck: ${truck.towTruck.name}, isAvailable: ${truck.isAvailable}, Services: ${truck.towTruck.services.map(s => s.vehicleType).join(', ')}`);
            });
            // End of debug block

            const pipeline = [
                { '$geoNear': { near: { type: "Point", coordinates: [longitude, latitude] }, distanceField: "distance", maxDistance: 50000, query: { isAvailable: true }, spherical: true } },
                { '$lookup': { from: "tow_trucks", localField: "towTruckId", foreignField: "_id", as: "truckDetails" } },
                { '$unwind': "$truckDetails" },
                { '$lookup': { from: "tow_truck_services", localField: "truckDetails._id", foreignField: "towTruckId", as: "services" } },
                // { '$match': { "services.vehicleType": vehicleType } }, // <-- THIS IS THE MOST LIKELY PROBLEM
                { '$project': { '_id': "$truckDetails._id", 'name': "$truckDetails.name", 'driverName': "$truckDetails.driverName", 'plateNumber': "$truckDetails.plateNumber", 'location': "$location", 'distance': "$distance", 'isAvailable': "$isAvailable" } },
                { '$limit': 20 }
            ];

            const nearbyTrucks = await prisma.liveTruckLocation.aggregateRaw({ pipeline });

            console.log(`[Tow Trucks] Aggregation pipeline found ${Array.isArray(nearbyTrucks) ? nearbyTrucks.length : 0} matching trucks.`);
            return res.status(200).json(nearbyTrucks);
        } catch (error: any) {
            console.error("--- 💥 TOW TRUCK NEARBY API ERROR 💥 ---", error);
            return res.status(500).json({ error: 'Failed to fetch tow truck details. Check server logs for the full error.' });
        }
    }
);

app.post(
    '/api/tow-trucks/location',
    ClerkExpressWithAuth(),
    async (req: Request, res: Response) => {
        const ownerId = req.auth.userId;
        if (!ownerId) return res.status(401).json({ error: 'Unauthorized' });
        const { latitude, longitude, isAvailable } = req.body;
        if (typeof latitude !== 'number' || typeof longitude !== 'number') {
            return res.status(400).json({ error: 'Invalid latitude or longitude.' });
        }
        try {
            const truck = await prisma.towTruck.findFirst({ where: { owner: { clerkId: ownerId } } });
            if (!truck) return res.status(404).json({ error: 'Your tow truck profile was not found.' });
            const updatedLocation = await prisma.liveTruckLocation.update({
                where: { towTruckId: truck.id },
                data: {
                    location: { type: 'Point', coordinates: [longitude, latitude] },
                    ...(typeof isAvailable === 'boolean' && { isAvailable }),
                }
            });
            return res.status(200).json(updatedLocation);
        } catch (error) {
            console.error("Failed to update tow truck location:", error);
            return res.status(500).json({ error: 'Could not update location.' });
        }
    }
);

app.post(
    '/api/tow-trucks',
    ClerkExpressWithAuth(),
    async (req: Request, res: Response) => {
        const ownerId = req.auth.userId;
        if (!ownerId) return res.status(401).json({ error: 'Unauthorized' });
        const { name, driverName, model, make, year, plateNumber, licenseNumber, location, services } = req.body;
        if (!name || !plateNumber || !location || !services || services.length === 0) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }
        try {
            const user = await prisma.user.findUnique({ where: { clerkId: ownerId } });
            if (!user) return res.status(404).json({ error: 'User profile not found.' });
            const newTowTruck = await prisma.towTruck.create({
                data: {
                    name, driverName, model, make, licenseNumber, plateNumber,
                    year: parseInt(String(year), 10),
                    owner: { connect: { id: user.id } },
                    services: {
                        create: services.map((s: { vehicleType: string, price: number }) => ({
                            vehicleType: s.vehicleType as any,
                            price: s.price,
                        })),
                    },
                    liveLocation: {
                        create: { location: location, isAvailable: true }
                    }
                },
                include: { liveLocation: true }
            });
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    role: {
                        push: 'TOW_TRUCK_OWNER'
                    }
                }
            });
            return res.status(201).json(newTowTruck);
        } catch (error: any) {
            console.error("Failed to create tow truck:", error);
            if (error.code === 'P2002') {
                return res.status(409).json({ error: 'A tow truck with this plate or license number already exists.' });
            }
            return res.status(500).json({ error: 'Failed to create tow truck.' });
        }
    }
);


// --- Parameterized and nested routes last ---

app.get(
    '/api/tow-trucks/:truckId/bookings',
    ClerkExpressWithAuth(),
    async (req: Request, res: Response) => {
        const ownerId = req.auth.userId;
        if (!ownerId) {
            return res.status(403).json({ error: 'User not authenticated' });
        }
        try {
            const { truckId } = req.params;
            const truck = await prisma.towTruck.findFirst({
                where: { id: truckId, owner: { clerkId: ownerId } },
            });
            if (!truck) {
                return res.status(403).json({ error: 'You are not authorized to view these bookings.' });
            }
            const bookings = await prisma.booking.findMany({
                where: { towTruckId: truckId },
                include: {
                    user: { select: { firstName: true, lastName: true } },
                    vehicle: { select: { brand: true, name: true, plateNumber: true } },
                },
                orderBy: { bookedAt: 'desc' },
            });
            const validBookings = bookings.filter(booking => booking.user && booking.vehicle);
            return res.status(200).json(validBookings);
        } catch (error: any) {
            console.error(`Failed to fetch tow truck bookings:`, error);
            return res.status(500).json({ error: 'Failed to fetch bookings.', details: error.message });
        }
    }
);

app.get(
    '/api/tow-trucks/:truckId',
    ClerkExpressWithAuth(),
    async (req: Request, res: Response) => {
        const { truckId } = req.params;
        try {
            const towTruck = await prisma.towTruck.findUnique({
                where: { id: truckId },
                include: { services: true },
            });
            if (!towTruck) return res.status(404).json({ error: 'Tow truck not found.' });
            return res.status(200).json(towTruck);
        } catch (error) {
            console.error('Error fetching tow truck:', error);
            return res.status(500).json({ error: 'Failed to fetch tow truck details.' });
        }
    }
);

app.put(
    '/api/tow-trucks/:truckId',
    ClerkExpressWithAuth(),
    async (req: Request, res: Response) => {
        const ownerId = req.auth.userId;
        const { truckId } = req.params;
        const { details, services } = req.body;
        if (!ownerId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        try {
            const existingTruck = await prisma.towTruck.findFirst({
                where: { id: truckId, owner: { clerkId: ownerId } },
            });
            if (!existingTruck) return res.status(403).json({ error: 'You are not authorized to edit this tow truck.' });
            await prisma.towTruckService.deleteMany({ where: { towTruckId: truckId } });
            const updatedTruck = await prisma.towTruck.update({
                where: { id: truckId },
                data: {
                    name: details.name, driverName: details.driverName, model: details.model, make: details.make,
                    year: parseInt(String(details.year), 10),
                    plateNumber: details.plateNumber, licenseNumber: details.licenseNumber,
                    services: {
                        create: services.map((s: { vehicleType: string, price: number }) => ({
                            vehicleType: s.vehicleType as any,
                            price: s.price,
                        })),
                    },
                },
            });
            return res.status(200).json(updatedTruck);
        } catch (error) {
            console.error("Failed to update tow truck:", error);
            return res.status(500).json({ error: 'Failed to update tow truck.' });
        }
    }
);

app.delete(
    '/api/tow-trucks/:truckId',
    ClerkExpressWithAuth(),
    async (req: Request, res: Response) => {
        const ownerId = req.auth.userId;
        const { truckId } = req.params;
        if (!ownerId) {
            return res.status(401).json({ error: 'Unauthorized - User ID not found' });
        }
        try {
            const truck = await prisma.towTruck.findFirst({
                where: { id: truckId, owner: { clerkId: ownerId } },
            });
            if (!truck) return res.status(403).json({ error: 'You are not authorized to delete this tow truck.' });
            await prisma.towTruckService.deleteMany({ where: { towTruckId: truckId }});
            await prisma.liveTruckLocation.delete({ where: { towTruckId: truckId }});
            await prisma.towTruck.delete({ where: { id: truckId } });
            return res.status(204).send();
        } catch (error) {
            console.error("Failed to delete tow truck:", error);
            return res.status(500).json({ error: 'Failed to delete tow truck.' });
        }
    }
);

// ===================================================================
//  GENERAL & UTILITY ROUTES
// ===================================================================

app.get(
    '/api/services',
    ClerkExpressWithAuth(),
    async (req: Request, res: Response) => {
        try {
            const services = await prisma.service.findMany({
                orderBy: { name: 'asc' },
            });
            return res.status(200).json(services);
        } catch (error) {
            console.error("Failed to fetch master services:", error);
            return res.status(500).json({ error: "Could not fetch services." });
        }
    }
);

app.get(
    '/api/users/my-business',
    ClerkExpressWithAuth(),
    async (req: Request, res: Response) => {
        const ownerId = req.auth.userId;
        if (!ownerId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        try {
            const userWithBusiness = await prisma.user.findUnique({
                where: { clerkId: ownerId },
                include: {
                    garage: true,
                    towTruck: true,
                },
            });
            if (!userWithBusiness) {
                return res.status(404).json({ error: 'User profile not found.' });
            }
            return res.status(200).json(userWithBusiness);
        } catch (error) {
            console.error("Failed to fetch user's business profile:", error);
            return res.status(500).json({ error: 'An internal server error occurred.' });
        }
    }
);


app.get(
    '/api/users/my-roles',
    ClerkExpressWithAuth(), // Ensures the user is logged in
    async (req: Request, res: Response) => {
        // Get the Clerk user ID from the authenticated session
        const clerkId = req.auth.userId;
        if (!clerkId) {
            return res.status(401).json({ error: 'User not authenticated.' });
        }
        try {
            // Find the user in YOUR database using their clerkId
            const userInDb = await prisma.user.findUnique({
                where: { clerkId: clerkId },
                select: {
                    // We only need to select the roles field
                    role: true,
                },
            });

            if (!userInDb) {
                return res.status(404).json({ error: 'User not found in database.' });
            }

            // Return the roles array (or an empty array if none are set)
            return res.status(200).json({ roles: userInDb.role || [] });

        } catch (error) {
            console.error("Failed to fetch user roles:", error);
            return res.status(500).json({ error: 'An internal server error occurred.' });
        }
    }
);


app.get(
    '/api/debug/database',
    ClerkExpressWithAuth(),
    async (req: Request, res: Response) => {
        try {
            const garageCount = await prisma.garage.count();
            const truckLocationCount = await prisma.liveTruckLocation.count();
            const sampleGarage = await prisma.garage.findFirst();
            const sampleTruckLocation = await prisma.liveTruckLocation.findFirst();
            const debug = { garageCount, truckLocationCount, sampleGarage, sampleTruckLocation, timestamp: new Date().toISOString() };
            return res.json(debug);
        } catch (error: unknown) {
            console.error('Database debug error:', error);
            return res.status(500).json({
                error: 'Database debug failed',
                message: error instanceof Error ? error.message : String(error)
            });
        }
    }
);

//=====================================================
//  DATABASE & SERVER STARTUP
//=====================================================

async function setupGeospatialIndexes() {
    try {
        console.log('Setting up geospatial indexes...');
        await prisma.$runCommandRaw({
            createIndexes: "Garage",
            indexes: [{ key: { location: "2dsphere" }, name: "location_2dsphere" }]
        });
        console.log('Garage location index created/verified.');
        await prisma.$runCommandRaw({
            createIndexes: "LiveTruckLocation",
            indexes: [{ key: { location: "2dsphere" }, name: "location_2dsphere" }]
        });
        console.log('Truck location index created/verified.');
    } catch (error) {
        console.error('Warning: Error setting up indexes. Geo-queries might fail.', error);
    }
}

const PORT = process.env.PORT || 3000;

async function startServer() {
    await setupGeospatialIndexes();
    httpServer.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
}

startServer();


/*
 // "eas": {
      "projectId": "ee50e7f9-8072-43c7-9e18-5a191a417bbd"
}
*/