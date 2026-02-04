import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from "react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const opts = [{
  id: 1,
  name: "Road Services",
  details: "Providing roadside assistance for your vehicle.", // Shortened for design
  icon: require("@/assets/icons/carfix.jpeg"), // Or maybe use vector icon if available? Sticking to image for now.
  vectorIcon: "car-wrench", // Alternative
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
]


export default function NavOptions() {
  const router = useRouter();
  return (
    <View className="flex-row justify-between w-full px-2">
      {opts.map((item) => (
        <TouchableOpacity
          key={item.id}
          activeOpacity={0.9}
          onPress={() => router.push(item.link as any)}
          className="w-[48%] h-[8rem] bg-[#005C70] rounded-xl items-center justify-center shadow-md p-2"
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
