import { useRouter } from 'expo-router';
import { Dimensions, FlatList, Image, Text, TouchableOpacity, View } from "react-native";

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
      className="mx-1 mb-1 h-[12rem]"
      data={opts}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => {
        const isSmallDevice = Dimensions.get('window').width < 380;
        
        const containerWidth = isSmallDevice ? 'w-[17rem]' : 'w-[19rem]';
        const containerHeight = isSmallDevice ? 'h-[8rem]' : 'h-[9rem]';
        const imageWidth = isSmallDevice ? 'w-[6rem]' : 'w-[7rem]';
        const imageHeight = isSmallDevice ? 'h-[8rem]' : 'h-[9rem]';
        const textContainerMargin = isSmallDevice ? 'ml-3' : 'ml-5';
        const textContainerPadding = isSmallDevice ? 'p-2' : 'p-3';
        const textMaxWidth = isSmallDevice ? 'max-w-[9rem]' : 'max-w-[10rem]';

        return (
          <View>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push(item.link as any)}
              className={`bg-[#fff] ${containerWidth} ${containerHeight} overflow-hidden shadow-xl border-red-950/8 shadow-slate-900 m-2 rounded-r-md`}
            >
              <View className="flex-row">
                <Image
                  source={item.icon}
                  className={`${imageWidth} ${imageHeight} object-cover overflow-hidden`}
                />
                <View className={`${textContainerMargin} ${textContainerPadding} text-wrap overflow-hidden`}>
                  <Text className={`text-slate-500 text-lg font-bold flex-shrink flex-wrap ${textMaxWidth}`}>{item.name}</Text>
                  <Text className={`text-slate-300 text-sm mt-2 flex-shrink flex-wrap ${textMaxWidth} pr-1`}>{item.details}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        );
      }}
    />
    
  );
}
