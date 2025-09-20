// app/(auth)/reset-password.tsx
import { useSignIn } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import PhoneInput from 'react-native-phone-number-input';

export default function ForgotPasswordScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  
  const [successfulCreation, setSuccessfulCreation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signInMethod, setSignInMethod] = useState<'phone' | 'email'>('email');

  // Request password reset code
  const onRequestReset = async () => {
    if (!isLoaded || !signIn) return;
    setLoading(true);

    try {
      if (signInMethod === 'email') {
        // For email, use email_link strategy
        await signIn.create({
          strategy: 'email_link',
          identifier: emailAddress,
        });
      } else {
        // For phone, use reset_password_phone_code strategy
        await signIn.create({
          strategy: 'reset_password_phone_code',
          identifier: formattedPhoneNumber,
        });
      }
      setSuccessfulCreation(true);
    } catch (err: any) {
      const firstError = err.errors?.[0];
      Alert.alert('Error', firstError?.longMessage || 'Failed to start password reset.');
      console.error('Forgot Password Error:', JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  };

  // Verify the code and set the new password
  const onReset = async () => {
    if (!isLoaded || !signIn) return;
    setLoading(true);

    try {
      // Attempt to reset the password using the code and new password
      const result = await signIn.attemptFirstFactor({
        strategy: signInMethod === 'email' ? 'reset_password_email_code' : 'reset_password_phone_code',
        code,
        password,
      });

      // The password has been reset, so the sign-in is complete
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        Alert.alert('Success', 'Your password has been reset successfully.');
        router.replace('/(root)/(tabs)/home');
      } else {
        console.log('Reset password status was not complete:', result);
      }
    } catch (err: any) {
      const firstError = err.errors?.[0];
      Alert.alert('Error', firstError?.longMessage || 'Failed to reset password.');
      console.error('Reset Password Error:', JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const onResetPassword = async () => {
    if (!isLoaded || !signIn) return;
    
    // Validate inputs
    if (!code) {
      Alert.alert('Error', 'Please enter the verification code.');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      // First, attempt to verify the OTP
      try {
        const verification = await signIn.attemptFirstFactor({
          strategy: signInMethod === 'email' ? 'reset_password_email_code' : 'reset_password_phone_code',
          code,
        });

        if (verification.status === 'needs_new_password') {
          // If OTP is valid, proceed with password reset
          const result = await signIn.resetPassword({
            password,
          });

          if (result.status === 'complete') {
            await setActive({ session: result.createdSessionId });
            Alert.alert('Success', 'Password reset successfully! You are now signed in.');
            router.replace('/(root)/(tabs)/home');
            return;
          }
        }
        
        // If we get here, something unexpected happened
        console.error('Unexpected status after verification:', verification.status);
        Alert.alert('Error', 'Failed to complete password reset. Please try again.');
        
      } catch (verificationError: any) {
        console.error('Verification Error:', JSON.stringify(verificationError, null, 2));
        const firstError = verificationError.errors?.[0];
        
        if (firstError?.code === 'form_identifier_not_found') {
          Alert.alert('Error', 'The provided code is invalid or has expired.');
        } else if (firstError?.code === 'form_code_incorrect') {
          Alert.alert('Error', 'Incorrect verification code. Please try again.');
        } else {
          Alert.alert('Error', firstError?.longMessage || 'Failed to verify code. Please try again.');
        }
      }
    } catch (err: any) {
      console.error('Reset Password Error:', JSON.stringify(err, null, 2));
      const firstError = err.errors?.[0];
      Alert.alert('Error', firstError?.longMessage || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleToggleMethod = () => {
    setEmailAddress('');
    setPhoneNumber('');
    setFormattedPhoneNumber('');
    setSuccessfulCreation(false); // Reset flow
    setSignInMethod(prev => prev === 'phone' ? 'email' : 'phone');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Reset Password</Text>

      {!successfulCreation && (
        <>
          <Text style={styles.subHeader}>Enter your {signInMethod === 'email' ? 'email address' : 'phone number'} to receive a reset code.</Text>
          {signInMethod === 'email' ? (
            <TextInput style={styles.inputField} autoCapitalize="none" value={emailAddress} placeholder="Email Address" onChangeText={setEmailAddress} keyboardType="email-address" />
          ) : (
            <PhoneInput
              value={phoneNumber}
              defaultCode="IN"
              layout="first"
              onChangeText={setPhoneNumber}
              onChangeFormattedText={setFormattedPhoneNumber}
              containerStyle={styles.phoneInputContainer}
              textContainerStyle={styles.phoneInputTextContainer}
            />
          )}
          <TouchableOpacity style={styles.toggleButton} onPress={handleToggleMethod}>
            <Text style={styles.linkText}>{signInMethod === 'phone' ? 'Use Email Instead' : 'Use Phone Instead'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={onRequestReset} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send Reset Code</Text>}
          </TouchableOpacity>
        </>
      )}

      {successfulCreation && (
        <>
          <Text style={styles.subHeader}>Enter the verification code and your new password.</Text>
          <TextInput style={styles.inputField} value={code} placeholder="Verification Code" keyboardType="number-pad" onChangeText={setCode} />
          <TextInput 
            style={styles.inputField} 
            value={password} 
            placeholder="New password" 
            secureTextEntry 
            onChangeText={setPassword} 
          />
          <TextInput 
            style={styles.inputField} 
            value={confirmPassword} 
            placeholder="Confirm new password" 
            secureTextEntry 
            onChangeText={setConfirmPassword} 
          />
          <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={onResetPassword} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Set new password</Text>}
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.linkText}>Back to Sign In</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  subHeader: { fontSize: 16, textAlign: 'center', marginBottom: 20, color: '#555' },
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
  linkText: { color: '#b95528', fontWeight: 'bold', fontSize: 15, alignSelf: 'center' },
  backButton: { marginTop: 20 },
});
