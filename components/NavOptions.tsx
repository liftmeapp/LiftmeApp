import { Text, Image, TouchableOpacity, View, FlatList } from "react-native";
import { useRouter } from 'expo-router';

const opts = [{
  id:1,
  name: "Road Services",
  details:"Providing roadside assistance for your vehicle, tire change, fuel delivery, and more.",
  icon: require("@/assets/icons/carfix.jpeg"),
  link: "/services/roadsidecar-service",
},
{
  id: 2,
  name: "Towing Service",
  details: "Towing Assitance for your vehicle,with ease and quick service protection.",
  icon: require("@/assets/icons/tow.jpeg"),
  link: "/services/towing_service",
},
{
  id:3,
  name: "Home Service",
  details:"Providing vehicle repair and maintenance services at your home.",
  icon: require("@/assets/icons/carhouse.jpeg"),
  link: "/services/homeservice",
},
{
  id: 4,
  name: "Electric Vehicle Service",
  details: "Specialized services for electric vehicles, from  battery checks to charging.",
  icon: require("@/assets/icons/electricCar.jpeg"),
  link: "/services/electric-vehicleservice",
},
]
 

export default function NavOptions() {
  const router = useRouter();
    return (
      <FlatList
      className="mx-1 mb-1 h-[12rem] bg-white"
      data={opts}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View className="top-2">
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push(item.link as any)}
            className="bg-[#fff] w-[19rem] h-[9rem] overflow-hidden  justify-center shadow-xl border-red-950/8 shadow-slate-900 m-2 rounded-r-md "
          >
            <View className="flex-row">
              {/* Icon */}
              <Image
                source={item.icon}
                className="w-[7rem] h-[9rem] object-cover overflow-hidden"
              />
    
              {/* Text */}
              <View className="ml-5 p-3 text-wrap overflow-hidden">
                <Text className="text-slate-500 text-lg font-bold flex-shrink flex-wrap max-w-[10rem]">{item.name}</Text>
                {/* Subheading */}
                <Text className="text-slate-300 text-sm mt-1 top-3 flex-shrink flex-wrap max-w-[10rem] pr-1">{item.details}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )}
    />
    
  );
}
