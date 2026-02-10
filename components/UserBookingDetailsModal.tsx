
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface UserBookingDetailsModalProps {
    visible: boolean;
    onClose: () => void;
    booking: any;
}

const UserBookingDetailsModal = ({ visible, onClose, booking }: UserBookingDetailsModalProps) => {
    if (!booking) return null;

    const isTowIn = booking.bookingType === 'TOW_TO_GARAGE';
    const status = booking.status?.replace(/_/g, ' ') || 'N/A';
    const finalPrice = booking.finalAmount || booking.basePrice || booking.jobEstimate || 0;

    // Safety check for ID and Date
    const displayId = booking.id ? booking.id.toString().slice(0, 8).toUpperCase() : 'N/A';
    const bookingDate = booking.bookedAt ? new Date(booking.bookedAt) : new Date();
    const date = bookingDate.toLocaleDateString();
    const time = bookingDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Helper to render sections
    const renderSection = (title: string, children: React.ReactNode) => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {children}
        </View>
    );

    const renderRow = (label: string, value: string | number) => (
        <View style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
        </View>
    );

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Booking Details</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close-circle" size={28} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        {/* Status Badge */}
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
                            <Text style={styles.statusText}>{status}</Text>
                        </View>

                        {/* Basic Info */}
                        {renderSection("General Info", (
                            <>
                                {renderRow("Booking ID", displayId)}
                                {renderRow("Date", date)}
                                {renderRow("Time", time)}
                                {renderRow("Total Price", `INR ${finalPrice.toFixed(2)}`)}
                            </>
                        ))}

                        {/* Service Details */}
                        {renderSection("Service Details", (
                            <>
                                <Text style={styles.serviceName}>{booking.service?.name || "Service Request"}</Text>
                                <Text style={styles.description}>{booking.problemDescription || "No description provided."}</Text>
                            </>
                        ))}

                        {/* Provider Details - Dynamic based on type */}
                        {isTowIn ? (
                            <>
                                {renderSection("Tow Truck Provider", (
                                    <>
                                        {booking.towTruck ? (
                                            <>
                                                {renderRow("Provider", booking.towTruck.name)}
                                                {renderRow("Driver", booking.towTruck.driverName)}
                                                {renderRow("Vehicle", `${booking.towTruck.vehicleModel} (${booking.towTruck.plateNumber})`)}
                                                {renderRow("Phone", booking.towTruck.contactPhone)}
                                            </>
                                        ) : (
                                            <Text style={styles.pendingText}>Searching for Tow Truck...</Text>
                                        )}
                                    </>
                                ))}
                                {renderSection("Garage Destination", (
                                    <>
                                        {booking.garage ? (
                                            <>
                                                {renderRow("Garage", booking.garage.name)}
                                                {renderRow("Address", booking.garage.address)}
                                            </>
                                        ) : (
                                            <Text style={styles.pendingText}>Garage not assigned yet.</Text>
                                        )}
                                    </>
                                ))}
                            </>
                        ) : (
                            renderSection("Provider", (
                                <>
                                    {booking.garage ? (
                                        <>
                                            {renderRow("Garage", booking.garage.name)}
                                            {renderRow("Address", booking.garage.address)}
                                            {renderRow("Phone", booking.garage.contactPhone)}
                                        </>
                                    ) : booking.towTruck ? (
                                        <>
                                            {renderRow("Tow Truck", booking.towTruck.name)}
                                            {renderRow("Driver", booking.towTruck.driverName)}
                                        </>
                                    ) : (
                                        <Text style={styles.pendingText}>Provider info unavailable.</Text>
                                    )}
                                </>
                            ))
                        )}

                        {/* Vehicle Details */}
                        {booking.vehicle && (
                            renderSection("Vehicle", (
                                <>
                                    {typeof booking.vehicle === 'string' ? (
                                        renderRow("Vehicle", booking.vehicle)
                                    ) : (
                                        <>
                                            {renderRow("Make/Model", `${booking.vehicle.make || ''} ${booking.vehicle.model || ''}`.trim() || 'N/A')}
                                            {renderRow("Year", booking.vehicle.year || 'N/A')}
                                            {renderRow("Plate Number", booking.vehicle.plateNumber || 'N/A')}
                                        </>
                                    )}
                                </>
                            ))
                        )}

                        {/* Quote / Work Details */}
                        {(booking.quoteHistory?.length > 0 || booking.servicesRequired || booking.notes) && (
                            renderSection("Work & Quote", (
                                <>
                                    {booking.servicesRequired && (
                                        <>
                                            <Text style={styles.serviceName}>Services Required</Text>
                                            <Text style={styles.description}>{booking.servicesRequired}</Text>
                                            <View style={{ height: 10 }} />
                                        </>
                                    )}
                                    {booking.notes && (
                                        <>
                                            <Text style={styles.serviceName}>Provider Notes</Text>
                                            <Text style={styles.description}>{booking.notes}</Text>
                                            <View style={{ height: 10 }} />
                                        </>
                                    )}
                                    {booking.quoteHistory?.length > 0 && (
                                        <>
                                            {renderRow("Latest Estimate", `INR ${booking.quoteHistory[booking.quoteHistory.length - 1].jobEstimate || 0}`)}
                                        </>
                                    )}
                                </>
                            ))
                        )}

                        {/* Location Details for Towing */}
                        {(isTowIn || booking.service?.type === 'TOWING') && (
                            renderSection("Route", (
                                <>
                                    <View style={styles.locationRow}>
                                        <Ionicons name="navigate-circle" size={20} color="#005C70" />
                                        <View style={{ marginLeft: 10, flex: 1 }}>
                                            <Text style={styles.locationLabel}>Pickup</Text>
                                            <Text style={styles.locationText}>{booking.pickupAddress || booking.pickupLocation?.description || 'N/A'}</Text>
                                        </View>
                                    </View>
                                    <View style={[styles.locationRow, { marginTop: 10 }]}>
                                        <Ionicons name="location" size={20} color="#b95528" />
                                        <View style={{ marginLeft: 10, flex: 1 }}>
                                            <Text style={styles.locationLabel}>Dropoff</Text>
                                            <Text style={styles.locationText}>{booking.destinationAddress || booking.destinationLocation?.description || booking.garage?.address || 'N/A'}</Text>
                                        </View>
                                    </View>
                                </>
                            ))
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'COMPLETED': return '#74B768';
        case 'CANCELLED': return '#FF7F50';
        case 'CONFIRMED': return '#005C70';
        case 'IN_PROGRESS': return '#FFA500';
        default: return '#999';
    }
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '85%',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 15,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    statusBadge: {
        alignSelf: 'center',
        paddingHorizontal: 15,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 20,
    },
    statusText: {
        color: '#fff',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        fontSize: 12,
    },
    section: {
        marginBottom: 24,
        backgroundColor: '#f8f9fa',
        padding: 15,
        borderRadius: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#005C70',
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 8,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    label: {
        color: '#666',
        fontSize: 14,
        flex: 0.4,
    },
    value: {
        color: '#333',
        fontWeight: '500',
        fontSize: 14,
        flex: 0.6,
        textAlign: 'right',
    },
    serviceName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    description: {
        color: '#666',
        fontSize: 14,
        lineHeight: 20,
    },
    pendingText: {
        color: '#999',
        fontStyle: 'italic',
        fontSize: 14,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    locationLabel: {
        fontSize: 10,
        color: '#999',
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    locationText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    }
});

export default UserBookingDetailsModal;
