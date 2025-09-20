// /api/scripts/createSparseIndexes.ts

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Attempting to create sparse unique indexes with Prisma--compatible names...');

  try {
    // 1. Create sparse index for Users
    await prisma.$runCommandRaw({
      createIndexes: 'users', // The name of the collection
      indexes: [
        {
          key: { stripeCustomerId: 1 },
          name: 'users_stripeCustomerId_key', // Prisma's expected name
          unique: true,
          sparse: true,
        },
      ],
    });
    console.log('✅ Successfully created sparse index on users.stripeCustomerId.');

    // 2. Create sparse index for Garages
    await prisma.$runCommandRaw({
      createIndexes: 'garages',
      indexes: [
        {
          key: { stripeAccountId: 1 },
          name: 'garages_stripeAccountId_key', // Prisma's expected name
          unique: true,
          sparse: true,
        },
      ],
    });
    console.log('✅ Successfully created sparse index on garages.stripeAccountId.');

    // 3. Create sparse index for Tow Trucks
    await prisma.$runCommandRaw({
      createIndexes: 'tow_trucks',
      indexes: [
        {
          key: { stripeAccountId: 1 },
          name: 'tow_trucks_stripeAccountId_key', // Prisma's expected name
          unique: true,
          sparse: true,
        },
      ],
    });
    console.log('✅ Successfully created sparse index on tow_trucks.stripeAccountId.');

    console.log('\nAll sparse indexes created successfully!');

  } catch (error) {
    console.error('\n🔴 An error occurred. It might be because the indexes already exist, which is okay.');
    console.error('   Error details:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();