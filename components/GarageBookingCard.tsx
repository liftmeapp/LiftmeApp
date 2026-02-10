import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const GarageBookingCard = ({ booking, onPress, currentTab }: { booking: any, onPress: (booking: any) => void, currentTab: 'Pending' | 'Current' | 'History' }) => {
    const getBadge = () => {
        if (booking.bookingType === 'TOW_TO_GARAGE') {
            if (booking.subStatus === 'AWAITING_TOW_TRUCK_ACCEPTANCE') return <View style={[styles.badge, styles.badgeWaiting]}><Text style={styles.badgeText}>VEHICLE INCOMING</Text></View>;
            if (booking.subStatus === 'AWAITING_GARAGE_QUOTE') return <View style={[styles.badge, styles.badgeReceived]}><Text style={styles.badgeText}>VEHICLE RECEIVED</Text></View>;
            if (booking.subStatus === 'AWAITING_QUOTE_APPROVAL') return <View style={[styles.badge, styles.badgeWaiting]}><Text style={styles.badgeText}>QUOTE PENDING</Text></View>;
            if (booking.subStatus === 'AWAITING_FINAL_APPROVAL') return <View style={[styles.badge, styles.badgeWaiting]}><Text style={styles.badgeText}>FINAL PENDING</Text></View>;
            if (booking.subStatus === 'QUOTE_REJECTED') return <View style={[styles.badge, styles.badgeRejected]}><Text style={styles.badgeText}>EST. REJECTED</Text></View>;
        }
        return null;
    };

    return (
        <TouchableOpacity style={styles.bookingCard} onPress={() => onPress(booking)} activeOpacity={0.9}>
            {getBadge()}

            <View style={styles.bookingHeader}>
                <Text style={styles.bookingDate}>
                    {new Date(booking.bookedAt).toLocaleDateString()} • {new Date(booking.bookedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                <Text style={styles.bookingPrice}>
                    {booking.finalAmount
                        ? `INR ${booking.finalAmount.toFixed(2)}`
                        : (booking.jobEstimate
                            ? `~ INR ${booking.jobEstimate}`
                            : (booking.service?.price
                                ? `Base: INR ${booking.service.price}`
                                : 'Pending Quote'))}
                </Text>
            </View>

            <View style={styles.bookingDetails}>
                <View style={styles.serviceIconContainer}>
                    <Ionicons name="car-sport" size={24} color="#005C70" />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.customerName}>{booking.user.firstName} {booking.user.lastName}</Text>
                    <Text style={styles.vehicleInfo}>{booking.vehicle.brand} {booking.vehicle.name} • {booking.vehicle.plateNumber}</Text>
                    <Text style={[styles.bookingText, { marginLeft: 0, marginTop: 4, color: '#555' }]}>
                        {booking.service?.name || 'Tow-to-Garage Service'}
                    </Text>
                    {booking.distance && (
                        <Text style={[styles.bookingText, { marginTop: 2 }]}>
                            <Text style={{ fontWeight: '600' }}>Distance:</Text> {booking.distance.toFixed(1)} km
                        </Text>
                    )}
                    {booking.pickupLocation?.description && (
                        <Text style={[styles.bookingText, { marginTop: 2 }]} numberOfLines={1}>
                            <Text style={{ fontWeight: '600' }}>Location:</Text> {booking.pickupLocation.description}
                        </Text>
                    )}
                </View>
                <Ionicons name="chevron-forward-circle" size={24} color="#ccc" />
            </View>

            {/* Action Hint */}
            <View style={{ marginTop: 10, alignItems: 'center' }}>
                <Text style={{ color: '#005C70', fontSize: 12, fontWeight: '600' }}>Tap to view details & actions</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    bookingCard: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 20,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2
    },
    bookingHeader: { marginBottom: 12 },
    bookingDate: { fontSize: 12, color: '#999', fontWeight: '500' },
    bookingPrice: { fontSize: 18, fontWeight: '700', color: '#333', marginTop: 4 },
    bookingDetails: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    serviceIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: '#e0f2f1', // Light teal
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    customerName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2c3e50',
        marginBottom: 4,
    },
    vehicleInfo: {
        fontSize: 15,
        color: '#7f8c8d',
        fontWeight: '500'
    },
    bookingText: { fontSize: 13, color: '#555' },
    badge: {
        position: 'absolute',
        top: 0,
        right: 0,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 20, // Match card corner
        borderBottomLeftRadius: 8,
        zIndex: 1
    },
    badgeWaiting: {
        backgroundColor: '#f39c12',
    },
    badgeReceived: {
        backgroundColor: '#27ae60',
    },
    badgeRejected: {
        backgroundColor: '#c0392b',
    },
    badgeText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 0.5
    },
});

export default GarageBookingCard;
