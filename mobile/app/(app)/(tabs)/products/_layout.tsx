import { Stack } from 'expo-router';
import { Colors } from '../../../../src/constants/colors';

export default function ProductsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.surface },
        headerTitleStyle: { fontWeight: '600', color: Colors.text },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Produkty' }} />
      <Stack.Screen name="add" options={{ title: 'Dodaj produkt', presentation: 'modal' }} />
      <Stack.Screen name="[id]" options={{ title: 'Szczegóły' }} />
      <Stack.Screen name="edit" options={{ title: 'Edytuj produkt', presentation: 'modal' }} />
      <Stack.Screen name="consumed" options={{ title: 'Zuzyte produkty' }} />
    </Stack>
  );
}
