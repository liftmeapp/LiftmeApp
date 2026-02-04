import { useAuth, useOAuth, useSignIn } from '@clerk/clerk-expo';
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

export default function SigninScreen() {
  const { signIn, setActive, isLoaded: isSignInLoaded } = useSignIn();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const router = useRouter();
  const auth = useAuth();

  const [signInMethod, setSignInMethod] = useState<'phone' | 'email'>('email');
  // Should default to Email based on "Image 3" input field? 
  // Actually Image 3 shows "Email" and "Password", so I will prioritize Email view style
  // but keep functionality if user mocks it. 
  // The design shows specific fields: Email, Password. 
  // Let's stick to Email as default or just show Email field.
  // The code supported toggling. I'll keep the toggling but style it better or just default to Email if that matches the design better.
  // Design shows: "Email" label/placeholder. So I will default to email.

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState('');
  const phoneInputRef = useRef<PhoneInput>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useWarmUpBrowser();

  const onGoogleSignInPress = useCallback(async () => {
    if (!isSignInLoaded) return;
    setIsGoogleLoading(true);
    try {
      const redirectUrl = Linking.createURL('/oauth-native-callback');
      const oauthResult = await startOAuthFlow({ redirectUrl });
      const { createdSessionId, setActive: oauthSetActive, signUp: oauthSignUpResource, signIn: oauthSignInResource } = oauthResult;

      if (createdSessionId) {
        await setActive({ session: createdSessionId });
        return;
      }
      if (oauthSignInResource?.status === 'complete' && oauthSignInResource.createdSessionId) {
        await setActive({ session: oauthSignInResource.createdSessionId });
        return;
      }
      if (oauthSignUpResource?.status === 'complete' && oauthSignUpResource.createdSessionId) {
        await setActive({ session: oauthSignUpResource.createdSessionId });
        return;
      } else if (oauthSignUpResource?.status === 'missing_requirements') {
        router.replace({ pathname: '/(auth)/complete-profile', params: { flow: 'oauth_missing_requirements' } });
        return;
      }
      if (oauthResult.authSessionResult?.type === 'cancel') return;
      Alert.alert('Sign-In Failed', 'Could not complete Google Sign-In.');
    } catch (err: any) {
      if (err.code !== 'USER_CANCELLED') {
        const firstError = err.errors?.[0];
        Alert.alert('Error', firstError?.longMessage || 'An unexpected error occurred.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  }, [isSignInLoaded, startOAuthFlow, setActive, router]);

  const onSignInPress = async () => {
    if (auth.isSignedIn) {
      router.replace('/(root)/(tabs)/home');
      return;
    }
    if (!isSignInLoaded) return;

    const identifier = signInMethod === 'email' ? email : formattedPhoneNumber;
    if (!identifier || !password) {
      Alert.alert('Error', 'Please enter your credentials.');
      return;
    }
    setIsLoading(true);
    try {
      const signInAttempt = await signIn.create({ identifier, password });
      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
      } else {
        Alert.alert('Sign In Failed', `Status: ${signInAttempt.status}.`);
      }
    } catch (err: any) {
      const firstError = err.errors?.[0];
      Alert.alert('Sign In Error', firstError?.longMessage || 'Invalid credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleMethod = () => {
    setSignInMethod(prev => prev === 'phone' ? 'email' : 'phone');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>

          <View style={styles.headerContainer}>
            <View style={styles.logoContainer}>
              <Image source={require('@/assets/icons/Liftme App icon black.png')} style={styles.logoImage} />
            </View>

            <Text style={styles.heroText}>We’re here whenever you need us</Text>
          </View>

          <Text style={styles.welcomeText}>Welcome Back</Text>

          <View style={styles.formContainer}>
            {signInMethod === 'phone' ? (
              <PhoneInput
                ref={phoneInputRef}
                value={phoneNumber}
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
              />
            ) : (
              <TextInput
                style={styles.inputField}
                autoCapitalize="none"
                value={email}
                placeholder="Email"
                onChangeText={setEmail}
                keyboardType="email-address"
                placeholderTextColor="rgba(255,255,255,0.7)"
              />
            )}

            <TextInput
              style={styles.inputField}
              value={password}
              placeholder="Password*"
              secureTextEntry={true}
              onChangeText={setPassword}
              placeholderTextColor="rgba(255,255,255,0.7)"
            />

            <View style={styles.forgotPasswordContainer}>
              <Link href="/(auth)/reset-password" asChild>
                <TouchableOpacity>
                  <Text style={styles.forgotPasswordText}>Forgot Password*</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={onSignInPress} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#005C70" /> : <Text style={styles.buttonText}>Log In</Text>}
          </TouchableOpacity>

          <View style={styles.orContainer}>
            <View style={styles.divider} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity style={styles.googleButton} onPress={onGoogleSignInPress} disabled={isGoogleLoading}>
            {isGoogleLoading ?
              <ActivityIndicator color="#000" /> :
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image source={require('@/assets/icons/google.png')} style={styles.googleIcon} />
                <Text style={styles.googleButtonText}>Log in with Google</Text>
              </View>
            }
          </TouchableOpacity>

          {/* Toggle Method Link (Optional, meant for UX if user prefers Phone) */}
          <TouchableOpacity onPress={handleToggleMethod} style={{ alignSelf: 'center', marginBottom: 20 }}>
            <Text style={styles.toggleMethodText}>
              {signInMethod === 'email' ? 'Use Phone Number instead' : 'Use Email instead'}
            </Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Link href="/(auth)/signup" asChild>
              <TouchableOpacity>
                <Text style={styles.linkText}>Sign Up</Text>
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
  headerContainer: {
    alignItems: 'flex-start', // Left align as per design? Or standard center? Design image 3 has large left aligned text.
    marginBottom: 30,
    marginTop: 20,
  },
  logoContainer: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  logoImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  heroText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'left',
    lineHeight: 46,
  },
  welcomeText: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '600'
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
    marginBottom: 20,
  },
  phoneInputContainer: {
    width: '100%',
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.5)',
    elevation: 0,
    shadowOpacity: 0,
    height: 50,
    marginBottom: 20,
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
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: -10, // Pull closer to password
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 30,
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
  googleButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  googleButtonText: {
    color: '#555',
    fontSize: 16,
    fontWeight: '600',
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
    color: '#2AB5D1',
    fontWeight: 'bold',
    fontSize: 16,
  },
  toggleMethodText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    textDecorationLine: 'underline'
  }
});
""