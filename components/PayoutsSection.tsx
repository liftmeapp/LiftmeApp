import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

interface PayoutsSectionProps {
    providerId: string;
    providerType: 'garage' | 'tow-truck';
    currentAccountId: string | null;
    onRefresh: () => void;
}

interface ReuseOption {
    available: boolean;
    sourceBusinessType?: 'garage' | 'tow-truck';
    sourceBusinessId?: string;
    accountId?: string;
}

export default function PayoutsSection({ providerId, providerType, currentAccountId, onRefresh }: PayoutsSectionProps) {
    const { getToken } = useAuth();
    const getTokenRef = useRef(getToken);
    const [loading, setLoading] = useState(false);
    const [reuseLoading, setReuseLoading] = useState(false);
    const [reuseOption, setReuseOption] = useState<ReuseOption | null>(null);

    // Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [contact, setContact] = useState('');
    const [accountType, setAccountType] = useState<'bank_account' | 'vpa'>('bank_account');

    // Bank Details
    const [ifsc, setIfsc] = useState('');
    const [accountNumber, setAccountNumber] = useState('');

    // VPA Details
    const [vpa, setVpa] = useState('');

    useEffect(() => {
        getTokenRef.current = getToken;
    }, [getToken]);

    useEffect(() => {
        if (currentAccountId) {
            setReuseOption(null);
            setReuseLoading(false);
            return;
        }

        let isActive = true;
        const fetchReuseOption = async () => {
            setReuseLoading(true);
            try {
                const token = await getTokenRef.current();
                const params = new URLSearchParams({
                    businessType: providerType,
                    businessId: providerId,
                });
                const response = await fetch(`${API_BASE_URL}/api/razorpay/reuse-account-option?${params.toString()}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Failed to load reusable payout option.');
                if (isActive) setReuseOption(data);
            } catch {
                if (isActive) setReuseOption(null);
            } finally {
                if (isActive) setReuseLoading(false);
            }
        };

        fetchReuseOption();
        return () => {
            isActive = false;
        };
    }, [currentAccountId, providerId, providerType]);

    const handleLinkAccount = async () => {
        if (!name || !email || !contact) {
            Alert.alert('Missing Fields', 'Please fill in Name, Email, and Contact Number.');
            return;
        }

        if (accountType === 'bank_account' && (!ifsc || !accountNumber)) {
            Alert.alert('Missing Fields', 'Please provide IFSC and Account Number.');
            return;
        }

        if (accountType === 'vpa' && !vpa) {
            Alert.alert('Missing Fields', 'Please provide a valid VPA (UPI ID).');
            return;
        }

        setLoading(true);
        try {
            const token = await getTokenRef.current();
            const payload = {
                businessType: providerType === 'tow-truck' ? 'tow-truck' : 'garage', // key mismatch fix if needed
                businessId: providerId,
                accountDetails: {
                    name,
                    email,
                    contact,
                    ...(accountType === 'bank_account' ? { ifsc, accountNumber } : { vpa })
                }
            };

            const response = await fetch(`${API_BASE_URL}/api/razorpay/create-account`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to link account.');

            Alert.alert('Success', 'Payout account linked successfully!');
            onRefresh();

        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDisconnect = async () => {
        Alert.alert(
            'Disconnect Account',
            'Are you sure you want to disconnect your payout account? You will stop receiving payments until you link a new one.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Disconnect',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            const token = await getTokenRef.current();
                            const response = await fetch(`${API_BASE_URL}/api/razorpay/disconnect-account`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify({
                                    businessType: providerType === 'tow-truck' ? 'tow-truck' : 'garage'
                                })
                            });

                            const data = await response.json();
                            if (!response.ok) throw new Error(data.error || 'Failed to disconnect account.');

                            Alert.alert('Disconnected', 'Your payout account has been removed.');
                            onRefresh();
                        } catch (error: any) {
                            Alert.alert('Error', error.message);
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleUseExistingAccount = async () => {
        if (!reuseOption?.available || !reuseOption.sourceBusinessId || !reuseOption.sourceBusinessType) return;

        setLoading(true);
        try {
            const token = await getTokenRef.current();
            const response = await fetch(`${API_BASE_URL}/api/razorpay/link-existing-account`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    targetBusinessType: providerType,
                    targetBusinessId: providerId,
                    sourceBusinessType: reuseOption.sourceBusinessType,
                    sourceBusinessId: reuseOption.sourceBusinessId,
                })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to link existing payout account.');

            Alert.alert('Success', 'Existing payout account linked successfully.');
            onRefresh();
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    if (currentAccountId) {
        return (
            <View style={styles.container}>
                <Text style={styles.sectionTitle}>Payout Settings</Text>
                <View style={styles.activeCard}>
                    <View style={styles.activeHeader}>
                        <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                        <Text style={styles.activeTitle}>Payouts Active</Text>
                    </View>
                    <Text style={styles.activeText}>
                        Your account is linked with Razorpay Route. Payments will be automatically settled to your account.
                    </Text>
                    <Text style={styles.accountId}>Account ID: {currentAccountId}</Text>

                    <TouchableOpacity
                        style={styles.disconnectButton}
                        onPress={handleDisconnect}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.disconnectButtonText}>Disconnect Account</Text>}
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Setup Payouts</Text>
            <Text style={styles.subtitle}>Link your bank account or UPI to receive payments directly.</Text>

            {reuseLoading ? (
                <View style={styles.reuseCard}>
                    <ActivityIndicator color="#231F7C" />
                    <Text style={styles.reuseText}>Checking existing payout setup...</Text>
                </View>
            ) : reuseOption?.available ? (
                <View style={styles.reuseCard}>
                    <View style={styles.reuseHeader}>
                        <Ionicons name="swap-horizontal-outline" size={20} color="#005C70" />
                        <Text style={styles.reuseTitle}>Use existing payout account</Text>
                    </View>
                    <Text style={styles.reuseText}>
                        Reuse payout from your {reuseOption.sourceBusinessType === 'garage' ? 'garage' : 'tow truck'} profile.
                    </Text>
                    <Text style={styles.accountId}>Account ID: {reuseOption.accountId}</Text>
                    <TouchableOpacity
                        style={styles.reuseButton}
                        onPress={handleUseExistingAccount}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.reuseButtonText}>Use This Account</Text>}
                    </TouchableOpacity>
                </View>
            ) : null}

            <View style={styles.form}>
                <Text style={styles.label}>Account Holder Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. John Doe"
                    value={name}
                    onChangeText={setName}
                />

                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. john@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                />

                <Text style={styles.label}>Contact Number</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. 9876543210"
                    keyboardType="phone-pad"
                    value={contact}
                    onChangeText={setContact}
                />

                <Text style={styles.label}>Payout Method</Text>
                <View style={styles.radioGroup}>
                    <TouchableOpacity
                        style={[styles.radioButton, accountType === 'bank_account' && styles.radioButtonActive]}
                        onPress={() => setAccountType('bank_account')}
                    >
                        <Ionicons name={accountType === 'bank_account' ? "radio-button-on" : "radio-button-off"} size={20} color={accountType === 'bank_account' ? "#231F7C" : "#666"} />
                        <Text style={[styles.radioText, accountType === 'bank_account' && styles.radioTextActive]}>Bank Account</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.radioButton, accountType === 'vpa' && styles.radioButtonActive]}
                        onPress={() => setAccountType('vpa')}
                    >
                        <Ionicons name={accountType === 'vpa' ? "radio-button-on" : "radio-button-off"} size={20} color={accountType === 'vpa' ? "#231F7C" : "#666"} />
                        <Text style={[styles.radioText, accountType === 'vpa' && styles.radioTextActive]}>UPI (VPA)</Text>
                    </TouchableOpacity>
                </View>

                {accountType === 'bank_account' ? (
                    <>
                        <Text style={styles.label}>IFSC Code</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. HDFC0001234"
                            autoCapitalize="characters"
                            value={ifsc}
                            onChangeText={setIfsc}
                        />

                        <Text style={styles.label}>Account Number</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. 1234567890"
                            keyboardType="number-pad"
                            value={accountNumber}
                            onChangeText={setAccountNumber}
                        />
                    </>
                ) : (
                    <>
                        <Text style={styles.label}>UPI ID (VPA)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. john@upi"
                            autoCapitalize="none"
                            value={vpa}
                            onChangeText={setVpa}
                        />
                    </>
                )}

                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleLinkAccount}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Link Payout Account</Text>}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
    },
    activeCard: {
        backgroundColor: '#F0F9F4',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#C3E6CB',
    },
    activeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    activeTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2E7D32',
        marginLeft: 8,
    },
    activeText: {
        fontSize: 14,
        color: '#444',
        marginBottom: 8,
        lineHeight: 20,
    },
    accountId: {
        fontSize: 12,
        color: '#666',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        marginBottom: 16,
    },
    disconnectButton: {
        backgroundColor: '#FFEBEE',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FFCDD2',
    },
    disconnectButtonText: {
        color: '#D32F2F',
        fontWeight: '600',
    },
    form: {
        marginTop: 10,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#444',
        marginBottom: 6,
        marginTop: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        color: '#333',
        backgroundColor: '#FAFAFA',
    },
    radioGroup: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    radioButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
        paddingVertical: 8,
    },
    radioButtonActive: {
        opacity: 1,
    },
    radioText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#666',
    },
    radioTextActive: {
        color: '#231F7C',
        fontWeight: '600',
    },
    submitButton: {
        backgroundColor: '#231F7C',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 24,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    reuseCard: {
        backgroundColor: '#E9F7FA',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#BDE6ED',
        padding: 12,
        marginBottom: 14,
        gap: 8,
    },
    reuseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    reuseTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#005C70',
    },
    reuseText: {
        fontSize: 13,
        color: '#335',
    },
    reuseButton: {
        backgroundColor: '#005C70',
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: 'center',
    },
    reuseButtonText: {
        color: '#fff',
        fontWeight: '700',
    },
});
