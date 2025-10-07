// app/_layout.tsx
import RotatingLoader from "@/components/RotatingLoader";
import { ClerkProvider, useAuth, useUser } from "@clerk/clerk-expo";
import { StripeProvider } from '@stripe/stripe-react-native';
import { Slot, SplashScreen, usePathname, useRouter, useSegments } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BookingProvider } from '../context/BookingContext';
import { TowingBookingProvider } from '../context/TowingBookingContext';
import "../global.css";

SplashScreen.preventAutoHideAsync();

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
if (!CLERK_PUBLISHABLE_KEY) {
    throw new Error("Missing Clerk Publishable Key.");
}

const tokenCache = {
    async getToken(key: string) {
        try { return SecureStore.getItemAsync(key); }
        catch (err) { console.error("SecureStore.getItemAsync error", err); return null; }
    },
    async saveToken(key: string, value: string) {
        try { return SecureStore.setItemAsync(key, value); }
        catch (err) { console.error("SecureStore.setItemAsync error", err); return; }
    },
};

export default function RootLayout() {
    return (
        <ClerkProvider tokenCache={tokenCache} publishableKey={CLERK_PUBLISHABLE_KEY as string}>
            <StripeProvider publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}>
                    <GestureHandlerRootView style={{ flex: 1 }}>
                        <InitialLayout />
                    </GestureHandlerRootView>
            </StripeProvider>
        </ClerkProvider>
    );
}

function InitialLayout() {
    const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();
    const { user, isLoaded: isUserLoaded } = useUser();
    const router = useRouter();
    const segments = useSegments();
    const pathname = usePathname();

    // [This useEffect for sign-out detection is unchanged and correct]
    const [prevIsSignedIn, setPrevIsSignedIn] = useState<boolean | undefined>(undefined);
    const [justSignedOut, setJustSignedOut] = useState(false);
    
    useEffect(() => {
        if (isAuthLoaded && prevIsSignedIn === undefined) {
            setPrevIsSignedIn(isSignedIn);
        }
        if (isAuthLoaded && prevIsSignedIn === true && isSignedIn === false) {
            setJustSignedOut(true);
            const timer = setTimeout(() => setJustSignedOut(false), 1500);
            return () => clearTimeout(timer);
        }
        if (isAuthLoaded && prevIsSignedIn !== isSignedIn) {
            setPrevIsSignedIn(isSignedIn);
        }
    }, [isAuthLoaded, isSignedIn, prevIsSignedIn]);


    // [This is your main navigation effect, now with the loop-causing dependencies removed]
    useEffect(() => {
        if (!isAuthLoaded || !isUserLoaded || !pathname) {
            return;
        }
        SplashScreen.hideAsync();

        if (pathname.includes('/oauth-native-callback')) {
            return;
        }

        const completeProfilePaths = ["/complete-profile", "/(auth)/complete-profile"];
        const isOnCompleteProfile = completeProfilePaths.some(path => pathname.includes(path));

        if (isSignedIn && user) {
            const hasVerifiedPhone = user.phoneNumbers?.some(pn => pn.verification?.status === 'verified');
            if (!hasVerifiedPhone) {
                if (!isOnCompleteProfile) {
                    router.replace("/(auth)/complete-profile");
                }
            } else {
                const inTabsGroup = segments[0] === '(root)' && segments[1] === '(tabs)';
                const authPaths = ["/(auth)/welcome", "/(auth)/signin", "/(auth)/signup"];
                const isOnAuthPath = authPaths.some(path => pathname === path);
                
                const isServicePath = segments.length > 0 && segments[0] === 'services';
                const isSettingsPath = segments.length > 0 && segments[0] === 'settings';
                
                if ((!inTabsGroup && !isServicePath && !isSettingsPath) || isOnAuthPath) {
                    router.replace("/(root)/(tabs)/home");
                }
            }
        }
        else { // Not signed in
            if (justSignedOut) {
                return;
            }
            const authFlowPaths = [
                "/welcome",
                "/signin",
                "/signup",
                "/reset-password",
                "/complete-profile"
            ];
            const isOnAuthFlowPath = authFlowPaths.some(p => pathname === p);

            if (!isOnAuthFlowPath) {
                router.replace("/(auth)/welcome");
            }
        }

    }, [isAuthLoaded, isUserLoaded, isSignedIn, user, router, pathname, justSignedOut, segments]);

    

    if (!isAuthLoaded || !isUserLoaded) {
        return (
            <View style={styles.loadingContainer}>
                <RotatingLoader size={50} color="#b95528" />
            </View>
        );
    }

    return (
        <BookingProvider>
           <TowingBookingProvider>
                <Slot />
            </TowingBookingProvider>
        </BookingProvider>
    );}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
});