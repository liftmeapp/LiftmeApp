declare module 'react-native-razorpay' {
    export interface RazorpayOptions {
        description: string;
        image: string;
        currency: string;
        key: string;
        amount: string | number; // Amount in smallest currency unit (e.g., paise)
        name: string;
        order_id: string; // Order ID from Razorpay Orders API
        prefill?: {
            email?: string;
            contact?: string;
            name?: string;
        };
        theme?: {
            color?: string;
        };
        // Add other optional fields as needed
    }

    export interface RazorpaySource {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
    }

    export interface RazorpayError {
        code: string;
        description: string;
        source?: string;
        step?: string;
        reason?: string;
        metadata?: any;
    }

    const RazorpayCheckout: {
        open: (options: RazorpayOptions) => Promise<RazorpaySource>;
        on: (event: string, callback: (data: any) => void) => void;
        off: (event: string) => void;
    };

    export default RazorpayCheckout;
}
