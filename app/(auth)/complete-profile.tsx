// app/(auth)/complete-profile.tsx
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// Import useSignUp and useLocalSearchParams
import { useAuth, useClerk, useSignUp, useUser } from '@clerk/clerk-expo';
import { useLocalSearchParams, useRouter } from 'expo-router';
import PhoneInput from 'react-native-phone-number-input';

export default function CompleteProfileScreen() {
  const { user, isLoaded: isUserLoadedFromHook } = useUser();
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const { signOut } = useClerk(); // setActive from useClerk is for client, not session
  // Get signUp object and its own setActive for completing a sign-up process
  const { signUp, isLoaded: isSignUpLoaded, setActive: setSignUpActive } = useSignUp();
  const router = useRouter();
  // Get route parameters passed from SignUpScreen
  const params = useLocalSearchParams<{ flow?: string }>();

  // UI State to determine which flow this screen is handling
  const [uiFlow, setUiFlow] = useState<'loading' | 'signUpCompletion' | 'userProfileUpdate' | 'redirecting'>('loading');

  const [phoneNumber, setPhoneNumber] = useState(''); // Raw phone number input
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState(''); // E.164 formatted number
  const phoneInputRef = useRef<PhoneInput>(null);
  const [code, setCode] = useState('');
  const [phoneVerificationPending, setPhoneVerificationPending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fields that might be pre-filled (from OAuth or existing user)
  const [profileFirstName, setProfileFirstName] = useState('');
  const [profileLastName, setProfileLastName] = useState('');
  const [profileEmail, setProfileEmail] = useState(''); // For display

  useEffect(() => {
    if (!isAuthLoaded || !isUserLoadedFromHook || !isSignUpLoaded) {
      console.log("[CompleteProfile] Waiting for Clerk hooks (Auth, User, SignUp) to load...");
      setUiFlow('loading');
      return;
    }

    console.log("[CompleteProfile] Hooks loaded. isSignedIn:", isSignedIn, "signUp?.status:", signUp?.status, "params.flow:", params.flow);

    // Prioritize completing an active signUp attempt (e.g., from OAuth)
    if (signUp && signUp.status === 'missing_requirements' && (params.flow === 'oauth_missing_requirements' || !isSignedIn) ) {
      console.log("[CompleteProfile] Detected 'missing_requirements' in signUp object. Activating 'signUpCompletion' flow.");
      setUiFlow('signUpCompletion');
      setProfileFirstName(signUp.firstName || '');
      setProfileLastName(signUp.lastName || ''); // Often null from Google initial OAuth
      setProfileEmail(signUp.emailAddress || ''); // Email from Google
      
      // If phone is not among missing fields but others are, this screen might need more inputs.
      // For now, we assume phone is the primary target.
      if (!signUp.missingFields?.includes('phone_number') && signUp.missingFields && signUp.missingFields.length > 0) {
          console.warn("[CompleteProfile] SignUp 'missing_requirements' but phone_number not listed as missing. Missing fields:", signUp.missingFields.join(', '));
          // You might need to handle other missing fields (e.g., password if globally required)
          // Alert.alert("Additional Info Needed", `Besides phone, we also need: ${signUp.missingFields.join(', ')}`);
      }
    } else if (isSignedIn && user) {
      console.log("[CompleteProfile] User is signed in. Activating 'userProfileUpdate' flow.");
      setUiFlow('userProfileUpdate');
      setProfileFirstName(user.firstName || '');
      setProfileLastName(user.lastName || '');
      setProfileEmail(user.primaryEmailAddress?.emailAddress || '');
      const verifiedPhone = user.phoneNumbers.find(p => p.verification?.status === 'verified' && p.phoneNumber);
      if (verifiedPhone) {
        // Pre-fill for display if they want to change it, though less common.
        // setFormattedPhoneNumber(verifiedPhone.phoneNumber);
      }
    } else {
      console.log("[CompleteProfile] No active signUp 'missing_requirements' and user not signed in. Redirecting to signin.");
      setUiFlow('redirecting');
      router.replace('/(auth)/signin'); // Or /signup
    }
  }, [isAuthLoaded, isUserLoadedFromHook, isSignUpLoaded, isSignedIn, user, signUp, params.flow, router]);


  // --- Handlers for 'signUpCompletion' flow (e.g., OAuth missing phone) ---
  const handleSignUpAddPhoneAndVerify = async () => {
    if (!signUp || signUp.status !== 'missing_requirements') {
        console.error("[CompleteProfile-SignUp] signUp object not available or not in missing_requirements state.");
        return;
    }
    const isValid = phoneInputRef.current?.isValidNumber(phoneNumber);
    if (!phoneNumber || !isValid || !formattedPhoneNumber) {
      Alert.alert('Invalid Phone', 'Please enter a valid phone number.');
      return;
    }
    setIsLoading(true);
    try {
      // Update the ongoing signUp attempt with the phone number.
      // Clerk might also require other missing fields if "password" was in missingFields.
      // For simplicity, this example focuses on phone.
      const updateParams: { phoneNumber: string, password?: string, firstName?: string, lastName?: string } = {
        phoneNumber: formattedPhoneNumber,
      };
      // If first/last name were editable and changed for this flow:
      if (profileFirstName && profileFirstName !== signUp.firstName) updateParams.firstName = profileFirstName;
      if (profileLastName && profileLastName !== signUp.lastName) updateParams.lastName = profileLastName;


      console.log("[CompleteProfile-SignUp] Updating signUp object with params:", updateParams);
      const updatedSignUp = await signUp.update(updateParams);
      console.log("[CompleteProfile-SignUp] Updated signUp with phone. New status:", updatedSignUp.status, "Verifications:", JSON.stringify(updatedSignUp.verifications, null, 2));

      if (updatedSignUp.status === 'missing_requirements') {
        // Phone added, but now might need verification, or other fields still missing.
        if (updatedSignUp.unverifiedFields?.includes('phone_number') || updatedSignUp.verifications.phoneNumber?.status !== 'verified') {
          console.log("[CompleteProfile-SignUp] Phone number added, now requires verification.");
          await signUp.preparePhoneNumberVerification({ strategy: 'phone_code' });
          setPhoneVerificationPending(true);
          Alert.alert('Verification Code Sent', `A code has been sent to ${formattedPhoneNumber}.`);
        } else if (updatedSignUp.missingFields && updatedSignUp.missingFields.length > 0) {
          Alert.alert('More Info Needed', `Phone added. Still missing: ${updatedSignUp.missingFields.join(', ')}. This screen may need adjustment.`);
          console.warn("[CompleteProfile-SignUp] Still missing fields after phone update:", updatedSignUp.missingFields);
        } else {
          // This state is unusual if phone was the only thing or if verification was expected
          console.warn("[CompleteProfile-SignUp] Updated, still missing_req, but unclear next step. SignUp:", JSON.stringify(updatedSignUp,null,2));
          Alert.alert("Update Incomplete", "Your phone was added, but the sign-up isn't complete. Please check the details.");
        }
      } else if (updatedSignUp.status === 'complete') {
        console.log("[CompleteProfile-SignUp] SignUp process completed directly after update. Session ID:", updatedSignUp.createdSessionId);
        if (updatedSignUp.createdSessionId && setSignUpActive) {
          await setSignUpActive({ session: updatedSignUp.createdSessionId });
          Alert.alert("Sign Up Successful!", "Your account is ready.");
          router.replace('/(root)/(tabs)/home'); // Navigate to home
        } else {
           Alert.alert("Sign Up Complete", "Your account is ready, but automatic session activation failed. Please try signing in.");
           router.replace('/(auth)/signin');
        }
      } else {
        console.warn("[CompleteProfile-SignUp] Unexpected status after phone update to signUp object:", updatedSignUp.status);
        Alert.alert("Error", "An unexpected issue occurred while updating your sign-up information.");
      }
    } catch (err: any) {
      console.error("[CompleteProfile-SignUp] Error adding phone to signUp object:", JSON.stringify(err, null, 2));
      Alert.alert('Error', err.errors?.[0]?.longMessage || 'Failed to add phone number to your sign-up.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpVerifyPhoneCode = async () => {
    if (!signUp || !code) {
        console.error("[CompleteProfile-SignUp] signUp object not available or no code provided for verification.");
        return;
    }
    setIsLoading(true);
    try {
      const completeSignUp = await signUp.attemptPhoneNumberVerification({ code });
      console.log("[CompleteProfile-SignUp] Phone verification attempt for signUp. New status:", completeSignUp.status);

      if (completeSignUp.status === 'complete') {
        console.log("[CompleteProfile-SignUp] SignUp completed after phone verification. Session ID:", completeSignUp.createdSessionId);
        if (completeSignUp.createdSessionId && setSignUpActive) { // Use setActive from useSignUp
          await setSignUpActive({ session: completeSignUp.createdSessionId });
          Alert.alert("Phone Verified & Sign Up Complete!", "Your account is all set.");
          router.replace('/(root)/(tabs)/home'); // Navigate to home
        } else {
           Alert.alert("Sign Up Complete", "Your account is ready, but session activation failed. Please try signing in.");
           router.replace('/(auth)/signin');
        }
      } else if (completeSignUp.status === 'missing_requirements') {
        // This implies phone was verified, but other fields (e.g., password if globally required) are still missing.
        Alert.alert('Phone Verified, More Info Needed', `Your phone is verified! However, we still need: ${completeSignUp.missingFields?.join(', ')}. Please complete these steps.`);
        setPhoneVerificationPending(false); // OTP part is done
        setCode('');
        // Here, you'd ideally show inputs for other missingFields.
        console.warn("[CompleteProfile-SignUp] Phone verified, but signUp still 'missing_requirements':", completeSignUp.missingFields);
      } else {
        // e.g., incorrect_code, expired_code
        Alert.alert('Verification Failed', `The code might be incorrect or expired (Status: ${completeSignUp.status}). Please try again or request a new code.`);
      }
    } catch (err: any) {
      console.error("[CompleteProfile-SignUp] Error verifying phone code for signUp:", JSON.stringify(err, null, 2));
      Alert.alert('Verification Error', err.errors?.[0]?.longMessage || 'Failed to verify the phone code.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Handlers for 'userProfileUpdate' flow (signed-in user) ---
  // Your existing handleAddOrUpdatePhoneNumber, handleVerifyPhone, handleProfileUpdate
  // should be mostly fine. Rename them for clarity (e.g., handleUserAddPhone, handleUserVerify, handleUserUpdateNames)
  // and ensure they use the `user` object from `useUser()`.

    const handleUserAddOrUpdatePhoneNumber = async () => { // Renamed from your original
        if (!user) return;
        // ... (Your existing logic from handleAddOrUpdatePhoneNumber)
        // Make sure to use `user.createPhoneNumber`, `phoneResource.prepareVerification`, etc.
        // For brevity, this part is condensed. Key changes are to ensure it's for the `user` object.
        const isValid = phoneInputRef.current?.isValidNumber(phoneNumber);
        if (!phoneNumber || !isValid || !formattedPhoneNumber) {
          Alert.alert('Invalid Phone', 'Please enter a valid phone number.'); return;
        }
        setIsLoading(true);
        try {
          const existingPhone = user.phoneNumbers.find(p => p.phoneNumber === formattedPhoneNumber);
          let phoneResource = existingPhone;

          if (!phoneResource) {
            phoneResource = await user.createPhoneNumber({ phoneNumber: formattedPhoneNumber });
          } else if (phoneResource.verification?.status === 'verified') {
            Alert.alert('Phone Already Verified', 'This phone number is already verified on your account.');
            setIsLoading(false); setPhoneVerificationPending(false); return;
          }
          await phoneResource.prepareVerification();
          setPhoneVerificationPending(true);
          Alert.alert('Verification Code Sent', `A code has been sent to ${formattedPhoneNumber}.`);
        } catch (err: any) {
          console.error("[CompleteProfile-UserFlow] Error adding/updating phone:", JSON.stringify(err, null, 2));
          Alert.alert('Error', err.errors?.[0]?.longMessage || 'Failed to process phone number.');
        } finally { setIsLoading(false); }
    };

    const handleUserVerifyPhone = async () => { // Renamed
        if (!user || !code) return;
        // ... (Your existing logic from handleVerifyPhone)
        // Use `user.phoneNumbers.find()`, `attemptResult = await phoneResource.attemptVerification({ code })`
        // Call `await user.reload()` upon successful verification.
        setIsLoading(true);
        try {
          const phoneResource = user.phoneNumbers.find(pn => pn.phoneNumber === formattedPhoneNumber && pn.verification?.status !== 'verified');
          if (!phoneResource) {
            Alert.alert('Error', 'Phone number to verify not found. Try adding it again.');
            setPhoneVerificationPending(false); setIsLoading(false); return;
          }
          const attemptResult = await phoneResource.attemptVerification({ code });
          if (attemptResult.verification.status === 'verified') {
            Alert.alert('Phone Verified!', 'Your phone number has been successfully verified.');
            await user.reload(); // CRITICAL: Reload user
            setPhoneVerificationPending(false); setCode('');
            // Optionally, proceed to update names if they were changed, or navigate.
            // For simplicity, we assume this step completes the phone part. Names are separate.
            // Check if profile is now complete according to InitialLayout logic.
            // If only names were pending and phone just got verified:
            if (profileFirstName.trim() === "" && user.firstName === null) {
                // If first name is required and still not set, prompt for it.
                // But if InitialLayout handles this, just reloading user might be enough.
            }
            // For now, assume InitialLayout will re-evaluate and navigate if profile is complete.
          } else {
            Alert.alert('Verification Failed', `The code was incorrect or an issue occurred. Status: ${attemptResult.verification.status}.`);
          }
        } catch (err: any) {
          console.error("[CompleteProfile-UserFlow] Error verifying phone:", JSON.stringify(err, null, 2));
          Alert.alert('Verification Error', err.errors?.[0]?.longMessage || 'Failed to verify phone code.');
        } finally { setIsLoading(false); }
    };

    const handleUserUpdateProfileNames = async () => { // Renamed and focused
        if (!user) return;
        // ... (Your existing logic from handleProfileUpdate, focused on names)
        // Use `user.update({ firstName, lastName })`, `user.reload()`
        setIsLoading(true);
        try {
            const updateParams: { firstName?: string; lastName?: string } = {};
            const currentFirstName = user.firstName || "";
            const currentLastName = user.lastName || "";

            if (profileFirstName.trim() && profileFirstName.trim() !== currentFirstName) {
                updateParams.firstName = profileFirstName.trim();
            }
            if (profileLastName.trim() !== currentLastName || (profileLastName.trim() === "" && currentLastName)) {
                 updateParams.lastName = profileLastName.trim() || undefined; // Send null to clear if empty
            }

            if (Object.keys(updateParams).length > 0) {
                console.log("[CompleteProfile-UserFlow] Updating user profile names with params:", updateParams);
                await user.update(updateParams);
                await user.reload();
                Alert.alert("Profile Updated", "Your name has been saved.");
            } else {
                Alert.alert("No Changes", "Your name is already up to date.");
            }
            // If all required info (including verified phone) is present, user can proceed.
            // InitialLayout should handle navigation to home if profile is now complete.
            const hasVerifiedPhone = user.phoneNumbers.some(p => p.verification?.status === 'verified');
            if(hasVerifiedPhone) {
                 router.replace('/(root)/(tabs)/home'); // Or let InitialLayout handle it
            } else {
                 Alert.alert("Phone Still Needed", "Please add and verify your phone number.");
            }

        } catch (err:any) {
            console.error("[CompleteProfile-UserFlow] Error updating profile names:", JSON.stringify(err, null, 2));
            Alert.alert("Update Error", err.errors?.[0]?.longMessage || "Could not save name changes.");
        } finally { setIsLoading(false); }
    };


  // --- Render logic ---
  if (uiFlow === 'loading' || uiFlow === 'redirecting') {
    return <View style={styles.container}><ActivityIndicator size="large" color="#b95528" /></View>;
  }

  const isSignUpFlow = uiFlow === 'signUpCompletion';
  const isUserUpdateFlow = uiFlow === 'userProfileUpdate';

  // Determine if phone input section should be shown
  const needsPhoneInput =
    (isSignUpFlow && signUp?.missingFields?.includes('phone_number') && !phoneVerificationPending) ||
    (isUserUpdateFlow && !user?.phoneNumbers.some(p => p.verification?.status === 'verified') && !phoneVerificationPending);

  // Determine if "Save Names" or "Continue" button for user update flow should be shown
  const showUserUpdateSaveButton = isUserUpdateFlow && user?.phoneNumbers.some(p => p.verification?.status === 'verified') && !phoneVerificationPending;


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Complete Your Profile</Text>
      <Text style={styles.infoText}>
        {isUserUpdateFlow ? `Welcome back, ${user?.firstName || profileEmail || 'User'}!` : `Welcome, ${profileFirstName || profileEmail || 'New User'}!`}
      </Text>
      {isSignUpFlow && <Text style={styles.subHeader}>{profileEmail} {profileFirstName ? `(${profileFirstName})` : ''}. Please add and verify your phone number.</Text>}
      {isUserUpdateFlow && !user?.phoneNumbers.some(p=>p.verification?.status === 'verified') && <Text style={styles.subHeader}>A verified phone number is required. You can also update your name.</Text>}
      {isUserUpdateFlow && user?.phoneNumbers.some(p=>p.verification?.status === 'verified') && <Text style={styles.subHeader}>Your phone is verified. You can update your name below.</Text>}

      <TextInput
        style={styles.inputField}
        value={profileFirstName}
        placeholder="First Name *"
        onChangeText={setProfileFirstName}
        autoCapitalize="words"
        // For OAuth (signUpFlow), first name from Google might not be editable here, or you allow it.
        editable={isUserUpdateFlow || isSignUpFlow} // Allow editing for both for now
      />
      <TextInput
        style={styles.inputField}
        value={profileLastName}
        placeholder="Last Name (Optional)"
        onChangeText={setProfileLastName}
        autoCapitalize="words"
        editable={isUserUpdateFlow || isSignUpFlow}
      />

      {needsPhoneInput && (
        <>
          <PhoneInput
            ref={phoneInputRef}
            defaultValue={phoneNumber}
            defaultCode="IN"
            layout="first"
            onChangeText={setPhoneNumber}
            onChangeFormattedText={setFormattedPhoneNumber}
            containerStyle={styles.phoneInputContainer}
            textContainerStyle={styles.phoneInputTextContainer}
            /* ... other props ... */
            autoFocus
          />
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={isSignUpFlow ? handleSignUpAddPhoneAndVerify : handleUserAddOrUpdatePhoneNumber}
            disabled={isLoading || !formattedPhoneNumber.trim()}
          >
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send Phone Verification Code</Text>}
          </TouchableOpacity>
        </>
      )}

      {phoneVerificationPending && (
        <>
          <Text style={styles.infoText}>Enter the code sent to {formattedPhoneNumber}:</Text>
          <TextInput style={styles.inputField} value={code} placeholder="Verification Code" onChangeText={setCode} keyboardType="numeric" autoFocus maxLength={6} />
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={isSignUpFlow ? handleSignUpVerifyPhoneCode : handleUserVerifyPhone}
            disabled={isLoading || !code || code.length < 4}
          >
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify Phone</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {setPhoneVerificationPending(false); setCode('');}} disabled={isLoading} style={styles.linkButton}>
            <Text style={styles.linkText}>Edit Phone Number or Resend</Text>
          </TouchableOpacity>
        </>
      )}

      {showUserUpdateSaveButton && (
          <TouchableOpacity
            style={[styles.button, {marginTop: 10}]}
            onPress={handleUserUpdateProfileNames} // This now primarily saves names
            disabled={isLoading || !profileFirstName.trim()}
            >
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save Name Changes & Continue</Text>}
          </TouchableOpacity>
      )}
      {/* Add a general "Save and Continue" if in Sign Up Flow and phone is verified but names might have been edited */}
       {isSignUpFlow && signUp?.verifications.phoneNumber?.status === 'verified' && !phoneVerificationPending && (
          <TouchableOpacity
            style={[styles.button, {marginTop: 10, backgroundColor: '#4CAF50'}]}
            onPress={async () => { // This implies all required fields for signUp are met
                setIsLoading(true);
                try {
                    // If names were editable and changed, update signUp again
                    if ((profileFirstName && profileFirstName !== signUp.firstName) || (profileLastName && profileLastName !== signUp.lastName)) {
                       await signUp.update({
                           firstName: profileFirstName || undefined,
                           lastName: profileLastName || undefined
                       });
                    }
                    // This assumes phone is verified and other missing_fields (like password) are handled.
                    // If signUp.status is not 'complete' here, it means something else is missing.
                    if (signUp.status === 'complete' && signUp.createdSessionId && setSignUpActive) {
                        await setSignUpActive({session: signUp.createdSessionId});
                        router.replace('/(root)/(tabs)/home');
                    } else if (signUp.status === 'missing_requirements'){
                         Alert.alert("Still Incomplete", `Missing: ${signUp.missingFields?.join(', ')}. Please ensure all fields are provided.`);
                         // This means the logic to handle other missing fields (e.g. password) is needed.
                    } else {
                        // Attempt to complete if possible (e.g. if only password was missing and is now optional)
                        // This is a fallback, ideally previous steps make it complete.
                        const finalAttempt = await signUp.update({}); // Attempt to finalize
                         if (finalAttempt.status === 'complete' && finalAttempt.createdSessionId && setSignUpActive) {
                            await setSignUpActive({session: finalAttempt.createdSessionId});
                            router.replace('/(root)/(tabs)/home');
                        } else {
                             Alert.alert("Finalization Needed", "Please complete all required steps. Status: " + finalAttempt.status);
                        }
                    }
                } catch (e:any) {
                    console.error("Error finalizing signUp on complete profile:", JSON.stringify(e,null,2));
                    Alert.alert("Error", "Could not finalize your sign up.");
                } finally {
                    setIsLoading(false);
                }
            }}
            disabled={isLoading || !profileFirstName.trim()} // Basic check
            >
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Complete Sign-Up</Text>}
          </TouchableOpacity>
      )}


      <TouchableOpacity onPress={async () => { await signOut(); router.replace('/(auth)/signin');}} style={[styles.linkButton, {marginTop: 30}]}>
        <Text style={styles.linkText}>Sign Out & Start Over</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
// Styles (use your existing styles from the prompt)
const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff', },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#333', textAlign: 'center'},
  subHeader: { fontSize: 16, marginBottom: 20, color: '#555', textAlign: 'center', paddingHorizontal: 10, },
  infoText: { fontSize: 16, color: '#333', marginBottom: 15, textAlign: 'center' },
  phoneInputContainer: { width: '100%', height: 50, marginBottom: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, backgroundColor: 'white' },
  phoneInputTextContainer: { paddingVertical: 0, borderRadius: 8, backgroundColor: 'white' },
  phoneInputText: { fontSize: 16, color: '#333', height: 50 },
  phoneInputCodeText: { fontSize: 16, color: '#333' },
  countryPickerButton: { width: 60 },
  inputField: { width: '100%', height: 50, paddingHorizontal: 15, marginBottom: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, fontSize: 16, color: '#333', },
  button: { width: '100%', backgroundColor: '#b95528', paddingVertical: 15, borderRadius: 8, alignItems: 'center', marginBottom: 10, minHeight: 50, },
  buttonDisabled: { backgroundColor: '#cccccc', },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold', },
  linkButton: { marginTop: 15, padding: 5 },
  linkText: { color: '#b95528', fontSize: 16, fontWeight: '500', textAlign: 'center' },
});