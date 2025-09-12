import { Stack } from 'expo-router';

export default function CountryLayout() {
  return (
    <Stack>
      <Stack.Screen name="turkey/welcome" options={{ headerShown: false }} />
      <Stack.Screen name="turkey/start" options={{ headerShown: false }} />
      <Stack.Screen name="turkey/status" options={{ headerShown: false }} />
      <Stack.Screen
        name="turkey/payment-details"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
