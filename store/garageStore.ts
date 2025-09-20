// /app/store/garageStore.ts
import { create } from 'zustand';

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
}

interface GarageService {
    serviceId: string;
    price: number;
}

interface GarageLocation {
    latitude: number;
    longitude: number;
}

interface GarageState {
    details: Partial<GarageDetails>;
    services: GarageService[];
    location: Partial<GarageLocation>;
    setDetails: (details: Partial<GarageDetails>) => void;
    setServices: (services: GarageService[]) => void;
    setLocation: (location: GarageLocation) => void;
    setStripeAccountId: (id: string) => void;
    reset: () => void;
}

export const useGarageStore = create<GarageState>((set) => ({
    details: {},
    services: [],
    location: {},
    setDetails: (details) => set((state) => ({ details: { ...state.details, ...details } })),
    setServices: (services) => set({ services }),
    setLocation: (location) => set({ location }),
    setStripeAccountId: (id) => set((state) => ({ details: { ...state.details, stripeAccountId: id } })),
    reset: () => set({ details: {}, services: [], location: {} }),
}));