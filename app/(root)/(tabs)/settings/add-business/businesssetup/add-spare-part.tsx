
import { useAuth } from '@clerk/clerk-expo';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import CustomButton from '@/components/CustomButton';
import InputField from '@/components/InputField';
import { Colors } from '@/constants/Colors';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export default function AddSparePartScreen() {
    const { getToken } = useAuth();
    const router = useRouter();

    const [partName, setPartName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [category, setCategory] = useState('');
    const [brand, setBrand] = useState('');
    const [model, setModel] = useState('');
    const [year, setYear] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const handleImagePick = async () => {
        if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Sorry, we need camera roll permissions to make this work!');
                return;
            }
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5, // Lower quality for faster upload
            base64: true, // Include base64 string
        });

        if (!result.canceled && result.assets && result.assets[0].base64) {
            const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
            setImages([...images, base64Image]);
        }
    };

    const handleAddPart = async () => {
        if (!partName || !price || !quantity || !brand || images.length === 0) {
            Alert.alert('Error', 'Please fill all required fields and add at least one image.');
            return;
        }
        setLoading(true);

        try {
            // 1. Get Location
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Permission to access location was denied.');
                setLoading(false);
                return;
            }
            let location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            // 2. Get Auth Token
            const token = await getToken();
            if (!token) {
                throw new Error("Authentication token not found.");
            }

            // 3. Construct Payload
            const payload = {
                partName,
                description,
                price: parseFloat(price),
                quantity: parseInt(quantity, 10),
                category,
                brand,
                model,
                year: parseInt(year, 10) || undefined,
                images,
                location: {
                    type: 'Point',
                    coordinates: [longitude, latitude],
                },
            };

            // 4. Send to API
            const response = await fetch(`${API_BASE_URL}/api/spare-parts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add spare part.');
            }

            // 5. Handle Success
            Alert.alert('Success', 'Your spare part has been listed for sale!', [
                { text: 'OK', onPress: () => router.back() }
            ]);

        } catch (error: any) {
            Alert.alert('Error', error.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            
            <Text style={styles.header}>List a New Spare Part</Text>
            <Text style={styles.subHeader}>Enter the details of the part you want to sell.</Text>

            <InputField label='Name' placeholder="Part Name (e.g., Brake Pads)" value={partName} onChangeText={setPartName} />
            <InputField label='Description' placeholder="Description" value={description} onChangeText={setDescription} multiline />
            <InputField label='Price' placeholder="Price" value={price} onChangeText={setPrice} keyboardType="numeric" />
            <InputField label='Quantity' placeholder="Quantity" value={quantity} onChangeText={setQuantity} keyboardType="numeric" />
            <InputField label='Category' placeholder="Category (e.g., Brakes)" value={category} onChangeText={setCategory} />
            <InputField label='Brand' placeholder="Brand (e.g., Brembo)" value={brand} onChangeText={setBrand} />
            <InputField label='Model' placeholder="Compatible Model (e.g., Honda Civic)" value={model} onChangeText={setModel} />
            <InputField label='Year' placeholder="Compatible Year (e.g., 2020)" value={year} onChangeText={setYear} keyboardType="numeric" />

            <CustomButton title="Pick Images" onPress={handleImagePick} bgVariant='outline' className="my-2" />
            
            <View style={styles.imagePreviewContainer}>
                {images.map((uri, index) => (
                    <Image key={index} source={{ uri }} style={styles.previewImage} />
                ))}
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#b95528" style={{ marginVertical: 20 }} />
            ) : (
                <CustomButton title="List Part for Sale" onPress={handleAddPart} className="mt-4" />
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    contentContainer: {
        padding: 20,
    },
    header: {
        fontSize: 26,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
        color: Colors.light.text,
    },
    subHeader: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        color: Colors.light.icon,
    },
    imagePreviewContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        marginVertical: 10,
    },
    previewImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        margin: 5,
        borderWidth: 1,
        borderColor: '#ddd',
    },
});
