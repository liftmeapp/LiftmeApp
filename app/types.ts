import { Stack } from 'expo-router';

export type RootStackParamList = {
  'settings/add-business/garage-dashboard': {
    garageId: string;
  };
  'settings/add-business/tow-truck-dashboard': {
    towTruckId: string;
  };
};

export type SettingsStackParamList = {
  'add-business': {
    'garage-dashboard': {
      garageId: string;
    };
    'tow-truck-dashboard': {
      towTruckId: string;
    };
  };
};

export type RoutePath = keyof RootStackParamList;

export const routePaths: Record<RoutePath, string> = {
  'settings/add-business/garage-dashboard': '/settings/add-business/garage-dashboard',
  'settings/add-business/tow-truck-dashboard': '/settings/add-business/tow-truck-dashboard'
};
