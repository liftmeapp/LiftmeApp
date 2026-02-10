import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Linking, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

interface BusinessBookingModalProps {
    visible: boolean;
    onClose: () => void;
    booking: any;
    children?: React.ReactNode; // For action buttons
    garageLocation?: any; // Optional, for Garage view
}

const BusinessBookingModal = ({ visible, onClose, booking, children, garageLocation }: BusinessBookingModalProps) => {
    if (!booking) return null;

    const getCoords = (loc: any) => {
        if (!loc) return null;
        if (Array.isArray(loc.coordinates) && loc.coordinates.length >= 2) {
            return { latitude: Number(loc.coordinates[1]), longitude: Number(loc.coordinates[0]) };
        }
        if (typeof loc.latitude === 'number' && typeof loc.longitude === 'number') {
            return { latitude: loc.latitude, longitude: loc.longitude };
        }
        return null;
    };

    const pickupCoords = getCoords(booking.pickupLocation);
    // For Tow Truck: Destination is booking.destinationLocation
    // For Garage: Destination is garageLocation (if provided) or we might just show Garage marker
    const destinationCoords = getCoords(booking.destinationLocation) || (garageLocation ? getCoords(garageLocation) : null);

    const openMaps = () => {
        if (!pickupCoords) return;
        const origin = `${pickupCoords.latitude},${pickupCoords.longitude}`;
        let url = '';
        if (destinationCoords) {
            const dest = `${destinationCoords.latitude},${destinationCoords.longitude}`;
            url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`;
        } else {
            url = `https://www.google.com/maps/search/?api=1&query=${origin}`;
        }
        Linking.openURL(url).catch(err => console.error("Couldn't open maps", err));
    };

    const getBadgeStyle = (status: string) => {
        switch (status) {
            case 'SEARCHING': return styles.badgePending;
            case 'CONFIRMED': return styles.badgeActive;
            case 'IN_PROGRESS': return styles.badgeActive;
            case 'COMPLETED': return styles.badgeCompleted;
            case 'CANCELLED': return styles.badgeCancelled;
            default: return styles.badgeDefault;
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    {/* Header with Close Button */}
                    <View style={styles.header}>
                        <Text style={styles.modalTitle}>Booking Details</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close-circle" size={30} color="#e74c3c" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        {/* Status Badge */}
                        <View style={[styles.badge, getBadgeStyle(booking.status)]}>
                            <Text style={styles.badgeText}>{booking.status.replace(/_/g, ' ')}</Text>
                        </View>

                        {/* Date & Price */}
                        <View style={styles.rowBetween}>
                            <Text style={styles.dateText}>
                                {new Date(booking.bookedAt).toLocaleDateString()} • {new Date(booking.bookedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                            <Text style={styles.priceText}>
                                {booking.finalAmount ? `INR ${booking.finalAmount.toFixed(2)}` : (booking.jobEstimate ? `~ INR ${booking.jobEstimate}` : 'Pending Quote')}
                            </Text>
                        </View>

                        <View style={styles.divider} />

                        {/* Customer & Vehicle */}
                        <InfoRow icon="person-circle-outline" label="Customer" value={`${booking.user.firstName} ${booking.user.lastName}`} />
                        <InfoRow icon="call-outline" label="Phone" value={booking.user.phone} />
                        <InfoRow icon="car-sport-outline" label="Vehicle" value={`${booking.vehicle.brand} ${booking.vehicle.name} (${booking.vehicle.plateNumber})`} />

                        {/* Service Info */}
                        <InfoRow icon="construct-outline" label="Service" value={booking.service?.name || 'Tow-to-Garage Service'} />
                        {booking.notes && <InfoRow icon="document-text-outline" label="Notes" value={booking.notes} />}


                        <View style={styles.divider} />

                        {/* Map Section */}
                        {pickupCoords && (
                            <View style={styles.mapContainer}>
                                <MapView
                                    style={styles.map}
                                    initialRegion={{
                                        latitude: pickupCoords.latitude,
                                        longitude: pickupCoords.longitude,
                                        latitudeDelta: 0.05,
                                        longitudeDelta: 0.05,
                                    }}
                                    scrollEnabled={false}
                                    zoomEnabled={false}
                                >
                                    <Marker coordinate={pickupCoords} title="Pickup" pinColor="red" />
                                    {destinationCoords && <Marker coordinate={destinationCoords} title="Destination" pinColor="#005C70" />}
                                    {destinationCoords && (
                                        <Polyline coordinates={[pickupCoords, destinationCoords]} strokeColor="#005C70" strokeWidth={3} />
                                    )}
                                </MapView>
                                <TouchableOpacity style={styles.mapButton} onPress={openMaps}>
                                    <Ionicons name="navigate" size={16} color="#fff" />
                                    <Text style={styles.mapButtonText}>Open in Maps</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Locations Text */}
                        <View style={styles.locationContainer}>
                            <Text style={styles.locationLabel}>Pickup:</Text>
                            <Text style={styles.locationText}>{booking.pickupAddress || booking.pickupLocation?.description || 'N/A'}</Text>

                            {(booking.destinationAddress || booking.destinationLocation?.description || booking.garage?.name) && (
                                <>
                                    <Text style={[styles.locationLabel, { marginTop: 8 }]}>Drop-off:</Text>
                                    <Text style={styles.locationText}>{booking.destinationAddress || booking.destinationLocation?.description || booking.garage?.name}</Text>
                                </>
                            )}
                            {booking.distance != null && (
                                <Text style={[styles.locationLabel, { marginTop: 8 }]}>Est. Distance: <Text style={styles.locationText}>{booking.distance.toFixed(1)} km</Text></Text>
                            )}
                        </View>

                        {/* Custom Actions (Children) */}
                        {children && (
                            <View style={styles.actionsContainer}>
                                {children}
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const InfoRow = ({ icon, label, value }: { icon: any, label: string, value?: string }) => (
    value ? (
        <View style={styles.infoRow}>
            <Ionicons name={icon} size={20} color="#888" style={{ width: 25 }} />
            <Text style={styles.infoLabel}>{label}:</Text>
            <Text style={styles.infoValue}>{value}</Text>
        </View>
    ) : null
);

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        width: '90%',
        height: '85%',
        borderRadius: 20,
        overflow: 'hidden',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#005C70',
    },
    closeButton: {
        padding: 5,
    },
    badge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        marginBottom: 15,
    },
    badgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    badgePending: { backgroundColor: '#f39c12' },
    badgeActive: { backgroundColor: '#27ae60' },
    badgeCompleted: { backgroundColor: '#2980b9' },
    badgeCancelled: { backgroundColor: '#c0392b' },
    badgeDefault: { backgroundColor: '#95a5a6' },

    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    dateText: {
        fontSize: 14,
        color: '#666',
    },
    priceText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#005C70',
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 15,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoLabel: {
        fontWeight: '600',
        color: '#555',
        marginRight: 5,
        fontSize: 14,
    },
    infoValue: {
        color: '#333',
        flex: 1,
        fontSize: 14,
    },

    mapContainer: {
        height: 200,
        borderRadius: 15,
        overflow: 'hidden',
        marginBottom: 15,
        position: 'relative',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    mapButton: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: '#005C70',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        elevation: 3,
    },
    mapButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 5,
    },

    locationContainer: {
        backgroundColor: '#f9f9f9',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
    },
    locationLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#888',
        marginBottom: 2,
    },
    locationText: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },

    actionsContainer: {
        marginTop: 10,
        gap: 10,
    },
});

export default BusinessBookingModal;
