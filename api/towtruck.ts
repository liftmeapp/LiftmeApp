import { ClerkExpressWithAuth, clerkClient } from '@clerk/clerk-sdk-node';
import cors from 'cors';
import express, { Request, Response } from 'express';
import prisma from './lib/prisma'; // Import the shared prisma instance


const router = express.Router();
router.use(cors());

//towtruckNearby
router.get(
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

router.post(
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

router.post(
    '/api/tow-trucks',
    ClerkExpressWithAuth(),
    async (req: Request, res: Response) => {
        const ownerId = req.auth.userId;
        if (!ownerId) return res.status(401).json({ error: 'Unauthorized' });
        const { name, driverName, contactEmail, model, make, year, plateNumber, licenseNumber, location, services } = req.body;
        if (!name || !plateNumber || !location || !services || services.length === 0) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }
        try {
            const user = await prisma.user.findUnique({ where: { clerkId: ownerId } });
            if (!user) return res.status(404).json({ error: 'User profile not found.' });
            const newTowTruck = await prisma.towTruck.create({
                data: {
                    name, driverName, contactEmail, model, make, licenseNumber, plateNumber,
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

router.get(
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

router.get(
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

router.put(
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
            const updatedTruck = await prisma.$transaction(async (tx) => {
                await tx.towTruckService.deleteMany({ where: { towTruckId: truckId } });

                const dataToUpdate: any = {
                    name: details.name, 
                    driverName: details.driverName, 
                    contactEmail: details.contactEmail, 
                    model: details.model, 
                    make: details.make,
                    year: parseInt(String(details.year), 10),
                    plateNumber: details.plateNumber, 
                    licenseNumber: details.licenseNumber,
                    services: {
                        create: services.map((s: { vehicleType: string, price: number }) => ({
                            vehicleType: s.vehicleType as any,
                            price: s.price,
                        })),
                    },
                };
    
                // Conditionally add status if it exists in the request (for re-applications)
                if (details.status) {
                    dataToUpdate.status = details.status;
                }
    
                const result = await tx.towTruck.update({
                    where: { id: truckId },
                    data: dataToUpdate,
                });

                return result;
            }, {
                timeout: 30000, // Set timeout to 30 seconds
            });

            return res.status(200).json(updatedTruck);
        } catch (error) {
            console.error("Failed to update tow truck:", error);
            return res.status(500).json({ error: 'Failed to update tow truck.' });
        }
    }
);

router.delete(
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



export default router;