import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const TowTruckBookingCard = ({ booking, onPress }: { booking: any, onPress: (booking: any) => void }) => {
    return (
        <TouchableOpacity style={styles.bookingCard} onPress={() => onPress(booking)} activeOpacity={0.9}>
            <View style={[styles.badge,
            booking.status === 'SEARCHING' ? styles.badgePending :
                booking.status === 'CONFIRMED' ? styles.badgeActive :
                    booking.status === 'IN_PROGRESS' ? styles.badgeActive : styles.badgeCompleted
            ]}>
                <Text style={styles.badgeText}>{booking.status.replace(/_/g, ' ')}</Text>
            </View>

            <View style={styles.bookingHeader}>
                <View>
                    <Text style={styles.bookingDate}>{new Date(booking.bookedAt).toLocaleDateString()} • {new Date(booking.bookedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    {booking.distance && <Text style={styles.bookingDate}>Dist: {booking.distance.toFixed(1)} km</Text>}
                </View>
                <Text style={styles.bookingPrice}>INR {booking.finalAmount ? booking.finalAmount.toFixed(2) : (booking.jobEstimate || '0.00')}</Text>
            </View>

            <View style={styles.bookingDetails}>
                <View style={styles.serviceIconContainer}>
                    <Ionicons name="car-sport" size={24} color="#005C70" />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.customerName}>{booking.user.firstName} {booking.user.lastName}</Text>
                    <Text style={styles.vehicleInfo}>{booking.vehicle.brand} {booking.vehicle.name} • {booking.vehicle.plateNumber}</Text>
                    <View style={{ marginTop: 4 }}>
                        <Text style={styles.bookingText} numberOfLines={1}>
                            <Text style={{ fontWeight: '600' }}>From:</Text> {booking.pickupAddress || booking.pickupLocation?.description || 'N/A'}
                        </Text>
                        <Text style={styles.bookingText} numberOfLines={1}>
                            <Text style={{ fontWeight: '600' }}>To:</Text> {booking.destinationAddress || booking.destinationLocation?.description || booking.garage?.name || 'N/A'}
                        </Text>
                    </View>
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
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    bookingHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    bookingDate: { fontSize: 12, color: '#999', fontWeight: '500' },
    bookingPrice: { fontSize: 16, fontWeight: '700', color: '#333' },
    bookingDetails: { flexDirection: 'row', alignItems: 'center' },
    serviceIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: '#e0f2f1',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    customerName: { fontSize: 16, fontWeight: '700', color: '#2c3e50', marginBottom: 2 },
    vehicleInfo: { fontSize: 14, color: '#7f8c8d', marginBottom: 6 },
    bookingText: { fontSize: 13, color: '#555', marginBottom: 2 },
    badge: {
        position: 'absolute', top: 0, right: 0, paddingHorizontal: 10, paddingVertical: 5,
        borderTopRightRadius: 20, borderBottomLeftRadius: 8, zIndex: 1
    },
    badgePending: { backgroundColor: '#f39c12' },
    badgeActive: { backgroundColor: '#27ae60' },
    badgeCompleted: { backgroundColor: '#95a5a6' },
    badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
});

export default TowTruckBookingCard;
