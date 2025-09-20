import { router } from "expo-router";
import { View, Text, TouchableOpacity, Image } from "react-native";

const opts = [
  {
    id: 5,
    name: "Motorcycle",
    icon: require("@/assets/icons/bikefix.jpeg"),
    link: "/services/roadsidebike-service",
  },
  {
    id: 7,
    name: "Luxury",
    icon: require("@/assets/icons/luxurycar.jpeg"),
    link: "/services/luxury-service",
  },
  {
    id: 8,
    name: "Garages",
    icon: require("@/assets/icons/garage.jpeg"),
    link: "/services/garages",
  },
  {
    id: 9,
    name: "Spare Parts",
    icon: require("@/assets/icons/spareparts.jpeg"),
    link: "/services/spareparts",
  },
];

export default function NavOptionSec() {
  return (
    <View className="flex-row justify-between px-4 py-2 mt-5 mb-[5rem] gap-1">
      {opts.map((item) => (
        <TouchableOpacity
          key={item.id}
          onPress={() => router.push(item.link as any)}
          className="w-[6.4rem] h-[96px] bg-white rounded-md items-center justify-start shadow-lg"
        >
          <Image
            source={item.icon}
            resizeMode="cover"
            className="w-full h-20 rounded-t-md"
          />
          <Text className="text-xs font-semibold mt-1 text-center text-slate-800">
            {item.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
