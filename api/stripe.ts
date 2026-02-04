// /api/stripe.ts
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';
import { PrismaClient } from '@prisma/client';
import express, { Request, Response } from 'express';
import Stripe from 'stripe';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});
const router = express.Router();

router.post(
  '/create-premium-intent',
  ClerkExpressWithAuth(),
  async (req: Request, res: Response) => {
    const clerkId = req.auth.userId;
    if (!clerkId) {
      return res.status(401).json({ error: 'User not authenticated.' });
    }
    try {
      // Find the user in your database
      const user = await prisma.user.findUnique({
        where: { clerkId },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 17900, // Rs 179.00 in paisa
        currency: 'inr',
        metadata: {
          userId: user.id,
          clerkId: clerkId,
        },
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error: any) {
      console.error('Failed to create payment intent:', error);
      res.status(500).json({ error: 'Failed to create payment intent.', details: error.message });
    }
  }
);

export default router;
