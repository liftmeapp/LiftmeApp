"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function fixMissingUserTimestamps() {
    console.log('Searching for users with missing timestamps...');
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
    const userIdsToUpdate = usersToFix.map((user) => user.id);
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
    const idsToUpdate = locationsToFix.map((loc) => loc.id);
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
        await fixMissingLiveTruckLocationTimestamps();
        console.log('Database cleanup complete.');
    }
    catch (error) {
        console.error('An error occurred during the cleanup script:', error);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
//# sourceMappingURL=cleanup.js.map