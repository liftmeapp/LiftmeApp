
// /api/scripts/createSparseIndexes.ts

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function createIndex(collection: string, index: any, successMessage: string) {
  try {
    await prisma.$runCommandRaw({
      createIndexes: collection,
      indexes: [index],
    });
    console.log(`✅ ${successMessage}`);
  } catch (error: any) {
    // Prisma error P2010 with code 86 means index already exists
    if (error.code === 'P2010' && error.meta?.message?.includes('IndexKeySpecsConflict')) {
      console.log(`🟡 Index on ${collection} already exists, which is okay.`);
    } else {
      console.error(`🔴 Failed to create index on ${collection}. Details:`, error);
    }
  }
}

async function main() {
  console.log('Attempting to create or verify database indexes...\n');

  // 1. Create sparse index for Users
  await createIndex('users', {
    key: { stripeCustomerId: 1 },
    name: 'users_stripeCustomerId_key',
    unique: true,
    sparse: true,
  }, 'Successfully created sparse index on users.stripeCustomerId.');

  // 2. Create sparse index for Garages
  await createIndex('garages', {
    key: { stripeAccountId: 1 },
    name: 'garages_stripeAccountId_key',
    unique: true,
    sparse: true,
  }, 'Successfully created sparse index on garages.stripeAccountId.');

  // 3. Create sparse index for Tow Trucks
  await createIndex('tow_trucks', {
    key: { stripeAccountId: 1 },
    name: 'tow_trucks_stripeAccountId_key',
    unique: true,
    sparse: true,
  }, 'Successfully created sparse index on tow_trucks.stripeAccountId.');

  // 4. Create 2dsphere index for Spare Parts
  await createIndex('spare_parts', {
    key: { location: "2dsphere" },
    name: 'spare_parts_location_idx',
  }, 'Successfully created geospatial index on spare_parts.location.');

  console.log('\nIndex creation process complete!');
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('An unexpected error occurred during the script execution:', e);
  await prisma.$disconnect();
  process.exit(1);
});
