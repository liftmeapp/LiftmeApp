// prisma/seed.ts

// The import of ServiceType is now removed.
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const servicesToSeed = [
  // Roadside Car Assistance
  // Use "GARAGE" as a string instead of ServiceType.GARAGE
  { name: "Tire Fixing assistance (Fixing Puncture, changing spare)", type: "GARAGE", description: "On-site tire repair and replacement." },
  { name: "Battery Booting assistance", type: "GARAGE", description: "Jump-starting a dead car battery." },
  { name: "Mechanical Assistance", type: "GARAGE", description: "Minor on-site mechanical repairs." },
  { name: "Car starting up assistance", type: "GARAGE", description: "Diagnosing and fixing starting issues." },
  { name: "Car Break Assistance", type: "GARAGE", description: "Assistance with brake system problems." },
  
  // Home Service
  { name: "Car Cleaning Service", type: "GARAGE", description: "Mobile car wash and detailing." },
  { name: "Oil Changing Service", type: "GARAGE", description: "Mobile oil and filter change." },
  { name: "Air conditioner cleaning service", type: "GARAGE", description: "A/C system cleaning and freon check." },
  { name: "Tire Fixing Service", type: "GARAGE", description: "Scheduled tire repair at home." },
  
  // Bike Assistance
  { name: "Bike Jumpstarting", type: "GARAGE", description: "Jump-starting for motorcycles." },
  { name: "Bike Tire Fixing Assistance", type: "GARAGE", description: "Motorcycle tire repair." },
  { name: "Bike Oil Changing Assistance", type: "GARAGE", description: "Mobile oil change for motorcycles." },
  { name: "Bike Alignment Assistance", type: "GARAGE", description: "Motorcycle alignment check." },
  { name: "Bike Brake Assistance", type: "GARAGE", description: "Motorcycle brake service." },
  
  // Towing
  // Use "TOWING" as a string
  { name: "Towing Service", type: "TOWING", description: "General towing for standard vehicles." },
  { name: "Bike Towing Service", type: "TOWING", description: "Specialized towing for motorcycles." },
  { name: "HatchBack Towing Service", type: "TOWING", description: "Towing for hatchback vehicles." },
  { name: "Sedan Towing Service", type: "TOWING", description: "Towing for sedan vehicles." },
  { name: "SUV Towing Service", type: "TOWING", description: "Towing for SUVs and light trucks." },
  { name: "Luxury vehicle Towing Service", type: "TOWING", description: "Premium flatbed towing for luxury cars." },
  
  // Luxury Services
  { name: "premium-flatbed", type: "TOWING", description: "Flatbed towing for high-value vehicles." },
  { name: "certified-tech", type: "GARAGE", description: "Service by manufacturer-certified technicians." },
  { name: "enclosed-transportation", type: "TOWING", description: "Fully enclosed transport for maximum protection." },
  { name: "concierge-detailing", type: "GARAGE", description: "High-end vehicle detailing service." },
  { name: "Performance-tuning", type: "GARAGE", description: "ECU and performance tuning for sports cars." },
  
  // Map Listing
  { name: "Listing on Map (Garages & Electric Chargers)", type: "GARAGE", description: "Feature your location on our primary map." },
];

async function main() {
  console.log('Start seeding...');
  for (const service of servicesToSeed) {
    await prisma.service.upsert({
      where: { name: service.name },
      update: {},
      create: service,
    });
  }
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });