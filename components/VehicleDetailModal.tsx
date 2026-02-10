import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface VehicleDetailModalProps {
    visible: boolean;
    vehicle: any;
    onClose: () => void;
}

const VehicleDetailModal = ({ visible, vehicle, onClose }: VehicleDetailModalProps) => {
    if (!vehicle) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{vehicle.brand} {vehicle.name}</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.divider} />

                    <ScrollView contentContainerStyle={styles.detailsContainer}>
                        <DetailRow label="Model" value={vehicle.model} icon="car-sport-outline" />
                        <DetailRow label="Year" value={vehicle.year} icon="calendar-outline" />
                        <DetailRow label="Plate Number" value={vehicle.plateNumber} icon="card-outline" />
                        <DetailRow label="Color" value={vehicle.color || 'N/A'} icon="color-palette-outline" />
                        <DetailRow label="Type" value={vehicle.type} icon="information-circle-outline" />
                    </ScrollView>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

const DetailRow = ({ label, value, icon }: { label: string, value: string, icon: any }) => (
    <View style={styles.row}>
        <View style={styles.iconContainer}>
            <Ionicons name={icon} size={20} color="#005C70" />
        </View>
        <View style={styles.textContainer}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        width: '100%',
        maxHeight: '80%',
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#005C70',
        flex: 1,
    },
    closeButton: {
        padding: 5,
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginBottom: 15,
    },
    detailsContainer: {
        paddingBottom: 10,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E8F5F7',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    textContainer: {
        flex: 1,
    },
    label: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2,
    },
    value: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
});

export default VehicleDetailModal;
