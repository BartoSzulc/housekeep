import { Stack } from 'expo-router';
import { Colors } from '../../../../src/constants/colors';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.surface },
        headerTitleStyle: { fontWeight: '600', color: Colors.text },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Ustawienia' }} />
      <Stack.Screen name="locations" options={{ title: 'Lokalizacje' }} />
      <Stack.Screen name="categories" options={{ title: 'Kategorie' }} />
      <Stack.Screen name="members" options={{ title: 'Członkowie' }} />
    </Stack>
  );
}
