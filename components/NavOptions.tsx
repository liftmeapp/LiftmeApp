import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from "react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const opts = [{
  id: 1,
  name: "Road Services",
  details: "Providing roadside assistance for your vehicle.",
  icon: require("@/assets/icons/carfix.jpeg"),
  vectorIcon: "car-wrench",
  link: "/services/roadsidecar-service",
},
{
  id: 2,
  name: "Towing Services",
  details: "Towing Assistance for your vehicle.",
  icon: require("@/assets/icons/tow.jpeg"),
  vectorIcon: "tow-truck",
  link: "/services/towing_service",
},
{
  id: 3,
  name: "EV Service",
  details: "Charging & repair for EVs.",
  icon: require("@/assets/icons/carfix.jpeg"), // Placeholder or use vector
  vectorIcon: "car-electric",
  link: "/services/electric-vehicleservice",
},
{
  id: 4,
  name: "Home Service",
  details: "Service at your doorstep.",
  icon: require("@/assets/icons/carfix.jpeg"), // Placeholder or use vector
  vectorIcon: "home-account",
  link: "/services/homeservice",
},
]


export default function NavOptions() {
  const router = useRouter();
  return (
    <View className="flex-row flex-wrap justify-between w-full px-2">
      {opts.map((item) => (
        <TouchableOpacity
          key={item.id}
          activeOpacity={0.9}
          onPress={() => router.push(item.link as any)}
          className="w-[48%] h-[8rem] bg-[#005C70] rounded-xl items-center justify-center shadow-md p-2 mb-4"
        >
          {/* 
                  Using Vector Icons for cleaner look matching the "Road Services" / "Towing Services" 
                  icons in the mock (White icons). The existing images are JPEGs which might not look good on Teal.
                  I will try to use Vector Icons if possible, or tint the image white.
                  The mock shows specific icons. Let's try Vector Icons first as they are cleaner.
                */}
          <View className="mb-2">
            <Icon name={item.vectorIcon} size={40} color="white" />
          </View>

          <Text className="text-white text-base font-bold text-center">
            {item.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>

  );
}
