import { Stack } from 'expo-router';
import { Colors } from '../../../../src/constants/colors';

export default function ShoppingLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.surface },
        headerTitleStyle: { fontWeight: '600', color: Colors.text },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Lista zakupów' }} />
    </Stack>
  );
}
