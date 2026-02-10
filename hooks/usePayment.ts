import { useAuth, useUser } from '@clerk/clerk-expo';
import { useState } from 'react';
import { Alert } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export const usePayment = () => {
    const { getToken } = useAuth();
    const { user } = useUser();
    const [isProcessing, setIsProcessing] = useState(false);

    const initiateRazorpay = async (bookingId: string, onSuccess?: () => void) => {
        setIsProcessing(true);
        try {
            const token = await getToken();
            if (!token) throw new Error("Authentication failed");

            // 1. Create Order
            const orderResponse = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/create-razorpay-order`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const orderData = await orderResponse.json();
            if (!orderResponse.ok) throw new Error(orderData.error || 'Failed to create order');

            // 2. Open Checkout
            const options = {
                description: 'Payment for Booking',
                image: 'https://avvvkshlpvbogjushmsc.supabase.co/storage/v1/object/public/profile-pictures/icon.png',
                currency: orderData.currency,
                key: orderData.key,
                amount: orderData.amount,
                name: 'Afthu Lift Me',
                order_id: orderData.orderId,
                customer_id: orderData.customerId || undefined,
                save: 1,
                prefill: {
                    email: user?.emailAddresses[0]?.emailAddress,
                    contact: user?.phoneNumbers[0]?.phoneNumber,
                    name: user?.fullName || ''
                },
                theme: { color: '#005C70' }
            };

            const data = await RazorpayCheckout.open(options);

            // 3. Confirm
            const confirmResponse = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/confirm-payment`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    paymentId: data.razorpay_payment_id,
                    signature: data.razorpay_signature
                })
            });

            const confirmData = await confirmResponse.json();
            if (!confirmResponse.ok) throw new Error(confirmData.error || 'Payment verification failed');

            if (confirmData.success) {
                Alert.alert("Success", "Payment successful!");
                if (onSuccess) onSuccess();
            }

        } catch (error: any) {
            if (error.code === 'PAYMENT_CANCELLED') {
                console.log("User cancelled payment");
            } else {
                Alert.alert("Payment Error", error.description || error.message || "Something went wrong");
            }
        } finally {
            setIsProcessing(false);
        }
    };

    return { initiateRazorpay, isProcessing };
};
