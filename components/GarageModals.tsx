import React from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export const OtpVerificationModal = ({ visible, onClose, otp, setOtp, onVerify, isVerifying }: any) => (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
            <View style={modalStyles.modalOverlay}>
                <View style={modalStyles.modalContent}>
                    <Text style={modalStyles.modalTitle}>Complete Service</Text>
                    <Text style={modalStyles.modalSubtitle}>Enter the 6-digit OTP from the customer to confirm service completion and capture payment.</Text>
                    <TextInput style={modalStyles.otpInput} keyboardType="number-pad" maxLength={6} value={otp} onChangeText={setOtp} placeholder="123456" />
                    <TouchableOpacity style={[modalStyles.modalPrimaryButton, modalStyles.acceptButton, isVerifying && modalStyles.disabledButton]} onPress={onVerify} disabled={isVerifying}>
                        {isVerifying ? <ActivityIndicator color="#fff" /> : <Text style={modalStyles.bookingButtonText}>Verify & Complete</Text>}
                    </TouchableOpacity>
                    <TouchableOpacity style={{ marginTop: 10 }} onPress={onClose}><Text style={{ textAlign: 'center', color: '#7f8c8d' }}>Cancel</Text></TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    </Modal>
);

export const QuoteModal = ({ visible, onClose, vehicleStatus, setVehicleStatus, servicesRequired, setServicesRequired, servicesEstimate, setServicesEstimate, jobEstimate, setJobEstimate, notes, setNotes, onSubmit, isSubmitting }: any) => (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
            <View style={modalStyles.modalOverlay}>
                <View style={modalStyles.modalContent}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={modalStyles.modalTitle}>Job Estimate</Text>
                        <Text style={modalStyles.modalSubtitle}>Enter Initial estiamtes after diagnosis. The customer will be notified to approve and pay.</Text>

                        <TextInput
                            style={modalStyles.quoteInput}
                            placeholder="Vehicle Status"
                            value={vehicleStatus}
                            onChangeText={setVehicleStatus}
                            returnKeyType="next"
                        />
                        <TextInput
                            style={[modalStyles.quoteInput, { height: 80, textAlignVertical: 'top' }]}
                            placeholder="Service Required"
                            multiline
                            blurOnSubmit={true}
                            value={servicesRequired}
                            onChangeText={setServicesRequired}
                        />
                        <TextInput
                            style={[modalStyles.quoteInput, { height: 80, textAlignVertical: 'top' }]}
                            placeholder="Services Estimate(e.g., Parts: INR 5000, Labor: INR 3000)"
                            multiline
                            blurOnSubmit={true}
                            value={servicesEstimate}
                            onChangeText={setServicesEstimate}
                        />
                        <TextInput
                            style={modalStyles.quoteInput}
                            placeholder="Job Estimate(Total Amount in INR)"
                            keyboardType="numeric"
                            value={jobEstimate}
                            onChangeText={setJobEstimate}
                            returnKeyType="next"
                        />
                        <TextInput
                            style={modalStyles.quoteInput}
                            placeholder="Notes for customer (Est Days)"
                            value={notes}
                            onChangeText={setNotes}
                            returnKeyType="done"
                            blurOnSubmit={true}
                        />

                        <TouchableOpacity
                            style={[modalStyles.bookingButton, modalStyles.acceptButton, isSubmitting && modalStyles.disabledButton]}
                            onPress={onSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? <ActivityIndicator color="#fff" />
                                : <Text style={modalStyles.bookingButtonText}>Job Estimate for Customer</Text>}
                        </TouchableOpacity>
                        <TouchableOpacity style={{ marginTop: 10 }} onPress={onClose}>
                            <Text style={{ textAlign: 'center', color: '#7f8c8d' }}>Cancel</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </KeyboardAvoidingView>
    </Modal>
);


export const FinalQuoteModal = ({ visible, onClose, jobEstimate, setJobEstimate, notes, setNotes, onSubmit, isSubmitting }: any) => (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
            <View style={modalStyles.modalOverlay}>
                <View style={modalStyles.modalContent}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={modalStyles.modalTitle}>Submit Final Amount</Text>
                        <Text style={modalStyles.modalSubtitle}>Enter the final amount for the service. The customer will be notified to approve and pay.</Text>

                        <TextInput
                            style={modalStyles.quoteInput}
                            placeholder="Final Job Amount (Total Amount in INR)"
                            keyboardType="numeric"
                            value={jobEstimate}
                            onChangeText={setJobEstimate}
                            returnKeyType="next"
                        />
                        <TextInput
                            style={modalStyles.quoteInput}
                            placeholder="Final notes for customer"
                            value={notes}
                            onChangeText={setNotes}
                            returnKeyType="done"
                            blurOnSubmit={true}
                        />

                        <TouchableOpacity
                            style={[modalStyles.bookingButton, modalStyles.acceptButton, isSubmitting && modalStyles.disabledButton]}
                            onPress={onSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? <ActivityIndicator color="#fff" />
                                : <Text style={modalStyles.bookingButtonText}>Submit Final Price</Text>}
                        </TouchableOpacity>
                        <TouchableOpacity style={{ marginTop: 10 }} onPress={onClose}>
                            <Text style={{ textAlign: 'center', color: '#7f8c8d' }}>Cancel</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </KeyboardAvoidingView>
    </Modal>
);

const modalStyles = StyleSheet.create({
    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 24,
        width: '90%',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 5,
    },
    modalTitle: { fontSize: 24, fontWeight: '700', marginBottom: 16, textAlign: 'center', color: '#1a1a1a' },
    modalSubtitle: { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
    otpInput: {
        borderWidth: 0,
        borderRadius: 16,
        padding: 16,
        fontSize: 28,
        textAlign: 'center',
        letterSpacing: 12,
        marginBottom: 24,
        width: '100%',
        height: 70,
        backgroundColor: '#f0f0f0',
        fontWeight: '700',
        color: '#333'
    },
    quoteInput: {
        borderWidth: 0,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        marginBottom: 16,
        backgroundColor: '#f0f0f0',
        color: '#333',
        fontWeight: '500'
    },
    modalPrimaryButton: { width: '100%', height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 12 },
    bookingButton: { width: '100%', height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    acceptButton: { backgroundColor: '#005C70' },
    disabledButton: { opacity: 0.6 },
    bookingButtonText: { fontWeight: '700', color: '#fff' },
});
