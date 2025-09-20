// app/(auth)/signin.tsx
import { useAuth, useOAuth, useSignIn } from '@clerk/clerk-expo';
import * as Linking from 'expo-linking';
import { Link, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import 'react-phone-input-2/lib/style.css'; // If you're using web
import { useWarmUpBrowser } from '../../hooks/useWarmUpBrowser';

WebBrowser.maybeCompleteAuthSession();

export default function SigninScreen() {
  const { signIn, setActive, isLoaded: isSignInLoaded } = useSignIn();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const router = useRouter();
  const auth = useAuth();

  // State for sign-in method
  const [signInMethod, setSignInMethod] = useState<'phone' | 'email'>('phone');

  // State for credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState('');
  const phoneInputRef = useRef<PhoneInput>(null);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  useWarmUpBrowser();

  const handleSignOut = async () => {
    console.log("Forcing sign out to clear stale session...");
    await auth.signOut();
    Alert.alert("Session Cleared", "The session has been cleared. Please try signing in again.");
};

  const onGoogleSignInPress = useCallback(async () => {
    if (!isSignInLoaded) {
      console.warn("[SignInScreen] Clerk's useSignIn is not fully loaded for Google Sign In.");
      return;
    }
    setIsGoogleLoading(true);
    try {
      const redirectUrl = Linking.createURL('/oauth-native-callback');
      const oauthResult = await startOAuthFlow({ redirectUrl });
      const { createdSessionId, setActive: oauthSetActive, signUp: oauthSignUpResource, signIn: oauthSignInResource } = oauthResult;

      if (createdSessionId) {
        await setActive({ session: createdSessionId });
        return;
      }

      if (oauthSignInResource) {
        if (oauthSignInResource.status === 'complete' && oauthSignInResource.createdSessionId) {
          await setActive({ session: oauthSignInResource.createdSessionId });
          return;
        }
      }

      if (oauthSignUpResource) {
        if (oauthSignUpResource.status === 'complete' && oauthSignUpResource.createdSessionId) {
          await setActive({ session: oauthSignUpResource.createdSessionId });
          return;
        } else if (oauthSignUpResource.status === 'missing_requirements') {
          Alert.alert('New Account Detected', 'It looks like this is a new account. Please complete the sign-up process.',
            [{ text: 'OK', onPress: () => router.replace({ pathname: '/(auth)/complete-profile', params: { flow: 'oauth_missing_requirements' } }) }]
          );
          return;
        }
      }

      if (oauthResult.authSessionResult?.type === 'cancel' || oauthResult.authSessionResult?.type === 'dismiss') {
        return;
      }

      Alert.alert('Sign-In Failed', 'Could not complete Google Sign-In. Please try again.');
    } catch (err: any) {
      console.error('[SignInScreen] Google OAuth Sign In error (outer catch):', JSON.stringify(err, null, 2));
      if (err.code === 'USER_CANCELLED' || err.message?.includes('cancelled')) return;
      const firstError = err.errors?.[0];
      Alert.alert('Error', `Google sign in failed: ${firstError?.longMessage || firstError?.message || 'An unexpected error occurred.'}`);
    } finally {
      setIsGoogleLoading(false);
    }
  }, [isSignInLoaded, startOAuthFlow, setActive, router]);

  const onSignInPress = async () => {
    if (auth.isSignedIn) {
      Alert.alert("Already Signed In", "It looks like you're already signed in. Redirecting you to the app.");
      // The root layout will handle the redirect automatically, but we can be explicit.
      router.replace('/(root)/(tabs)/home'); 
      return;
  }
    if (!isSignInLoaded) return;


    const identifier = signInMethod === 'email' ? email : formattedPhoneNumber;
    if (!identifier || !password) {
      Alert.alert('Error', 'Please enter your credentials.');
      return;
    }
    if (signInMethod === 'phone' && !phoneInputRef.current?.isValidNumber(phoneNumber)) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid phone number.');
      return;
    }

    setIsLoading(true);
    try {
      const signInAttempt = await signIn.create({ identifier, password });

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
      } else if (signInAttempt.status && ["needs_first_factor", "needs_second_factor"].includes(signInAttempt.status)) {
        Alert.alert("MFA Required", `Please complete the next authentication step.`);
        // Potentially navigate to an MFA screen here
      } else {
        Alert.alert('Sign In Failed', `Status: ${signInAttempt.status}. Please check your credentials.`);
      }
    } catch (err: any) {
      console.error("Password Sign In Error:", JSON.stringify(err, null, 2));
      const firstError = err.errors?.[0];
      if (firstError?.code === 'form_identifier_not_found' || firstError?.code === 'form_password_incorrect') {
        Alert.alert('Sign In Failed', 'Invalid credentials. Please try again.');
      } else {
        Alert.alert('Sign In Error', firstError?.longMessage || 'An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleMethod = () => {
    setEmail('');
    setPassword('');
    setPhoneNumber('');
    setFormattedPhoneNumber('');
    setSignInMethod(prev => prev === 'phone' ? 'email' : 'phone');
  };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
      <Text style={styles.header}>Sign In</Text>

      {signInMethod === 'phone' ? (
        <PhoneInput
          ref={phoneInputRef}
          value={phoneNumber}
          defaultCode="IN"
          layout="first"
          onChangeText={(text) => setPhoneNumber(text)}
          onChangeFormattedText={(text) => setFormattedPhoneNumber(text)}
          containerStyle={styles.phoneInputContainer}
          textContainerStyle={styles.phoneInputTextContainer}
          textInputStyle={styles.phoneInputText}
          codeTextStyle={styles.phoneInputCodeText}
          countryPickerButtonStyle={styles.countryPickerButton}
          withDarkTheme
          withShadow
          autoFocus
        />
      ) : (
        <TextInput
          style={styles.inputField}
          autoCapitalize="none"
          value={email}
          placeholder="Email Address"
          onChangeText={setEmail}
          keyboardType="email-address"
          textContentType="emailAddress"
          placeholderTextColor="#999"
        />
      )}

      <TextInput
        style={styles.inputField}
        value={password}
        placeholder="Password"
        secureTextEntry={true}
        onChangeText={setPassword}
        textContentType="password"
        placeholderTextColor="#999"
      />

      <View style={styles.passwordOptions}>
        <TouchableOpacity style={styles.toggleButton} onPress={handleToggleMethod}>
          <Text style={styles.linkText}>
            {signInMethod === 'phone' ? 'Sign In with Email Instead' : 'Sign In with Phone Instead'}
          </Text>
        </TouchableOpacity>
        <Link href="/(auth)/reset-password" asChild>
          <TouchableOpacity>
            <Text style={styles.linkText}>Forgot Password?</Text>
          </TouchableOpacity>
        </Link>
      </View>

      <TouchableOpacity
        style={[styles.button, (isLoading || (signInMethod === 'email' ? !email : !phoneNumber) || !password) && styles.buttonDisabled]}
        onPress={onSignInPress}
        disabled={isLoading || !isSignInLoaded || (signInMethod === 'email' ? !email : !phoneNumber) || !password}
      >
        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign In</Text>}
      </TouchableOpacity>

      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.divider} />
      </View>

      <TouchableOpacity
        style={styles.googleButton}
        onPress={onGoogleSignInPress}
        disabled={isGoogleLoading || !isSignInLoaded}
      >
        {isGoogleLoading ? (
          <ActivityIndicator color="#757575" size="small" style={{marginRight: 10}} />
        ) : (
          <Image source={require('@/assets/icons/google.png')} style={styles.googleIcon} />
        )}
        <Text style={styles.googleButtonText}>Continue with Google</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <Link href="/(auth)/signup" asChild>
          <TouchableOpacity>
            <Text style={[styles.footerText, styles.linkText]}>Sign Up</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    scrollView: { flex: 1, backgroundColor: '#fff' },
    scrollViewContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
    innerContainer: { width: '100%', alignItems: 'center' },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
    inputField: { width: '100%', height: 50, paddingHorizontal: 15, marginBottom: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, fontSize: 16, color: '#333' },
    phoneInputContainer: { width: '100%', height: 50, marginBottom: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, backgroundColor: 'white' },
    phoneInputTextContainer: { paddingVertical: 0, borderRadius: 8, backgroundColor: 'white' },
    phoneInputText: { fontSize: 16, color: '#333', height: 50 },
    phoneInputCodeText: { fontSize: 16, color: '#333' },
    countryPickerButton: { width: 60 },
    button: { width: '100%', backgroundColor: '#b95528', paddingVertical: 15, borderRadius: 8, alignItems: 'center', minHeight: 50, justifyContent: 'center' },
    buttonDisabled: { backgroundColor: '#cccccc' },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    toggleButton: { alignSelf: 'flex-start', marginBottom: 15 },
    googleButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 15, width: '100%', minHeight: 50 },
    googleIcon: { width: 20, height: 20, marginRight: 10 },
    googleButtonText: { color: '#757575', fontSize: 16, fontWeight: '600' },
    dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 20, width: '100%' },
    divider: { flex: 1, height: 1, backgroundColor: '#e0e0e0' },
    dividerText: { marginHorizontal: 10, color: '#757575', fontSize: 14 },
    footer: { flexDirection: 'row', marginTop: 20 },
    footerText: { fontSize: 16, color: '#555' },
    linkText: { color: '#b95528', fontWeight: 'bold', fontSize: 15,alignSelf: 'center' },
    imageContainer: { width: '100%', justifyContent: 'center', alignItems: 'center', height: 180, marginBottom: 5 },
    logoImage: { width: '65%', height: '100%', resizeMode: 'contain' },
    passwordOptions: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 15 },
});
""