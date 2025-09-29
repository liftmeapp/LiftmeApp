import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

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