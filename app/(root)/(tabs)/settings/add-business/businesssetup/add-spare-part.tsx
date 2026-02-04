import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import InputField from '@/components/InputField';
import { useSparePartStore } from '@/store/sparePartStore';

export default function AddSparePartScreen() {
    const router = useRouter();
    const { details, setDetails } = useSparePartStore();
    const [images, setImages] = useState<string[]>(details.images || []);

    const handleImagePick = async () => {
        if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to make this work!');
                return;
            }
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled && result.assets && result.assets[0].base64) {
            const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
            setImages(prevImages => [...prevImages, base64Image]);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleNext = () => {
        if (!details.partName || !details.price || !details.quantity || !details.brand || images.length === 0) {
            Alert.alert('Missing Info', 'Please fill all required fields and add at least one image.');
            return;
        }
        setDetails({ images });
        router.push('/settings/add-business/businesssetup/location-picker?mode=sparePart');
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#005C70" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add Spare Part</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>Product Details</Text>

                <View style={styles.inputGroup}>
                    <InputField label='Part Name' placeholder="e.g. Brake Pads" value={details.partName} onChangeText={(text) => setDetails({ partName: text })} />
                    <InputField label='Description' placeholder="Describe the condition, specs..." value={details.description} onChangeText={(text) => setDetails({ description: text })} multiline />
                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <InputField label='Price (INR)' placeholder="0.00" value={details.price} onChangeText={(text) => setDetails({ price: text })} keyboardType="numeric" />
                        </View>
                        <View style={{ flex: 1, marginLeft: 8 }}>
                            <InputField label='Quantity' placeholder="1" value={details.quantity} onChangeText={(text) => setDetails({ quantity: text })} keyboardType="numeric" />
                        </View>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Specifications</Text>
                <View style={styles.inputGroup}>
                    <InputField label='Category' placeholder="e.g. Brakes" value={details.category} onChangeText={(text) => setDetails({ category: text })} />
                    <InputField label='Brand' placeholder="e.g. Brembo" value={details.brand} onChangeText={(text) => setDetails({ brand: text })} />
                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <InputField label='Model' placeholder="e.g. Civic" value={details.model} onChangeText={(text) => setDetails({ model: text })} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 8 }}>
                            <InputField label='Year' placeholder="e.g. 2022" value={details.year} onChangeText={(text) => setDetails({ year: text })} keyboardType="numeric" />
                        </View>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Images ({images.length})</Text>
                <View style={styles.imageSection}>
                    {images.map((uri, index) => (
                        <View key={index} style={styles.imageWrapper}>
                            <Image source={{ uri }} style={styles.previewImage} />
                            <TouchableOpacity style={styles.removeImageBtn} onPress={() => removeImage(index)}>
                                <Ionicons name="close-circle" size={22} color="#ff4444" />
                            </TouchableOpacity>
                        </View>
                    ))}
                    <TouchableOpacity style={styles.addImageBtn} onPress={handleImagePick}>
                        <Ionicons name="camera-outline" size={32} color="#005C70" />
                        <Text style={styles.addImageText}>Add Photo</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity onPress={handleNext} style={{ flex: 1 }}>
                    <LinearGradient colors={['#005C70', '#004252']} style={styles.nextButton}>
                        <Text style={styles.nextButtonText}>Next Step</Text>
                        <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    headerContainer: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: '#fff',
        borderBottomWidth: 1, borderBottomColor: '#eee'
    },
    backButton: { padding: 4, marginRight: 12 },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1a1a1a' },

    scrollContent: { padding: 20 },

    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginTop: 10, marginBottom: 15 },
    inputGroup: { marginBottom: 10 },
    row: { flexDirection: 'row' },

    imageSection: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    imageWrapper: { position: 'relative' },
    previewImage: { width: 90, height: 90, borderRadius: 12, backgroundColor: '#eee' },
    removeImageBtn: { position: 'absolute', top: -8, right: -8, backgroundColor: '#fff', borderRadius: 12 },

    addImageBtn: {
        width: 90, height: 90, borderRadius: 12, borderStyle: 'dashed', borderWidth: 1, borderColor: '#005C70',
        justifyContent: 'center', alignItems: 'center', backgroundColor: '#e0f2f1'
    },
    addImageText: { fontSize: 12, color: '#005C70', marginTop: 4, fontWeight: '600' },

    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: '#fff', padding: 20, paddingBottom: 40,
        borderTopWidth: 1, borderTopColor: '#eee'
    },
    nextButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 16, borderRadius: 30, elevation: 4, shadowColor: '#005C70', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }
    },
    nextButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});