// /app/store/towTruckStore.ts
import { create } from 'zustand';

// --- INTERFACES ---

// This matches the form fields on your first sign-up screen
interface TowTruckDetails {
    name: string;
    driverName: string; // The UI has "Owner Name", which maps to "driverName" in the DB
    model: string;      // e.g., "Flatbed", "Wheel-Lift"
    make: string;       // e.g., "Ford", "Chevrolet"
    year: number;
    plateNumber: string;
    licenseNumber: string; // The UI has "License No"
}

// This matches the Prisma Enum `VehicleType`
// It's good practice to define it here to ensure consistency

export interface TowTruckServicePrice {
    vehicleType: TowableVehicleType;
    price: number;
}

export type TowableVehicleType = 'BIKE' | 'SEDAN' | 'HATCHBACK' | 'SUV' | 'LUXURY' | 'TRUCK';
// This matches the final location data we'll get from the map
interface TowTruckLocation {
    latitude: number;
    longitude: number;
}

// --- ZUSTAND STORE DEFINITION ---

// This interface defines the complete shape of our store's state and its actions (the setters)
interface TowTruckState {
    details: Partial<TowTruckDetails>; // Use Partial<> so we can build it up step-by-step
    services: Partial<TowTruckServicePrice>[]; // <-- UPDATED
    towedVehicleTypes: TowableVehicleType[];
    location: Partial<TowTruckLocation>;
    setDetails: (details: Partial<TowTruckDetails>) => void;
    setServices: (services: Partial<TowTruckServicePrice>[]) => void; // <-- UPDATED
    setTowedVehicleTypes: (types: TowableVehicleType[]) => void;
    setLocation: (location: TowTruckLocation) => void;
    reset: () => void; // A handy function to clear the form after successful submission
}

// --- CREATE THE STORE ---

export const useTowTruckStore = create<TowTruckState>((set) => ({
    // --- Initial State ---
    details: {},
    towedVehicleTypes: [],
    services: [], // <-- UPDATED
    location: {},

    // --- Actions (Setters) ---

    /**
     * Updates the details part of the store.
     * Merges the provided details with the existing ones.
     * @param {Partial<TowTruckDetails>} details - The details from the first form screen.
     */
    setDetails: (details) => set((state) => ({ 
        details: { ...state.details, ...details } 
    })),
    setServices: (services) => set({ services }), // <-- UPDATED
    /**
     * Sets the array of vehicle types the truck can tow.
     * @param {TowableVehicleType[]} types - An array of selected vehicle types.
     */
    setTowedVehicleTypes: (types) => set({ towedVehicleTypes: types }),

    /**
     * Sets the final geographic location of the tow truck's base.
     * @param {TowTruckLocation} location - The latitude and longitude from the map screen.
     */
    setLocation: (location) => set({ location }),

    /**
     * Resets the entire store back to its initial empty state.
     * Called after a successful sign-up to clear the form for the next time.
     */
    reset: () => set({ 
        details: {}, 
        towedVehicleTypes: [], 
        location: {} 
    }),
}));