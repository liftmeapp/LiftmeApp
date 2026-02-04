// /api/scripts/createSparseIndexes.ts

import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createIndex(collection: string, index: Prisma.InputJsonValue, successMessage: string) {
  try {
    await prisma.$runCommandRaw({
      createIndexes: collection,
      indexes: [index],
    });
    console.log(successMessage);
  } catch (error: any) {
    const metaMessage = error?.meta?.message ?? '';
    if (metaMessage.includes('IndexKeySpecsConflict') || metaMessage.includes('already exists')) {
      console.log(`Index on ${collection} already exists. Skipping creation.`);
    } else {
      console.error(`Failed to create index on ${collection}. Details:`, error);
    }
  }
}

async function dropIndexIfExists(collection: string, indexName: string) {
  try {
    await prisma.$runCommandRaw({
      dropIndexes: collection,
      index: indexName,
    });
    console.log(`Dropped existing index '${indexName}' on ${collection}.`);
  } catch (error: any) {
    const message = error?.meta?.message ?? error?.message ?? '';
    if (message.includes('index not found') || message.includes('ns not found')) {
      console.log(`Index '${indexName}' on ${collection} was not present. Continuing.`);
    } else {
      console.error(`Failed to drop index '${indexName}' on ${collection}. Details:`, error);
    }
  }
}

async function main() {
  console.log('Attempting to create or verify database indexes...\n');

  // 1. Ensure Stripe customer IDs are unique only when a value exists.
  await dropIndexIfExists('users', 'users_stripeCustomerId_key');
  await createIndex(
    'users',
    {
      key: { stripeCustomerId: 1 },
      name: 'users_stripeCustomerId_key',
      unique: true,
      partialFilterExpression: { stripeCustomerId: { $type: 'string' } },
    },
    'Created filtered unique index on users.stripeCustomerId.'
  );

  // 2. Create sparse index for Garages.
  await createIndex(
    'garages',
    {
      key: { stripeAccountId: 1 },
      name: 'garages_stripeAccountId_key',
      unique: true,
      sparse: true,
    },
    'Ensured sparse unique index on garages.stripeAccountId.'
  );

  // 3. Create sparse index for Tow Trucks.
  await createIndex(
    'tow_trucks',
    {
      key: { stripeAccountId: 1 },
      name: 'tow_trucks_stripeAccountId_key',
      unique: true,
      sparse: true,
    },
    'Ensured sparse unique index on tow_trucks.stripeAccountId.'
  );

  // 4. Create geospatial index for Spare Parts.
  await createIndex(
    'spare_parts',
    {
      key: { location: '2dsphere' },
      name: 'spare_parts_location_idx',
    },
    'Ensured geospatial index on spare_parts.location.'
  );

  console.log('\nIndex creation process complete!');
  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error('An unexpected error occurred during index setup:', error);
  await prisma.$disconnect();
  process.exit(1);
});
