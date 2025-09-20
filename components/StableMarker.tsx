import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker, Callout } from 'react-native-maps'; // Correctly import Callout
import { Ionicons } from '@expo/vector-icons';

interface StableMapMarkerProps {
  id: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  name: string;
  type: 'garage' | 'truck';
  // Optional prop for handling marker taps if you need it later
  onPress?: (id: string, type: 'garage' | 'truck') => void;
}

// This is the component logic
const StableMapMarkerComponent = ({ id, coordinate, name, type, onPress }: StableMapMarkerProps) => {
  const isGarage = type === 'garage';
  const iconName = isGarage ? 'build' : 'car-sport';
  const markerColor = isGarage ? '#b95528' : '#2980b9';

  return (
    <Marker
      coordinate={coordinate}
      // This is a critical performance prop.
      // It stops the marker from re-rendering on every map move.
      tracksViewChanges={false}
      // Call the optional onPress function when the marker is tapped
      onPress={() => onPress?.(id, type)}
    >
      {/* This is the visible icon on the map */}
      <View style={[styles.markerIcon, { backgroundColor: markerColor }]}>
        <Ionicons name={iconName} size={22} color="white" />
      </View>

      {/* This is the label that appears ABOVE the marker when tapped.
          The `tooltip` prop allows for full custom styling. */}
      <Callout tooltip>
        <View style={styles.calloutContainer}>
          <Text style={styles.calloutText}>{name}</Text>
        </View>
      </Callout>
    </Marker>
  );
};

// Use React.memo to prevent unnecessary re-renders for even better performance.
const StableMapMarker = React.memo(StableMapMarkerComponent);

const styles = StyleSheet.create({
  // Style for the circular marker icon
  markerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22, // Makes it a circle
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
    // Shadow for depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  // Style for the white popup label (the Callout)
  calloutContainer: {
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    // Add a max width to prevent very long names from breaking the layout
    maxWidth: 200, 
  },
  // Style for the text inside the Callout
  calloutText: {
    color: '#333333',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default StableMapMarker;