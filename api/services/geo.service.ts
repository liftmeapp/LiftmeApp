import { Client } from '@googlemaps/google-maps-services-js';

const googleMapsClient = new Client();

export interface GeoJSONPoint {
    type: 'Point';
    coordinates: [number, number];
}

export function isGeoJSONPoint(obj: any): obj is GeoJSONPoint {
    return obj && typeof obj === 'object' && obj.type === 'Point' && Array.isArray(obj.coordinates) &&
        obj.coordinates.length === 2 && typeof obj.coordinates[0] === 'number' && typeof obj.coordinates[1] === 'number';
}

export async function getEtaAndDistance(
    origin: { lat: number; lon: number }, destination: { lat: number; lon: number }) {
    try {
        const response = await googleMapsClient.directions({
            params: {
                origin: `${origin.lat},${origin.lon}`,
                destination: `${destination.lat},${destination.lon}`,
                key: process.env.GOOGLE_MAPS_API_KEY!,
            },
            timeout: 1000,
        });
        if (response.data.routes.length > 0 && response.data.routes[0].legs.length > 0) {
            const leg = response.data.routes[0].legs[0];
            return {
                etaMinutes: Math.round(leg.duration.value / 60),
                distanceKm: Math.round(leg.distance.value / 1000),
            };
        }
        return { etaMinutes: null, distanceKm: null };
    } catch (error) {
        console.error("Google Directions API Error:", error);
        return { etaMinutes: null, distanceKm: null };
    }
}
