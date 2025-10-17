// /api/index.ts
import { ClerkExpressWithAuth, clerkClient } from '@clerk/clerk-sdk-node';
import { Client } from '@googlemaps/google-maps-services-js';
import { PrismaClient, Role } from '@prisma/client';
import cors from 'cors';
import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Webhook } from 'svix';
import adminRouter from './admin';
import bookingsRouter from './bookings';
import chatRoutes from './chat';
import garagesRouter from './garages';
import { attachSocketServer } from './socket';
import sparePartRoutes from './spareparts';
import towTruckRoutes from './towtruck';
import vehiclesRouter from './vehicles';
import stripeRouter from './stripe';

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

            const { id, first_name, last_name, phone_numbers, email_addresses, unsafe_metadata, primary_email_address_id, firstName, lastName } = evt.data;

            if (!id) {
                console.error('🔴 Error: Clerk user ID is missing from payload.');
                // We can respond 200 here so Clerk doesn't retry, as the payload is invalid.
                return res.status(200).json({ message: 'Error: Missing Clerk user ID' });
            }

            // --- THIS IS THE CRITICAL LOGIC CORRECTION ---
            const primaryPhoneNumber = phone_numbers?.[0]?.phone_number;
            const primaryEmailObject = email_addresses?.find((email: any) => email.id === primary_email_address_id);
            const primaryEmail = primaryEmailObject?.email_address;


            // Prepare the data for Prisma, ensuring no required fields are null/undefined
            const userDataForDb = {
                clerkId: id,
                // Fallback to a placeholder if email is missing. Your schema requires it.
                email: primaryEmail || (email_addresses?.[0]?.email_address) || `user_${id}@placeholder.email`,
                firstName: firstName || first_name || (unsafe_metadata?.firstName as string) || 'New',
                lastName: lastName || last_name || (unsafe_metadata?.lastName as string) || 'User',
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
        } else if (eventType === 'user.updated') {
            console.log("Processing 'user.updated' event...");
            const { id, first_name, last_name, firstName, lastName, unsafe_metadata } = evt.data;

            if (!id) {
                console.error('🔴 Error: Clerk user ID is missing from update payload.');
                return res.status(200).json({ message: 'Error: Missing Clerk user ID' });
            }

            const userDataForDb: { firstName?: string; lastName?: string | null } = {
                firstName: firstName || first_name || (unsafe_metadata?.firstName as string),
                lastName: lastName || last_name || (unsafe_metadata?.lastName as string),
            };

            const cleanData = Object.fromEntries(Object.entries(userDataForDb).filter(([_, v]) => v !== undefined));

            if (Object.keys(cleanData).length === 0) {
                console.log("No name fields to update for user:", id);
                return res.status(200).json({ message: 'Webhook processed, no data to update.' });
            }

            console.log("Attempting to update user in DB for Clerk ID:", id, "with data:", cleanData);

            try {
                await prisma.user.update({
                    where: { clerkId: id },
                    data: cleanData,
                });
                console.log("✅ User successfully updated in database for Clerk ID:", id);
            } catch (dbError: any) {
                if (dbError.code === 'P2025') { 
                     console.warn(`⚠️ User with Clerk ID ${id} not found in local DB for update.`);
                } else {
                    console.error('🔴 Database error updating user:', dbError);
                }
                return res.status(200).json({ message: 'Webhook processed, but DB update failed.' });
            }
        } else {
             console.log(`Received unhandled event type: ${eventType}`);
        }

        // Send a 200 response to acknowledge receipt of the event
        return res.status(200).json({ message: 'Webhook processed successfully' });
    }
);

app.use(express.json({ limit: '50mb' }));
app.use(garagesRouter); // Mount garagesRouter directly
app.use(towTruckRoutes); // Mount towTruckRoutes directly
app.use('/api/stripe', stripeRouter);
app.use('/api/admin', adminRouter);
app.use('/api/vehicles', vehiclesRouter);
app.use('/api', bookingsRouter);
app.get(
    '/api/services',
    ClerkExpressWithAuth(),
    async (req: Request, res: Response) => {
        try {
            console.log("[API /api/services] Attempting to fetch services...");
            const { categories } = req.query;
            let whereClause: any = {};

            if (categories && typeof categories === 'string') {
                const categoryList = categories.split(',');
                whereClause.category = {
                    in: categoryList,
                };
            }

            const services = await prisma.service.findMany({
                where: whereClause,
                orderBy: { name: 'asc' },
            });
            console.log(`[API /api/services] Successfully fetched ${services.length} services with filters: ${JSON.stringify(whereClause)}`);
            return res.status(200).json(services);
        } catch (error) {
            console.error("[API /api/services] CRITICAL: Failed to fetch services.", error);
            return res.status(500).json({ error: "Could not fetch services." });
        }
    }
);

app.use('/api', chatRoutes);
app.use('/api/spare-parts', sparePartRoutes);

// Apply express.json() middleware for all subsequent routes

app.get(
    '/api/users/me',
    ClerkExpressWithAuth(),
    async (req: Request, res: Response) => {
        const clerkId = req.auth.userId;
        if (!clerkId) {
            return res.status(401).json({ error: 'User not authenticated.' });
        }
        try {
            const userInDb = await prisma.user.findUnique({
                where: { clerkId: clerkId },
            });

            if (!userInDb) {
                return res.status(404).json({ error: 'User not found in database.' });
            }
            
            return res.status(200).json(userInDb);

        } catch (error) {
            console.error("Failed to fetch user profile:", error);
            return res.status(500).json({ error: 'An internal server error occurred.' });
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


app.delete(
    '/api/users/me',
    ClerkExpressWithAuth(),
    async (req: Request, res: Response) => {
        const clerkId = req.auth.userId;
        if (!clerkId) {
            return res.status(401).json({ error: 'User not authenticated.' });
        }

        try {
            const user = await prisma.user.findUnique({
                where: { clerkId },
                include: { garage: true, towTruck: true, sparePartStore: true }
            });

            if (!user) {
                // If user is not in our DB, just delete from Clerk and return
                await clerkClient.users.deleteUser(clerkId);
                return res.status(200).json({ message: 'Account deleted successfully.' });
            }
            const userId = user.id;

            // Prisma Transaction to ensure atomicity
            await prisma.$transaction(async (tx) => {
                await tx.booking.deleteMany({ where: { userId } });
                await tx.vehicle.deleteMany({ where: { userId } });
                await tx.message.deleteMany({ where: { senderId: userId } });

                if (user.garage) {
                    await tx.garageService.deleteMany({ where: { garageId: user.garage.id } });
                    await tx.garage.delete({ where: { id: user.garage.id } });
                }
                if (user.towTruck) {
                    await tx.towTruckService.deleteMany({ where: { towTruckId: user.towTruck.id } });
                    await tx.liveTruckLocation.delete({ where: { towTruckId: user.towTruck.id } }).catch(() => {});
                    await tx.towTruck.delete({ where: { id: user.towTruck.id } });
                }
                if (user.sparePartStore) {
                    await tx.sparePart.deleteMany({ where: { storeId: user.sparePartStore.id } });
                    await tx.sparePartStore.delete({ where: { id: user.sparePartStore.id } });
                }

                await tx.user.delete({ where: { id: userId } });
            });

            await clerkClient.users.deleteUser(clerkId);

            return res.status(200).json({ message: 'Account deleted successfully.' });

        } catch (error) {
            console.error("🔴 FAILED TO DELETE ACCOUNT:", error);
            return res.status(500).json({ error: 'An internal server error occurred during account deletion.' });
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
    console.log("Initializing server...");
    await setupGeospatialIndexes();
    httpServer.listen(PORT, () => {
        console.log(`🚀 Server listening on port ${PORT}`);
    });
}

startServer().catch((error) => {
    console.error("🔴 FAILED TO START SERVER:", error);
    process.exit(1);
});


/*
 // "eas": {
      "projectId": "ee50e7f9-8072-43c7-9e18-5a191a417bbd"
}
*/