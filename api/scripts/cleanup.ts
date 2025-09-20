// File: api/scripts/cleanup.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// This function specifically targets Users with missing timestamps
async function fixMissingUserTimestamps() {
  console.log('Searching for users with missing timestamps...');

  // Using `isSet: false` is the correct way for MongoDB
  const usersToFix = await prisma.user.findMany({
    where: {
      createdAt: {
        isSet: false
      }
    }
  });

  if (usersToFix.length === 0) {
    console.log('✅ All users have valid timestamps. No action needed.');
    return;
  }

  console.log(`Found ${usersToFix.length} user(s) that need fixing.`);
  const now = new Date();

  const userIdsToUpdate = usersToFix.map((user: { id: string }) => user.id);

  const updateResult = await prisma.user.updateMany({
    where: {
      id: {
        in: userIdsToUpdate
      }
    },
    data: {
      createdAt: now,
      updatedAt: now
    }
  });

  console.log(`✅ Successfully updated ${updateResult.count} user(s).`);
}

async function fixMissingLiveTruckLocationTimestamps() {
  console.log('Searching for LiveTruckLocations with missing timestamps...');

  // Use `isSet: false` to find documents where the field is null or missing
  const locationsToFix = await prisma.liveTruckLocation.findMany({
    where: {
      createdAt: {
        isSet: false
      }
    }
  });

  if (locationsToFix.length === 0) {
    console.log('✅ All LiveTruckLocations have valid timestamps.');
    return;
  }

  console.log(`Found ${locationsToFix.length} location(s) that need fixing.`);
  const now = new Date();
  const idsToUpdate = locationsToFix.map((loc: { id: string }) => loc.id);

  const updateResult = await prisma.liveTruckLocation.updateMany({
    where: {
      id: {
        in: idsToUpdate
      }
    },
    data: {
      createdAt: now,
      updatedAt: now
    }
  });

  console.log(`✅ Successfully updated ${updateResult.count} location(s).`);
}


async function main() {
    try {
        await fixMissingUserTimestamps();
        // Add a call to the new function here!
        await fixMissingLiveTruckLocationTimestamps();
        // You can also add ones for Garage, TowTruck, etc.
        console.log('Database cleanup complete.');
    } catch (error) {
        console.error('An error occurred during the cleanup script:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}
main();