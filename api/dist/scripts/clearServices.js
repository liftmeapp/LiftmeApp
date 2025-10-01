"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    await prisma.booking.deleteMany({});
    await prisma.garageService.deleteMany({});
    await prisma.service.deleteMany({});
    console.log('All bookings, garage services, and services have been deleted.');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=clearServices.js.map