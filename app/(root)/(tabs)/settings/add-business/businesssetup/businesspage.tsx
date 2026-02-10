//app/(root)/(tabs)/settings/add-business/businesssetup/businesspage.tsx
import RotatingLoader from '@/components/RotatingLoader';
import { useGarageStore } from '@/store/garageStore';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from 'react';
import { Alert, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ScrollView } from 'react-native-gesture-handler';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// ===================================================================
//  TYPE DEFINITIONS & HELPER FUNCTIONS
// ===================================================================

type BusinessStatus = 'SETUP' | 'PENDING' | 'APPROVED' | 'REJECTED';

interface BusinessOptionProps {
    title: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    status: BusinessStatus;
}

// A reusable component for our dashboard/setup links
const BusinessOption = ({ title, description, icon, onPress, status }: BusinessOptionProps) => {

    const getBadgeStyle = () => {
        switch (status) {
            case 'APPROVED': return styles.approvedBadge;
            case 'PENDING': return styles.pendingBadge;
            case 'REJECTED': return styles.rejectedBadge;
            default: return styles.setupBadge; // SETUP
        }
    };
    const getBadgeText = () => {
        switch (status) {
            case 'APPROVED': return 'MANAGE';
            case 'PENDING': return 'UNDER REVIEW';
            case 'REJECTED': return 'REJECTED';
            default: return 'SET UP';
        }
    }

    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <View style={styles.iconContainer}>
                <Ionicons name={icon} size={30} color="#005C70" />
            </View>
            <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>{title}</Text>
                <Text style={styles.cardDescription}>{description}</Text>
            </View>
            <View style={[styles.statusBadge, getBadgeStyle()]}>
                <Text style={styles.statusBadgeText}>{getBadgeText()}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>
    );
};

export default function ServicesHome() {
    const router = useRouter();
    const { getToken } = useAuth();
    const [initialLoading, setInitialLoading] = useState(true); // For the very first load
    const [userBusiness, setUserBusiness] = useState<any>(null);
    const [refreshing, setRefreshing] = useState(false);
    const isFetching = useRef(false);

    // Fetch the user's business data
    const fetchData = useCallback(async () => {
        if (isFetching.current) return;
        isFetching.current = true;
        try {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");
            const response = await fetch(`${API_BASE_URL}/api/users/my-business`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                }
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "Could not load business profile.");
            }
            const data = await response.json();
            setUserBusiness(data);
        } catch (error: any) {
            console.error(error.message);
        } finally {
            isFetching.current = false;
            setInitialLoading(false);
            setRefreshing(false);
        }
    }, []);

    // useFocusEffect will re-fetch data every time the screen comes into view
    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, [fetchData]);


    if (initialLoading) {
        return (
            <View style={styles.centered}>
                <RotatingLoader
                    iconName="navigate-circle-outline"
                    message="Loading Your Business Profile"
                    color="#005C70"
                    size={50}
                />
            </View>
        );
    }

    const handleSetupPress = (setupRoute: string) => {
        Alert.alert(
            "Heads Up!",
            "Once you fill out your business information, it will be submitted for review. This process can take 4-5 business days.",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Continue", onPress: () => router.push(setupRoute as any) }
            ]
        );
    };



    const handleGaragePress = () => {
        const garage = userBusiness?.garage;
        if (!garage) return;

        switch (garage.status) {
            case 'APPROVED':
                router.push({
                    pathname: '/(root)/(tabs)/settings/add-business/garage-dashboard',
                    params: { garageId: garage.id }
                } as any);
                break;
            case 'PENDING':
                Alert.alert(
                    "Verification in Progress",
                    "Your business is under review. Please allow 4-5 business days for verification. We will notify you once it's complete."
                );
                break;
            case 'REJECTED':
                Alert.alert(
                    "Application Rejected",
                    `Your garage application was rejected for the following reason: ${garage.rejectionReason || 'No reason provided.'}`,
                    [
                        { text: "Cancel", style: "cancel" },
                        {
                            text: "Fix Application", onPress: () => {
                                // Seed the store with existing data
                                useGarageStore.getState().setDetails({
                                    name: garage.name,
                                    licenseNumber: garage.licenseNumber,
                                    address: garage.address,
                                    ownerName: garage.ownerName,
                                    numberOfEmployees: garage.numberOfEmployees,
                                    contactEmail: garage.contactEmail,
                                    contactPhone: garage.contactPhone,
                                    operatingHours: garage.operatingHours,
                                    stripeAccountId: garage.razorpayAccountId, // Using the new field mapping if store handles it, or just generic
                                    status: 'PENDING' // Reset status to PENDING so it can be reviewed again
                                });
                                // Seed services if possible, though format might differ. 
                                // Simplified seeding for now as per dashboard logic
                                const services = (garage.services || []).map((s: any) => ({
                                    serviceId: s.service.id,
                                    price: s.price,
                                    garageId: garage.id,
                                    duration: 60
                                }));
                                useGarageStore.getState().setServices(services);
                                useGarageStore.getState().setSupportedVehicleTypes(garage.supportedVehicleTypes || []);

                                if (garage.location?.coordinates) {
                                    useGarageStore.getState().setLocation({
                                        latitude: garage.location.coordinates[1],
                                        longitude: garage.location.coordinates[0]
                                    });
                                }

                                router.push({
                                    pathname: '/settings/add-business/businesssetup/garage-setup/garage-sign',
                                    params: { garageId: garage.id }
                                } as any);
                            }
                        }
                    ]
                );
                break;
            default:
                Alert.alert("Unknown Status", "Your business has an unknown status. Please contact support.");
        }
    };

    const handleTowTruckPress = () => {
        const towTruck = userBusiness?.towTruck;
        if (!towTruck) return;

        switch (towTruck.status) {
            case 'APPROVED':
                router.push({
                    pathname: '/(root)/(tabs)/settings/add-business/tow-truck-dashboard',
                    params: { towTruckId: towTruck.id }
                } as any);
                break;
            case 'PENDING':
                Alert.alert(
                    "Verification in Progress",
                    "Your business is under review. Please allow 4-5 business days for verification."
                );
                break;
            case 'REJECTED':
                Alert.alert(
                    "Application Rejected",
                    `Your tow truck application was rejected for the following reason: ${towTruck.rejectionReason || 'No reason provided.'}`,
                    [
                        { text: "OK", style: "cancel" },
                        {
                            text: "Fix Application", onPress: () => router.push({
                                pathname: '/settings/add-business/businesssetup/edit-tow-truck/edit-tow-truck-details',
                                params: { towTruckId: towTruck.id }
                            } as any)
                        }
                    ]
                );
                break;
            default:
                Alert.alert("Unknown Status", "Your business has an unknown status. Please contact support.");
        }
    };
    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: true, // Let layout handle options, just ensure shown
                }}
            />
            <ScrollView
                style={styles.container}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#005C70" />}
            >
                <View style={styles.header}>
                    <Text style={styles.heading}>Your Business Hub</Text>
                    <Text style={styles.subheading}>Manage your existing services or add new ones.</Text>
                </View>

                {/* Conditional UI for Garage */}
                {userBusiness?.garage ? (
                    <BusinessOption
                        title={userBusiness.garage.name}
                        description="View your garage's status and manage its details."
                        icon="business-outline"
                        onPress={handleGaragePress}
                        status={userBusiness.garage.status || 'PENDING'} // Default to PENDING if status is null
                    />
                ) : (
                    <BusinessOption
                        title="Set Up a Garage"
                        description="List your garage to offer repair, maintenance, and home services."
                        icon="add-circle-outline"
                        onPress={() => handleSetupPress('/(root)/(tabs)/settings/add-business/businesssetup/garage-setup/garage-sign')}
                        status='SETUP'
                    />
                )}

                {/* Conditional UI for Tow Truck */}
                {userBusiness?.towTruck ? (
                    <BusinessOption
                        title={userBusiness.towTruck.name}
                        description="View your tow truck's status and manage its details."
                        icon="car-sport"
                        onPress={handleTowTruckPress}
                        status={userBusiness.towTruck.status || 'PENDING'}
                    />
                ) : (
                    <BusinessOption
                        title="Register a Tow Truck"
                        description="Provide roadside assistance and manage your live location."
                        icon="add-circle-outline"
                        onPress={() => handleSetupPress('/(root)/(tabs)/settings/add-business/businesssetup/towtruck-setup/towtruck-signup')}
                        status='SETUP'
                    />
                )}

                {/* Placeholder for Spare Parts */}
                <BusinessOption
                    title="Spare Part Supply"
                    description="List spare parts for sale to garages and customers."
                    icon="build-outline"
                    onPress={() => router.push('/settings/add-business/businesssetup/spare-part')}
                    status='SETUP'
                />
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    customHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        height: 60,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerBack: {
        padding: 5,
    },
    customHeaderTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    header: {
        padding: 20,
        paddingTop: 40,
        alignItems: 'center',
    },
    heading: {
        fontSize: 26,
        fontWeight: "bold",
        color: '#333',
    },
    subheading: {
        fontSize: 16,
        color: '#777',
        marginTop: 5,
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        marginHorizontal: 15,
        marginVertical: 8,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
        borderLeftWidth: 5,
        borderLeftColor: '#005C70',
    },
    iconContainer: {
        marginRight: 15,
        backgroundColor: '#E0F2F1',
        padding: 12,
        borderRadius: 50,
    },
    cardTextContainer: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#333',
    },
    cardDescription: {
        fontSize: 13,
        color: '#666',
        marginTop: 3,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 15,
        marginRight: 5,
    },
    newBadge: {
        backgroundColor: '#e8f5e9', // Light green
    },
    setupBadge: {
        backgroundColor: '#e3f2fd', // Light blue
    },
    approvedBadge: { backgroundColor: '#e3f2fd', /* Light blue */ },
    pendingBadge: { backgroundColor: '#fff9c4', /* Light yellow */ },
    rejectedBadge: { backgroundColor: '#ffcdd2', /* Light red */ },
    statusBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
});