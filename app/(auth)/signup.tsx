import { useAuth, useOAuth, useSignUp } from '@clerk/clerk-expo';
import * as Linking from 'expo-linking';
import { Link, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import { useWarmUpBrowser } from '../../hooks/useWarmUpBrowser';

WebBrowser.maybeCompleteAuthSession();

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState('');
  const phoneInputRef = useRef<any>(null);
  const { isLoaded: isAuthLoaded } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');

  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useWarmUpBrowser();

  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const onGoogleSignUpPress = useCallback(async () => {
    if (!isLoaded || !isAuthLoaded) return;
    setIsGoogleLoading(true);
    try {
      const redirectUrl = Linking.createURL('/oauth-native-callback');
      const oauthResult = await startOAuthFlow({ redirectUrl });
      const { createdSessionId, signUp: oauthSignUpResource, setActive: oauthSetActive } = oauthResult;

      if (createdSessionId && oauthSetActive) {
        await oauthSetActive({ session: createdSessionId });
      } else if (oauthSignUpResource) {
        if (oauthSignUpResource.status === 'complete' && oauthSignUpResource.createdSessionId && setActive) {
          await setActive({ session: oauthSignUpResource.createdSessionId });
        } else if (oauthSignUpResource.status === 'missing_requirements') {
          router.replace({
            pathname: '/(auth)/complete-profile',
            params: { flow: 'oauth_missing_requirements' }
          });
        } else {
          Alert.alert('Sign Up Incomplete', `Something went wrong during Google Sign-Up. Status: ${oauthSignUpResource.status}`);
        }
      }
    } catch (err: any) {
      if (err.code === 'USER_CANCELLED' || err.message?.includes('cancelled')) {
        // User cancelled
      } else {
        Alert.alert('Google Sign-Up Error', err.message || 'An unexpected error occurred.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  }, [isLoaded, isAuthLoaded, startOAuthFlow, setActive, signUp, router]);

  const onSignUpPress = async () => {
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
        phoneNumber: formattedPhoneNumber,
        password,
        firstName: firstName.trim(),
      };
      if (lastName.trim()) signUpParams.lastName = lastName.trim();
      signUpParams.unsafeMetadata = {
        firstName: firstName.trim(),
        ...(lastName.trim() && { lastName: lastName.trim() }),
        ...(emailAddress.trim() && { providedEmail: emailAddress.trim() }),
      };

      await signUp.create(signUpParams);
      await signUp.preparePhoneNumberVerification({ strategy: 'phone_code' });
      setPendingVerification(true);
    } catch (err: any) {
      const firstError = err.errors?.[0];
      Alert.alert('Sign Up Error', firstError?.longMessage || firstError?.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;
    if (!code || code.length < 4) {
      Alert.alert("Error", "Please enter a valid verification code.");
      return;
    }
    setIsLoading(true);
    try {
      const completeSignUp = await signUp.attemptPhoneNumberVerification({ code });
      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        router.replace('/(root)/(tabs)/home');
      } else {
        Alert.alert('Verification Failed', `Status: ${completeSignUp.status}`);
      }
    } catch (err: any) {
      const firstError = err.errors?.[0];
      Alert.alert('Verification Error', firstError?.longMessage || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.header}>Verify Phone</Text>
            <Text style={styles.subHeader}>Code sent to {formattedPhoneNumber}</Text>

            <TextInput
              style={styles.inputField}
              value={code}
              placeholder="Verification Code"
              placeholderTextColor="rgba(255,255,255,0.7)"
              onChangeText={setCode}
              keyboardType="numeric"
              autoFocus
              maxLength={6}
            />

            <TouchableOpacity style={styles.button} onPress={onVerifyPress} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="#005C70" /> : <Text style={styles.buttonText}>Verify</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setPendingVerification(false)} style={styles.linkButton}>
              <Text style={styles.linkText}>Edit Number</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Logo */}
          <View style={styles.imageContainer}>
            <Image source={require('@/assets/icons/Liftme App icon black.png')} style={styles.logoImage} />
          </View>

          <Text style={styles.header}>Get Started</Text>

          {/* Form */}
          <View style={styles.formContainer}>
            <PhoneInput
              ref={phoneInputRef}
              defaultValue={phoneNumber}
              defaultCode="IN"
              layout="first"
              onChangeText={setPhoneNumber}
              onChangeFormattedText={setFormattedPhoneNumber}
              containerStyle={styles.phoneInputContainer}
              textContainerStyle={styles.phoneInputTextContainer}
              textInputStyle={styles.phoneInputText}
              codeTextStyle={styles.phoneInputCodeText}
              countryPickerButtonStyle={styles.countryPickerButton}
              withDarkTheme
              withShadow
              autoFocus
            />

            <TextInput
              style={styles.inputField}
              placeholder="First Name*"
              placeholderTextColor="rgba(255,255,255,0.7)"
              value={firstName}
              onChangeText={setFirstName}
            />
            <TextInput
              style={styles.inputField}
              placeholder="Last Name"
              placeholderTextColor="rgba(255,255,255,0.7)"
              value={lastName}
              onChangeText={setLastName}
            />
            <TextInput
              style={styles.inputField}
              placeholder="Email"
              placeholderTextColor="rgba(255,255,255,0.7)"
              value={emailAddress}
              onChangeText={setEmailAddress}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.inputField}
              placeholder="Create Password*"
              placeholderTextColor="rgba(255,255,255,0.7)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* Buttons */}
          <TouchableOpacity style={styles.button} onPress={onSignUpPress} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#005C70" /> : <Text style={styles.buttonText}>Sign Up</Text>}
          </TouchableOpacity>

          <View style={styles.orContainer}>
            <View style={styles.divider} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity style={styles.googleButton} onPress={onGoogleSignUpPress} disabled={isGoogleLoading}>
            {isGoogleLoading ?
              <ActivityIndicator color="#000" /> :
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image source={require('@/assets/icons/google.png')} style={styles.googleIcon} />
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </View>
            }
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/(auth)/signin" asChild>
              <TouchableOpacity>
                <Text style={styles.linkText}>Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#005C70', // Teal background
  },
  scrollContent: {
    padding: 24,
    minHeight: '100%',
    justifyContent: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 40,
  },
  logoImage: {
    width: 100, // Reduced size for logo
    height: 100,
    resizeMode: 'contain',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
  },
  subHeader: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  formContainer: {
    marginBottom: 20,
  },
  inputField: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.5)',
    height: 50,
    fontSize: 16,
    color: '#fff',
    marginBottom: 15,
  },
  phoneInputContainer: {
    width: '100%',
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.5)',
    elevation: 0,
    shadowOpacity: 0,
    height: 50,
    marginBottom: 15,
  },
  phoneInputTextContainer: {
    backgroundColor: 'transparent',
    paddingVertical: 0,
    height: 50,
  },
  phoneInputText: {
    color: '#fff',
    fontSize: 16,
    height: 50,
    textAlignVertical: 'center',
  },
  phoneInputCodeText: {
    color: '#fff',
    fontSize: 16,
  },
  countryPickerButton: {
    backgroundColor: 'transparent',
    width: 60,
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 30, // Pill shape
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#005C70',
    fontSize: 18,
    fontWeight: 'bold',
  },
  googleButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 30, // Pill shape
    alignItems: 'center',
    marginBottom: 20,
  },
  googleButtonText: {
    color: '#555',
    fontSize: 16,
    fontWeight: '600',
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  orText: {
    marginHorizontal: 10,
    color: 'rgba(255,255,255,0.7)',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  footerText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
  },
  linkText: {
    color: '#2AB5D1', // Cyan/Blue for links
    fontWeight: 'bold',
    fontSize: 16,
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center'
  }
});