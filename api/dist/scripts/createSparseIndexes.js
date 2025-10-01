"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Attempting to create sparse unique indexes with Prisma--compatible names...');
    try {
        await prisma.$runCommandRaw({
            createIndexes: 'users',
            indexes: [
                {
                    key: { stripeCustomerId: 1 },
                    name: 'users_stripeCustomerId_key',
                    unique: true,
                    sparse: true,
                },
            ],
        });
        console.log('✅ Successfully created sparse index on users.stripeCustomerId.');
        await prisma.$runCommandRaw({
            createIndexes: 'garages',
            indexes: [
                {
                    key: { stripeAccountId: 1 },
                    name: 'garages_stripeAccountId_key',
                    unique: true,
                    sparse: true,
                },
            ],
        });
        console.log('✅ Successfully created sparse index on garages.stripeAccountId.');
        await prisma.$runCommandRaw({
            createIndexes: 'tow_trucks',
            indexes: [
                {
                    key: { stripeAccountId: 1 },
                    name: 'tow_trucks_stripeAccountId_key',
                    unique: true,
                    sparse: true,
                },
            ],
        });
        console.log('✅ Successfully created sparse index on tow_trucks.stripeAccountId.');
        console.log('\nAll sparse indexes created successfully!');
    }
    catch (error) {
        console.error('\n🔴 An error occurred. It might be because the indexes already exist, which is okay.');
        console.error('   Error details:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
//# sourceMappingURL=createSparseIndexes.js.map