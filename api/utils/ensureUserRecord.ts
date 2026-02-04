// /api/utils/ensureUserRecord.ts
import { clerkClient } from '@clerk/clerk-sdk-node';
import { Role } from '@prisma/client';
import type { Prisma, PrismaClient } from '@prisma/client';

type EnsureUserResult = Awaited<ReturnType<PrismaClient['user']['findUnique']>>;

export async function ensureUserRecord(prisma: PrismaClient, clerkId: string): Promise<EnsureUserResult> {
  if (!clerkId) return null;

  const existingUser = await prisma.user.findUnique({ where: { clerkId } });
  if (existingUser) {
    return existingUser;
  }

  try {
    const clerkUser = await clerkClient.users.getUser(clerkId);
    if (!clerkUser) {
      console.warn(`[ensureUserRecord] Clerk returned no user for clerkId=${clerkId}`);
      return null;
    }

    const primaryEmail =
      clerkUser.emailAddresses?.find((email) => email.id === clerkUser.primaryEmailAddressId)?.emailAddress ??
      clerkUser.emailAddresses?.[0]?.emailAddress ??
      `user_${clerkId}@placeholder.email`;

    const primaryPhone =
      clerkUser.phoneNumbers?.find((phone) => phone.id === clerkUser.primaryPhoneNumberId)?.phoneNumber ??
      clerkUser.phoneNumbers?.[0]?.phoneNumber ??
      'pending_phone_verification';

    const firstName =
      clerkUser.firstName ??
      (clerkUser.unsafeMetadata?.firstName as string | undefined) ??
      'New';

    const lastName =
      clerkUser.lastName ??
      (clerkUser.unsafeMetadata?.lastName as string | undefined) ??
      'User';

    const publicMetadata = clerkUser.publicMetadata as Record<string, unknown> | undefined;
    const defaultRole = publicMetadata?.defaultRole;
    const derivedRole =
      typeof defaultRole === 'string' &&
      (Object.values(Role) as string[]).includes(defaultRole)
        ? (defaultRole as Role)
        : Role.CUSTOMER;

    const createdUser = await prisma.user.create({
      data: {
        clerkId,
        email: primaryEmail,
        firstName,
        lastName,
        phone: primaryPhone,
        role: [derivedRole],
        isPremium: false,
        isBanned: false,
        unsafeMetadata: clerkUser.unsafeMetadata as Prisma.JsonValue,
      },
    });

    console.log(`[ensureUserRecord] Backfilled user ${clerkId} in database.`);
    return createdUser;
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return prisma.user.findUnique({ where: { clerkId } });
    }

    console.error(`[ensureUserRecord] Failed to backfill user ${clerkId}:`, error);
    return null;
  }
}
