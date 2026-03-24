import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0A0E17' },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="splash" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="wifi-setup" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="alerts" />
        <Stack.Screen name="fault-detail" />
        <Stack.Screen name="history" />
        <Stack.Screen name="motor-health" />
        <Stack.Screen name="circuit-analyser" />
        <Stack.Screen name="device-network" />
      </Stack>
    </>
  );
}
