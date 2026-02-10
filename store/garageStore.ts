// /app/store/garageStore.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type GarageService = {
    id?: string;
    serviceId: string;
    garageId: string;
    price: number;
    duration: number; // in minutes
    description?: string;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
};

export type GarageStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'INACTIVE';

interface GarageDetails {
    name: string;
    licenseNumber: string;
    address: string;
    ownerName: string;
    numberOfEmployees: string;
    contactEmail: string;
    contactPhone: string;
    operatingHours: any; // Can be a simple object
    stripeAccountId: string;
    razorpayAccountId?: string | null;
    status?: GarageStatus;
}

interface GarageLocation {
    latitude: number;
    longitude: number;
}

interface GarageState {
    details: Partial<GarageDetails>;
    services: GarageService[];
    location: Partial<GarageLocation>;
    supportedVehicleTypes: string[]; // New field
    setDetails: (details: Partial<GarageDetails>) => void;
    setServices: (services: GarageService[]) => void;
    setLocation: (location: GarageLocation) => void;
    setStripeAccountId: (id: string) => void;
    setSupportedVehicleTypes: (types: string[]) => void; // New action
    reset: () => void;
}

const initialState = {
    details: {},
    services: [],
    location: {},
    supportedVehicleTypes: [], // Initialize new field
};

export const useGarageStore = create<GarageState>()(
    persist(
        (set) => ({
            ...initialState,
            setDetails: (details) => set((state) => ({ details: { ...state.details, ...details } })),
            setServices: (services) => set({ services }),
            setLocation: (location) => set({ location }),
            setStripeAccountId: (id) => set((state) => ({ details: { ...state.details, stripeAccountId: id } })),
            setSupportedVehicleTypes: (types) => set({ supportedVehicleTypes: types }), // New action implementation
            reset: () => set(initialState),
        }),
        {
            name: 'garage-setup-storage', // unique name
            storage: createJSONStorage(() => AsyncStorage), // Use AsyncStorage for React Native
        }
    )
);