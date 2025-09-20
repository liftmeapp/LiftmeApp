// app/oauth-native-callback.tsx
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter, usePathname } from 'expo-router';

export default function OAuthNativeCallback() {
  const pathname = usePathname();
  const router = useRouter();
  const [message, setMessage] = useState('Processing authentication...');
  const { isLoaded, isSignedIn } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const [hasNavigated, setHasNavigated] = useState(false);

  useEffect(() => {
    console.log(`[OAuthCallback ${pathname}] Mounted. Calling WebBrowser.maybeCompleteAuthSession().`);
    WebBrowser.maybeCompleteAuthSession();

    setMessage('Finalizing... This should only take a moment.');
  }, [pathname]);

  useEffect(() => {
    // Wait for Clerk to be fully loaded
    if (!isLoaded || !isUserLoaded || hasNavigated) {
      return;
    }

    console.log(`[OAuthCallback ${pathname}] Status: Clerk Loaded: ${isLoaded}, IsSignedIn: ${isSignedIn}, User: ${!!user?.id}`);

    if (isSignedIn && user) {
      console.log(`[OAuthCallback ${pathname}] User signed in successfully. Checking profile completeness.`);
      
      // Check if user needs to complete profile (same logic as InitialLayout)
      const hasVerifiedPhone = user.phoneNumbers?.some(pn => pn.verification?.status === 'verified');
      
      setHasNavigated(true);
      
      if (!hasVerifiedPhone) {
        console.log(`[OAuthCallback ${pathname}] User missing required info. Redirecting to complete-profile.`);
        router.replace('/(auth)/complete-profile');
      } else {
        console.log(`[OAuthCallback ${pathname}] User profile complete. Redirecting to home.`);
        router.replace('/(root)/(tabs)/home');
      }
    } else if (isLoaded && !isSignedIn) {
      // OAuth failed or was cancelled
      console.log(`[OAuthCallback ${pathname}] OAuth failed or cancelled. Redirecting to sign-in.`);
      setHasNavigated(true);
      router.replace('/(auth)/signin');
    }
  }, [isLoaded, isUserLoaded, isSignedIn, user, hasNavigated, router, pathname]);

  // Fallback timeout in case something goes wrong
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (!hasNavigated) {
        console.log(`[OAuthCallback ${pathname}] Fallback timeout reached. Redirecting to sign-in.`);
        setHasNavigated(true);
        router.replace('/(auth)/signin');
      }
    }, 10000); // 10 second fallback

    return () => clearTimeout(fallbackTimer);
  }, [hasNavigated, router, pathname]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#b95528" />
      <Text style={styles.statusText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  statusText: {
    marginTop: 20,
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
  },
});