// app/(auth)/_layout.tsx
import { Stack } from "expo-router";
import "../../global.css";
// Remove useAuth and the immediate redirect if isSignedIn
// import { useAuth } from "@clerk/clerk-expo";
// import { Redirect } from "expo-router";

export default function AuthRootLayout() {
  // const { isSignedIn } = useAuth();

  // if (isSignedIn) {
  //   // This redirect is too early and can conflict with InitialLayout.
  //   // Let InitialLayout in app/_layout.tsx handle routing after sign-in.
  //   return <Redirect href="/(auth)/complete-profile" />;
  // }

  return (
    <Stack>
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="signin" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="complete-profile" options={{ headerShown: false }} />
    </Stack>
  );
}