import { icons } from "@/constants";
import { Tabs } from "expo-router";
import React from 'react';
import { Image, ImageSourcePropType, View } from "react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const TabIcon = ({
  source,
  iconName ='help-circle',
  focused,
}: {
  source?: ImageSourcePropType;
  iconName?: string;
  focused: boolean;
}) => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    {source ? (
      <Image
        source={source}
        resizeMode="contain"
        style={{
          width: 28,
          height: 28,
          tintColor: focused ? 'black' : '#7b381a',
        }}
      />
    ) : (
      <Icon
        name={iconName}
        size={28}
        color={focused ? 'black' : '#7b381a'}
      />
    )}
  </View>
);

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Apply this globally
        tabBarActiveTintColor: '#b95528',
        tabBarInactiveTintColor: '#7b381a',
        tabBarShowLabel: false, // Hiding labels to match many modern UIs, set to true if you want them
        tabBarPosition: 'bottom',
        tabBarStyle: {
          backgroundColor: "#ededed",
          borderTopColor: '#fff',
          height: 85,
          paddingBottom: 20,
          paddingTop: 10,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.home} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.profile} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.list} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="chats"
        options={{
          title: "Chats",
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.chat} focused={focused} />
          ),
        }}
      />

      {/* --- THIS IS THE CORRECT WAY TO CONFIGURE A GROUPED TAB --- */}
      {/* The `name` points to the DIRECTORY. */}
      {/* All screens inside `app/(tabs)/settings` will now belong to this tab. */}
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings", // This is the title for the tab
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName="cog-outline" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
