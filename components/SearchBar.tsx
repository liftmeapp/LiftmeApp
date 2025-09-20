import React from 'react';
import { View, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/Feather'; // Using Feather icons, search icon looks clean

const SearchBar = () => {
  return (
    <View className="flex-row items-center bg-gray-200 rounded-full px-4 py-2 mx-3 my-2">
      <Icon name="search" size={20} color="#555" />
      <TextInput
        placeholder="Search services"
        placeholderTextColor="#555"
        className="flex-1 pl-3 text-base text-gray-700"
      />
    </View>
  );
};

export default SearchBar;
