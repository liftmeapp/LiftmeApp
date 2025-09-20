import React from 'react';
import { ScrollView, View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';

const { width } = Dimensions.get('window');
const cardWidth = width * 0.8; // 80% of screen width

const data = [
  { id: '11', name: '20% Offer for first booking' },
  { id: '12', name: 'Ideal Offers for Luxury Vehicles' },
  { id: '13', name: 'Quick assistance for Premium members' },
];

const HorizontalScrollView = () => {
  return (
    <ScrollView
      horizontal
      pagingEnabled
      snapToInterval={cardWidth + 20}
      decelerationRate="fast"
      showsHorizontalScrollIndicator={false}
      className="mb-5"
    >
      {data.map((item) => (
        <View key={item.id} style={styles.cardContainer}>
          <TouchableOpacity
            style={styles.card}
          >
            <Text style={styles.cardText}>
              * {item.name}
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    height: 153, // 18rem
    backgroundColor: '#fff', // slate-50
    marginHorizontal: 8, // mx-2
    marginBottom: 2,
    marginTop:2, // mb-5
    flexDirection: 'row',
  },
  card: {
    width: 288, // 18rem
    height: 128, // 8rem
    backgroundColor: '#334155', // slate-700
    borderRadius: 8, // rounded-md
    justifyContent: 'flex-end',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.4,
    shadowRadius: 4.65,
    elevation: 6, // Android shadow
  },
  cardText: {
    textAlign: 'right',
    padding: 12, // p-3
    paddingRight: 16, // pr-4
    color: '#e2e8f0', // slate-200
    fontSize: 18, // text-lg
    fontWeight: 'bold',
  },
});

export default HorizontalScrollView;
