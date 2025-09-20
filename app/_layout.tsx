// app/_layout.tsx
import RotatingLoader from "@/components/RotatingLoader";
import { BookingProvider } from '../context/BookingContext';
import { ClerkProvider, useAuth, useUser } from "@clerk/clerk-expo";
import { Slot, SplashScreen, usePathname, useRouter, useSegments } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
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
            <GestureHandlerRootView style={{ flex: 1 }}>
                <InitialLayout />
            </GestureHandlerRootView>
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
        console.log("InitialLayout useEffect triggered. Pathname:", pathname, "isSignedIn:", isSignedIn, "isAuthLoaded:", isAuthLoaded, "isUserLoaded:", isUserLoaded);

        if (!isAuthLoaded || !isUserLoaded || !pathname) {
            console.log("InitialLayout: Auth/User not loaded or pathname missing. Returning.");
            return;
        }
        SplashScreen.hideAsync();

        if (pathname.includes('/oauth-native-callback')) {
            console.log("InitialLayout: On OAuth callback path. Returning.");
            return;
        }

        const completeProfilePaths = ["/complete-profile", "/(auth)/complete-profile"];
        const isOnCompleteProfile = completeProfilePaths.some(path => pathname.includes(path));

        if (isSignedIn && user) {
            console.log("InitialLayout: User is signed in. Pathname:", pathname);
            const hasVerifiedPhone = user.phoneNumbers?.some(pn => pn.verification?.status === 'verified');
            if (!hasVerifiedPhone) {
                console.log("InitialLayout: Signed in but phone not verified.");
                if (!isOnCompleteProfile) {
                    console.log("InitialLayout: Redirecting to complete-profile.");
                    router.replace("/(auth)/complete-profile");
                }
            } else {
                console.log("InitialLayout: Signed in and phone verified.");
                const inTabsGroup = segments[0] === '(root)' && segments[1] === '(tabs)';
                const authPaths = ["/(auth)/welcome", "/(auth)/signin", "/(auth)/signup"];
                const isOnAuthPath = authPaths.some(path => pathname === path);
                
                const isServicePath = segments.length > 0 && segments[0] === 'services';
                const isSettingsPath = segments.length > 0 && segments[0] === 'settings';
                
                if ((!inTabsGroup && !isServicePath && !isSettingsPath) || isOnAuthPath) {
                    console.log("InitialLayout: Signed in, redirecting to home.");
                    router.replace("/(root)/(tabs)/home");
                }
            }
        }
        else { // Not signed in
            console.log("InitialLayout: User is NOT signed in. Pathname:", pathname);
            if (justSignedOut) {
                console.log("InitialLayout: Just signed out. Returning.");
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
            console.log("InitialLayout: isOnAuthFlowPath for current pathname (", pathname, ") is", isOnAuthFlowPath);

            if (!isOnAuthFlowPath) {
                console.log("InitialLayout: Not on auth flow path, redirecting to welcome.");
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
            <Slot />
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