import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

type ModalType = 'email' | 'phone' | null;

const ManagementModal = ({ visible, type, onClose }: { visible: boolean; type: ModalType; onClose: () => void }) => {
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
      <View style={modalStyles.modalBackdrop}>
        <View style={modalStyles.modalContent}>
          <TouchableOpacity style={modalStyles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          {!verification ? (
            <>
              <Text style={modalStyles.modalTitle}>{`Add New ${type === 'email' ? 'Email' : 'Phone Number'}`}</Text>
              <TextInput style={modalStyles.input} placeholder={type === 'email' ? 'Email Address' : 'Phone Number'} value={value} onChangeText={setValue} keyboardType={type === 'email' ? 'email-address' : 'phone-pad'} autoCapitalize="none" />
              <TouchableOpacity style={modalStyles.modalButton} onPress={onAdd} disabled={isSubmitting}>
                {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={modalStyles.modalButtonText}>Send Verification Code</Text>}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={modalStyles.modalTitle}>{`Verify ${type === 'email' ? 'Email' : 'Phone'}`}</Text>
              <Text style={modalStyles.modalSubtitle}>A code has been sent to {value}.</Text>
              <TextInput style={modalStyles.input} placeholder="Verification Code" value={code} onChangeText={setCode} keyboardType="numeric" />
              <TouchableOpacity style={modalStyles.modalButton} onPress={onVerify} disabled={isSubmitting}>
                {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={modalStyles.modalButtonText}>Verify and Set as Primary</Text>}
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
  const [initialFirstName, setInitialFirstName] = useState('');
  const [initialLastName, setInitialLastName] = useState('');

  const [isEditingFirst, setIsEditingFirst] = useState(false);
  const [isEditingLast, setIsEditingLast] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<ModalType>(null);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setInitialFirstName(user.firstName || '');
      setInitialLastName(user.lastName || '');
    }
  }, [user]);

  const hasChanges = firstName !== initialFirstName || lastName !== initialLastName;

  const onSaveName = async () => {
    if (!hasChanges) return;
    if (!firstName.trim()) { Alert.alert('First name is required.'); return; }

    setIsSaving(true);
    try {
      const updateData: { firstName?: string; lastName?: string | null } = {};
      if (firstName !== initialFirstName) updateData.firstName = firstName || '';
      if (lastName !== initialLastName) updateData.lastName = lastName || null;

      await user?.update(updateData);
      await user?.reload();

      if (updateData.firstName) setInitialFirstName(updateData.firstName);
      if (updateData.lastName !== undefined) setInitialLastName(updateData.lastName || '');

      setIsEditingFirst(false);
      setIsEditingLast(false);

      Alert.alert('Success', 'Your profile has been updated.');
    } catch (error: any) {
      Alert.alert('Error', error.errors?.[0]?.message || 'An unknown error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  const onDeleteAccount = async () => {
    Alert.alert(
      "Delete Account",
      "Are you absolutely sure? This action is irreversible.",
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
              if (!response.ok) throw new Error("Failed to delete account.");
              await signOut();
              router.replace('/(auth)/signin');
              Alert.alert("Account Deleted", "Your account has been deleted.");
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

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(root)/(tabs)/settings');
    }
  };

  if (!isLoaded) return <ActivityIndicator style={{ flex: 1, marginTop: 50 }} />;

  const primaryEmail = user?.primaryEmailAddress?.emailAddress;
  const primaryPhone = user?.primaryPhoneNumber?.phoneNumber;

  return (
    <View style={styles.safeArea}>
      <Stack.Screen
        options={{
          title: 'User Settings',
          headerShown: true,
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: '#e0e0e0' },
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity onPress={handleBack} style={{ marginLeft: 10 }}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Personal Information</Text>
          <View style={styles.divider} />

          {/* First Name */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>First Name</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.valueInput, isEditingFirst && styles.editableInput]}
                value={firstName}
                onChangeText={setFirstName}
                editable={isEditingFirst}
                autoFocus={isEditingFirst}
              />
              <TouchableOpacity
                style={styles.editIcon}
                onPress={() => setIsEditingFirst(!isEditingFirst)}
              >
                <Ionicons name={isEditingFirst ? "checkmark" : "pencil"} size={16} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Last Name */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Last Name</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.valueInput, isEditingLast && styles.editableInput]}
                value={lastName}
                onChangeText={setLastName}
                editable={isEditingLast}
              />
              <TouchableOpacity
                style={styles.editIcon}
                onPress={() => setIsEditingLast(!isEditingLast)}
              >
                <Ionicons name={isEditingLast ? "checkmark" : "pencil"} size={16} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Email */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputRow}>
              <Text style={styles.valueText}>{primaryEmail || 'Add Email'}</Text>
              <TouchableOpacity style={styles.editIcon} onPress={() => openModal('email')}>
                <Ionicons name="pencil" size={16} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Phone */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputRow}>
              <Text style={styles.valueText}>{primaryPhone || 'Add Phone'}</Text>
              <TouchableOpacity style={styles.editIcon} onPress={() => openModal('phone')}>
                <Ionicons name="pencil" size={16} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Update Button */}
          <TouchableOpacity
            style={[styles.updateButton, !hasChanges && styles.disabledButton]}
            onPress={onSaveName}
            disabled={isSaving || !hasChanges}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.updateButtonText}>Update Details</Text>
            )}
          </TouchableOpacity>

          {/* Delete Button (Separate) */}
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
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#e0e0e0' },
  container: { padding: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#005C70', // Teal
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginBottom: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 40,
  },
  valueInput: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  editableInput: {
    borderBottomColor: '#005C70', // Show underline when editable
    color: '#000',
  },
  valueText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  editIcon: {
    backgroundColor: '#e0e0e0',
    padding: 8,
    borderRadius: 8,
    marginLeft: 10,
  },
  updateButton: {
    backgroundColor: '#74B768', // Green
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#A8D5A0', // Lighter Green/Gray for disabled
    opacity: 0.7,
  },
  updateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#FF7F50', // Orange
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

const modalStyles = StyleSheet.create({
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 20, width: '90%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  modalSubtitle: { fontSize: 14, color: '#666', marginBottom: 15, textAlign: 'center' },
  modalButton: { backgroundColor: '#005C70', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 15 },
  modalButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  closeButton: { alignSelf: 'flex-end' },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    fontSize: 16
  },
});

export default UserSettingsScreen;
