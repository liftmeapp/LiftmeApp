import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { Tabs } from "expo-router";
import React from 'react';
import { View } from "react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Helper to determine tab bar visibility
const getTabBarVisibility = (route: any) => {
  const routeName = getFocusedRouteNameFromRoute(route) ?? '';

  // Routes where the tab bar should be hidden
  const hiddenRoutes = [
    'vehicle-page',
    'add-vehicle', // In case it's a direct route
    'add-business',
    'businesssetup', // In case it's a direct route
    '[id]', // Conversation details
    'conversation' // In case it's used as the route name for the stack
  ];

  if (hiddenRoutes.includes(routeName) ||
    (route.name === 'conversation' && routeName === '[id]')) {
    return 'none';
  }

  return 'flex';
};

// Custom Dynamic Tab Bar Icon Component
const DynamicTabIcon = ({
  iconName,
  focused,
}: {
  iconName: string;
  focused: boolean;
}) => {
  if (focused) {
    return (
      <View style={{
        width: 50,
        height: 50,
        borderRadius: 35,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
      }}>
        <Icon name={iconName} size={28} color="#005C70" />
      </View>
    );
  }

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Icon
        name={iconName}
        size={28}
        color="rgba(255,255,255,0.6)"
      />
    </View>
  );
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#005C70',
          borderTopWidth: 0,
          elevation: 0,
          height: 60,
          position: 'absolute',
          bottom: 30,
          marginHorizontal: 20,
          borderRadius: 50,
          paddingBottom: 0,
          paddingTop: 0,
          paddingHorizontal: 2,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.3,
          shadowRadius: 4,
        },
        tabBarItemStyle: {
          height: 60,
          paddingVertical: 10,
          paddingHorizontal: 0,
          marginHorizontal: -2,
        }
      }}
    >
      <Tabs.Screen
        name="settings"
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route);
          // Hide tab bar for specific nested routes in Settings stack
          const shouldHide = ['vehicle-page', 'add-business', 'businesssetup'].some(
            r => routeName === r || routeName?.startsWith(r)
          );
          return {
            title: "Settings",
            tabBarIcon: ({ focused }) => (
              <DynamicTabIcon iconName="cog-outline" focused={focused} />
            ),
            tabBarStyle: {
              ...(shouldHide ? { display: 'none' } : {
                backgroundColor: '#005C70',
                borderTopWidth: 0,
                elevation: 0,
                height: 60,
                position: 'absolute',
                bottom: 30,
                marginHorizontal: 30,
                borderRadius: 50,
                paddingBottom: 0,
                paddingTop: 0,
                paddingHorizontal: 2,
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 4,
                },
                shadowOpacity: 0.3,
                shadowRadius: 4,
              }),
            }
          };
        }}
      />

      <Tabs.Screen
        name="conversation"
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route);
          // Hide tab bar for specific nested routes in Conversation stack
          const shouldHide = routeName === '[id]';
          return {
            title: "Conversation",
            tabBarIcon: ({ focused }) => (
              <DynamicTabIcon iconName="email-outline" focused={focused} />
            ),
            tabBarStyle: {
              ...(shouldHide ? { display: 'none' } : {
                backgroundColor: '#005C70',
                borderTopWidth: 0,
                elevation: 0,
                height: 60,
                position: 'absolute',
                bottom: 30,
                marginHorizontal: 30,
                borderRadius: 50,
                paddingBottom: 0,
                paddingTop: 0,
                paddingHorizontal: 2,
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 4,
                },
                shadowOpacity: 0.3,
                shadowRadius: 4,
              }),
            }
          };
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('conversation', { screen: 'index' });
          },
        })}
      />

      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <DynamicTabIcon iconName="home" focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ focused }) => (
            <DynamicTabIcon iconName="bell-outline" focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <DynamicTabIcon iconName="account-circle-outline" focused={focused} />
          ),
        }}
      />
    </Tabs >
  );
}