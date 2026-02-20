import { Stack } from 'expo-router';
import { Colors } from '../../../../src/constants/colors';

export default function TasksLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.surface },
        headerTitleStyle: { fontWeight: '600', color: Colors.text },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Zadania' }} />
      <Stack.Screen name="add" options={{ title: 'Dodaj zadanie', presentation: 'modal' }} />
      <Stack.Screen name="[id]" options={{ title: 'Szczegóły' }} />
    </Stack>
  );
}
