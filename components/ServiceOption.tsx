// RideOptionCard.js or inside same file

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

type RideOptionCardProps = {
    name: string;
    description: string;
    selected?: boolean;
    onPress: () => void;
  };
  

const RideOptionCard = ({ name, description, onPress, selected }: RideOptionCardProps) => {
  return (
    <TouchableOpacity 
    onPress={onPress}
      style={[
        styles.card,
        selected && { borderColor: '#b95528', borderWidth: 1.5, backgroundColor: '#FFF6F0' },
      ]}
    >
      <View style={styles.details}>
        <Text style={styles.name}>{name} <Text style={styles.capacity}></Text></Text>
        <Text style={styles.subText}>{description}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fcfcfc',
    borderRadius: 3,
    marginVertical: 4,
    marginHorizontal: 8,
    padding: 12,
    paddingVertical:18,
    elevation: 0.5,
  },
  iconSection: {
    width: 50,
    alignItems: 'center',
  },
  icon: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
  },
  details: {
    flex: 1,
    paddingHorizontal: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  capacity: {
    fontSize: 12,
    color: '#555',
  },
  subText: {
    fontSize: 12,
    color: '#666',
  },
  priceSection: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RideOptionCard;
