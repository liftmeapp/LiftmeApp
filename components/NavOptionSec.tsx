import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const opts = [
  {
    id: 5,
    name: "Bike",
    icon: "bike", // Using MaterialCommunityIcons name
    link: "/services/roadsidebike-service",
  },
  {
    id: 7,
    name: "Car",
    icon: "car-hatchback",
    link: "/services/luxury-service",
  },
  {
    id: 8,
    name: "Garages",
    icon: "garage",
    link: "/services/garages",
  },
  {
    id: 9,
    name: "Spare Parts",
    icon: "wrench",
    link: "/services/spareparts",
  },
];

export default function NavOptionSec() {
  return (
    <View className="flex-row flex-wrap justify-between px-2 py-2 mt-4" style={{ gap: 10 }}>
      {opts.map((item) => (
        <TouchableOpacity
          key={item.id}
          activeOpacity={0.8}
          onPress={() => router.push(item.link as any)}
          className="w-[48%] bg-white rounded-xl flex-row items-center justify-between p-4 shadow-sm h-20"
        >
          <View className="flex-row items-center gap-3">
            <View className="bg-sky-100 p-2 rounded-lg">
              <Icon name={item.icon} size={24} color="#000" />
            </View>
            <Text className="text-base font-medium text-slate-800">
              {item.name}
            </Text>
          </View>
          <Icon name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>
      ))}
    </View>
  );
}
