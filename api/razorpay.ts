import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';
import express, { Request, Response } from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import prisma from './lib/prisma';

// Initialize Razorpay client directly
const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
    throw new Error(
        'Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in api/.env.'
    );
}

export const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
});

const router = express.Router();

router.use(ClerkExpressWithAuth());

type BusinessType = 'garage' | 'tow-truck';

const normalizeBusinessType = (value: unknown): BusinessType | null => {
    if (value === 'garage' || value === 'tow-truck') return value;
    return null;
};

const getOwnedBusiness = (user: { garage: any; towTruck: any }, businessType: BusinessType) => {
    return businessType === 'garage' ? user.garage : user.towTruck;
};

const ensureRazorpayCustomer = async (user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string | null;
    phone: string;
    razorpayCustomerId: string | null;
}) => {
    if (user.razorpayCustomerId) {
        return user.razorpayCustomerId;
    }

    const customer = await razorpay.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName || ''}`.trim(),
        contact: user.phone,
        fail_existing: 0,
    });

    await prisma.user.update({
        where: { id: user.id },
        data: { razorpayCustomerId: customer.id },
    });

    return customer.id;
};

// ===================================================================
//  PREMIUM SUBSCRIPTION
// ===================================================================

router.post('/create-premium-order', async (req: Request, res: Response) => {
    const clerkId = req.auth.userId;
    if (!clerkId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const user = await prisma.user.findUnique({ where: { clerkId } });
        if (!user) return res.status(404).json({ error: 'User not found.' });

        // Create a Razorpay Order
        // Amount is in paise (179 INR = 17900 paise)
        const options = {
            amount: 17900,
            currency: "INR",
            receipt: `receipt_premium_${user.id}_${Date.now()}`,
            notes: {
                userId: user.id,
                type: 'premium_subscription'
            }
        };

        const order = await razorpay.orders.create(options);

        return res.status(200).json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID
        });
    } catch (error: any) {
        console.error('Failed to create premium order:', error);
        return res.status(500).json({ error: 'Failed to create order.', details: error.message });
    }
});

// ===================================================================
//  SELLER ONBOARDING (RAZORPAY ROUTE)
// ===================================================================

// Routes for connecting a garage/tow-truck to Razorpay Route
// We need to:
// 1. Create a Customer (if not exists)
// 2. Create a Fund Account (Bank Account or VPA)
// 3. Save the Fund Account ID as the 'razorpayAccountId' in our DB

router.post('/create-account', async (req: Request, res: Response) => {
    const clerkId = req.auth.userId;
    if (!clerkId) return res.status(401).json({ error: 'Unauthorized' });

    const { businessType: rawBusinessType, businessId, accountDetails } = req.body;
    const businessType = normalizeBusinessType(rawBusinessType);
    // accountDetails: { name, email, contact, ifsc, accountNumber } OR { name, email, contact, vpa }

    if (!businessType || !businessId || !accountDetails) {
        return res.status(400).json({ error: 'Missing required fields.' });
    }

    try {
        let user = await prisma.user.findUnique({
            where: { clerkId },
            include: { garage: true, towTruck: true },
        });
        if (!user) return res.status(404).json({ error: 'User not found.' });

        const business = getOwnedBusiness(user, businessType);
        if (!business || business.id !== businessId) {
            return res.status(403).json({ error: 'User does not own this business.' });
        }

        // 1. Create Customer
        // `razorpay.contacts` is not available in razorpay@2.9.6.
        // Fund accounts in this SDK are linked via `customer_id`.
        const customer = await razorpay.customers.create({
            name: accountDetails.name,
            email: accountDetails.email,
            contact: accountDetails.contact,
            fail_existing: 0,
            notes: {
                businessType,
                businessId
            }
        });

        // 2. Create Fund Account
        let fundAccount: { id: string };
        if (accountDetails.ifsc && accountDetails.accountNumber) {
            // Bank Account
            fundAccount = await razorpay.fundAccount.create({
                customer_id: customer.id,
                account_type: "bank_account",
                bank_account: {
                    name: accountDetails.name,
                    ifsc: accountDetails.ifsc,
                    account_number: accountDetails.accountNumber
                }
            } as any);
        } else if (accountDetails.vpa) {
            // UPI
            fundAccount = await razorpay.fundAccount.create({
                customer_id: customer.id,
                account_type: "vpa",
                vpa: {
                    address: accountDetails.vpa
                }
            } as any);
        } else {
            return res.status(400).json({ error: 'Invalid account details. Provide IFSC+Account No or VPA.' });
        }

        // 3. Save Fund Account ID to DB
        // This ID (fa_...) is used for transfers in Route
        const accountId = fundAccount.id;

        if (businessType === 'garage') {
            await prisma.garage.update({ where: { id: businessId }, data: { razorpayAccountId: accountId } });
        } else {
            await prisma.towTruck.update({ where: { id: businessId }, data: { razorpayAccountId: accountId } });
        }

        return res.status(200).json({ success: true, accountId });

    } catch (error: any) {
        console.error('Failed to create Razorpay account:', error);
        return res.status(500).json({ error: 'Failed to link account.', details: error.error?.description || error.message });
    }
});

router.get('/reuse-account-option', async (req: Request, res: Response) => {
    const clerkId = req.auth.userId;
    if (!clerkId) return res.status(401).json({ error: 'Unauthorized' });

    const businessType = normalizeBusinessType(req.query.businessType);
    const businessId = req.query.businessId as string | undefined;

    if (!businessType || !businessId) {
        return res.status(400).json({ error: 'businessType and businessId are required.' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { clerkId },
            include: { garage: true, towTruck: true },
        });
        if (!user) return res.status(404).json({ error: 'User not found.' });

        const targetBusiness = getOwnedBusiness(user, businessType);
        if (!targetBusiness || targetBusiness.id !== businessId) {
            return res.status(403).json({ error: 'User does not own this business.' });
        }

        const otherBusinessType: BusinessType = businessType === 'garage' ? 'tow-truck' : 'garage';
        const sourceBusiness = getOwnedBusiness(user, otherBusinessType);
        if (!sourceBusiness || !sourceBusiness.razorpayAccountId) {
            return res.status(200).json({ available: false });
        }

        return res.status(200).json({
            available: true,
            sourceBusinessType: otherBusinessType,
            sourceBusinessId: sourceBusiness.id,
            accountId: sourceBusiness.razorpayAccountId,
        });
    } catch (error: any) {
        console.error('Failed to fetch reusable Razorpay account:', error);
        return res.status(500).json({ error: 'Failed to fetch reusable account.' });
    }
});

router.post('/link-existing-account', async (req: Request, res: Response) => {
    const clerkId = req.auth.userId;
    if (!clerkId) return res.status(401).json({ error: 'Unauthorized' });

    const {
        targetBusinessType: rawTargetBusinessType,
        targetBusinessId,
        sourceBusinessType: rawSourceBusinessType,
        sourceBusinessId,
    } = req.body as {
        targetBusinessType?: BusinessType;
        targetBusinessId?: string;
        sourceBusinessType?: BusinessType;
        sourceBusinessId?: string;
    };

    const targetBusinessType = normalizeBusinessType(rawTargetBusinessType);
    const sourceBusinessType = normalizeBusinessType(rawSourceBusinessType);

    if (!targetBusinessType || !targetBusinessId || !sourceBusinessType || !sourceBusinessId) {
        return res.status(400).json({ error: 'Missing required fields.' });
    }
    if (targetBusinessType === sourceBusinessType) {
        return res.status(400).json({ error: 'Source and target business must be different types.' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { clerkId },
            include: { garage: true, towTruck: true },
        });
        if (!user) return res.status(404).json({ error: 'User not found.' });

        const targetBusiness = getOwnedBusiness(user, targetBusinessType);
        const sourceBusiness = getOwnedBusiness(user, sourceBusinessType);
        if (!targetBusiness || targetBusiness.id !== targetBusinessId) {
            return res.status(403).json({ error: 'User does not own target business.' });
        }
        if (!sourceBusiness || sourceBusiness.id !== sourceBusinessId) {
            return res.status(403).json({ error: 'User does not own source business.' });
        }
        if (!sourceBusiness.razorpayAccountId) {
            return res.status(400).json({ error: 'Source business does not have a payout account linked.' });
        }

        const accountId = sourceBusiness.razorpayAccountId;
        if (targetBusinessType === 'garage') {
            await prisma.garage.update({
                where: { id: targetBusinessId },
                data: { razorpayAccountId: accountId },
            });
        } else {
            await prisma.towTruck.update({
                where: { id: targetBusinessId },
                data: { razorpayAccountId: accountId },
            });
        }

        return res.status(200).json({ success: true, accountId });
    } catch (error: any) {
        console.error('Failed to link existing Razorpay account:', error);
        return res.status(500).json({ error: 'Failed to link existing account.' });
    }
});

router.post('/disconnect-account', async (req: Request, res: Response) => {
    const clerkId = req.auth.userId;
    if (!clerkId) return res.status(401).json({ error: 'Unauthorized' });

    const businessType = normalizeBusinessType((req.body as { businessType?: BusinessType })?.businessType);
    if (!businessType) return res.status(400).json({ error: 'businessType is required.' });

    try {
        const user = await prisma.user.findUnique({
            where: { clerkId },
            include: { garage: true, towTruck: true },
        });
        if (!user) return res.status(404).json({ error: 'User not found.' });

        const business = getOwnedBusiness(user, businessType);
        if (!business) return res.status(404).json({ error: `No ${businessType} found for this user.` });

        if (businessType === 'garage') {
            await prisma.garage.update({ where: { id: business.id }, data: { razorpayAccountId: null } });
        } else {
            await prisma.towTruck.update({ where: { id: business.id }, data: { razorpayAccountId: null } });
        }

        return res.status(200).json({ success: true, message: 'Account disconnected successfully.' });
    } catch (error: any) {
        console.error('Failed to disconnect account:', error);
        return res.status(500).json({ error: 'Failed to disconnect account.' });
    }
});

// ===================================================================
//  CUSTOMER CARDS (SAVED CARDS VIA RAZORPAY)
// ===================================================================

router.get('/customer-cards', async (req: Request, res: Response) => {
    const clerkId = req.auth.userId;
    if (!clerkId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const user = await prisma.user.findUnique({ where: { clerkId } });
        if (!user) return res.status(404).json({ error: 'User not found.' });

        const customerId = await ensureRazorpayCustomer(user);
        const tokensResponse: any = await razorpay.customers.fetchTokens(customerId);
        const cards = (tokensResponse?.items || []).map((token: any) => ({
            id: token.id,
            token: token.token,
            status: token.status,
            recurring: token.recurring,
            card: {
                last4: token?.card?.last4 || token?.card?.number?.slice(-4) || '',
                network: token?.card?.network || token?.card?.brand || '',
                issuer: token?.card?.issuer || '',
                type: token?.card?.type || '',
                expiryMonth: token?.card?.expiry_month || token?.card?.expiryMonth || '',
                expiryYear: token?.card?.expiry_year || token?.card?.expiryYear || '',
            }
        }));

        return res.status(200).json({ customerId, cards });
    } catch (error: any) {
        console.error('Failed to fetch customer cards:', error);
        return res.status(500).json({ error: 'Failed to fetch customer cards.' });
    }
});

router.post('/create-card-setup-order', async (req: Request, res: Response) => {
    const clerkId = req.auth.userId;
    if (!clerkId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const user = await prisma.user.findUnique({ where: { clerkId } });
        if (!user) return res.status(404).json({ error: 'User not found.' });

        const customerId = await ensureRazorpayCustomer(user);
        const amount = 100; // 1 INR in paise for card token setup
        const shortUserId = String(user.id).slice(-10);
        const shortTs = Date.now().toString().slice(-8);
        const receipt = `card_${shortUserId}_${shortTs}`; // Razorpay limit: <= 40 chars

        const order = await razorpay.orders.create({
            amount,
            currency: 'INR',
            receipt,
            notes: {
                type: 'card_setup',
                userId: user.id,
            },
        });

        return res.status(200).json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID,
            customerId,
        });
    } catch (error: any) {
        console.error('Failed to create card setup order:', error);
        return res.status(500).json({ error: 'Failed to create card setup order.' });
    }
});

router.post('/confirm-card-setup', async (req: Request, res: Response) => {
    const clerkId = req.auth.userId;
    if (!clerkId) return res.status(401).json({ error: 'Unauthorized' });

    const { orderId, paymentId, signature } = req.body as {
        orderId?: string;
        paymentId?: string;
        signature?: string;
    };

    if (!orderId || !paymentId || !signature) {
        return res.status(400).json({ error: 'Missing orderId, paymentId, or signature.' });
    }

    try {
        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET as string)
            .update(`${orderId}|${paymentId}`)
            .digest('hex');

        if (generatedSignature !== signature) {
            return res.status(400).json({ error: 'Payment verification failed.' });
        }

        // Best effort: Refund setup charge.
        try {
            await razorpay.payments.refund(paymentId, { amount: 100 });
        } catch (refundError) {
            console.warn('Card setup payment refund failed (manual follow-up may be needed):', refundError);
        }

        return res.status(200).json({ success: true });
    } catch (error: any) {
        console.error('Failed to confirm card setup:', error);
        return res.status(500).json({ error: 'Failed to confirm card setup.' });
    }
});

export default router;
