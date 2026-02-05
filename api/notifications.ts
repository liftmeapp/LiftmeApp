import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';
import { PrismaClient } from '@prisma/client';
import { Request, Response, Router } from 'express';

const prisma = new PrismaClient();

const router = Router();

// POST /api/notifications/register-token
router.post(
    '/api/notifications/register-token',
    ClerkExpressWithAuth(),
    async (req: Request, res: Response) => {
        const userId = req.auth.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { token, type, providerId } = req.body;

        if (!token) {
            return res.status(400).json({ error: 'Token is required' });
        }

        try {
            // Ensure the user exists in our DB (similar to other endpoints)
            const user = await prisma.user.findUnique({
                where: { clerkId: userId },
            });

            if (!user) {
                return res.status(404).json({ error: 'User not found in database' });
            }

            // Upsert the token
            // We use upsert on the composite unique key [userId, token] logic
            // providing a unique match or findFirst logic.
            // Since we defined @@unique([userId, token]), we can use upsert if we had a unique ID,
            // but for composite keys in Prisma with MongoDB, explicit 'where' with composite might need verify.
            // Let's rely on findFirst + create/update or use the unique constraint.

            // With MongoDB, the @@unique([userId, token]) creates a unique constraint.
            // Simplest way is to try creating, if it exists, do nothing or update timestamp.

            const existingToken = await prisma.notificationToken.findFirst({
                where: {
                    userId: user.id,
                    token: token
                }
            });

            if (existingToken) {
                // Update the existing token's metadata
                await prisma.notificationToken.update({
                    where: { id: existingToken.id },
                    data: {
                        type: type || 'unknown',
                        providerId: providerId || null,
                    }
                });
                return res.status(200).json({ message: 'Token updated successfully' });
            } else {
                await prisma.notificationToken.create({
                    data: {
                        userId: user.id,
                        token: token,
                        type: type || 'unknown',
                        providerId: providerId || null
                    }
                });
                return res.status(201).json({ message: 'Token registered successfully' });
            }

        } catch (error) {
            console.error('Error registering notification token:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
);

export default router;
