// app/(tabs)/_layout.tsx
import { icons } from "@/constants";
import { Tabs } from "expo-router";
import React from 'react';
import { Image, ImageSourcePropType, View } from "react-native";

const TabIcon = ({
  source,
  focused,
}: {
  source: ImageSourcePropType;
  focused: boolean;
}) => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Image
      source={source}
      resizeMode="contain"
      style={{
        width: 28,
        height: 28,
        tintColor: focused ? 'black' : '#7b381a',
      }}
    />
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
          borderTopWidth: 1,
          borderTopColor: '#707070',
          height: 85,
          paddingBottom: 20,
          paddingTop: 20,
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
        name="service"
        options={{
          title: "Services",
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.chat} focused={focused} />
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

      {/* --- THIS IS THE CORRECT WAY TO CONFIGURE A GROUPED TAB --- */}
      {/* The `name` points to the DIRECTORY. */}
      {/* All screens inside `app/(tabs)/settings` will now belong to this tab. */}
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings", // This is the title for the tab
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.list} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}