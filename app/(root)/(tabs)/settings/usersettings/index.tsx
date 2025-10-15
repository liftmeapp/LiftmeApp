import { useAuth, useUser } from '@clerk/clerk-expo';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

type ModalType = 'email' | 'phone' | null;

const ManagementModal = ({ visible, type, onClose }: { visible: boolean; type: ModalType; onClose: () => void } ) => {
  const [value, setValue] = useState('');
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verification, setVerification] = useState<any>(null);
  const { user } = useUser();

  useEffect(() => {
    if (!visible) {
      setValue('');
      setCode('');
      setVerification(null);
    }
  }, [visible]);

  const onAdd = async () => {
    setIsSubmitting(true);
    try {
      let created;
      if (type === 'email') {
        if (!value) { Alert.alert('Please enter an email address.'); return; }
        created = await user?.createEmailAddress({ email: value });
        await created?.prepareVerification({ strategy: 'email_code' });
      } else {
        if (!value) { Alert.alert('Please enter a phone number.'); return; }
        created = await user?.createPhoneNumber({ phoneNumber: value });
        await created?.prepareVerification();
      }
      setVerification(created);
      Alert.alert('Verification Code Sent', `A verification code has been sent to your new ${type}.`);
    } catch (err: any) {
      Alert.alert('Error', err.errors?.[0]?.message || `Failed to add ${type}.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onVerify = async () => {
    if (!code) { Alert.alert('Please enter the verification code.'); return; }
    setIsSubmitting(true);
    try {
      const result = await verification.attemptVerification({ code });
      if (result.status === 'complete') {
        await user?.reload();
        await result.setAsPrimary();
        Alert.alert('Success', `${type === 'email' ? 'Email' : 'Phone number'} verified and updated successfully.`);
        onClose();
      }
    } catch (err: any) {
      Alert.alert('Error', err.errors?.[0]?.message || `Failed to verify ${type}.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} onRequestClose={onClose} transparent animationType="slide">
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text>Close</Text>
          </TouchableOpacity>
          {!verification ? (
            <>
              <Text style={styles.modalTitle}>{`Add New ${type === 'email' ? 'Email' : 'Phone Number'}`}</Text>
              <TextInput style={styles.input} placeholder={type === 'email' ? 'Email Address' : 'Phone Number'} value={value} onChangeText={setValue} keyboardType={type === 'email' ? 'email-address' : 'phone-pad'} />
              <TouchableOpacity style={styles.modalButton} onPress={onAdd} disabled={isSubmitting}>
                {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalButtonText}>Send Verification Code</Text>}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.modalTitle}>{`Verify ${type === 'email' ? 'Email' : 'Phone'}`}</Text>
              <Text style={styles.modalSubtitle}>A code has been sent to {value}.</Text>
              <TextInput style={styles.input} placeholder="Verification Code" value={code} onChangeText={setCode} keyboardType="numeric" />
              <TouchableOpacity style={styles.modalButton} onPress={onVerify} disabled={isSubmitting}>
                {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalButtonText}>Verify and Set as Primary</Text>}
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const UserSettingsScreen = () => {
  const { user, isLoaded } = useUser();
  const { getToken, signOut } = useAuth();
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<ModalType>(null);

  useEffect(() => {
    const fetchUserDataFromDb = async () => {
      if (!isLoaded || !user) {
        setIsLoadingProfile(false);
        return;
      }
      setIsLoadingProfile(true);
      try {
        const token = await getToken();
        if (!token) throw new Error("No auth token");

        const response = await fetch(`${API_BASE_URL}/api/users/me`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch from DB");
        
        const dbUser = await response.json();
        setFirstName(dbUser.firstName || '');
        setLastName(dbUser.lastName || '');

      } catch (e) {
        console.error("Error fetching user profile from DB:", e);
        // If DB fails, fall back to Clerk data
        setFirstName(user.firstName || '');
        setLastName(user.lastName || '');
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserDataFromDb();
  }, [isLoaded, user]);

  const onSaveName = async () => {
    if (!firstName) { Alert.alert('First name is required.'); return; }
    setIsSaving(true);
    try {
      const updateData: { firstName: string; lastName?: string } = { firstName };
      if (lastName) {
        updateData.lastName = lastName;
      }
      await user?.update(updateData);
      Alert.alert('Success', 'Your profile has been updated.');
    } catch (error: any) {
      const errorMessage = error.errors?.[0]?.longMessage || error.errors?.[0]?.message || 'An unknown error occurred while updating your profile.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const onDeleteAccount = async () => {
    Alert.alert(
      "Delete Account",
      "Are you absolutely sure? This action is irreversible and will permanently delete your account and all associated data.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await getToken();
              const response = await fetch(`${API_BASE_URL}/api/users/me`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
              });

              if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: "Failed to delete account." }));
                throw new Error(errorData.error);
              }

              await signOut();
              router.replace('/(auth)/signin');
              Alert.alert("Account Deleted", "Your account has been successfully deleted.");

            } catch (error: any) {
              Alert.alert("Error", error.message);
            }
          },
        },
      ]
    );
  };

  const openModal = (type: ModalType) => {
    setModalType(type);
    setModalVisible(true);
  };

  if (!isLoaded) {
    return <ActivityIndicator style={{ flex: 1 }} />;
  }

  const primaryEmail = user?.primaryEmailAddress?.emailAddress;
  const primaryPhone = user?.primaryPhoneNumber?.phoneNumber;

  return (
    <>
      <ScrollView style={styles.container}>
        <Stack.Screen options={{ title: 'Profile Settings' }} />
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          {isLoadingProfile ? (
            <ActivityIndicator style={{ marginVertical: 20 }} />
          ) : (
            <>
              <TextInput style={styles.input} placeholder="First Name" value={firstName} onChangeText={setFirstName} />
              <TextInput style={styles.input} placeholder="Last Name" value={lastName} onChangeText={setLastName} />
              <TouchableOpacity style={styles.saveButton} onPress={onSaveName} disabled={isSaving}>
                {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Update Name</Text>}
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Email Address</Text>
          <View style={styles.infoRow}>
            <Text>{primaryEmail || 'No email address'}</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={() => openModal('email')}>
            <Text style={styles.addButtonText}>{primaryEmail ? 'Update Email' : 'Add Email'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phone Number</Text>
          <View style={styles.infoRow}>
            <Text>{primaryPhone || 'No phone number'}</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={() => openModal('phone')}>
            <Text style={styles.addButtonText}>{primaryPhone ? 'Update Phone Number' : 'Add Phone Number'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.deleteButton} onPress={onDeleteAccount}>
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <ManagementModal 
        visible={modalVisible}
        type={modalType}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f2', padding: 20 },
  section: { backgroundColor: '#fff', padding: 20, borderRadius: 10, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 15, borderRadius: 8, marginBottom: 15, fontSize: 16 },
  saveButton: { backgroundColor: '#007BFF', padding: 15, borderRadius: 8, alignItems: 'center' },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  addButton: { backgroundColor: '#28a745', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 10, width: '90%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  modalSubtitle: { fontSize: 14, color: '#666', marginBottom: 15 },
  modalButton: { backgroundColor: '#007BFF', padding: 15, borderRadius: 8, alignItems: 'center' },
  modalButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  closeButton: { alignSelf: 'flex-end', marginBottom: 10 },
  deleteButton: {
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default UserSettingsScreen;
