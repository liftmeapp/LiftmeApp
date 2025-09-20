// Located at: app/settings/add-business/_layout.tsx
import { Stack } from "expo-router";

export default function AddBusinessLayout() { // Renamed component for clarity
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/*
        This Stack will automatically discover:
        - garagesignup.tsx (accessible via /settings/add-business/garagesignup)
        - addservices.tsx (accessible via /settings/add-business/addservices)
        - any other .tsx files in this directory as screens.
        The headerShown: false will apply to all screens in this group unless overridden.
      */}
    </Stack>
  );
}