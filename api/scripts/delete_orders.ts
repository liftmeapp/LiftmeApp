
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteOrders() {
    try {
        console.log('Starting order cleanup...');

        // 1. Delete Messages (Children of Chat)
        // Since Chat is strictly 1:1 with Booking due to `bookingId` unique constraint,
        // and Messages belong to Chats, it's safe to clear them if we are clearing all bookings.
        const deletedMessages = await prisma.message.deleteMany({});
        console.log(`✅ Deleted ${deletedMessages.count} messages.`);

        // 2. Delete Chats (Children of Booking)
        const deletedChats = await prisma.chat.deleteMany({});
        console.log(`✅ Deleted ${deletedChats.count} chats.`);

        // 3. Delete Bookings
        const deletedBookings = await prisma.booking.deleteMany({});
        console.log(`✅ Deleted ${deletedBookings.count} bookings.`);

        console.log('🎉 Cleanup complete: All orders and related chat history removed.');
    } catch (error) {
        console.error('❌ Error deleting orders:', error);
    } finally {
        await prisma.$disconnect();
    }
}

deleteOrders();
