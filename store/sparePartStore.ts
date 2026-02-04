import { create } from 'zustand';

interface SparePartDetails {
    partName: string;
    description: string;
    price: string;
    quantity: string;
    category: string;
    brand: string;
    model: string;
    year: string;
    images: string[];
}

interface LocationState {
    latitude: number | null;
    longitude: number | null;
}

interface SparePartState {
    details: SparePartDetails;
    location: LocationState;
    setDetails: (newDetails: Partial<SparePartDetails>) => void;
    setLocation: (newLocation: LocationState) => void;
    reset: () => void;
}

const initialState = {
    details: {
        partName: '',
        description: '',
        price: '',
        quantity: '',
        category: '',
        brand: '',
        model: '',
        year: '',
        images: [],
    },
    location: {
        latitude: null,
        longitude: null,
    },
};

export const useSparePartStore = create<SparePartState>((set) => ({
    ...initialState,
    setDetails: (newDetails) => set((state) => ({ details: { ...state.details, ...newDetails } })),
    setLocation: (newLocation) => set({ location: newLocation }),
    reset: () => set(initialState),
}));
