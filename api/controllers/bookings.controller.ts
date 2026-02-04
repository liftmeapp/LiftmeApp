import { Request, Response } from 'express';
import { BookingService } from '../services/booking.service';
import { AppError } from '../utils/AppError';

export class BookingsController {

    static async fetchUserHistory(req: Request, res: Response) {
        try {
            const userId = req.auth.userId;
            if (!userId) return res.status(401).json({ error: "Unauthorized" });

            const history = await BookingService.getUserBookingHistory(userId);
            return res.status(200).json(history);
        } catch (error: any) {
            console.error("Failed to fetch user history:", error);
            if (error instanceof AppError) return res.status(error.statusCode).json({ error: error.message });
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    static async fetchActiveBookings(req: Request, res: Response) {
        try {
            const userId = req.auth.userId;
            if (!userId) return res.status(401).json({ error: "Unauthorized" });

            const bookings = await BookingService.getActiveBookings(userId);
            return res.status(200).json(bookings);
        } catch (error: any) {
            console.error("Failed to fetch active bookings:", error);
            if (error instanceof AppError) return res.status(error.statusCode).json({ error: error.message });
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    static async fetchSparePartOrders(req: Request, res: Response) {
        try {
            const sellerClerkId = req.auth.userId;
            if (!sellerClerkId) return res.status(401).json({ error: "Unauthorized" });

            const statusQuery = req.query.status as string;
            const orders = await BookingService.getSparePartOrders(sellerClerkId, statusQuery);

            return res.status(200).json(orders);
        } catch (error: any) {
            console.error("Failed to fetch spare part orders:", error);
            if (error instanceof AppError) return res.status(error.statusCode).json({ error: error.message });
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    static async acceptSparePart(req: Request, res: Response) {
        try {
            const { bookingId } = req.params;
            const sellerClerkId = req.auth.userId;
            if (!sellerClerkId) return res.status(401).json({ error: "Unauthorized" });

            const result = await BookingService.acceptSparePartOrder(bookingId, sellerClerkId);
            return res.status(200).json(result);
        } catch (error: any) {
            console.error("Failed to accept spare part order:", error);
            if (error instanceof AppError) return res.status(error.statusCode).json({ error: error.message });
            return res.status(500).json({ error: 'An internal server error occurred.' });
        }
    }

    static async completeSparePart(req: Request, res: Response) {
        try {
            const { bookingId } = req.params;
            const sellerClerkId = req.auth.userId;
            if (!sellerClerkId) return res.status(401).json({ error: "Unauthorized" });

            const result = await BookingService.completeSparePartOrder(bookingId, sellerClerkId);
            return res.status(200).json(result);
        } catch (error: any) {
            console.error("Failed to complete spare part order:", error);
            if (error instanceof AppError) return res.status(error.statusCode).json({ error: error.message });
            return res.status(500).json({ error: 'An internal server error occurred.' });
        }
    }

    static async fetchGarageBookings(req: Request, res: Response) {
        try {
            const garageOwnerId = req.auth.userId;
            if (!garageOwnerId) return res.status(401).json({ error: "Unauthorized" });

            const statusQuery = req.query.status as string;
            const bookings = await BookingService.getGarageBookings(garageOwnerId, statusQuery);
            return res.status(200).json(bookings);
        } catch (error: any) {
            console.error("Failed to fetch garage bookings:", error);
            if (error instanceof AppError) return res.status(error.statusCode).json({ error: error.message });
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    static async fetchTowTruckBookings(req: Request, res: Response) {
        try {
            const towTruckOwnerId = req.auth.userId;
            if (!towTruckOwnerId) return res.status(401).json({ error: "Unauthorized" });

            const statusQuery = req.query.status as string;
            const bookings = await BookingService.getTowTruckBookings(towTruckOwnerId, statusQuery);
            return res.status(200).json(bookings);
        } catch (error: any) {
            console.error("Failed to fetch tow truck bookings:", error);
            if (error instanceof AppError) return res.status(error.statusCode).json({ error: error.message });
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    static async acceptBooking(req: Request, res: Response) {
        try {
            const { id: bookingId } = req.params;
            const garageOwnerId = req.auth.userId;
            if (!garageOwnerId) return res.status(401).json({ error: "Unauthorized" });

            const result = await BookingService.acceptBooking(bookingId, garageOwnerId);
            return res.status(200).json(result);
        } catch (error: any) {
            console.error("Failed to accept booking:", error);
            if (error instanceof AppError) return res.status(error.statusCode).json({ error: error.message });
            return res.status(500).json({ error: 'An internal server error occurred.' });
        }
    }

    static async acceptTowInBooking(req: Request, res: Response) {
        try {
            const { id: bookingId } = req.params;
            const garageOwnerId = req.auth.userId;
            if (!garageOwnerId) return res.status(401).json({ error: "Unauthorized" });

            const result = await BookingService.acceptTowInBooking(bookingId, garageOwnerId);
            return res.status(200).json(result);
        } catch (error: any) {
            console.error("Failed to accept tow-in booking:", error);
            if (error instanceof AppError) return res.status(error.statusCode).json({ error: error.message });
            return res.status(500).json({ error: 'An internal server error occurred.' });
        }
    }

    static async acceptTowBooking(req: Request, res: Response) {
        try {
            const { id: bookingId } = req.params;
            const towTruckOwnerId = req.auth.userId;
            if (!towTruckOwnerId) return res.status(401).json({ error: "Unauthorized" });

            const result = await BookingService.acceptTowBooking(bookingId, towTruckOwnerId);
            return res.status(200).json(result);
        } catch (error: any) {
            console.error("Failed to accept tow booking:", error);
            if (error instanceof AppError) return res.status(error.statusCode).json({ error: error.message });
            return res.status(500).json({ error: 'An internal server error occurred.' });
        }
    }

    static async declineBooking(req: Request, res: Response) {
        try {
            const { id: bookingId } = req.params;
            const garageOwnerId = req.auth.userId;
            if (!garageOwnerId) return res.status(401).json({ error: "Unauthorized" });

            const result = await BookingService.declineBooking(bookingId, garageOwnerId);
            return res.status(200).json(result);
        } catch (error: any) {
            console.error("Failed to decline booking:", error);
            if (error instanceof AppError) return res.status(error.statusCode).json({ error: error.message });
            return res.status(500).json({ error: 'An internal server error occurred' });
        }
    }

    static async declineTowBooking(req: Request, res: Response) {
        try {
            const { id: bookingId } = req.params;
            const towTruckOwnerId = req.auth.userId;
            if (!towTruckOwnerId) return res.status(401).json({ error: "Unauthorized" });

            const result = await BookingService.declineTowBooking(bookingId, towTruckOwnerId);
            return res.status(200).json(result);
        } catch (error: any) {
            console.error("Failed to decline tow booking:", error);
            if (error instanceof AppError) return res.status(error.statusCode).json({ error: error.message });
            return res.status(500).json({ error: 'An internal server error occurred' });
        }
    }

    static async verifyOtp(req: Request, res: Response) {
        try {
            const { id: bookingId } = req.params;
            const { otp } = req.body;
            const garageOwnerId = req.auth.userId;
            if (!garageOwnerId) return res.status(401).json({ error: "Unauthorized" });
            if (!otp) return res.status(400).json({ error: "OTP is required." });

            const result = await BookingService.verifyOtp(bookingId, otp, garageOwnerId);
            return res.status(200).json(result);
        } catch (error: any) {
            console.error("Failed to verify OTP:", error);
            if (error instanceof AppError) return res.status(error.statusCode).json({ error: error.message });
            return res.status(500).json({ error: 'An internal server error occurred.' });
        }
    }
}
