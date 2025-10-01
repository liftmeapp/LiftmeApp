"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const servicesToSeed = [
    { name: "Car-Flat Tire", icon: "car-tire.png", type: "GARAGE", category: client_1.ServiceCategory.ROADSIDE_CAR, description: "On-site tire repair and replacement for cars." },
    { name: "Car-Battery Jump-Start", icon: "car-battery.png", type: "GARAGE", category: client_1.ServiceCategory.ROADSIDE_CAR, description: "Jump-starting a dead car battery." },
    { name: "Car-Minor Mechanical", icon: "car-wrench.png", type: "GARAGE", category: client_1.ServiceCategory.ROADSIDE_CAR, description: "Minor on-site mechanical repairs for cars." },
    { name: "Car-Fuel Delivery", icon: "car-fuel.png", type: "GARAGE", category: client_1.ServiceCategory.ROADSIDE_CAR, description: "Emergency fuel delivery." },
    { name: "Car-Lockout", icon: "car-key.png", type: "GARAGE", category: client_1.ServiceCategory.ROADSIDE_CAR, description: "Assistance with car lockouts." },
    { name: "Bike-Flat Tire", icon: "bike-tire.png", type: "GARAGE", category: client_1.ServiceCategory.ROADSIDE_BIKE, description: "Motorcycle tire repair." },
    { name: "Bike-Battery Jump-Start", icon: "bike-battery.png", type: "GARAGE", category: client_1.ServiceCategory.ROADSIDE_BIKE, description: "Jump-starting for motorcycles." },
    { name: "Bike-Minor Mechanical", icon: "bike-wrench.png", type: "GARAGE", category: client_1.ServiceCategory.ROADSIDE_BIKE, description: "Minor on-site mechanical repairs for bikes." },
    { name: "Bike-Fuel Delivery", icon: "bike-fuel.png", type: "GARAGE", category: client_1.ServiceCategory.ROADSIDE_BIKE, description: "Emergency fuel delivery." },
    { name: "Bike-Chain Repair", icon: "bike-chain.png", type: "GARAGE", category: client_1.ServiceCategory.ROADSIDE_BIKE, description: "On-site motorcycle chain repair." },
    { name: "Home-Car Detailing", icon: "car-detailing.png", type: "GARAGE", category: client_1.ServiceCategory.HOME_SERVICE, description: "Mobile car wash and detailing at your home." },
    { name: "Home-Car Oil Change", icon: "car-oil.png", type: "GARAGE", category: client_1.ServiceCategory.HOME_SERVICE, description: "Mobile oil and filter change at your home." },
    { name: "Home-Car Brake Service", icon: "car-brakes.png", type: "GARAGE", category: client_1.ServiceCategory.HOME_SERVICE, description: "Brake pad and rotor replacement at your home." },
    { name: "Home-Car Inspection", icon: "car-inspection.png", type: "GARAGE", category: client_1.ServiceCategory.HOME_SERVICE, description: "Scheduled vehicle health check at your home." },
    { name: "Sedan", icon: "tow-sedan.png", type: "TOW_TRUCK", category: client_1.ServiceCategory.TOWING, description: "Towing for sedan vehicles." },
    { name: "Hatchback", icon: "tow-hatchback.png", type: "TOW_TRUCK", category: client_1.ServiceCategory.TOWING, description: "Towing for hatchback vehicles." },
    { name: "SUV", icon: "tow-suv.png", type: "TOW_TRUCK", category: client_1.ServiceCategory.TOWING, description: "Towing for SUVs and light trucks." },
    { name: "Bike", icon: "tow-bike.png", type: "TOW_TRUCK", category: client_1.ServiceCategory.TOWING, description: "Specialized towing for motorcycles." },
    { name: "Luxury Vehicle", icon: "tow-luxury.png", type: "TOW_TRUCK", category: client_1.ServiceCategory.TOWING, description: "Premium flatbed towing for luxury cars." },
    { name: "Luxury-Enclosed Transport", icon: "luxury-transport.png", type: "TOW_TRUCK", category: client_1.ServiceCategory.LUXURY, description: "Fully enclosed transport for maximum protection of high-value vehicles." },
    { name: "Luxury-Performance Tuning", icon: "luxury-tuning.png", type: "GARAGE", category: client_1.ServiceCategory.LUXURY, description: "ECU and performance tuning for sports and luxury cars." },
    { name: "Luxury-Certified Tech Service", icon: "luxury-tech.png", type: "GARAGE", category: client_1.ServiceCategory.LUXURY, description: "Service by manufacturer-certified technicians for luxury brands." },
    { name: "Luxury-Concierge Detailing", icon: "luxury-detailing.png", type: "GARAGE", category: client_1.ServiceCategory.LUXURY, description: "High-end, meticulous vehicle detailing service." },
];
async function main() {
    console.log('Start seeding...');
    const serviceNamesToKeep = servicesToSeed.map((service) => service.name);
    const servicesToDelete = await prisma.service.findMany({
        where: {
            name: {
                notIn: serviceNamesToKeep,
            },
        },
        select: {
            id: true,
        },
    });
    if (servicesToDelete.length > 0) {
        const serviceIdsToDelete = servicesToDelete.map(service => service.id);
        console.log(`Found ${serviceIdsToDelete.length} old services to delete.`);
        await prisma.garageService.deleteMany({
            where: {
                serviceId: {
                    in: serviceIdsToDelete,
                },
            },
        });
        await prisma.booking.updateMany({
            where: {
                serviceId: {
                    in: serviceIdsToDelete,
                },
            },
            data: {
                serviceId: null,
            },
        });
        await prisma.service.deleteMany({
            where: {
                id: {
                    in: serviceIdsToDelete,
                },
            },
        });
        console.log(`Successfully deleted ${serviceIdsToDelete.length} old services.`);
    }
    else {
        console.log('No old services to delete.');
    }
    console.log('Upserting current services...');
    for (const service of servicesToSeed) {
        await prisma.service.upsert({
            where: { name: service.name },
            update: { ...service },
            create: { ...service },
        });
    }
    console.log(`${servicesToSeed.length} services have been seeded.`);
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
//# sourceMappingURL=seed.js.map