// app/(auth)/signup.tsx
import { useAuth, useOAuth, useSignUp } from '@clerk/clerk-expo';
import * as Linking from 'expo-linking'; // Import Linking
import { Link, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import { useWarmUpBrowser } from '../../hooks/useWarmUpBrowser'; // Ensure path is correct

WebBrowser.maybeCompleteAuthSession();

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  // Phone Input state
  const [phoneNumber, setPhoneNumber] = useState(''); // This will store the raw number part
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState(''); // Stores full number like +12223334444
  const phoneInputRef = useRef<any>(null);
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth(); 

  // Other user details
  const [firstName, setFirstName] = useState(''); // Mandatory
  const [lastName, setLastName] = useState('');   // Optional
  const [emailAddress, setEmailAddress] = useState(''); // Optional for password-based
  const [password, setPassword] = useState('');   // Mandatory

  // Flow control states
  const [pendingVerification, setPendingVerification] = useState(false); // For phone OTP
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false); // For email/phone signup/verify buttons
  const [isGoogleLoading, setIsGoogleLoading] = useState(false); // For Google button

  

  useWarmUpBrowser();

  const cancelVerify = () => {
    router.replace('/(auth)/signup');
  }  

  
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const onGoogleSignUpPress = useCallback(async () => {
    if (!isLoaded || !isAuthLoaded) {
        console.warn("[SignUpScreen] Clerk SDKs not fully loaded for OAuth.");
        return;
    }
    setIsGoogleLoading(true);
    try {
        const redirectUrl = Linking.createURL('/oauth-native-callback', {
          // Ensure the scheme matches your Expo project config if not using default 'exp'
          // scheme: 'yourappscheme'
        });
        console.log("[SignUpScreen] Using redirectUrl for Google OAuth:", redirectUrl);

        const oauthResult = await startOAuthFlow({ redirectUrl });
        console.log("[SignUpScreen] startOAuthFlow completed. Full OAuth Result:", JSON.stringify(oauthResult, null, 2));

        const { createdSessionId, signUp: oauthSignUpResource, setActive: oauthSetActive } = oauthResult;

        if (createdSessionId && oauthSetActive) {
            console.log(`[SignUpScreen] OAuth created a session directly: ${createdSessionId}. Attempting oauthSetActive.`);
            await oauthSetActive({ session: createdSessionId });
            console.log('[SignUpScreen] oauthSetActive for direct session was called. isSignedIn should update soon.');
            // InitialLayout will handle navigation to home if session is active and profile complete
        }
        else if (oauthSignUpResource) {
            console.log("[SignUpScreen] OAuth resulted in a SignUp resource. Status:", oauthSignUpResource.status);
            console.log("[SignUpScreen] SignUp resource details:", JSON.stringify(oauthSignUpResource, null, 2));

            if (oauthSignUpResource.status === 'complete' && oauthSignUpResource.createdSessionId && setActive) {
                console.log(`[SignUpScreen] OAuth SignUp complete. Session: ${oauthSignUpResource.createdSessionId}. Attempting setActive (from useSignUp).`);
                await setActive({ session: oauthSignUpResource.createdSessionId });
                console.log('[SignUpScreen] setActive for completed SignUpResource was called.');
                 // InitialLayout will handle navigation
            }
            else if (oauthSignUpResource.status === 'missing_requirements') {
                console.log(`[SignUpScreen] OAuth SignUp Missing Requirements. SignUpResource ID: ${oauthSignUpResource.id}, Status: ${oauthSignUpResource.status}, Missing Fields: ${oauthSignUpResource.missingFields?.join(', ')}`);
                
                // The signUp object from useSignUp() hook is now updated by Clerk to be this oauthSignUpResource.
                // We need to navigate to a screen where the user can provide these missing fields.
                const prefilledEmail = oauthSignUpResource.emailAddress;
                const prefilledFirstName = oauthSignUpResource.firstName;

                Alert.alert(
                    'Account Almost Ready!',
                    `We've got some details from Google ${prefilledFirstName ? `(like your name: ${prefilledFirstName})` : ''}. Please add your phone number to complete your sign up.`,
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                // Pass a parameter to indicate this flow to CompleteProfileScreen
                                router.replace({
                                    pathname: '/(auth)/complete-profile',
                                    params: { flow: 'oauth_missing_requirements' }
                                });
                            }
                        },
                    ]
                );
            }
            else {
                console.warn(`[SignUpScreen] OAuth SignUp resource in unexpected status: ${oauthSignUpResource.status}.`);
                Alert.alert('Sign Up Incomplete', `Something went wrong during Google Sign-Up (Status: ${oauthSignUpResource.status}). Please try again.`);
            }
        }
        else {
            console.warn('[SignUpScreen] Google OAuth: Flow did not result in a direct session or a SignUp resource. Full oauthResult:', JSON.stringify(oauthResult, null, 2));
            // This can happen if the user cancels, or if there's an issue with the OAuth provider setup
            if (oauthResult?.authSessionResult?.type === 'cancel' || oauthResult?.authSessionResult?.type === 'dismiss') {
                 Alert.alert('Google Sign-Up Cancelled', 'You cancelled the Google sign-up process.');
            } else {
                 Alert.alert('Setup Error', 'Could not retrieve necessary information from Google to proceed. Please try again or use another sign-up method.');
            }
        }
    } catch (err: any) {
        console.error('[SignUpScreen] Google OAuth error (outer catch):', JSON.stringify(err, null, 2));
        if (err.errors && err.errors[0] && err.errors[0].code === 'oauth_callback_error') {
             Alert.alert('OAuth Error', 'There was an issue processing the callback from Google. Please try again.');
        } else if (err.message?.includes('user_cancelled') || err.code === 'USER_CANCELLED') {
             Alert.alert('Google Sign-Up Cancelled', 'You cancelled the Google sign-up process.');
        }
        else {
            Alert.alert('Google Sign-Up Error', err.message || 'An unexpected error occurred during Google Sign-Up. Please try again.');
        }
    } finally {
        setIsGoogleLoading(false);
    }
  }, [isLoaded, isAuthLoaded, startOAuthFlow, setActive, signUp, router]);

  
  const onSignUpPress = async () => { // Password-based signup using Phone
    if (!isLoaded) return;

    const isValidPhoneNumber = phoneInputRef.current?.isValidNumber(phoneNumber);
    if (!phoneNumber || !isValidPhoneNumber || !formattedPhoneNumber) {
      Alert.alert('Error', 'Please enter a valid phone number.');
      return;
    }
    if (!firstName.trim()) {
      Alert.alert('Error', 'First name is required.');
      return;
    }
    if (!password) {
      Alert.alert('Error', 'Password is required.');
      return;
    }
    setIsLoading(true);

    try {
      const signUpParams: any = {
        phoneNumber: formattedPhoneNumber, // Use the full formatted number from the library
        password,
        unsafeMetadata: {
          firstName: firstName.trim(),
          ...(lastName.trim() && { lastName: lastName.trim() }), // Add lastName if provided
          ...(emailAddress.trim() && { providedEmail: emailAddress.trim() }),
        }
      };

      // If your Clerk instance is configured to also accept 'firstName' and 'lastName' as top-level params
      // during sign-up (check User Attributes in Clerk dashboard, some might be allowed), you could try:
      // signUpParams.firstName = firstName.trim();
      // if (lastName.trim()) signUpParams.lastName = lastName.trim();
      // But unsafeMetadata is safer for custom/non-primary fields.

      console.log("Creating sign up with params:", JSON.stringify(signUpParams));
      await signUp.create(signUpParams);

      await signUp.preparePhoneNumberVerification({ strategy: 'phone_code' });
      setPendingVerification(true);
      setIsLoading(false); // Reset loading state before moving to verification screen
    } catch (err: any) {
      const firstError = err.errors?.[0];
      if (firstError?.code === 'form_password_pwned') { Alert.alert('Weak Password', 'This password has been found in a data breach. Please use a different password.'); }
      else if (firstError?.code === 'form_identifier_exists') { Alert.alert('Account Exists', 'An account with this phone number already exists. Please sign in or use a different number.'); }
      else { Alert.alert('Sign Up Error', firstError?.longMessage || firstError?.message || 'An unknown error occurred.'); }
      console.error('Sign Up Error (Password-based):', JSON.stringify(err, null, 2));
    } finally {
      setIsLoading(false); // Always reset loading state in finally block
    }
  };

  const onVerifyPress = async () => { // This is for Phone OTP verification
    if (!isLoaded) {
      console.warn("Clerk not loaded yet in onVerifyPress");
      return;
    }
    if (!code || code.trim() === "" || code.length < 4) { // Added basic length check for OTP
      Alert.alert("Error", "Please enter a valid verification code.");
      return;
    }

    setIsLoading(true); // Set loading true at the beginning of the action
    let navigatedSuccessfully = false; // Flag to track if navigation occurred

    try {
      let completeSignUp;
      // Assuming this screen (SignUpScreen) is now primarily for phone verification
      // after initial details are submitted in onSignUpPress
      completeSignUp = await signUp.attemptPhoneNumberVerification({ code });
      
      console.log("Phone Verification Attempt. Status:", completeSignUp.status);

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        router.replace('/(root)/(tabs)/home'); // Navigate to home
        navigatedSuccessfully = true; // Mark that navigation is intended
      } else if (completeSignUp.status === 'missing_requirements') {
        Alert.alert(
          'Almost There!',
          `Your phone was verified, but additional information might be required (e.g., ${completeSignUp.missingFields?.join(', ')}). You might be prompted for this next.`
        );
        if (completeSignUp.createdSessionId) {
            try {
                await setActive({ session: completeSignUp.createdSessionId });
                router.replace('/(root)/(tabs)/home'); // Let InitialLayout sort out next steps
                navigatedSuccessfully = true;
            } catch (setActiveError) {
                console.error("Error setting active session (missing req after phone verify):", setActiveError);
                // If setActive fails, we fall through to finally to reset loading
            }
        }
      } else {
        // Other non-complete statuses (e.g., incorrect_code, expired_code)
        Alert.alert(
          'Verification Failed',
          `The code might be incorrect or expired. Status: ${completeSignUp.status}. Please try again.`
        );
      }
    } catch (err: any) {
      console.error("Phone Verification Error from Clerk:", err);
      const firstError = err.errors?.[0];
      let errorMessage = 'An unknown error occurred during phone verification.';
      if (firstError) {
        errorMessage = firstError.longMessage || firstError.message || 'An unknown error occurred.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      Alert.alert('Verification Error', errorMessage);
    } finally {
      // This block ALWAYS executes after try/catch.
      // We only set isLoading to false if navigation did NOT successfully occur.
      // If navigation happened, the component will unmount, and setting state is not needed/problematic.
      if (!navigatedSuccessfully) {
        setIsLoading(false);
      }
    }
  };

  // --- JSX for the OTP Verification Screen (when pendingVerification is true) ---
  if (pendingVerification) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Verify Your Phone Number</Text>
        <Text style={styles.subHeader}>Enter the code sent to {formattedPhoneNumber}</Text>
        <TextInput
          style={styles.inputField}
          value={code}
          placeholder="Verification Code"
          onChangeText={(text) => setCode(text)}
          keyboardType="numeric"
          placeholderTextColor="#999"
          autoFocus={true}
          maxLength={6} // Typical OTP length
        />
        <TouchableOpacity
          style={[
            styles.button,
            // Disable button if:
            // 1. isLoading is true (an action is in progress)
            // 2. No code is entered OR code is too short (basic validation)
            // 3. Clerk's useSignUp is not loaded yet
            (isLoading || !code || code.length < 4 || !isLoaded) && styles.buttonDisabled
          ]}
          onPress={onVerifyPress}
          disabled={isLoading || !code || code.length < 4 || !isLoaded}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Verify Phone</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setPendingVerification(false); // Go back to the previous form
            setIsLoading(false);         // Ensure loading is reset
            setCode('');                 // Clear the code input
          }}
          disabled={isLoading} // Disable "Go Back" while an operation is in progress
          style={styles.linkButton}
        >
          <Text style={styles.linkText}>Edit Phone Number</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.imageContainer}><Image source={require('@/assets/images/liftm.png')} style={styles.logoImage} /></View>
      <Text style={styles.header}>Create Account</Text>
      
      <PhoneInput
        ref={phoneInputRef}
        defaultValue={phoneNumber}
        value={formattedPhoneNumber}
        defaultCode="IN" // Set your default country
        layout="first" // Or "second"
        onChangeText={(text) => { // This 'text' is the raw number without country code
          setPhoneNumber(text);
        }}
        onChangeFormattedText={(text) => { // This 'text' is the full number like +12223334444
          setFormattedPhoneNumber(text);
        }}
        containerStyle={styles.phoneInputContainer}
        textContainerStyle={styles.phoneInputTextContainer}
        textInputStyle={styles.phoneInputText}
        codeTextStyle={styles.phoneInputCodeText}
        countryPickerButtonStyle={styles.countryPickerButton}
        // autoFocus
      />

      <TextInput style={styles.inputField} autoCapitalize="words" value={firstName} placeholder="First Name *" onChangeText={setFirstName} placeholderTextColor="#999" />
      <TextInput style={styles.inputField} autoCapitalize="words" value={lastName} placeholder="Last Name (Optional)" onChangeText={setLastName} placeholderTextColor="#999" />
      <TextInput style={styles.inputField} autoCapitalize="none" value={emailAddress} placeholder="Email Address (Optional)" onChangeText={setEmailAddress} keyboardType="email-address" placeholderTextColor="#999" />
      <TextInput style={styles.inputField} value={password} placeholder="Create a Strong Password *" secureTextEntry={true} onChangeText={setPassword} textContentType="newPassword" placeholderTextColor="#999" />
      
      <TouchableOpacity style={[styles.button, isLoading && styles.buttonDisabled]} onPress={onSignUpPress} disabled={isLoading || !isLoaded}>
        {isLoading ? <ActivityIndicator color="#fff"/> : <Text style={styles.buttonText}>Sign Up</Text>}
      </TouchableOpacity>

      <View style={styles.dividerContainer}><View style={styles.divider} /><Text style={styles.dividerText}>OR</Text><View style={styles.divider} /></View>
      
      <TouchableOpacity style={styles.googleButton} onPress={onGoogleSignUpPress} disabled={isGoogleLoading || !isLoaded}>
        {isGoogleLoading ? <ActivityIndicator color="#757575" size="small" style={{marginRight: 10}} /> : <Image source={require('@/assets/icons/google.png')} style={styles.googleIcon} />}
        <Text style={styles.googleButtonText}>Continue with Google</Text>
      </TouchableOpacity>
      
      <View style={styles.footer}><Text style={styles.footerText}>Already have an account? </Text><Link href="/(auth)/signin" asChild><TouchableOpacity><Text style={[styles.footerText, styles.linkText]}>Sign In</Text></TouchableOpacity></Link></View>
    </ScrollView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
    container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff', },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 15, color: '#333', textAlign: 'center' },
    subHeader: { fontSize: 16, marginBottom: 20, color: '#555', textAlign: 'center', },
    phoneInputContainer: { width: '100%', height: 50, marginBottom: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, backgroundColor: 'white' /* Important for appearance */},
    phoneInputTextContainer: { paddingVertical: 0, borderRadius: 8, backgroundColor: 'white' /* Match container */ },
    phoneInputText: { fontSize: 16, color: '#333', height: 50 /* Match container height */ },
    phoneInputCodeText: { fontSize: 16, color: '#333' },
    countryPickerButton: { width: 60 /* Adjust as needed */ }, // Style the country picker button area
    inputField: { width: '100%', height: 50, paddingHorizontal: 15, marginBottom: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, fontSize: 16, color: '#333', },
    button: { width: '100%', backgroundColor: '#b95528', paddingVertical: 15, borderRadius: 8, alignItems: 'center', marginBottom: 10, minHeight: 50 },
    buttonDisabled: { backgroundColor: '#cccccc', },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold', },
    googleButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 15, marginTop: 0, width: '100%', minHeight: 50 },
    googleIcon: { width: 20, height: 20, marginRight: 10, },
    googleButtonText: { color: '#757575', fontSize: 16, fontWeight: '600', },
    dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 15, width: '100%', },
    divider: { flex: 1, height: 1, backgroundColor: '#e0e0e0', },
    dividerText: { marginHorizontal: 10, color: '#757575', fontSize: 14, },
    footer: { flexDirection: 'row', marginTop: 15, },
    footerText: { fontSize: 16, color: '#555', },
    linkButton: { marginTop: 15, },
    linkText: { color: '#b95528', fontWeight: 'bold', },
    imageContainer: { width: '100%', justifyContent: 'center', alignItems: 'center', height: 180, marginBottom: 5 },
    logoImage: { width: '65%', height: '100%', resizeMode: 'contain', },
  });