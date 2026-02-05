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

    static async requestCompletionOtp(req: Request, res: Response) {
        try {
            const { id: bookingId } = req.params;
            const providerClerkId = req.auth.userId;
            if (!providerClerkId) return res.status(401).json({ error: "Unauthorized" });

            const result = await BookingService.requestCompletionOtp(bookingId, providerClerkId);
            return res.status(200).json(result);
        } catch (error: any) {
            console.error("Failed to generate completion OTP:", error);
            if (error instanceof AppError) return res.status(error.statusCode).json({ error: error.message });
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    static async requestService(req: Request, res: Response) {
        try {
            const userId = req.auth.userId;
            if (!userId) return res.status(401).json({ error: "Unauthorized" });

            const { serviceId, vehicleId, userLat, userLon, pickupDescription } = req.body;
            if (!serviceId || !vehicleId || !userLat || !userLon) {
                return res.status(400).json({ error: "Missing required fields." });
            }

            const result = await BookingService.requestService(userId, serviceId, vehicleId, userLat, userLon, pickupDescription);
            return res.status(201).json(result);

        } catch (error: any) {
            console.error("Request Service Error:", error);
            if (error instanceof AppError) return res.status(error.statusCode).json({ error: error.message });
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    static async requestTowing(req: Request, res: Response) {
        try {
            const userId = req.auth.userId;
            if (!userId) return res.status(401).json({ error: "Unauthorized" });

            const { vehicleId, vehicleType, pickup, destination } = req.body;
            if (!vehicleId || !vehicleType || !pickup) {
                return res.status(400).json({ error: "Missing required fields." });
            }

            const result = await BookingService.requestTowing(userId, vehicleId, vehicleType, pickup, destination);
            return res.status(201).json(result);

        } catch (error: any) {
            console.error("Request Towing Error:", error);
            if (error instanceof AppError) return res.status(error.statusCode).json({ error: error.message });
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    static async requestTowToGarage(req: Request, res: Response) {
        try {
            const userId = req.auth.userId;
            if (!userId) return res.status(401).json({ error: "Unauthorized" });

            const { vehicleId, pickup } = req.body;
            if (!vehicleId || !pickup) {
                return res.status(400).json({ error: "Missing required fields." });
            }

            const result = await BookingService.requestTowToGarage(userId, vehicleId, pickup);
            return res.status(201).json(result);
        } catch (error: any) {
            console.error("Request Tow-To-Garage Error:", error);
            if (error instanceof AppError) return res.status(error.statusCode).json({ error: error.message });
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    static async fetchBookingStatus(req: Request, res: Response) {
        try {
            const userId = req.auth.userId;
            if (!userId) return res.status(401).json({ error: "Unauthorized" });
            const { id } = req.params;

            const status = await BookingService.getBookingStatus(id, userId);
            return res.status(200).json(status);
        } catch (error: any) {
            console.error("Failed to fetch booking status:", error);
            if (error instanceof AppError) return res.status(error.statusCode).json({ error: error.message });
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    static async createPaymentIntent(req: Request, res: Response) {
        try {
            const customerClerkId = req.auth.userId;
            if (!customerClerkId) return res.status(401).json({ error: "Unauthorized" });
            const { bookingId } = req.params;

            const result = await BookingService.createPaymentIntent(bookingId, customerClerkId);
            return res.status(200).json(result);
        } catch (error: any) {
            console.error("Failed to create payment intent:", error);
            if (error instanceof AppError) return res.status(error.statusCode).json({ error: error.message });
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    static async confirmPayment(req: Request, res: Response) {
        try {
            const customerClerkId = req.auth.userId;
            if (!customerClerkId) return res.status(401).json({ error: "Unauthorized" });
            const { bookingId } = req.params;

            const result = await BookingService.confirmPayment(bookingId, customerClerkId);
            return res.status(200).json(result);
        } catch (error: any) {
            console.error("Failed to confirm payment:", error);
            if (error instanceof AppError) return res.status(error.statusCode).json({ error: error.message });
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    static async confirmCash(req: Request, res: Response) {
        try {
            const customerClerkId = req.auth.userId;
            if (!customerClerkId) return res.status(401).json({ error: "Unauthorized" });
            const { bookingId } = req.params;

            const result = await BookingService.confirmCashBooking(bookingId, customerClerkId);
            return res.status(200).json(result);
        } catch (error: any) {
            console.error("Failed to confirm cash booking:", error);
            if (error instanceof AppError) return res.status(error.statusCode).json({ error: error.message });
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    static async cancelByUser(req: Request, res: Response) {
        try {
            const customerClerkId = req.auth.userId;
            if (!customerClerkId) return res.status(401).json({ error: "Unauthorized" });
            const { bookingId } = req.params;
            const reason = req.body?.reason as string | undefined;

            const result = await BookingService.cancelByUser(bookingId, customerClerkId, reason);
            return res.status(200).json(result);
        } catch (error: any) {
            console.error("Failed to cancel booking by user:", error);
            if (error instanceof AppError) return res.status(error.statusCode).json({ error: error.message });
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    static async cancelByProvider(req: Request, res: Response) {
        try {
            const providerClerkId = req.auth.userId;
            if (!providerClerkId) return res.status(401).json({ error: "Unauthorized" });
            const { bookingId } = req.params;
            const reason = req.body?.reason as string | undefined;
            if (!reason) return res.status(400).json({ error: "A reason is required." });

            const result = await BookingService.cancelByProvider(bookingId, providerClerkId, reason);
            return res.status(200).json(result);
        } catch (error: any) {
            console.error("Failed to cancel booking by provider:", error);
            if (error instanceof AppError) return res.status(error.statusCode).json({ error: error.message });
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    static async verifyTowOtp(req: Request, res: Response) {
        try {
            const towTruckOwnerId = req.auth.userId;
            if (!towTruckOwnerId) return res.status(401).json({ error: "Unauthorized" });
            const { id: bookingId } = req.params;
            const { otp } = req.body;
            if (!otp) return res.status(400).json({ error: "OTP is required." });

            const result = await BookingService.verifyTowOtp(bookingId, otp, towTruckOwnerId);
            return res.status(200).json(result);
        } catch (error: any) {
            console.error("Failed to verify tow OTP:", error);
            if (error instanceof AppError) return res.status(error.statusCode).json({ error: error.message });
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    static async submitQuote(req: Request, res: Response) {
        try {
            const garageOwnerId = req.auth.userId;
            if (!garageOwnerId) return res.status(401).json({ error: "Unauthorized" });
            const { bookingId } = req.params;
            const { vehicleStatus, servicesRequired, servicesEstimate, jobEstimate, notes } = req.body;
            if (!servicesRequired || !jobEstimate) {
                return res.status(400).json({ error: "servicesRequired and jobEstimate are required." });
            }

            const result = await BookingService.submitQuote(bookingId, garageOwnerId, {
                vehicleStatus: vehicleStatus || '',
                servicesRequired,
                servicesEstimate,
                jobEstimate: Number(jobEstimate),
                notes,
            });
            return res.status(200).json(result);
        } catch (error: any) {
            console.error("Failed to submit quote:", error);
            if (error instanceof AppError) return res.status(error.statusCode).json({ error: error.message });
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    static async submitFinalQuote(req: Request, res: Response) {
        try {
            const garageOwnerId = req.auth.userId;
            if (!garageOwnerId) return res.status(401).json({ error: "Unauthorized" });
            const { bookingId } = req.params;
            const { jobEstimate, notes } = req.body;
            if (!jobEstimate) return res.status(400).json({ error: "jobEstimate is required." });

            const result = await BookingService.submitFinalQuote(bookingId, garageOwnerId, {
                jobEstimate: Number(jobEstimate),
                notes,
            });
            return res.status(200).json(result);
        } catch (error: any) {
            console.error("Failed to submit final quote:", error);
            if (error instanceof AppError) return res.status(error.statusCode).json({ error: error.message });
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    static async approveQuote(req: Request, res: Response) {
        try {
            const customerClerkId = req.auth.userId;
            if (!customerClerkId) return res.status(401).json({ error: "Unauthorized" });
            const { bookingId } = req.params;

            const result = await BookingService.approveQuote(bookingId, customerClerkId);
            return res.status(200).json(result);
        } catch (error: any) {
            console.error("Failed to approve quote:", error);
            if (error instanceof AppError) return res.status(error.statusCode).json({ error: error.message });
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    static async rejectQuote(req: Request, res: Response) {
        try {
            const customerClerkId = req.auth.userId;
            if (!customerClerkId) return res.status(401).json({ error: "Unauthorized" });
            const { bookingId } = req.params;
            const reason = req.body?.reason as string | undefined;

            const result = await BookingService.rejectQuote(bookingId, customerClerkId, reason);
            return res.status(200).json(result);
        } catch (error: any) {
            console.error("Failed to reject quote:", error);
            if (error instanceof AppError) return res.status(error.statusCode).json({ error: error.message });
            return res.status(500).json({ error: "Internal server error" });
        }
    }
}
