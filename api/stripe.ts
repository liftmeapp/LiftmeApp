import { ClerkExpressWithAuth, clerkClient } from '@clerk/clerk-sdk-node';
import express, { Request, Response } from 'express';
import prisma from './lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10' as any,
});

const router = express.Router();

router.use(ClerkExpressWithAuth());

router.post('/create-premium-intent', async (req: Request, res: Response) => {
  const clerkId = req.auth.userId;
  if (!clerkId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 17900,
      currency: 'inr',
      metadata: { userId: user.id, clerkId },
    });

    return res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    console.error('Failed to create premium payment intent:', error);
    return res.status(500).json({ error: 'Failed to create payment intent.', details: error.message });
  }
});

router.get('/payment-methods', async (req: Request, res: Response) => {
  const clerkId = req.auth.userId;
  if (!clerkId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user || !user.stripeCustomerId) return res.status(200).json([]);

    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: 'card',
    });

    const cards = paymentMethods.data.map((pm) => ({
      id: pm.id,
      brand: pm.card?.brand,
      last4: pm.card?.last4,
      exp_month: pm.card?.exp_month,
      exp_year: pm.card?.exp_year,
    }));

    return res.status(200).json(cards);
  } catch (error: any) {
    console.error('Failed to fetch payment methods:', error);
    return res.status(500).json({ error: 'Failed to retrieve payment methods.' });
  }
});

router.post('/create-setup-intent', async (req: Request, res: Response) => {
  const clerkId = req.auth.userId;
  if (!clerkId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName || ''}`.trim(),
        phone: user.phone,
      });
      stripeCustomerId = customer.id;
      await prisma.user.update({
        where: { clerkId },
        data: { stripeCustomerId },
      });
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      usage: 'on_session',
    });

    return res.status(200).json({ clientSecret: setupIntent.client_secret });
  } catch (error: any) {
    console.error('Failed to create setup intent:', error);
    return res.status(500).json({ error: 'Could not prepare to save card.' });
  }
});

router.post('/detach-payment-method', async (req: Request, res: Response) => {
  const clerkId = req.auth.userId;
  if (!clerkId) return res.status(401).json({ error: 'Unauthorized' });

  const { paymentMethodId } = req.body;
  if (!paymentMethodId) return res.status(400).json({ error: 'paymentMethodId is required.' });

  try {
    const detached = await stripe.paymentMethods.detach(paymentMethodId);
    return res.status(200).json({ success: true, id: detached.id });
  } catch (error: any) {
    console.error('Failed to detach payment method:', error);
    return res.status(500).json({ error: 'Failed to detach payment method.' });
  }
});

router.post('/disconnect-account', async (req: Request, res: Response) => {
  const clerkId = req.auth.userId;
  if (!clerkId) return res.status(401).json({ error: 'Unauthorized' });

  const { businessType } = req.body as { businessType?: 'garage' | 'tow-truck' };
  if (!businessType) return res.status(400).json({ error: 'businessType is required.' });
  if (businessType !== 'garage' && businessType !== 'tow-truck') {
    return res.status(400).json({ error: 'Invalid businessType.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: { garage: true, towTruck: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const business = businessType === 'garage' ? user.garage : user.towTruck;
    if (!business) return res.status(404).json({ error: `No ${businessType} found for this user.` });

    if (businessType === 'garage') {
      await prisma.garage.update({ where: { id: business.id }, data: { stripeAccountId: null } });
    } else {
      await prisma.towTruck.update({ where: { id: business.id }, data: { stripeAccountId: null } });
    }

    return res.status(200).json({ success: true, message: 'Stripe account disconnected successfully.' });
  } catch (error: any) {
    console.error('Failed to disconnect account:', error);
    return res.status(500).json({ error: 'Failed to disconnect Stripe account.' });
  }
});

router.post('/create-connect-account', async (req: Request, res: Response) => {
  const clerkId = req.auth.userId;
  if (!clerkId) return res.status(401).json({ error: 'Unauthorized' });

  const { businessType, businessId } = req.body as { businessType?: 'garage' | 'tow-truck'; businessId?: string };
  if (!businessType || !businessId) {
    return res.status(400).json({ error: 'businessType and businessId are required.' });
  }
  if (businessType !== 'garage' && businessType !== 'tow-truck') {
    return res.status(400).json({ error: 'Invalid businessType.' });
  }

  try {
    let user = await prisma.user.findUnique({
      where: { clerkId },
      include: { garage: true, towTruck: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    if (!user.email || user.email.endsWith('@placeholder.email')) {
      const clerkUser = await clerkClient.users.getUser(clerkId);
      const primary = clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId);
      const primaryEmail = primary?.emailAddress;
      if (!primaryEmail) {
        return res.status(400).json({ error: 'A valid email is required to create a Stripe account.' });
      }
      user = await prisma.user.update({
        where: { id: user.id },
        data: { email: primaryEmail },
        include: { garage: true, towTruck: true },
      });
    }

    const business = businessType === 'garage' ? user.garage : user.towTruck;
    if (!business || business.id !== businessId) {
      return res.status(403).json({ error: 'User does not own this business.' });
    }

    let accountId = business.stripeAccountId;
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'IN',
        email: user.email,
        business_type: 'individual',
      });
      accountId = account.id;

      if (businessType === 'garage') {
        await prisma.garage.update({ where: { id: businessId }, data: { stripeAccountId: accountId } });
      } else {
        await prisma.towTruck.update({ where: { id: businessId }, data: { stripeAccountId: accountId } });
      }
    }

    const appUrl = process.env.APP_URL || 'https://example.com';
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${appUrl}/settings/payments?reauth=true`,
      return_url: `${appUrl}/settings/payments?stripe_return=true`,
      type: 'account_onboarding',
    });

    return res.status(200).json({ url: accountLink.url });
  } catch (error: any) {
    console.error('Failed to create Stripe connect account:', error);
    return res.status(500).json({ error: 'Failed to create Stripe connection.' });
  }
});

export default router;
