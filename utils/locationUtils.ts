export const getAddressFromCoords = async (latitude: number, longitude: number): Promise<string> => {
    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`
        );
        const json = await response.json();
        return json.results?.[0]?.formatted_address || "Unknown Location";
    } catch (error) {
        console.error("Geocoding Error:", error);
        return "Could not fetch address";
    }
};
