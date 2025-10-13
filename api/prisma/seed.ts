// prisma/seed.ts

import { PrismaClient, ServiceCategory } from '@prisma/client';
const prisma = new PrismaClient();

const servicesToSeed = [
  // ============================
  // Roadside Car Assistance
  // ============================
  { name: "Car-Flat Tire", icon: "car-tire.png", type: "GARAGE", category: ServiceCategory.ROADSIDE_CAR, description: "On-site tire repair or replacement for cars with punctured or flat tires." },
  { name: "Car-Battery Jump-Start", icon: "car-battery.png", type: "GARAGE", category: ServiceCategory.ROADSIDE_CAR, description: "Emergency jump-start for drained car batteries." },
  { name: "Car-Minor Mechanical", icon: "car-wrench.png", type: "GARAGE", category: ServiceCategory.ROADSIDE_CAR, description: "Quick roadside mechanical fixes to help you get moving again." },
  { name: "Car-Fuel Delivery", icon: "car-fuel.png", type: "GARAGE", category: ServiceCategory.ROADSIDE_CAR, description: "Emergency fuel delivery if you run out of fuel." },
  { name: "Car-Lockout", icon: "car-key.png", type: "GARAGE", category: ServiceCategory.ROADSIDE_CAR, description: "Assistance for car lockouts and lost key retrieval." },

  // ============================
  // Roadside Bike Assistance
  // ============================
  { name: "Bike-Flat Tire", icon: "bike-tire.png", type: "GARAGE", category: ServiceCategory.ROADSIDE_BIKE, description: "Motorcycle tire repair or air fill service on-site." },
  { name: "Bike-Battery Jump-Start", icon: "bike-battery.png", type: "GARAGE", category: ServiceCategory.ROADSIDE_BIKE, description: "Jump-start service for motorcycles." },
  { name: "Bike-Minor Mechanical", icon: "bike-wrench.png", type: "GARAGE", category: ServiceCategory.ROADSIDE_BIKE, description: "Minor roadside repairs for bikes including chain tightening and cable issues." },
  { name: "Bike-Fuel Delivery", icon: "bike-fuel.png", type: "GARAGE", category: ServiceCategory.ROADSIDE_BIKE, description: "Emergency fuel delivery for bikes." },
  { name: "Bike-Chain Repair", icon: "bike-chain.png", type: "GARAGE", category: ServiceCategory.ROADSIDE_BIKE, description: "On-site motorcycle chain repair and lubrication." },

  // ============================
  // In-Garage Car Services
  // ============================
  { name: "Engine Diagnostic & Repair", icon: "engine-repair.png", type: "GARAGE", category: ServiceCategory.INGARAGE_CAR, description: "Full engine diagnostics and repair service for all car models." },
  { name: "Oil Change & Filter Replacement", icon: "oil-change.png", type: "GARAGE", category: ServiceCategory.INGARAGE_CAR, description: "Complete oil change with oil, fuel, and air filter replacement." },
  { name: "Brake System Service", icon: "car-brakes.png", type: "GARAGE", category: ServiceCategory.INGARAGE_CAR, description: "Brake pad, disc, and fluid replacement for safe braking performance." },
  { name: "Suspension & Steering Repair", icon: "car-suspension.png", type: "GARAGE", category: ServiceCategory.INGARAGE_CAR, description: "Shock absorber, ball joint, and steering alignment repairs." },
  { name: "Transmission Service", icon: "car-transmission.png", type: "GARAGE", category: ServiceCategory.INGARAGE_CAR, description: "Transmission oil change and clutch replacement." },
  { name: "AC & Cooling System", icon: "car-ac.png", type: "GARAGE", category: ServiceCategory.INGARAGE_CAR, description: "AC gas refill, leak detection, and radiator maintenance." },
  { name: "Battery Replacement", icon: "car-battery.png", type: "GARAGE", category: ServiceCategory.INGARAGE_CAR, description: "Battery testing and new battery installation." },
  { name: "Full Body Painting", icon: "car-paint.png", type: "GARAGE", category: ServiceCategory.INGARAGE_CAR, description: "High-quality body paint and scratch repair service." },
  { name: "Detailing & Polishing", icon: "car-detailing.png", type: "GARAGE", category: ServiceCategory.INGARAGE_CAR, description: "Comprehensive car detailing including interior and exterior polishing." },
  { name: "Wheel Alignment & Balancing", icon: "wheel-align.png", type: "GARAGE", category: ServiceCategory.INGARAGE_CAR, description: "Precision wheel alignment and balancing for smoother rides." },

  // ============================
  // In-Garage Bike Services
  // ============================
  { name: "Bike Engine Service", icon: "bike-engine.png", type: "GARAGE", category: ServiceCategory.INGARAGE_BIKE, description: "Engine tuning, valve check, and oil replacement for motorcycles." },
  { name: "Bike Brake & Clutch Service", icon: "bike-brakes.png", type: "GARAGE", category: ServiceCategory.INGARAGE_BIKE, description: "Brake pad and clutch plate replacement with fluid check." },
  { name: "Bike Chain & Sprocket Replacement", icon: "bike-chain.png", type: "GARAGE", category: ServiceCategory.INGARAGE_BIKE, description: "Chain and sprocket set replacement with adjustment." },
  { name: "Bike Electrical Check", icon: "bike-electric.png", type: "GARAGE", category: ServiceCategory.INGARAGE_BIKE, description: "Battery, spark plug, and lighting system check." },
  { name: "Bike Painting & Polish", icon: "bike-paint.png", type: "GARAGE", category: ServiceCategory.INGARAGE_BIKE, description: "Full or partial repainting with polish and protection coating." },

  // ============================
  // Home Services
  // ============================
  { name: "Home Car Wash & Detailing", icon: "car-detailing.png", type: "GARAGE", category: ServiceCategory.HOME_SERVICE, description: "Mobile car wash and detailing at your home or office." },
  { name: "Home Oil & Filter Change", icon: "car-oil.png", type: "GARAGE", category: ServiceCategory.HOME_SERVICE, description: "Oil and filter change at your convenience." },
  { name: "Home Brake Check", icon: "car-brakes.png", type: "GARAGE", category: ServiceCategory.HOME_SERVICE, description: "Brake inspection and minor replacements done at home." },
  { name: "Home Vehicle Inspection", icon: "car-inspection.png", type: "GARAGE", category: ServiceCategory.HOME_SERVICE, description: "Comprehensive vehicle inspection at your doorstep." },

  // ============================
  // Electric Vehicle Roadside
  // ============================
  { name: "EV Flat Tire", icon: "ev-tire.png", type: "GARAGE", category: ServiceCategory.ELECTRIC_VEHICLE, description: "Tire repair and replacement for electric vehicles on-site." },
  { name: "EV Battery Jump-Start", icon: "ev-battery.png", type: "GARAGE", category: ServiceCategory.ELECTRIC_VEHICLE, description: "Low-voltage system restart and battery service for EVs." },
  { name: "EV Breakdown Assistance", icon: "ev-breakdown.png", type: "GARAGE", category: ServiceCategory.ELECTRIC_VEHICLE, description: "Basic roadside assistance for EV systems." },
  { name: "EV Charging Support", icon: "ev-charging.png", type: "GARAGE", category: ServiceCategory.ELECTRIC_VEHICLE, description: "Portable EV charging or nearby station assistance." },
  { name: "EV Lockout", icon: "ev-key.png", type: "GARAGE", category: ServiceCategory.ELECTRIC_VEHICLE, description: "Unlocking electric cars when locked out." },

  // ============================
  // Electric Vehicle In-Garage
  // ============================
  { name: "EV Diagnostic & Software Update", icon: "ev-diagnostic.png", type: "GARAGE", category: ServiceCategory.INGARAGE_ELECTRIC, description: "Comprehensive diagnostic checks and ECU updates for EVs." },
  { name: "EV Battery Pack Service", icon: "ev-pack.png", type: "GARAGE", category: ServiceCategory.INGARAGE_ELECTRIC, description: "Battery conditioning, cooling system, and connector check." },
  { name: "EV Charging Port Repair", icon: "ev-port.png", type: "GARAGE", category: ServiceCategory.INGARAGE_ELECTRIC, description: "Repair and maintenance of EV charging connectors." },
  { name: "EV Cooling System Maintenance", icon: "ev-cool.png", type: "GARAGE", category: ServiceCategory.INGARAGE_ELECTRIC, description: "Coolant and thermal system maintenance for battery health." },
  { name: "EV Motor Service", icon: "ev-motor.png", type: "GARAGE", category: ServiceCategory.INGARAGE_ELECTRIC, description: "Electric drive motor inspection and replacement." },

  // ============================
  // Towing Services
  // ============================
  { name: "Towing - Sedan", icon: "tow-sedan.png", type: "TOW_TRUCK", category: ServiceCategory.TOWING, description: "Flatbed towing service for sedans." },
  { name: "Towing - SUV", icon: "tow-suv.png", type: "TOW_TRUCK", category: ServiceCategory.TOWING, description: "Safe towing for SUVs and 4x4 vehicles." },
  { name: "Towing - Bike", icon: "tow-bike.png", type: "TOW_TRUCK", category: ServiceCategory.TOWING, description: "Two-wheeler towing with specialized carriers." },
  { name: "Towing - Luxury Enclosed", icon: "luxury-transport.png", type: "TOW_TRUCK", category: ServiceCategory.TOWING, description: "Enclosed, secure towing for luxury or sports cars." },
];

async function main() {
  console.log('Start seeding...');

  const serviceNamesToKeep = servicesToSeed.map(s => s.name);

  const servicesToDelete = await prisma.service.findMany({
    where: { name: { notIn: serviceNamesToKeep } },
    select: { id: true },
  });

  if (servicesToDelete.length > 0) {
    const serviceIdsToDelete = servicesToDelete.map(s => s.id);
    console.log(`Found ${serviceIdsToDelete.length} old services to delete.`);

    await prisma.garageService.deleteMany({
      where: { serviceId: { in: serviceIdsToDelete } },
    });

    await prisma.booking.updateMany({
      where: { serviceId: { in: serviceIdsToDelete } },
      data: { serviceId: null },
    });

    await prisma.service.deleteMany({
      where: { id: { in: serviceIdsToDelete } },
    });

    console.log(`Deleted ${serviceIdsToDelete.length} old services.`);
  }

  console.log('Upserting new services...');
  for (const service of servicesToSeed) {
    await prisma.service.upsert({
      where: { name: service.name },
      update: { ...service },
      create: { ...service },
    });
  }

  console.log(`${servicesToSeed.length} services seeded successfully.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
