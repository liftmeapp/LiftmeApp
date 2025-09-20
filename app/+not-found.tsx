import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <ThemedView style={styles.container}>
      <ActivityIndicator size="large" color="#0000ff" />
        <Link href="/" style={styles.link}>
          <ThemedText type="link">Go to home screen!</ThemedText>
        </Link>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});


/*
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
      
      console.log("Phone Verification Attempt Response:", JSON.stringify(completeSignUp, null, 2));

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
      console.error("Raw Phone Verification Error from Clerk:", JSON.stringify(err, null, 2));
      const firstError = err.errors?.[0];
      let errorMessage = 'An unknown error occurred during phone verification.';
      if (firstError) {
        errorMessage = firstError.longMessage || firstError.message || errorMessage;
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

*/